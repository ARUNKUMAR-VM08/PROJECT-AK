import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider }     from './context/AuthContext';
import { CartProvider }     from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { CategoryProvider } from './context/CategoryContext';

import ErrorBoundary   from './components/ErrorBoundary';
import Header          from './components/Header';
import Footer          from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import { ProductGridSkeleton } from './components/Skeleton';
import { ProtectedRoute, AdminRoute } from './routes/ProtectedRoute';

// ── Lazy-loaded pages (code splitting) ─────────────────────────────────────
const Home           = lazy(() => import('./pages/Home'));
const Shop           = lazy(() => import('./pages/Shop'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart           = lazy(() => import('./pages/Cart'));
const Checkout       = lazy(() => import('./pages/Checkout'));
const Orders         = lazy(() => import('./pages/Orders'));
const Wishlist       = lazy(() => import('./pages/Wishlist'));
const Login          = lazy(() => import('./pages/Login'));
const Signup         = lazy(() => import('./pages/Signup'));
const About          = lazy(() => import('./pages/About'));
const Contact        = lazy(() => import('./pages/Contact'));
const NotFound       = lazy(() => import('./pages/NotFound'));

// Admin pages (separate chunk)
const AdminDashboard  = lazy(() => import('./admin/AdminDashboard'));
const ManageProducts  = lazy(() => import('./admin/ManageProducts'));
const ManageCategories = lazy(() => import('./admin/ManageCategories'));

// ── Page loading fallback ───────────────────────────────────────────────────
const PageLoader = () => (
  <div className="max-w-6xl mx-auto px-4 py-12" role="status" aria-live="polite">
    <ProductGridSkeleton count={8} />
  </div>
);

// ── Main App ────────────────────────────────────────────────────────────────
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <CategoryProvider>
            <CartProvider>
              <WishlistProvider>
                {/* Skip-to-content link for keyboard / screen-reader users */}
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-brand-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-full focus:font-bold focus:text-sm"
                >
                  Skip to content
                </a>

                <div className="flex flex-col min-h-screen pb-16 md:pb-0">
                  <Header />

                  <main id="main-content" className="flex-grow">
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        {/* Public routes */}
                        <Route path="/"                          element={<Home />} />
                        <Route path="/shop"                      element={<Shop />} />
                        <Route path="/categories/:categorySlug" element={<Shop />} />
                        <Route path="/product/:id"              element={<ProductDetails />} />
                        <Route path="/cart"                     element={<Cart />} />
                        <Route path="/checkout"                 element={<Checkout />} />
                        <Route path="/wishlist"                 element={<Wishlist />} />
                        <Route path="/about"                    element={<About />} />
                        <Route path="/contact"                  element={<Contact />} />
                        <Route path="/login"                    element={<Login />} />
                        <Route path="/signup"                   element={<Signup />} />

                        {/* Protected user routes */}
                        <Route path="/orders" element={
                          <ProtectedRoute><Orders /></ProtectedRoute>
                        } />

                        {/* Protected admin routes */}
                        <Route path="/admin" element={
                          <AdminRoute><AdminDashboard /></AdminRoute>
                        } />
                        <Route path="/admin/products" element={
                          <AdminRoute><ManageProducts /></AdminRoute>
                        } />
                        <Route path="/admin/categories" element={
                          <AdminRoute><ManageCategories /></AdminRoute>
                        } />

                        {/* 404 */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </main>

                <Footer />
                <MobileBottomNav />
              </div>

              <ToastContainer
                position="bottom-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                aria-live="polite"
              />
              </WishlistProvider>
            </CartProvider>
          </CategoryProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
