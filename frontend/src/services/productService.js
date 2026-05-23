import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import logger from '../utils/logger';
import { PRODUCTS_PER_PAGE } from '../utils/constants';

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT SERVICE — Firestore CRUD for the products collection
// Falls back to empty arrays gracefully when Firebase is offline/unconfigured
// ─────────────────────────────────────────────────────────────────────────────

const COLLECTION = 'products';

/** Fetch all featured products (isFeatured === true) */
export const getFeaturedProducts = async () => {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('isFeatured', '==', true),
      orderBy('createdAt', 'desc'),
      limit(8)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    logger.error('getFeaturedProducts:', err);
    return [];
  }
};

/** Fetch all best-seller products */
export const getBestSellers = async () => {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('isBestSeller', '==', true),
      orderBy('rating', 'desc'),
      limit(8)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    logger.error('getBestSellers:', err);
    return [];
  }
};

/**
 * Fetch paginated products with optional category filter and sort
 * @param {{ category?: string, sort?: string, lastDoc?: any, pageSize?: number }} opts
 */
export const getProducts = async ({ category, sort = 'featured', lastDoc = null, pageSize = PRODUCTS_PER_PAGE } = {}) => {
  try {
    let constraints = [];
    if (category && category !== 'all') constraints.push(where('category', '==', category));

    switch (sort) {
      case 'price-asc':  constraints.push(orderBy('price', 'asc'));  break;
      case 'price-desc': constraints.push(orderBy('price', 'desc')); break;
      case 'rating':     constraints.push(orderBy('rating', 'desc')); break;
      case 'newest':     constraints.push(orderBy('createdAt', 'desc')); break;
      default:           constraints.push(orderBy('createdAt', 'desc')); break;
    }

    constraints.push(limit(pageSize));
    if (lastDoc) constraints.push(startAfter(lastDoc));

    const q = query(collection(db, COLLECTION), ...constraints);
    const snap = await getDocs(q);
    const products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const lastVisible = snap.docs[snap.docs.length - 1] || null;
    return { products, lastVisible, hasMore: snap.docs.length === pageSize };
  } catch (err) {
    logger.error('getProducts:', err);
    return { products: [], lastVisible: null, hasMore: false };
  }
};

/** Fetch a single product by ID */
export const getProductById = async (id) => {
  try {
    const snap = await getDoc(doc(db, COLLECTION, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    logger.error('getProductById:', err);
    return null;
  }
};

/**
 * Create a new product (admin only — also enforced by Firestore rules)
 * @param {Object} data
 * @returns {string} new document ID
 */
export const createProduct = async (data) => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    rating: 0,
    reviewCount: 0,
  });
  logger.firebase('createProduct', docRef.id);
  return docRef.id;
};

/** Update product fields */
export const updateProduct = async (id, data) => {
  await updateDoc(doc(db, COLLECTION, id), { ...data, updatedAt: serverTimestamp() });
  logger.firebase('updateProduct', id);
};

/** Delete a product document */
export const deleteProduct = async (id) => {
  await deleteDoc(doc(db, COLLECTION, id));
  logger.firebase('deleteProduct', id);
};

// ── REVIEWS SUBCOLLECTION ───────────────────────────────────────────────────

/** Get all reviews for a product */
export const getReviews = async (productId) => {
  try {
    const q = query(
      collection(db, COLLECTION, productId, 'reviews'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    logger.error('getReviews:', err);
    return [];
  }
};

/** Submit a review and update product rating */
export const submitReview = async (productId, reviewData) => {
  const reviewRef = await addDoc(
    collection(db, COLLECTION, productId, 'reviews'),
    { ...reviewData, createdAt: serverTimestamp() }
  );

  // Recalculate average rating
  try {
    const reviews = await getReviews(productId);
    const avg = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
    await updateDoc(doc(db, COLLECTION, productId), {
      rating: parseFloat(avg.toFixed(1)),
      reviewCount: reviews.length,
    });
  } catch (err) {
    logger.warn('Failed to update product rating average:', err);
  }

  return reviewRef.id;
};
