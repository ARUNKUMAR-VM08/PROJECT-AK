import { BRAND_CONFIG, DELIVERY_CONFIG } from './constants';

// ─────────────────────────────────────────────────────────────────────────────
// FORMATTERS — currency, dates, phone numbers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format a number as Indian Rupees
 * @param {number} amount
 * @returns {string}  e.g. "₹1,299"
 */
export const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: BRAND_CONFIG.currency,
    maximumFractionDigits: 0,
  }).format(amount ?? 0);

/**
 * Format a Firestore timestamp or ISO string to a readable date
 * @param {string|Date|{seconds:number}} ts
 * @returns {string}  e.g. "23 May 2026"
 */
export const formatDate = (ts) => {
  if (!ts) return '—';
  let date;
  if (ts?.seconds) {
    date = new Date(ts.seconds * 1000);
  } else {
    date = new Date(ts);
  }
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Format a Firestore timestamp as relative time (e.g. "2 days ago")
 * @param {string|Date|{seconds:number}} ts
 * @returns {string}
 */
export const formatRelativeTime = (ts) => {
  if (!ts) return '—';
  let date;
  if (ts?.seconds) {
    date = new Date(ts.seconds * 1000);
  } else {
    date = new Date(ts);
  }
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(ts);
};

/**
 * Calculate delivery charge based on subtotal
 * @param {number} subtotal
 * @returns {number}
 */
export const calcDeliveryCharge = (subtotal) =>
  subtotal >= DELIVERY_CONFIG.freeAbove ? 0 : DELIVERY_CONFIG.charge;

/**
 * Truncate a string to a max character count with ellipsis
 * @param {string} str
 * @param {number} max
 * @returns {string}
 */
export const truncate = (str, max = 80) =>
  str && str.length > max ? `${str.slice(0, max)}…` : str ?? '';

/**
 * Generate a short display ID from a Firestore doc ID
 * @param {string} id
 * @returns {string}  e.g. "#GB-A1B2C"
 */
export const formatOrderId = (id) =>
  id ? `#GB-${id.slice(0, 6).toUpperCase()}` : '#GB-XXXXXX';
