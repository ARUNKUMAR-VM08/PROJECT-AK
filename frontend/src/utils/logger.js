// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTION-SAFE LOGGER
// In production builds, only errors are emitted. All dev logs are stripped.
// ─────────────────────────────────────────────────────────────────────────────

const isDev = import.meta.env.DEV;
const isTest = import.meta.env.MODE === 'test';

const noop = () => {};

const logger = {
  /**
   * General info log (dev only)
   * @param {...any} args
   */
  info: isDev ? (...args) => console.info('[INFO]', ...args) : noop,

  /**
   * Debug log (dev only)
   * @param {...any} args
   */
  debug: isDev ? (...args) => console.debug('[DEBUG]', ...args) : noop,

  /**
   * Warning log (dev only)
   * @param {...any} args
   */
  warn: isDev ? (...args) => console.warn('[WARN]', ...args) : noop,

  /**
   * Error log — always active (even in production)
   * In production you could send this to an error tracking service (Sentry etc.)
   * @param {...any} args
   */
  error: (...args) => {
    if (isDev || isTest) {
      console.error('[ERROR]', ...args);
    } else {
      // Production: suppress console but keep hook for error reporting services
      // e.g. Sentry.captureException(args[0]);
    }
  },

  /**
   * Firebase-specific log wrapper
   * @param {string} operation - Name of the Firebase operation
   * @param {...any} args
   */
  firebase: isDev ? (operation, ...args) => console.log(`[FIREBASE] ${operation}`, ...args) : noop,
};

export default logger;
