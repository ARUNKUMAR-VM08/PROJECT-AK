import { db } from './firebase';
import { collection, addDoc, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import logger from '../utils/logger';

// ─────────────────────────────────────────────────────────────────────────────
// SEED DATA — sample products for instant demo/testing
// ─────────────────────────────────────────────────────────────────────────────

export const SEED_PRODUCTS = [
  {
    name: 'LED Cushion with Custom Photo',
    description: 'A soft, glowing LED cushion printed with your favourite photo. Perfect for birthdays and anniversaries.',
    price: 699,
    imageUrls: ['https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600&q=80'],
    category: 'birthday-gifts',
    isFeatured: true,
    isBestSeller: true,
    customizationPrompt: 'Upload or describe the photo you want printed',
    stock: 50,
    rating: 4.7,
    reviewCount: 23,
  },
  {
    name: 'Luxury Chocolate Hamper',
    description: 'A curated hamper of artisan chocolates, truffles, and premium treats in an elegant gift box.',
    price: 1299,
    imageUrls: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80'],
    category: 'anniversary-gifts',
    isFeatured: true,
    isBestSeller: false,
    customizationPrompt: 'Add a personal message card (optional)',
    stock: 30,
    rating: 4.9,
    reviewCount: 41,
  },
  {
    name: 'Preserved Rose in Glass Dome',
    description: 'A real rose preserved forever inside a handcrafted glass dome. Romantic and everlasting.',
    price: 1599,
    imageUrls: ['https://images.unsplash.com/photo-1582530391065-4ef3e7b5e78d?w=600&q=80'],
    category: 'anniversary-gifts',
    isFeatured: true,
    isBestSeller: true,
    customizationPrompt: 'Choose rose colour: Red, Pink, or White',
    stock: 20,
    rating: 4.8,
    reviewCount: 35,
  },
  {
    name: 'Name Engraved Wooden Frame',
    description: 'Elegant wooden photo frame with custom laser engraving. A timeless keepsake for any occasion.',
    price: 849,
    imageUrls: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&q=80'],
    category: 'personalised-gifts',
    isFeatured: false,
    isBestSeller: true,
    customizationPrompt: 'Enter the name or message to engrave',
    stock: 40,
    rating: 4.6,
    reviewCount: 18,
  },
  {
    name: 'Friendship Scrapbook Kit',
    description: 'A DIY memory kit with decorative papers, stickers, and markers to create a personalised scrapbook.',
    price: 599,
    imageUrls: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'],
    category: 'friendship-gifts',
    isFeatured: false,
    isBestSeller: false,
    customizationPrompt: null,
    stock: 60,
    rating: 4.5,
    reviewCount: 12,
  },
  {
    name: 'Corporate Gift Set — Pen & Diary',
    description: 'A premium branded pen and leather-bound diary set. Ideal for corporate gifting and bulk orders.',
    price: 999,
    imageUrls: ['https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=600&q=80'],
    category: 'corporate-gifts',
    isFeatured: true,
    isBestSeller: false,
    customizationPrompt: 'Enter company name or logo details',
    stock: 100,
    rating: 4.4,
    reviewCount: 9,
  },
  {
    name: 'Diwali Dry Fruit Gift Box',
    description: 'Premium dry fruits, nuts, and sweets arranged beautifully in a decorative festive box.',
    price: 1499,
    imageUrls: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80'],
    category: 'festive-gifts',
    isFeatured: true,
    isBestSeller: true,
    customizationPrompt: 'Add a festive greeting message',
    stock: 45,
    rating: 4.8,
    reviewCount: 27,
  },
  {
    name: 'Birthday Balloon Surprise Box',
    description: 'Open the box and watch colourful balloons pop out! Includes a small chocolate and greeting card.',
    price: 549,
    imageUrls: ['https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80'],
    category: 'birthday-gifts',
    isFeatured: false,
    isBestSeller: true,
    customizationPrompt: 'Enter birthday person\'s name for the card',
    stock: 35,
    rating: 4.7,
    reviewCount: 32,
  },
];

/**
 * Seed the Firestore database with sample products using a batch write.
 * Safe to call multiple times — each call adds a fresh set of products.
 * @returns {Promise<{ success: boolean, count: number, error?: string }>}
 */
export const seedDatabase = async () => {
  try {
    const batch = writeBatch(db);
    SEED_PRODUCTS.forEach((product) => {
      const ref = doc(collection(db, 'products'));
      batch.set(ref, { ...product, createdAt: serverTimestamp() });
    });
    await batch.commit();
    logger.firebase('seedDatabase', `Seeded ${SEED_PRODUCTS.length} products`);
    return { success: true, count: SEED_PRODUCTS.length };
  } catch (err) {
    logger.error('seedDatabase:', err);
    return { success: false, count: 0, error: err.message };
  }
};
