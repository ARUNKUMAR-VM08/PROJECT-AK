import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { PRODUCT_CATEGORIES } from '../utils/constants';

const CategoryContext = createContext();

export const useCategories = () => useContext(CategoryContext);

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const colRef = collection(db, 'categories');
      const snap = await getDocs(colRef);
      const list = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() });
      });

      if (list.length === 0) {
        // Fallback to constants
        const formatted = PRODUCT_CATEGORIES.map(c => ({
          id: c.slug,
          slug: c.slug,
          label: c.label,
          name: c.label, // alias for consistency
          emoji: c.emoji,
          color: c.color || 'from-pink-100 to-rose-100'
        }));
        setCategories(formatted);
      } else {
        const formatted = list.map(c => ({
          id: c.id,
          slug: c.slug || c.id,
          label: c.label || c.name,
          name: c.label || c.name,
          emoji: c.emoji || '✨',
          color: c.color || 'from-pink-100 to-rose-100'
        }));
        setCategories(formatted);
      }
    } catch (err) {
      console.warn("Error fetching categories from Firestore, using static constants:", err);
      const formatted = PRODUCT_CATEGORIES.map(c => ({
        id: c.slug,
        slug: c.slug,
        label: c.label,
        name: c.label,
        emoji: c.emoji,
        color: c.color || 'from-pink-100 to-rose-100'
      }));
      setCategories(formatted);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <CategoryContext.Provider value={{ categories, loading, refreshCategories: fetchCategories }}>
      {children}
    </CategoryContext.Provider>
  );
};
