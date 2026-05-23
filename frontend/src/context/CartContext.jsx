import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import useLocalStorage from '../hooks/useLocalStorage';
import { calcDeliveryCharge } from '../utils/formatters';

const CartContext = createContext(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useLocalStorage('gb_cart', []);

  const itemsCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal   = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryCharge = calcDeliveryCharge(subtotal);
  const total = subtotal + deliveryCharge;

  /** Add a product to cart (handles duplicates by merging quantity) */
  const addToCart = (product, quantity = 1, customizationText = '') => {
    setCartItems((prev) => {
      // Unique key: productId + customization text to allow same product with different texts
      const key = `${product.id}__${customizationText}`;
      const existing = prev.find((i) => `${i.id}__${i.customizationText}` === key);
      if (existing) {
        return prev.map((i) =>
          `${i.id}__${i.customizationText}` === key
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrls?.[0] || '',
          customizationText,
          quantity,
        },
      ];
    });
    toast.success(`${product.name} added to cart 🛍️`, { toastId: `cart-${product.id}` });
  };

  /** Update item quantity; removes item if quantity reaches 0 */
  const updateQuantity = (id, customizationText, quantity) => {
    setCartItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => !(i.id === id && i.customizationText === customizationText));
      return prev.map((i) =>
        i.id === id && i.customizationText === customizationText ? { ...i, quantity } : i
      );
    });
  };

  /** Remove a specific cart item */
  const removeFromCart = (id, customizationText) => {
    setCartItems((prev) => prev.filter((i) => !(i.id === id && i.customizationText === customizationText)));
    toast.info('Item removed from cart.');
  };

  /** Empty the cart */
  const clearCart = () => setCartItems([]);

  const value = {
    cartItems, itemsCount, subtotal, deliveryCharge, total,
    addToCart, updateQuantity, removeFromCart, clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
