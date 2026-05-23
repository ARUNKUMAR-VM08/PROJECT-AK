import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Mail, Phone, MapPin, Heart, Gift } from 'lucide-react';
import { Instagram } from './BrandIcons';
import { BRAND_CONFIG } from '../utils/constants';
import { useCategories } from '../context/CategoryContext';

const Footer = () => {
  const { categories } = useCategories();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-pastel-navy text-gray-300 pt-12 pb-6" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-white/10">

          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2" aria-label={`${BRAND_CONFIG.name} home`}>
              <div className="w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center">
                <Gift size={18} className="text-white" />
              </div>
              <span className="font-black text-xl text-white">{BRAND_CONFIG.name}</span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              {BRAND_CONFIG.tagline}. Handcrafted gifts delivered with love across India.
            </p>
            <div className="flex gap-3">
              <a
                href={BRAND_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
                className="w-9 h-9 bg-white/10 hover:bg-brand-500 rounded-xl flex items-center justify-center transition-colors"
              >
                <Instagram size={16} />
              </a>
              <a
                href={`https://wa.me/${BRAND_CONFIG.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with us on WhatsApp"
                className="w-9 h-9 bg-white/10 hover:bg-green-500 rounded-xl flex items-center justify-center transition-colors"
              >
                <MessageCircle size={16} />
              </a>
              <a
                href={`mailto:${BRAND_CONFIG.email}`}
                aria-label="Send us an email"
                className="w-9 h-9 bg-white/10 hover:bg-brand-500 rounded-xl flex items-center justify-center transition-colors"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest">Shop</h3>
            <ul className="space-y-2.5" role="list">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    to={`/categories/${cat.slug}`}
                    className="text-sm text-gray-400 hover:text-brand-400 transition-colors flex items-center gap-1.5"
                  >
                    <span aria-hidden="true">{cat.emoji}</span> {cat.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/shop" className="text-sm text-brand-400 font-semibold hover:text-brand-300 transition-colors">
                  View All →
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest">Quick Links</h3>
            <ul className="space-y-2.5" role="list">
              {[
                { label: 'My Orders',    to: '/orders' },
                { label: 'Wishlist',     to: '/wishlist' },
                { label: 'Cart',         to: '/cart' },
                { label: 'About Us',     to: '/about' },
                { label: 'Contact Us',   to: '/contact' },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-gray-400 hover:text-brand-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest">Contact</h3>
            <ul className="space-y-3" role="list">
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <Phone size={14} className="text-brand-400 mt-0.5 flex-shrink-0" />
                <a href={`tel:${BRAND_CONFIG.phone}`} className="hover:text-brand-400 transition-colors">
                  {BRAND_CONFIG.phone}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <Mail size={14} className="text-brand-400 mt-0.5 flex-shrink-0" />
                <a href={`mailto:${BRAND_CONFIG.email}`} className="hover:text-brand-400 transition-colors break-all">
                  {BRAND_CONFIG.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <MapPin size={14} className="text-brand-400 mt-0.5 flex-shrink-0" />
                <span>{BRAND_CONFIG.address}</span>
              </li>
              <li className="mt-2">
                <a
                  href={`https://wa.me/${BRAND_CONFIG.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors"
                >
                  <MessageCircle size={13} /> Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {year} {BRAND_CONFIG.name}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={11} className="text-brand-400 fill-brand-400" aria-hidden="true" /> in India
          </p>
          <div className="flex gap-4">
            <Link to="/about"   className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
