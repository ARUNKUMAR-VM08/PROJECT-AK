import { useCallback, useEffect, useRef } from 'react';
import { RAZORPAY_CONFIG, BRAND_CONFIG } from '../utils/constants';
import logger from '../utils/logger';

// ─────────────────────────────────────────────────────────────────────────────
// useRazorpay — dynamic SDK loader + payment modal hook
// ─────────────────────────────────────────────────────────────────────────────

const loadScript = (src) =>
  new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

/**
 * Hook to trigger a Razorpay payment modal.
 *
 * Usage:
 *   const { openRazorpay, loading } = useRazorpay();
 *   await openRazorpay({ amount: 1299, orderId: 'abc', name: 'Jane', email: '...', mobile: '...' }, onSuccess, onFailure);
 *
 * @returns {{ openRazorpay: Function, loading: boolean }}
 */
const useRazorpay = () => {
  const loadingRef = useRef(false);

  useEffect(() => {
    // Pre-load the Razorpay script when the hook mounts
    loadScript(RAZORPAY_CONFIG.scriptUrl);
  }, []);

  const openRazorpay = useCallback(async ({ amount, orderId, name, email, mobile }, onSuccess, onFailure) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    const loaded = await loadScript(RAZORPAY_CONFIG.scriptUrl);
    if (!loaded || !window.Razorpay) {
      logger.error('Razorpay SDK failed to load.');
      loadingRef.current = false;
      if (onFailure) onFailure(new Error('Payment gateway unavailable. Please try another payment method.'));
      return;
    }

    const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKeyId) {
      logger.warn('VITE_RAZORPAY_KEY_ID not set — Razorpay is in demo mode.');
      loadingRef.current = false;
      if (onFailure) onFailure(new Error('Payment gateway not configured. Please use COD or UPI.'));
      return;
    }

    const options = {
      key: razorpayKeyId,
      amount: amount * 100, // convert to paise
      currency: RAZORPAY_CONFIG.currency,
      name: BRAND_CONFIG.name,
      description: `Order ${orderId ? `#${orderId.slice(0, 6).toUpperCase()}` : ''}`,
      handler: (response) => {
        logger.info('Razorpay success:', response.razorpay_payment_id);
        loadingRef.current = false;
        if (onSuccess) onSuccess(response);
      },
      prefill: { name, email, contact: mobile },
      theme: RAZORPAY_CONFIG.theme,
      modal: {
        ondismiss: () => {
          loadingRef.current = false;
          if (onFailure) onFailure(new Error('Payment cancelled by user.'));
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      logger.error('Razorpay payment failed:', response.error);
      loadingRef.current = false;
      if (onFailure) onFailure(new Error(response.error?.description || 'Payment failed.'));
    });
    rzp.open();
  }, []);

  return { openRazorpay, loading: loadingRef.current };
};

export default useRazorpay;
