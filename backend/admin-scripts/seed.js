import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environmental configuration from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  console.error('❌ Error: Missing required environment variables in backend/.env');
  console.log('Please make sure backend/.env exists and contains FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail,
    privateKey,
  }),
});

const db = admin.firestore();

const SEED_CATEGORIES = [
  { id: 'birthday-gifts', name: 'Birthday Gifts', description: 'Make their special day unforgettable.' },
  { id: 'anniversary-gifts', name: 'Anniversary Gifts', description: 'Celebrate years of love and together-time.' },
  { id: 'personalised-gifts', name: 'Personalised Keepsakes', description: 'Engraved, printed, and crafted just for them.' },
  { id: 'friendship-gifts', name: 'Friendship Keepsakes', description: 'Celebrate the bond that matters most.' },
  { id: 'corporate-gifts', name: 'Corporate Hampers', description: 'Professional gifts for clients and high-performing staff.' },
  { id: 'festive-gifts', name: 'Festive Offerings', description: 'Spread joy during Diwali, Christmas, and Holi.' },
];

const SEED_PRODUCTS = [
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

async function seed() {
  try {
    console.log('🚀 Starting Admin CLI Database Seed...');

    // 1. Seed Categories
    console.log('Seeding categories...');
    const catBatch = db.batch();
    SEED_CATEGORIES.forEach((category) => {
      const ref = db.collection('categories').doc(category.id);
      catBatch.set(ref, {
        name: category.name,
        description: category.description,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    });
    await catBatch.commit();
    console.log(`✅ Seeded ${SEED_CATEGORIES.length} categories.`);

    // 2. Seed Products
    console.log('Seeding products...');
    const prodBatch = db.batch();
    SEED_PRODUCTS.forEach((product) => {
      const ref = db.collection('products').doc();
      prodBatch.set(ref, {
        ...product,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    await prodBatch.commit();
    console.log(`✅ Seeded ${SEED_PRODUCTS.length} products.`);

    console.log('🎉 Seeding successfully completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    process.exit(0);
  }
}

seed();
