import { collection, doc, getDocs, addDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

// Fetch all products
export const fetchProducts = async () => {
  const snapshot = await getDocs(collection(db, 'products'));
  const products = [];
  snapshot.forEach((docSnap) => {
    products.push({ id: docSnap.id, ...docSnap.data() });
  });
  return products;
};

// Add a new product, returns the created product with id
export const addProduct = async (product) => {
  const docRef = await addDoc(collection(db, 'products'), product);
  return { id: docRef.id, ...product };
};

// Update an existing product by id
export const updateProduct = async (id, data) => {
  const productRef = doc(db, 'products', id);
  await setDoc(productRef, data, { merge: true });
};

// Delete a product by id
export const deleteProduct = async (id) => {
  const productRef = doc(db, 'products', id);
  await deleteDoc(productRef);
};
