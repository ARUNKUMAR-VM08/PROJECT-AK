import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useCart }     from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice, truncate } from '../utils/formatters';
import { IMAGE_PLACEHOLDERS } from '../utils/constants';

const cardVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const ProductCard = ({ product }) => {
  const { addToCart }       = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const inWishlist  = isInWishlist(product.id);
  const imgSrc      = product.imageUrls?.[0] || IMAGE_PLACEHOLDERS.product;
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-premium border border-brand-50/80 transition-shadow duration-300 flex flex-col"
    >
      {/* Wishlist button */}
      <button
        aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
        onClick={() => toggleWishlist(product)}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-soft flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
      >
        <Heart
          size={15}
          className={inWishlist ? 'text-brand-500 fill-brand-500' : 'text-gray-400'}
          aria-hidden="true"
        />
      </button>

      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {product.isBestSeller && (
          <span className="bg-pastel-gold text-pastel-navy text-[9px] font-black px-2 py-0.5 rounded-full">
            BEST SELLER
          </span>
        )}
        {product.isFeatured && !product.isBestSeller && (
          <span className="bg-brand-100 text-brand-700 text-[9px] font-black px-2 py-0.5 rounded-full">
            FEATURED
          </span>
        )}
        {hasDiscount && (
          <span className="bg-green-100 text-green-700 text-[9px] font-black px-2 py-0.5 rounded-full">
            SALE
          </span>
        )}
      </div>

      {/* Product Image */}
      <Link to={`/product/${product.id}`} className="block overflow-hidden aspect-[4/3]" aria-label={product.name} tabIndex={-1}>
        <img
          src={imgSrc}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = IMAGE_PLACEHOLDERS.product; }}
        />
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-grow">
        {/* Category */}
        <p className="text-[9px] text-brand-400 font-bold uppercase tracking-wider">
          {product.category?.replace(/-/g, ' ')}
        </p>

        {/* Name */}
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-bold text-pastel-navy leading-snug hover:text-brand-500 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1" aria-label={`Rated ${product.rating} out of 5`}>
            <Star size={11} className="text-pastel-gold fill-pastel-gold" aria-hidden="true" />
            <span className="text-[10px] font-bold text-gray-500">
              {product.rating.toFixed(1)}
              {product.reviewCount ? ` (${product.reviewCount})` : ''}
            </span>
          </div>
        )}

        {/* Price + Add to Cart */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <div>
            <span className="text-base font-black text-pastel-navy">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="ml-1.5 text-[10px] text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <button
            aria-label={`Add ${product.name} to cart`}
            onClick={() => addToCart(product)}
            className="flex items-center gap-1 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-[10px] font-bold px-3 py-1.5 rounded-full transition-all shadow-soft"
          >
            <ShoppingBag size={11} aria-hidden="true" /> Add
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export default ProductCard;
