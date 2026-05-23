import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import SEO from '../components/SEO';
import { ShoppingBag, DollarSign, Package, Users, PlusCircle, CheckCircle, RefreshCw, Smartphone, Layers } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    sales: 0,
    ordersCount: 0,
    productsCount: 8
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const ordersCol = collection(db, 'orders');
      const q = query(ordersCol, orderBy('createdAt', 'desc'));
      const ordersSnap = await getDocs(q);
      
      let ordersList = [];
      let totalSales = 0;
      ordersSnap.forEach(doc => {
        const data = doc.data();
        ordersList.push({ id: doc.id, ...data });
        if (data.orderStatus !== 'Cancelled') {
          totalSales += data.total || 0;
        }
      });
      setOrders(ordersList);

      const productsCol = collection(db, 'products');
      const productsSnap = await getDocs(productsCol);
      const prodCount = productsSnap.size || 8;

      setStats({
        sales: totalSales,
        ordersCount: ordersList.length,
        productsCount: prodCount
      });
    } catch (error) {
      console.warn("Firestore error on admin dashboard load, presenting demo data:", error);
      setOrders([
        {
          id: 'ord_demo1',
          createdAt: new Date().toISOString(),
          total: 1499,
          paymentOption: 'upi',
          paymentStatus: 'verification-pending',
          orderStatus: 'Pending',
          upiTxnId: 'UPI294720471',
          items: [{ name: 'Eternal Red Rose Wooden Box', quantity: 1, price: 1499, customizationText: 'Happy 5th Anniversary' }],
          customerDetails: { name: 'Monica Sri', mobile: '9876543210', address: 'Indiranagar 100ft road', city: 'Bangalore', pincode: '560038' }
        }
      ]);
      setStats({
        sales: 1499,
        ordersCount: 1,
        productsCount: 8
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { orderStatus: newStatus });
      toast.success(`Updated order status to ${newStatus}!`);
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
    } catch (error) {
      toast.error("Failed to update status. Firestore rules might block updates.");
      console.error(error);
    }
  };

  const handlePaymentStatusChange = async (orderId, newPayStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { paymentStatus: newPayStatus });
      toast.success(`Updated payment status to ${newPayStatus}!`);
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: newPayStatus } : o));
    } catch (error) {
      toast.error("Failed to update payment status.");
      console.error(error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 page-transition">
      <SEO title="Admin Dashboard" description="Overview stats and update customer orders." />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-pastel-navy">IFRAME YOUU Admin Panel</h1>
          <p className="text-xs text-gray-500">Manage products inventory and track order packaging pipelines</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchDashboardData}
            className="bg-white border border-brand-100 hover:bg-brand-50 text-pastel-navy font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 focus:outline-none"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <Link
            to="/admin/categories"
            className="bg-white border border-brand-100 hover:bg-brand-50 text-pastel-navy font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 focus:outline-none"
          >
            <Layers size={14} /> Manage Categories
          </Link>
          <Link
            to="/admin/products"
            className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-soft focus:outline-none"
          >
            <PlusCircle size={14} /> Manage Products
          </Link>
        </div>
      </div>

      {/* Stats Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-brand-100 rounded-3xl p-6 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Total Sales</p>
            <p className="text-xl font-extrabold text-pastel-navy mt-1">{formatPrice(stats.sales)}</p>
          </div>
        </div>

        <div className="bg-white border border-brand-100 rounded-3xl p-6 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Total Orders</p>
            <p className="text-xl font-extrabold text-pastel-navy mt-1">{stats.ordersCount}</p>
          </div>
        </div>

        <div className="bg-white border border-brand-100 rounded-3xl p-6 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
            <Package size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Products Catalog</p>
            <p className="text-xl font-extrabold text-pastel-navy mt-1">{stats.productsCount} items</p>
          </div>
        </div>
      </div>

      {/* Orders Queue list */}
      <div className="bg-white border border-brand-100 rounded-3xl shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-50">
          <h2 className="font-bold text-pastel-navy text-base">Customer Orders Queue</h2>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-xs font-semibold">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs font-semibold">No orders found in queue.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-pastel-pink/30 border-b border-brand-50 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Order Ref / ID</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Items Summary</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Shipping Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-50 text-pastel-navy">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-pastel-pink/10 transition-colors">
                    <td className="p-4 font-mono font-bold text-brand-600">{order.id}</td>
                    
                    <td className="p-4 space-y-1">
                      <p className="font-bold">{order.customerDetails?.name}</p>
                      <p className="text-[10px] text-gray-400">{order.customerDetails?.mobile}</p>
                      <p className="text-[10px] text-gray-500 truncate max-w-[200px]" title={order.customerDetails?.address}>
                        {order.customerDetails?.address}, {order.customerDetails?.city}
                      </p>
                    </td>

                    <td className="p-4 space-y-1.5">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex flex-col">
                          <span className="font-semibold">{item.name} <span className="text-brand-500 font-bold">x{item.quantity}</span></span>
                          {item.customizationText && (
                            <span className="text-[9px] text-brand-600 bg-brand-50/50 px-1 py-0.5 rounded w-fit">
                              Print: "{item.customizationText}"
                            </span>
                          )}
                        </div>
                      ))}
                    </td>

                    <td className="p-4 font-extrabold">{formatPrice(order.total)}</td>

                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="uppercase text-[9px] font-bold text-gray-400">{order.paymentOption}</span>
                        {order.upiTxnId && (
                          <span className="text-[9px] bg-pastel-peach text-pastel-gold font-bold px-1.5 rounded">Txn ID: {order.upiTxnId}</span>
                        )}
                      </div>
                      
                      <select
                        value={order.paymentStatus || 'pending'}
                        onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                        className="bg-pastel-pink/50 text-[10px] border border-brand-100 rounded p-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="verification-pending">Pending Verification</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                      </select>
                    </td>

                    <td className="p-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="bg-brand-50/80 border border-brand-100 rounded-lg p-1.5 font-semibold text-pastel-navy"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
