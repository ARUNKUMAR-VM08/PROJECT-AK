import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ShoppingBag, Heart, User, Store } from 'lucide-react';
import { useCart }     from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const navItems = [
  { to: '/',        label: 'Home',    Icon: Home },
  { to: '/shop',    label: 'Shop',    Icon: Store },
  { to: '/wishlist',label: 'Saved',   Icon: Heart },
  { to: '/cart',    label: 'Cart',    Icon: ShoppingBag, badge: 'cart' },
  { to: '/orders',  label: 'Account', Icon: User },
];

const MobileBottomNav = () => {
  const location              = useLocation();
  const { itemsCount }        = useCart();
  const { wishlistItems }     = useWishlist();
  const isActive = (path)     => location.pathname === path;

  const getBadge = (key) => {
    if (key === 'cart') return itemsCount;
    if (key === 'wishlist') return wishlistItems.length;
    return 0;
  };

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-100 safe-area-inset-bottom"
    >
      <div className="flex items-center justify-around px-2 py-1.5">
        {navItems.map(({ to, label, Icon, badge }) => {
          const active = isActive(to);
          const count  = badge ? getBadge(badge) : 0;
          return (
            <Link
              key={to}
              to={to}
              aria-label={`${label}${count > 0 ? ` (${count})` : ''}`}
              aria-current={active ? 'page' : undefined}
              className="relative flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors"
            >
              {active && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute inset-0 bg-brand-50 rounded-xl"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <div className="relative z-10">
                <Icon
                  size={21}
                  className={active ? 'text-brand-500' : 'text-gray-400'}
                  strokeWidth={active ? 2.5 : 2}
                />
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-brand-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </div>
              <span className={`text-[9px] font-bold relative z-10 ${active ? 'text-brand-500' : 'text-gray-400'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
