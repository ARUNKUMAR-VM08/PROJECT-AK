import React, { createContext, useContext } from 'react';
import { toast } from 'react-toastify';
import useLocalStorage from '../hooks/useLocalStorage';

const WishlistContext = createContext(null);

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useLocalStorage('gb_wishlist', []);

  const isInWishlist = (id) => wishlistItems.some((i) => i.id === id);

  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      setWishlistItems((prev) => prev.filter((i) => i.id !== product.id));
      toast.info('Removed from wishlist.', { toastId: `wl-${product.id}` });
    } else {
      setWishlistItems((prev) => [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrls?.[0] || '',
          category: product.category,
          rating: product.rating,
        },
      ]);
      toast.success(`${product.name} saved to wishlist 💖`, { toastId: `wl-${product.id}` });
    }
  };

  const clearWishlist = () => setWishlistItems([]);

  const value = { wishlistItems, isInWishlist, toggleWishlist, clearWishlist };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
