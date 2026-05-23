import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const { wishlistItems } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 page-transition">
      <SEO title="My Wishlist" description="Browse and buy from your saved gift wishlists." />

      <h1 className="text-2xl md:text-3xl font-extrabold text-pastel-navy mb-8 flex items-center gap-2">
        <Heart size={24} className="text-brand-500" />
        My Wishlist
      </h1>

      {wishlistItems.length === 0 ? (
        <div className="bg-white border border-brand-100 rounded-3xl p-12 text-center shadow-soft">
          <span className="text-5xl">❤️</span>
          <h2 className="text-lg font-bold text-pastel-navy mt-4">Your Wishlist is Empty</h2>
          <p className="text-gray-400 text-xs mt-1">Tap the heart icon on products to save them here for later!</p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-brand-500 text-white font-bold px-6 py-2.5 rounded-full mt-6 text-xs focus:outline-none">
            Explore Catalog
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {wishlistItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
