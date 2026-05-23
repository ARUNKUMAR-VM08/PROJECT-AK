import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById, getReviews, submitReview, getProducts } from '../services/productService';
import { SEED_PRODUCTS } from '../services/seed';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { ProductDetailSkeleton, ProductCardSkeleton } from '../components/Skeleton';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';
import { Heart, ShoppingCart, Send, Star, User, AlertCircle, Sparkles, Truck } from 'lucide-react';
import { toast } from 'react-toastify';
import { BRAND_CONFIG } from '../utils/constants';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { currentUser } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [quantity, setQuantity] = useState(1);
  const [customizationText, setCustomizationText] = useState('');
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Review states
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch product data
  const loadProductData = async () => {
    setLoading(true);
    try {
      let prodData = await getProductById(id);

      if (!prodData) {
        // Fallback to local seed products if not found in db or offline
        prodData = SEED_PRODUCTS.find(p => p.id === id) || SEED_PRODUCTS.map((p, idx) => ({ ...p, id: `demo-${idx}` })).find(p => p.id === id);
      }

      if (!prodData) {
        toast.error("Product not found");
        navigate('/shop');
        return;
      }

      setProduct(prodData);
      setActiveImageIdx(0);
      setCustomizationText('');
      setQuantity(1);

      // Fetch Reviews
      try {
        const revList = await getReviews(id);
        setReviews(revList);
      } catch (e) {
        console.warn("Could not fetch reviews from service:", e);
        setReviews([]);
      }

      // Fetch Related Products
      try {
        const result = await getProducts({ category: prodData.category, pageSize: 5 });
        let relList = result.products.filter(d => d.id !== id);
        
        if (relList.length === 0) {
          const fallback = SEED_PRODUCTS.filter(p => p.category === prodData.category && p.id !== id).slice(0, 4);
          setRelatedProducts(fallback);
        } else {
          setRelatedProducts(relList.slice(0, 4));
        }
      } catch (e) {
        const fallback = SEED_PRODUCTS.filter(p => p.category === prodData.category && p.id !== id).slice(0, 4);
        setRelatedProducts(fallback);
      }

    } catch (error) {
      console.error("Error loading product detail page:", error);
      const fallbackProd = SEED_PRODUCTS.find(p => p.id === id);
      if (fallbackProd) {
        setProduct(fallbackProd);
        setRelatedProducts(SEED_PRODUCTS.filter(p => p.category === fallbackProd.category && p.id !== id).slice(0, 4));
      } else {
        toast.error("Error loading product");
        navigate('/shop');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductData();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, quantity, customizationText);
    toast.success(`Added ${quantity} x ${product.name} to cart! 🎁`, {
      position: "bottom-center"
    });
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, customizationText);
    navigate('/checkout');
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product);
  };

  // WhatsApp Enquiry Generator
  const shareOnWhatsApp = () => {
    const message = `Hi! I want to enquire about this product on your store:\n\n*Product Name*: ${product.name}\n*Price*: ₹${product.price}\n*Link*: ${window.location.href}\n${customizationText ? `*Customization Request*: ${customizationText}` : ''}`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${BRAND_CONFIG.whatsappNumber}?text=${encoded}`, '_blank');
  };

  // Submit Review Form
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.warning("Please log in to submit a review!");
      navigate('/login');
      return;
    }
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty!");
      return;
    }

    setSubmittingReview(true);
    try {
      const reviewData = {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Customer',
        rating: Number(newRating),
        comment: newComment.trim(),
        createdAt: new Date().toISOString()
      };

      await submitReview(id, reviewData);
      
      // Calculate new average rating locally for immediate update
      const updatedReviews = [reviewData, ...reviews];
      setReviews(updatedReviews);
      
      const newAverage = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
      setProduct(prev => ({ ...prev, rating: newAverage }));
      setNewComment('');
      setNewRating(5);
      toast.success("Review submitted! Thank you. ⭐");
    } catch (error) {
      toast.error("Error submitting review. Make sure your Firestore settings are configured.");
      console.error(error);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <ProductDetailSkeleton />;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const images = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls 
    : [product.imageUrl || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop'];

  const isLiked = isInWishlist(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 page-transition">
      <SEO title={product.name} description={product.description} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Side: Images Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-white rounded-3xl overflow-hidden border border-brand-100 shadow-soft">
            <img
              src={images[activeImageIdx]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.isBestSeller && (
              <span className="absolute top-4 left-4 bg-brand-500 text-white text-xs uppercase font-bold tracking-wider px-3.5 py-1.5 rounded-full shadow-soft">
                Best Seller
              </span>
            )}
          </div>
          
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative w-20 aspect-square rounded-xl overflow-hidden border-2 bg-white flex-shrink-0 transition-all ${idx === activeImageIdx ? 'border-brand-500 scale-105 shadow-soft' : 'border-brand-100'}`}
                >
                  <img src={img} alt="Product view" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details & Controls */}
        <div className="space-y-6">
          <div>
            <span className="text-xs uppercase font-bold text-brand-500 bg-brand-50 px-3 py-1 rounded-full tracking-wider">
              {product.category?.replace('-', ' ')}
            </span>
            <h1 className="text-3xl font-extrabold text-pastel-navy mt-3 leading-snug">
              {product.name}
            </h1>
            
            {/* Star Rating details */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-yellow-400">
                {Array(5).fill(0).map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    className={i < Math.round(product.rating || 0) ? 'fill-yellow-400' : 'text-gray-300'} 
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-500">
                {(product.rating || 0).toFixed(1)} ({reviews.length} reviews)
              </span>
            </div>
          </div>

          {/* Pricing Info */}
          <div className="border-y border-brand-100/50 py-4 flex items-baseline gap-3">
            <span className="text-3xl font-black text-brand-600">{formatPrice(product.price)}</span>
            <span className="text-sm text-gray-400 line-through">{formatPrice(product.price * 1.35)}</span>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">35% OFF</span>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed">
            {product.description}
          </p>

          {/* Delivery Time Info */}
          <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-500 bg-pastel-pink/10 border border-brand-100/30 px-3.5 py-2.5 rounded-2xl w-fit">
            <Truck size={15} className="text-brand-500" />
            <span>Estimated Delivery: <strong className="text-pastel-navy">{product.deliveryTime || '3–5 Days'}</strong></span>
          </div>

          {/* Customization Text Field (if applicable) */}
          {product.customizationPrompt && (
            <div className="space-y-2 bg-pastel-peach/50 border border-brand-100/40 p-4 rounded-2xl">
              <label className="text-xs font-extrabold text-pastel-navy uppercase tracking-wider block flex items-center gap-1.5">
                <Sparkles size={14} className="text-brand-500" />
                {product.customizationPrompt}
              </label>
              <textarea
                value={customizationText}
                onChange={(e) => setCustomizationText(e.target.value)}
                placeholder="Type name, dates, or messages to print on the gift..."
                className="w-full bg-white text-sm border border-brand-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-300 placeholder:text-gray-400"
                rows={3}
              />
            </div>
          )}

          {/* Quantity Controls */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-pastel-navy">Quantity:</span>
            <div className="flex items-center border border-brand-100 bg-white rounded-full">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-4 py-2 text-pastel-navy font-bold hover:text-brand-500 transition-colors focus:outline-none"
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="px-4 py-2 text-pastel-navy font-bold hover:text-brand-500 transition-colors focus:outline-none"
              >
                +
              </button>
            </div>
          </div>

          {/* Purchase Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-white border border-brand-500 text-brand-500 hover:bg-brand-50 font-bold py-3.5 rounded-full shadow-soft flex items-center justify-center gap-2 transition-all focus:outline-none"
            >
              <ShoppingCart size={18} />
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-full shadow-premium flex items-center justify-center gap-2 transition-all focus:outline-none"
            >
              Buy Now
            </button>
            <button
              onClick={handleWishlistToggle}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-pastel-pink border border-brand-100 hover:bg-brand-100 text-pastel-navy transition-all focus:outline-none"
            >
              <Heart size={20} className={isLiked ? 'text-red-500 fill-red-500 scale-110' : ''} />
            </button>
          </div>

          {/* WhatsApp share */}
          <button
            onClick={shareOnWhatsApp}
            className="w-full bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 font-bold py-3 rounded-full text-xs flex items-center justify-center gap-1.5 focus:outline-none"
          >
            <Send size={14} />
            Enquire about this gift on WhatsApp
          </button>
        </div>
      </div>

      {/* Product Reviews section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 border-t border-brand-100 pt-12">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-pastel-navy">Reviews & Ratings</h2>
          <div className="bg-white border border-brand-100/50 rounded-2xl p-6 shadow-soft text-center space-y-2">
            <span className="text-5xl font-black text-brand-500">{(product.rating || 0).toFixed(1)}</span>
            <div className="flex justify-center text-yellow-400">
              {Array(5).fill(0).map((_, i) => (
                <Star key={i} size={16} className={i < Math.round(product.rating || 0) ? 'fill-yellow-400' : 'text-gray-300'} />
              ))}
            </div>
            <p className="text-xs text-gray-400">Based on {reviews.length} customer ratings</p>
          </div>

          {/* Review form */}
          <form onSubmit={handleSubmitReview} className="bg-white border border-brand-100/50 rounded-2xl p-6 shadow-soft space-y-4">
            <h3 className="font-bold text-sm text-pastel-navy">Write a Review</h3>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Rating</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="text-yellow-400 focus:outline-none"
                  >
                    <Star 
                      size={20} 
                      className={star <= newRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Comment</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your experience about this gift..."
                className="w-full text-xs bg-pastel-cream/50 border border-brand-100 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-300"
                rows={3}
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-2 rounded-xl disabled:opacity-50"
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>

        {/* Reviews Queue List */}
        <div className="md:col-span-2 space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-brand-100/50 shadow-soft">
              <span className="text-2xl">✨</span>
              <p className="text-sm font-semibold text-gray-500 mt-2">No reviews yet. Be the first to review this gift!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-white rounded-2xl p-6 border border-brand-100/50 shadow-soft">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 font-bold text-sm">
                        {rev.userName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-pastel-navy leading-none">{rev.userName}</h4>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                    </div>
                    <div className="flex text-yellow-400">
                      {Array(rev.rating).fill(0).map((_, i) => (
                        <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Products list */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 border-t border-brand-100 pt-12">
          <h2 className="text-xl font-bold text-pastel-navy mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
