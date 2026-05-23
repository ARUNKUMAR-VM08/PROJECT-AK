import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Heart, Search, User, Menu, X, LogOut,
  Settings, Package, ChevronDown, Gift
} from 'lucide-react';
import { useAuth }     from '../context/AuthContext';
import { useCart }     from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { BRAND_CONFIG } from '../utils/constants';
import { useCategories } from '../context/CategoryContext';

const Header = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const { itemsCount }    = useCart();
  const { wishlistItems } = useWishlist();
  const { categories }    = useCategories();
  const navigate          = useNavigate();
  const location          = useLocation();

  const [menuOpen,   setMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ,    setSearchQ]    = useState('');
  const [userMenu,   setUserMenu]   = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Track scroll for glassmorphism effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setUserMenu(false);
  }, [location.pathname]);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 100);
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim().length >= 2) {
      navigate(`/shop?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchQ('');
      setSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Home',       to: '/' },
    { label: 'Shop',       to: '/shop' },
    { label: 'About',      to: '/about' },
    { label: 'Contact',    to: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-[0_2px_20px_rgba(224,164,152,0.12)] border-b border-brand-50'
          : 'bg-white border-b border-brand-50/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" aria-label={`${BRAND_CONFIG.name} – Home`} className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-soft">
            <Gift size={16} className="text-white" />
          </div>
          <span className="font-black text-lg text-pastel-navy tracking-tight hidden sm:block">
            {BRAND_CONFIG.name}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          {navLinks.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm font-semibold transition-colors ${
                isActive(to) ? 'text-brand-500' : 'text-gray-600 hover:text-brand-500'
              }`}
            >
              {label}
            </Link>
          ))}
          {/* Categories dropdown */}
          <div className="relative group">
            <button className="text-sm font-semibold text-gray-600 hover:text-brand-500 flex items-center gap-1 transition-colors">
              Categories <ChevronDown size={13} className="mt-0.5" />
            </button>
            <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl shadow-premium border border-brand-50 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <Link
                to="/#categories"
                className="flex items-center gap-2 px-4 py-2 text-sm text-brand-500 font-bold hover:bg-brand-50 transition-colors border-b border-brand-50 mb-1"
              >
                <span>✨</span> View All Categories
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/categories/${cat.slug}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-brand-500 hover:bg-pastel-pink/30 transition-colors"
                >
                  <span>{cat.emoji}</span> {cat.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">

          {/* Search */}
          <button
            aria-label="Search products"
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 rounded-xl text-gray-600 hover:text-brand-500 hover:bg-pastel-pink/30 transition-colors"
          >
            <Search size={20} />
          </button>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            aria-label={`Wishlist (${wishlistItems.length} items)`}
            className="relative p-2 rounded-xl text-gray-600 hover:text-brand-500 hover:bg-pastel-pink/30 transition-colors"
          >
            <Heart size={20} />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-brand-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {wishlistItems.length > 9 ? '9+' : wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            aria-label={`Cart (${itemsCount} items)`}
            className="relative p-2 rounded-xl text-gray-600 hover:text-brand-500 hover:bg-pastel-pink/30 transition-colors"
          >
            <ShoppingBag size={20} />
            {itemsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-brand-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {itemsCount > 9 ? '9+' : itemsCount}
              </span>
            )}
          </Link>

          {/* User menu */}
          {currentUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                aria-label="Account menu"
                aria-expanded={userMenu}
                onClick={() => setUserMenu(!userMenu)}
                className="p-2 rounded-xl text-gray-600 hover:text-brand-500 hover:bg-pastel-pink/30 transition-colors"
              >
                <User size={20} />
              </button>
              <AnimatePresence>
                {userMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-premium border border-brand-50 py-2 z-10"
                    role="menu"
                  >
                    <div className="px-4 py-2 border-b border-brand-50">
                      <p className="text-xs font-bold text-pastel-navy truncate">{currentUser.displayName || 'My Account'}</p>
                      <p className="text-[10px] text-gray-400 truncate">{currentUser.email}</p>
                    </div>
                    <Link to="/orders"   className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-brand-500 hover:bg-pastel-pink/30 transition-colors" role="menuitem"><Package size={14} /> My Orders</Link>
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-brand-600 font-semibold hover:bg-brand-50 transition-colors" role="menuitem"><Settings size={14} /> Admin Panel</Link>
                    )}
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors" role="menuitem">
                      <LogOut size={14} /> Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden sm:block text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-full transition-colors"
            >
              Sign In
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-pastel-pink/30 transition-colors"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-brand-50 overflow-hidden"
          >
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto px-4 py-3 flex gap-2">
              <input
                ref={searchRef}
                type="search"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search gifts, occasions, personalised items…"
                aria-label="Search products"
                className="flex-grow bg-pastel-pink/30 border border-brand-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
              <button
                type="submit"
                disabled={searchQ.trim().length < 2}
                className="bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white font-bold px-5 py-2 rounded-full text-sm transition-colors"
              >
                Search
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-brand-50 bg-white overflow-hidden"
            aria-label="Mobile navigation"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-colors ${
                    isActive(to) ? 'text-brand-500 bg-brand-50' : 'text-gray-700 hover:bg-pastel-pink/30'
                  }`}
                >
                  {label}
                </Link>
              ))}
              <div className="h-px bg-brand-50 my-2" />
              <Link
                to="/#categories"
                className="py-2.5 px-3 rounded-xl text-sm font-bold text-brand-500 hover:bg-pastel-pink/30 transition-colors flex items-center gap-2 border-b border-brand-50/50 mb-1"
              >
                ✨ View All Categories
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/categories/${cat.slug}`}
                  className="py-2 px-3 rounded-xl text-sm text-gray-600 hover:bg-pastel-pink/30 transition-colors flex items-center gap-2"
                >
                  {cat.emoji} {cat.label}
                </Link>
              ))}
              {!currentUser && (
                <>
                  <div className="h-px bg-brand-50 my-2" />
                  <Link to="/login"  className="py-2.5 px-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-pastel-pink/30">Sign In</Link>
                  <Link to="/signup" className="py-2.5 px-3 rounded-xl text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 text-center mt-1 transition-colors">Create Account</Link>
                </>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
