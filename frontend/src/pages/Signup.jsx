import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import { Lock, Mail, User, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { BRAND_CONFIG } from '../utils/constants';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    try {
      await signup(email, password, name);
      toast.success("Account created successfully! 🎁");
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error("Failed to create account. Make sure Firebase Auth email signup is enabled.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 page-transition">
      <SEO title="Sign Up" description={`Create an account at ${BRAND_CONFIG.name} to track customized order packing states.`} />

      <div className="bg-white border border-brand-100 rounded-3xl p-8 shadow-soft space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-pastel-navy">Join Us</h1>
          <p className="text-xs text-gray-500">Create an account to save shopping wishlists</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
                className="w-full bg-pastel-pink/30 text-xs border border-brand-100 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-pastel-pink/30 text-xs border border-brand-100 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-pastel-pink/30 text-xs border border-brand-100 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl shadow-premium text-xs transition-all disabled:opacity-50 focus:outline-none"
          >
            {submitting ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-500 hover:underline font-bold">
            Log In
          </Link>
        </p>

        <div className="bg-brand-50/50 rounded-xl p-3 border border-brand-100/20 text-[10px] text-gray-400 flex items-start gap-2">
          <AlertCircle size={14} className="text-brand-500 flex-shrink-0 mt-0.5" />
          <span>Note: Firebase Auth creates user authentication keys, and adds customer profile docs to the /users collection.</span>
        </div>
      </div>
    </div>
  );
};

export default Signup;
