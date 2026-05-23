// ─────────────────────────────────────────────────────────────────────────────
// INPUT VALIDATION & SANITIZATION UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Strip HTML tags and dangerous characters from a string (basic XSS sanitization)
 * @param {string} str
 * @returns {string}
 */
export const sanitizeText = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&(?!amp;|lt;|gt;|quot;|#39;)/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .trim();
};

/**
 * Strip all HTML tags (for plain text contexts like order messages)
 * @param {string} str
 * @returns {string}
 */
export const stripHtml = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
};

// ── FIELD VALIDATORS ────────────────────────────────────────────────────────

/**
 * Validate an Indian mobile number (10 digits, starting with 6-9)
 * @param {string} mobile
 * @returns {{ valid: boolean, message: string }}
 */
export const validateMobile = (mobile) => {
  const cleaned = mobile?.replace(/\s|-/g, '');
  if (!cleaned) return { valid: false, message: 'Mobile number is required.' };
  if (!/^[6-9]\d{9}$/.test(cleaned))
    return { valid: false, message: 'Enter a valid 10-digit Indian mobile number.' };
  return { valid: true, message: '' };
};

/**
 * Validate an email address
 * @param {string} email
 * @returns {{ valid: boolean, message: string }}
 */
export const validateEmail = (email) => {
  if (!email) return { valid: true, message: '' }; // email is optional in checkout
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { valid: false, message: 'Enter a valid email address.' };
  return { valid: true, message: '' };
};

/**
 * Validate a 6-digit Indian PIN code
 * @param {string} pincode
 * @returns {{ valid: boolean, message: string }}
 */
export const validatePincode = (pincode) => {
  if (!pincode) return { valid: false, message: 'Pincode is required.' };
  if (!/^\d{6}$/.test(pincode))
    return { valid: false, message: 'Enter a valid 6-digit pincode.' };
  return { valid: true, message: '' };
};

/**
 * Validate a required text field
 * @param {string} value
 * @param {string} fieldName
 * @param {number} [min=2]
 * @param {number} [max=200]
 * @returns {{ valid: boolean, message: string }}
 */
export const validateRequired = (value, fieldName = 'Field', min = 2, max = 200) => {
  if (!value || !value.trim())
    return { valid: false, message: `${fieldName} is required.` };
  if (value.trim().length < min)
    return { valid: false, message: `${fieldName} must be at least ${min} characters.` };
  if (value.trim().length > max)
    return { valid: false, message: `${fieldName} must not exceed ${max} characters.` };
  return { valid: true, message: '' };
};

/**
 * Validate a product price
 * @param {string|number} price
 * @returns {{ valid: boolean, message: string }}
 */
export const validatePrice = (price) => {
  const n = Number(price);
  if (isNaN(n) || n <= 0)
    return { valid: false, message: 'Price must be a positive number.' };
  if (n > 1000000)
    return { valid: false, message: 'Price seems unrealistically high.' };
  return { valid: true, message: '' };
};

/**
 * Validate an image file before upload
 * @param {File} file
 * @param {number} [maxMb=5]
 * @returns {{ valid: boolean, message: string }}
 */
export const validateImageFile = (file, maxMb = 5) => {
  if (!file) return { valid: false, message: 'Please select an image file.' };
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type))
    return { valid: false, message: 'Only JPG, PNG, WEBP, and GIF images are allowed.' };
  if (file.size > maxMb * 1024 * 1024)
    return { valid: false, message: `Image must be smaller than ${maxMb}MB.` };
  return { valid: true, message: '' };
};

/**
 * Validate the entire checkout form object
 * @param {Object} formData
 * @returns {{ valid: boolean, errors: Object }}
 */
export const validateCheckoutForm = (formData) => {
  const errors = {};

  const nameResult = validateRequired(formData.name, 'Full Name', 2, 100);
  if (!nameResult.valid) errors.name = nameResult.message;

  const mobileResult = validateMobile(formData.mobile);
  if (!mobileResult.valid) errors.mobile = mobileResult.message;

  const emailResult = validateEmail(formData.email);
  if (!emailResult.valid) errors.email = emailResult.message;

  const addressResult = validateRequired(formData.address, 'Address', 5, 300);
  if (!addressResult.valid) errors.address = addressResult.message;

  const cityResult = validateRequired(formData.city, 'City', 2, 100);
  if (!cityResult.valid) errors.city = cityResult.message;

  const pincodeResult = validatePincode(formData.pincode);
  if (!pincodeResult.valid) errors.pincode = pincodeResult.message;

  if (formData.paymentOption === 'upi' && !formData.upiTxnId?.trim()) {
    errors.upiTxnId = 'Please enter your UPI transaction reference ID.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

/**
 * Validate a review submission
 * @param {{ rating: number, comment: string }} reviewData
 * @returns {{ valid: boolean, errors: Object }}
 */
export const validateReview = (reviewData) => {
  const errors = {};
  if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5)
    errors.rating = 'Please select a rating between 1 and 5.';
  const commentResult = validateRequired(reviewData.comment, 'Review comment', 10, 500);
  if (!commentResult.valid) errors.comment = commentResult.message;
  return { valid: Object.keys(errors).length === 0, errors };
};
