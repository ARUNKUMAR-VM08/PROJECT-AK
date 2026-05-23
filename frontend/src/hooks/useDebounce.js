import { useState, useEffect, useRef } from 'react';
import { MIN_SEARCH_CHARS } from '../utils/constants';

/**
 * Debounce a value by the given delay.
 * Useful for search inputs to avoid firing on every keystroke.
 *
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default 350ms)
 * @returns {any} debounced value
 */
const useDebounce = (value, delay = 350) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

export default useDebounce;
