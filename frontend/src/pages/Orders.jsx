import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { OrderSkeleton } from '../components/Skeleton';
import SEO from '../components/SEO';
import { Calendar, Package, ArrowRight, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Orders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef, 
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        
        let list = [];
        snap.forEach(doc => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setOrders(list);
      } catch (error) {
        console.warn("Firestore error in Orders, using mock tracking details locally:", error);
        // Fallback to local mock order history for testing
        setOrders([
          {
            id: 'ord_demo1',
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
            total: 1499,
            paymentOption: 'upi',
            orderStatus: 'Shipped',
            items: [
              { name: 'Eternal Red Rose Wooden Box', quantity: 1, price: 1499, imageUrl: 'https://images.unsplash.com/photo-1559563458-527698bf5295?q=80&w=300&auto=format&fit=crop' }
            ],
            customerDetails: { name: currentUser.displayName || 'Customer' }
          },
          {
            id: 'ord_demo2',
            createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
            total: 699,
            paymentOption: 'cod',
            orderStatus: 'Delivered',
            items: [
              { name: 'Personalized LED Glow Cushion', quantity: 1, price: 699, imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=300&auto=format&fit=crop' }
            ],
            customerDetails: { name: currentUser.displayName || 'Customer' }
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'Shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Processing': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200'; // Pending
    }
  };

  const renderStatusTracker = (status) => {
    if (status === 'Cancelled') {
      return (
        <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl border border-red-100">
          This order has been cancelled. If you paid online, refund will process in 2-3 business days.
        </div>
      );
    }

    const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    const currentIdx = steps.indexOf(status);

    return (
      <div className="pt-4">
        <div className="flex justify-between relative">
          {/* Tracking Connector Line */}
          <div className="absolute top-3 left-6 right-6 h-0.5 bg-brand-100 -z-10" />
          <div 
            className="absolute top-3 left-6 h-0.5 bg-brand-500 transition-all duration-500 -z-10" 
            style={{ width: `${(Math.max(0, currentIdx) / (steps.length - 1)) * 90}%` }}
          />

          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIdx;
            const isActive = idx === currentIdx;
            return (
              <div key={step} className="flex flex-col items-center">
                <div 
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${isCompleted ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-300 border-brand-100'} ${isActive ? 'ring-4 ring-brand-100 animate-pulse' : ''}`}
                >
                  {idx + 1}
                </div>
                <span className={`text-[10px] font-bold mt-1.5 uppercase tracking-wider ${isCompleted ? 'text-brand-500' : 'text-gray-400'}`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8 page-transition">
      <SEO title="My Orders" description="View details and trace tracking status of your past purchases." />

      <h1 className="text-2xl md:text-3xl font-extrabold text-pastel-navy mb-8 flex items-center gap-2">
        <Package size={24} className="text-brand-500" />
        Order History
      </h1>

      {loading ? (
        Array(2).fill(0).map((_, i) => <OrderSkeleton key={i} />)
      ) : orders.length === 0 ? (
        <div className="bg-white border border-brand-100 rounded-3xl p-12 text-center shadow-soft">
          <span className="text-5xl">📦</span>
          <h2 className="text-lg font-bold text-pastel-navy mt-4">No Orders Placed Yet</h2>
          <p className="text-gray-400 text-xs mt-1">Make your first purchase and track status updates here!</p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-brand-500 text-white font-bold px-6 py-2.5 rounded-full mt-6 text-xs">
            Start Shopping
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-brand-100/50 rounded-3xl p-6 shadow-soft space-y-6">
              
              {/* Order Info Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-brand-50 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-pastel-navy uppercase">Order:</span>
                    <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{order.id}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
                    <Calendar size={14} />
                    <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-extrabold tracking-wider">Total Amount</p>
                    <p className="font-extrabold text-brand-600 text-base leading-none mt-1">{formatPrice(order.total)}</p>
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1 border rounded-full ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <div className="w-12 h-14 bg-pastel-pink/30 rounded-xl overflow-hidden flex-shrink-0 border border-brand-50">
                      <img 
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=300&auto=format&fit=crop'} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="font-bold text-pastel-navy text-xs md:text-sm truncate leading-snug">{item.name}</p>
                      {item.customizationText && (
                        <p className="text-[10px] text-brand-600 font-medium">Custom text: "{item.customizationText}"</p>
                      )}
                      <p className="text-[10px] text-gray-400 font-semibold">Qty: {item.quantity} • Price: {formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Visual Tracker */}
              <div className="border-t border-brand-50 pt-6">
                {renderStatusTracker(order.orderStatus)}
              </div>

              {/* Delivery Address Details */}
              {order.customerDetails && (
                <div className="bg-pastel-cream/50 rounded-2xl p-4 text-[11px] text-gray-500 border border-brand-100/10 flex items-start gap-2">
                  <Truck size={14} className="text-brand-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-pastel-navy">Shipped To: </span>
                    {order.customerDetails.name}, {order.customerDetails.address}, {order.customerDetails.city} - {order.customerDetails.pincode} (Mobile: {order.customerDetails.mobile})
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
