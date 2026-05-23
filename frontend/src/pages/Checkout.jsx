import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, buildWhatsAppOrderUrl, updateOrderStatus } from '../services/orderService';
import useRazorpay from '../hooks/useRazorpay';
import SEO from '../components/SEO';
import { CreditCard, Truck, Send, Smartphone, CheckCircle, QrCode, ShoppingBag } from 'lucide-react';
import { toast } from 'react-toastify';
import { BRAND_CONFIG } from '../utils/constants';
import { formatPrice } from '../utils/formatters';

const Checkout = () => {
  const { cartItems, subtotal, deliveryCharge, total, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { openRazorpay, loading: razorpayLoading } = useRazorpay();

  const [formData, setFormData] = useState({
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    mobile: '',
    address: '',
    city: '',
    pincode: '',
    paymentOption: 'cod', // cod, upi, whatsapp, razorpay
    upiTxnId: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRazorpayCheckout = async (orderId, totalAmount) => {
    try {
      await openRazorpay(
        {
          amount: totalAmount,
          orderId: orderId,
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile
        },
        async (response) => {
          // Success callback
          toast.success("Payment successful! 💳");
          try {
            await updateOrderStatus(orderId, {
              paymentStatus: 'paid',
              razorpayPaymentId: response.razorpay_payment_id
            });
          } catch (err) {
            console.error("Failed to update paid status in Firestore:", err);
          }
        },
        (error) => {
          // Failure callback
          toast.error(error.message || "Payment failed.");
        }
      );
    } catch (err) {
      console.error("Razorpay initiation error:", err);
      toast.error("Could not load payment overlay. Please verify configuration.");
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    if (!formData.name || !formData.mobile || !formData.address || !formData.city || !formData.pincode) {
      toast.error("Please fill in all required shipping fields!");
      return;
    }

    if (formData.paymentOption === 'upi' && !formData.upiTxnId) {
      toast.error("Please enter your UPI transaction reference ID!");
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        userId: currentUser?.uid || 'guest',
        customerDetails: {
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode
        },
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          customizationText: item.customizationText || '',
          imageUrl: item.imageUrl || ''
        })),
        subtotal,
        deliveryCharge,
        total,
        paymentOption: formData.paymentOption,
        upiTxnId: formData.paymentOption === 'upi' ? formData.upiTxnId : '',
      };

      const result = await createOrder(orderData);
      
      if (!result.success) {
        toast.error(result.error || "Failed to place order.");
        setSubmitting(false);
        return;
      }
      
      const orderId = result.id;
      setCreatedOrderId(orderId);
      setOrderSuccess(true);
      toast.success("Order placed successfully! 🎉");

      // Trigger Razorpay modal overlay
      if (formData.paymentOption === 'razorpay') {
        await handleRazorpayCheckout(orderId, total);
      }

      // WhatsApp redirection if chosen
      if (formData.paymentOption === 'whatsapp') {
        const waUrl = buildWhatsAppOrderUrl(orderId, {
          ...orderData,
          items: cartItems
        });
        window.open(waUrl, '_blank');
      }

      clearCart();
    } catch (error) {
      console.warn("Order submission failed:", error);
      toast.error("Error placing order. Please check your network connection.");
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6 page-transition">
        <SEO title="Order Success" description={`Thank you for shopping at ${BRAND_CONFIG.name}.`} />
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto border-2 border-green-200">
          <CheckCircle size={44} className="fill-green-50" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-pastel-navy">Order Confirmed!</h1>
          <p className="text-sm text-gray-500">
            Thank you for shopping. We are preparing your boutique package now.
          </p>
          <div className="bg-brand-50 border border-brand-100 rounded-2xl p-3 inline-block mt-3 text-xs font-bold text-pastel-navy">
            Order Reference ID: <span className="font-black text-brand-600">#GB-{createdOrderId.slice(0, 6).toUpperCase()}</span>
          </div>
        </div>

        <div className="bg-white border border-brand-100 rounded-3xl p-6 shadow-soft text-left space-y-4">
          <h3 className="font-bold text-sm text-pastel-navy border-b border-brand-50 pb-2">What happens next?</h3>
          <ul className="space-y-2 text-xs text-gray-500">
            <li>• Log in to your account page to track status updates.</li>
            <li>• Our team will message you on WhatsApp to double-check custom texts.</li>
            {formData.paymentOption === 'upi' && <li>• Once payment txn ID is verified, shipping will begin.</li>}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <a
            href={buildWhatsAppOrderUrl(createdOrderId, {
              subtotal,
              deliveryCharge,
              total,
              paymentOption: formData.paymentOption,
              customerDetails: {
                name: formData.name,
                mobile: formData.mobile,
                address: formData.address,
                city: formData.city,
                pincode: formData.pincode
              },
              items: cartItems
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-full text-xs shadow-soft flex items-center justify-center gap-2 transition-all"
          >
            <Send size={14} />
            Confirm Customizations on WhatsApp 💬
          </a>
          <Link
            to="/orders"
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-full text-xs shadow-soft text-center"
          >
            Track Order Status
          </Link>
          <Link
            to="/"
            className="w-full bg-white border border-brand-100 text-pastel-navy font-semibold py-3 rounded-full text-xs shadow-soft text-center"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 page-transition">
      <SEO title="Checkout" description="Enter delivery coordinates and select shipping/billing options." />
      
      <h1 className="text-2xl md:text-3xl font-extrabold text-pastel-navy mb-8">Secure Checkout</h1>

      {cartItems.length === 0 ? (
        <div className="bg-white border border-brand-100 rounded-3xl p-12 text-center shadow-soft">
          <h2 className="text-lg font-bold text-pastel-navy">Your Cart is Empty</h2>
          <p className="text-gray-400 text-xs mt-1">Add products to cart before heading here.</p>
          <Link to="/shop" className="inline-block bg-brand-500 text-white font-bold px-6 py-2 rounded-full mt-4 text-xs">
            Browse Gifts
          </Link>
        </div>
      ) : (
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Shipping Form details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-brand-100/50 rounded-3xl p-6 shadow-soft space-y-4">
              <h3 className="font-bold text-pastel-navy text-base flex items-center gap-2 border-b border-brand-50 pb-3">
                <Truck size={18} className="text-brand-500" />
                Shipping Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter name"
                    className="w-full bg-pastel-pink/30 text-xs border border-brand-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Mobile Number *</label>
                  <input
                    type="tel"
                    name="mobile"
                    required
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="10-digit number"
                    className="w-full bg-pastel-pink/30 text-xs border border-brand-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-300"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email Address (Optional)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full bg-pastel-pink/30 text-xs border border-brand-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Complete Address *</label>
                <textarea
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House/Flat number, Street name, Landmark details"
                  rows={3}
                  className="w-full bg-pastel-pink/30 text-xs border border-brand-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">City *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    className="w-full bg-pastel-pink/30 text-xs border border-brand-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="6-digit pincode"
                    className="w-full bg-pastel-pink/30 text-xs border border-brand-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-300"
                  />
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-white border border-brand-100/50 rounded-3xl p-6 shadow-soft space-y-4">
              <h3 className="font-bold text-pastel-navy text-base flex items-center gap-2 border-b border-brand-50 pb-3">
                <CreditCard size={18} className="text-brand-500" />
                Select Payment Mode
              </h3>

              <div className="space-y-3">
                {/* COD option */}
                <label className="flex items-center gap-3 p-3.5 border border-brand-100 rounded-2xl cursor-pointer hover:bg-pastel-pink/30 transition-colors">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="cod"
                    checked={formData.paymentOption === 'cod'}
                    onChange={handleChange}
                    className="accent-brand-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-pastel-navy">Cash on Delivery (COD)</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Pay in cash or UPI when the package is delivered.</p>
                  </div>
                </label>

                {/* WhatsApp Order option */}
                <label className="flex items-center gap-3 p-3.5 border border-brand-100 rounded-2xl cursor-pointer hover:bg-pastel-pink/30 transition-colors">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="whatsapp"
                    checked={formData.paymentOption === 'whatsapp'}
                    onChange={handleChange}
                    className="accent-brand-500"
                  />
                  <div className="flex-grow">
                    <p className="text-xs font-bold text-pastel-navy flex items-center gap-1.5">
                      Order via WhatsApp
                      <span className="text-[9px] bg-green-500 text-white font-black px-1.5 py-0.5 rounded">AUTO-FILL</span>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Place order here and send auto-filled receipt directly on WhatsApp to customize.</p>
                  </div>
                </label>

                {/* UPI QR option */}
                <label className="flex items-center gap-3 p-3.5 border border-brand-100 rounded-2xl cursor-pointer hover:bg-pastel-pink/30 transition-colors">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="upi"
                    checked={formData.paymentOption === 'upi'}
                    onChange={handleChange}
                    className="accent-brand-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-pastel-navy">Scan & Pay via UPI QR</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Pay via any UPI app (GPay, PhonePe, Paytm) to skip COD fees.</p>
                  </div>
                </label>

                {/* Razorpay Gateway option (Future ready) */}
                <label className="flex items-center gap-3 p-3.5 border border-brand-100 rounded-2xl cursor-pointer hover:bg-pastel-pink/30 transition-colors opacity-75">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="razorpay"
                    checked={formData.paymentOption === 'razorpay'}
                    onChange={handleChange}
                    className="accent-brand-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-pastel-navy flex items-center gap-1.5">
                      Pay Online (Credit Card / UPI / NetBanking)
                      <span className="text-[9px] bg-brand-100 text-brand-600 font-bold px-1.5 py-0.5 rounded">GATEWAY DEMO</span>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Future-ready integration placeholder demonstrating standard Razorpay script loader.</p>
                  </div>
                </label>
              </div>

              {/* UPI QR code drawer panel */}
              {formData.paymentOption === 'upi' && (
                <div className="bg-pastel-peach/50 border border-brand-100/40 rounded-2xl p-4 mt-4 text-center space-y-4 animate-[slideDown_0.2s_ease-out]">
                  <div className="flex flex-col items-center gap-2">
                    <QrCode size={120} className="text-pastel-navy bg-white p-2 rounded-xl border border-brand-100" />
                    <p className="text-xs font-bold text-pastel-navy">UPI ID: {BRAND_CONFIG.upiId}</p>
                    <p className="text-[10px] text-gray-400 max-w-xs">
                      Scan the QR code or use the ID to pay total amount of <span className="font-extrabold text-brand-600">{formatPrice(total)}</span>. Enter the Transaction Ref ID below.
                    </p>
                  </div>
                  
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-extrabold text-pastel-navy uppercase tracking-wider block">UPI Transaction Ref ID *</label>
                    <input
                      type="text"
                      name="upiTxnId"
                      value={formData.upiTxnId}
                      onChange={handleChange}
                      placeholder="e.g. 234893746328"
                      className="w-full bg-white text-xs border border-brand-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-300"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Checkout Right Column: Summary & Button */}
          <div className="space-y-6">
            <div className="bg-white border border-brand-100/50 rounded-3xl p-6 shadow-soft space-y-4">
              <h3 className="font-bold text-pastel-navy text-sm border-b border-brand-50 pb-2">Your Items</h3>
              
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex gap-3 text-xs items-center">
                    <div className="w-10 h-12 bg-pastel-pink/30 rounded overflow-hidden flex-shrink-0 border border-brand-50">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="font-semibold text-pastel-navy truncate leading-snug">{item.name}</p>
                      <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-bold text-pastel-navy">{formatPrice(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>

              <div className="border-t border-brand-50 pt-4 space-y-2 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-pastel-navy">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-semibold text-pastel-navy">
                    {deliveryCharge > 0 ? formatPrice(deliveryCharge) : 'FREE'}
                  </span>
                </div>
              </div>

              <div className="border-t border-brand-50 pt-3 flex justify-between items-baseline">
                <span className="font-bold text-pastel-navy text-sm">Total</span>
                <span className="text-xl font-black text-brand-600">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-full shadow-premium flex items-center justify-center gap-1.5 text-sm disabled:opacity-50 focus:outline-none"
            >
              {submitting ? "Processing..." : (
                formData.paymentOption === 'whatsapp' ? "Order on WhatsApp" : "Place Order Now"
              )}
            </button>

            <Link
              to="/cart"
              className="block text-center text-xs font-bold text-brand-500 hover:text-brand-600 transition-colors"
            >
              Edit Cart Items
            </Link>
          </div>

        </form>
      )}
    </div>
  );
};

export default Checkout;
