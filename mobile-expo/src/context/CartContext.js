// mobile-expo/src/context/CartContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CartContext = createContext({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
});

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load persisted cart on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const json = await AsyncStorage.getItem('@cart');
        if (json != null) setCart(JSON.parse(json));
      } catch (e) {
        console.error('Failed to load cart', e);
      }
    };
    loadCart();
  }, []);

  // Persist whenever cart changes
  useEffect(() => {
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem('@cart', JSON.stringify(cart));
      } catch (e) {
        console.error('Failed to save cart', e);
      }
    };
    saveCart();
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => [...prev, product]);
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
