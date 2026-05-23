// ─────────────────────────────────────────────────────────────────────────────
// CENTRALIZED APPLICATION CONSTANTS
// Update BRAND_CONFIG to customize for your business.
// ─────────────────────────────────────────────────────────────────────────────

export const BRAND_CONFIG = {
  name: 'IFRAMEYOUU',
  tagline: 'Gifts That Speak From The Heart',
  instagramHandle: '@iframeyouu',
  instagramUrl: 'https://instagram.com/iframeyouu',
  whatsappNumber: '919876543210', // Format: country code + number (no + or spaces)
  email: 'hello@iframeyouu.in',
  phone: '+91 98765 43210',
  address: 'Mumbai, Maharashtra, India',
  upiId: 'pay.iframeyouu@okaxis',
  currency: 'INR',
  currencySymbol: '₹',
};

export const DELIVERY_CONFIG = {
  charge: 80,              // flat delivery charge in INR
  freeAbove: 999,          // free delivery threshold in INR
  estimatedDays: '3–5',   // estimated delivery days string
};

export const PAYMENT_OPTIONS = {
  COD: 'cod',
  UPI: 'upi',
  WHATSAPP: 'whatsapp',
  RAZORPAY: 'razorpay',
};

export const ORDER_STATUS = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  VERIFICATION_PENDING: 'verification-pending',
  PAID: 'paid',
  FAILED: 'failed',
};

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

export const PRODUCT_CATEGORIES = [
  { slug: 'birthday-gifts',     label: 'Birthday Gifts',     emoji: '🎂', color: 'from-pink-100 to-rose-100' },
  { slug: 'anniversary-gifts',  label: 'Anniversary Gifts',  emoji: '💑', color: 'from-red-100 to-pink-100' },
  { slug: 'friendship-gifts',   label: 'Friendship Gifts',   emoji: '🤝', color: 'from-yellow-100 to-orange-100' },
  { slug: 'corporate-gifts',    label: 'Corporate Gifts',    emoji: '💼', color: 'from-blue-100 to-indigo-100' },
  { slug: 'festive-gifts',      label: 'Festive Gifts',      emoji: '🪔', color: 'from-amber-100 to-yellow-100' },
  { slug: 'personalised-gifts', label: 'Personalised Gifts', emoji: '✨', color: 'from-purple-100 to-pink-100' },
];

export const SORT_OPTIONS = [
  { value: 'featured',   label: 'Featured' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'newest',     label: 'Newest First' },
];

export const IMAGE_PLACEHOLDERS = {
  product: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&q=80',
  avatar:  'https://ui-avatars.com/api/?background=FF5E5E&color=fff&name=User',
};

export const RAZORPAY_CONFIG = {
  scriptUrl: 'https://checkout.razorpay.com/v1/checkout.js',
  currency: 'INR',
  theme: { color: '#FF5E5E' },
};

export const SEO_DEFAULTS = {
  title: `${BRAND_CONFIG.name} – ${BRAND_CONFIG.tagline}`,
  description: 'Shop premium personalised gifts for birthdays, anniversaries, and every celebration. Fast delivery across India.',
  keywords: 'gifts, personalised gifts, birthday gifts, anniversary gifts, India',
  ogImage: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1200&q=80',
};

export const MAX_REVIEW_LENGTH = 500;
export const MIN_SEARCH_CHARS = 2;
export const PRODUCTS_PER_PAGE = 12;
