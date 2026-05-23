import {
  collection, doc, addDoc, getDoc, getDocs,
  updateDoc, query, where, orderBy, serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import logger from '../utils/logger';
import { BRAND_CONFIG } from '../utils/constants';

// ─────────────────────────────────────────────────────────────────────────────
// ORDER SERVICE — create, read, update orders with duplicate-submission guard
// ─────────────────────────────────────────────────────────────────────────────

const COLLECTION = 'orders';

// Simple in-memory submission lock to prevent double-clicks creating two orders
let _submitting = false;

/**
 * Create a new order in Firestore with duplicate-submission protection
 * @param {Object} orderData
 * @returns {Promise<{ id: string, success: boolean, error?: string }>}
 */
export const createOrder = async (orderData) => {
  if (_submitting) {
    return { id: null, success: false, error: 'Order already being submitted. Please wait.' };
  }
  _submitting = true;
  try {
    const payload = {
      ...orderData,
      createdAt: serverTimestamp(),
      orderStatus: 'Pending',
      paymentStatus: orderData.paymentOption === 'upi' ? 'verification-pending' : 'pending',
    };
    const docRef = await addDoc(collection(db, COLLECTION), payload);
    logger.firebase('createOrder', docRef.id);

    // Optional: Write to 'mail' collection for Firebase Trigger Email extension
    try {
      await addDoc(collection(db, 'mail'), {
        to: [payload.customerDetails.email, BRAND_CONFIG.email].filter(Boolean),
        message: {
          subject: `🎁 New Order Placed at ${BRAND_CONFIG.name}: #GB-${docRef.id.slice(0, 6).toUpperCase()}`,
          text: `Hi ${payload.customerDetails.name},\n\nYour order has been placed successfully!\n\nOrder ID: #GB-${docRef.id.slice(0, 6).toUpperCase()}\nTotal: ₹${payload.total}\nPayment Method: ${payload.paymentOption.toUpperCase()}\n\nWe will coordinate your customization shortly on WhatsApp (${payload.customerDetails.mobile}).\n\nThank you for shopping at ${BRAND_CONFIG.name}!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ffebeb; border-radius: 20px; background-color: #ffffff; color: #1e293b;">
              <h2 style="color: #FF5E5E; text-align: center;">Order Confirmed! 🎁</h2>
              <p>Hi <b>${payload.customerDetails.name}</b>,</p>
              <p>Thank you for your order at <b>${BRAND_CONFIG.name}</b>. Your order details are below:</p>
              <div style="background-color: #ffebeb; padding: 15px; border-radius: 12px; margin: 20px 0;">
                <p style="margin: 5px 0;"><b>Order Reference:</b> #GB-${docRef.id.slice(0, 6).toUpperCase()}</p>
                <p style="margin: 5px 0;"><b>Payment Option:</b> ${payload.paymentOption.toUpperCase()}</p>
                <p style="margin: 5px 0;"><b>Total Amount:</b> ₹${payload.total}</p>
              </div>
              <p>Our team will reach out to you shortly on WhatsApp at <b>${payload.customerDetails.mobile}</b> to verify any custom photo printings or message engraving options.</p>
              <hr style="border: 0; border-top: 1px solid #ffebeb; margin: 20px 0;" />
              <p style="font-size: 11px; color: #888888; text-align: center;">This is an automated order notification from ${BRAND_CONFIG.name}.</p>
            </div>
          `
        }
      });
      logger.info("Trigger email document generated in Firestore");
    } catch (mailErr) {
      logger.warn("Could not write trigger email document:", mailErr.message);
    }

    return { id: docRef.id, success: true };
  } catch (err) {
    logger.error('createOrder:', err);
    return { id: null, success: false, error: err.message };
  } finally {
    _submitting = false;
  }
};

/**
 * Fetch all orders for a specific user (sorted newest first)
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export const getUserOrders = async (userId) => {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    logger.error('getUserOrders:', err);
    return [];
  }
};

/**
 * Fetch all orders (admin only — enforced by Firestore rules too)
 * @returns {Promise<Array>}
 */
export const getAllOrders = async () => {
  try {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    logger.error('getAllOrders:', err);
    return [];
  }
};

/**
 * Get a single order by ID
 * @param {string} orderId
 */
export const getOrderById = async (orderId) => {
  try {
    const snap = await getDoc(doc(db, COLLECTION, orderId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    logger.error('getOrderById:', err);
    return null;
  }
};

/**
 * Update an order's status (admin only)
 * @param {string} orderId
 * @param {{ orderStatus?: string, paymentStatus?: string }} updates
 */
export const updateOrderStatus = async (orderId, updates) => {
  try {
    await updateDoc(doc(db, COLLECTION, orderId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    logger.firebase('updateOrderStatus', orderId, updates);
  } catch (err) {
    logger.error('updateOrderStatus:', err);
    throw err;
  }
};

/**
 * Build the auto-filled WhatsApp order message
 * @param {string} orderId
 * @param {Object} order
 * @returns {string} WhatsApp URL
 */
export const buildWhatsAppOrderUrl = (orderId, order) => {
  const itemsText = order.items
    .map((item, i) =>
      `${i + 1}. *${item.name}* (Qty: ${item.quantity})` +
      (item.customizationText ? `\n   _Custom: ${item.customizationText}_` : '')
    )
    .join('\n');

  const message =
    `Hi! I just placed an order on your website 🎁\n\n` +
    `*Order ID*: #GB-${orderId.slice(0, 6).toUpperCase()}\n\n` +
    `*Items*:\n${itemsText}\n\n` +
    `*Subtotal*: ₹${order.subtotal}\n` +
    `*Delivery*: ₹${order.deliveryCharge}\n` +
    `*Total*: ₹${order.total}\n\n` +
    `*Payment*: ${order.paymentOption.toUpperCase()}\n\n` +
    `*Shipping to*:\n` +
    `${order.customerDetails.name}\n` +
    `${order.customerDetails.mobile}\n` +
    `${order.customerDetails.address}, ${order.customerDetails.city} – ${order.customerDetails.pincode}\n\n` +
    `Please confirm my order! Thank you 🙏`;

  return `https://wa.me/${BRAND_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
};
