import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6 page-transition">
      <SEO title="Page Not Found" description="The page you are looking for does not exist." />
      
      <span className="text-7xl block">🎁</span>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-pastel-navy">404 - Lost Package!</h1>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          We couldn't find the page you are looking for. Perhaps it got delivered somewhere else!
        </p>
      </div>

      <Link
        to="/"
        className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-full text-xs shadow-soft transition-all focus:outline-none"
      >
        <Home size={14} />
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
