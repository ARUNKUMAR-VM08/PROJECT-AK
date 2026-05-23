import { useState, useEffect } from 'react';
import logger from '../utils/logger';

/**
 * Persist state in localStorage with JSON serialization.
 * Falls back gracefully when localStorage is unavailable (SSR / private browsing).
 *
 * @param {string} key - localStorage key
 * @param {any} initialValue - default state value
 * @returns {[any, Function]} [value, setValue]
 */
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (err) {
      logger.warn('useLocalStorage read error:', err);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (err) {
      logger.warn('useLocalStorage write error:', err);
    }
  };

  return [storedValue, setValue];
};

export default useLocalStorage;
