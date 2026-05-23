import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ArrowRight, ShoppingBag, Truck, Gift } from 'lucide-react';
import SEO from '../components/SEO';
import { toast } from 'react-toastify';
import { DELIVERY_CONFIG } from '../utils/constants';
import { formatPrice } from '../utils/formatters';

const Cart = () => {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    subtotal, 
    deliveryCharge, 
    total
  } = useCart();
  
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    navigate('/checkout');
  };

  // Calculate missing amount for free shipping
  const missingForFreeShipping = DELIVERY_CONFIG.freeAbove - subtotal;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 page-transition">
      <SEO title="Shopping Cart" description="Manage items in your shopping cart before proceeding to customized checkout." />

      <h1 className="text-2xl md:text-3xl font-extrabold text-pastel-navy mb-8 flex items-center gap-2">
        <ShoppingBag size={24} className="text-brand-500" />
        Shopping Cart
      </h1>

      {cartItems.length === 0 ? (
        <div className="bg-white border border-brand-100 rounded-3xl p-12 text-center shadow-soft">
          <span className="text-5xl">🛍️</span>
          <h2 className="text-xl font-bold text-pastel-navy mt-4">Your Cart is Empty</h2>
          <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto">
            Looks like you haven't added any premium gifts yet. Explore our custom collections to surprise your loved ones!
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-full mt-6 shadow-soft transition-all"
          >
            Start Shopping
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Free Shipping Alert Bar */}
            {missingForFreeShipping > 0 ? (
              <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 flex items-center gap-3 text-xs md:text-sm text-brand-700 font-medium">
                <Truck size={20} className="text-brand-500 flex-shrink-0 animate-bounce" />
                <span>
                  Add <span className="font-extrabold">{formatPrice(missingForFreeShipping)}</span> more to qualify for <span className="font-extrabold">FREE SHIPPING!</span> (Current flat delivery: ₹{DELIVERY_CONFIG.charge})
                </span>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 text-xs md:text-sm text-green-700 font-medium">
                <Truck size={20} className="text-green-500 flex-shrink-0" />
                <span>
                  Congratulations! Your order qualifies for <span className="font-extrabold">FREE SHIPPING!</span> 🎉
                </span>
              </div>
            )}

            <div className="bg-white border border-brand-100/50 rounded-3xl overflow-hidden shadow-soft divide-y divide-brand-50">
              {cartItems.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="p-4 md:p-6 flex gap-4 items-start md:items-center">
                  {/* Item Image */}
                  <div className="w-16 h-20 md:w-20 md:h-24 bg-pastel-pink/30 rounded-xl overflow-hidden flex-shrink-0 border border-brand-50">
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=300&auto=format&fit=crop'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-grow min-w-0">
                    <span className="text-[10px] uppercase font-bold text-gray-400">
                      {item.category?.replace('-', ' ')}
                    </span>
                    <h3 className="font-bold text-pastel-navy text-sm md:text-base leading-snug truncate hover:text-brand-500">
                      <Link to={`/product/${item.id}`}>{item.name}</Link>
                    </h3>
                    
                    {/* Custom Text Print */}
                    {item.customizationText && (
                      <div className="bg-pastel-peach/50 text-[11px] text-brand-700 font-medium px-2.5 py-1 rounded-lg mt-1 border border-brand-100/20 inline-block max-w-full truncate">
                        <span className="font-bold">Custom:</span> "{item.customizationText}"
                      </div>
                    )}

                    <div className="text-sm font-extrabold text-brand-600 mt-2 md:hidden">
                      {formatPrice(item.price)}
                    </div>
                  </div>

                  {/* Quantity & Actions (Desktop layout) */}
                  <div className="flex flex-col md:flex-row items-end md:items-center gap-3 md:gap-6 flex-shrink-0">
                    <div className="hidden md:block text-sm font-extrabold text-pastel-navy">
                      {formatPrice(item.price)}
                    </div>

                    {/* Counter */}
                    <div className="flex items-center border border-brand-100 bg-pastel-cream rounded-full scale-90 md:scale-100">
                      <button
                        onClick={() => updateQuantity(item.id, item.customizationText, item.quantity - 1)}
                        className="px-2.5 py-1 text-pastel-navy font-bold hover:text-brand-500 transition-colors focus:outline-none"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.customizationText, item.quantity + 1)}
                        className="px-2.5 py-1 text-pastel-navy font-bold hover:text-brand-500 transition-colors focus:outline-none"
                      >
                        +
                      </button>
                    </div>

                    {/* Delete Icon */}
                    <button
                      onClick={() => {
                        removeFromCart(item.id, item.customizationText);
                        toast.info(`Removed ${item.name} from cart`);
                      }}
                      className="text-gray-400 hover:text-red-500 p-2 transition-colors focus:outline-none"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Summary Card */}
          <div className="bg-white border border-brand-100/50 rounded-3xl p-6 shadow-soft h-fit space-y-6">
            <h3 className="font-bold text-pastel-navy text-lg border-b border-brand-50 pb-3">Order Summary</h3>
            
            <div className="space-y-3 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-pastel-navy">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-bold text-pastel-navy">
                  {deliveryCharge > 0 ? formatPrice(deliveryCharge) : 'FREE'}
                </span>
              </div>
            </div>

            <div className="border-t border-brand-50 pt-4 flex justify-between items-baseline">
              <span className="font-bold text-pastel-navy text-base">Total Amount</span>
              <span className="text-2xl font-black text-brand-600">{formatPrice(total)}</span>
            </div>

            {/* Gift Wrap Promo */}
            <div className="bg-pastel-pink/30 rounded-2xl p-3 border border-brand-100/20 text-xs text-gray-500 flex items-center gap-2">
              <Gift size={16} className="text-brand-400 flex-shrink-0" />
              <span>All items include premium, cute boutique packaging with a customizable greeting card.</span>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-full shadow-premium flex items-center justify-center gap-1.5 transition-all text-sm focus:outline-none"
            >
              Proceed to Checkout
              <ArrowRight size={16} />
            </button>

            <Link
              to="/shop"
              className="block text-center text-xs font-bold text-brand-500 hover:text-brand-600 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
