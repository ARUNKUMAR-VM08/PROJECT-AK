import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import { Lock, Mail, AlertCircle, Phone, CheckCircle, Smartphone } from 'lucide-react';
import { Chrome } from '../components/BrandIcons';
import { toast } from 'react-toastify';
import { BRAND_CONFIG } from '../utils/constants';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../services/firebase';

const Login = () => {
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+91');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, loginWithGoogle, upsertUserDoc } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (e) {
          console.error("Error clearing recaptcha on unmount:", e);
        }
      }
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Successfully logged in! 👋");
      navigate(-1); // Back to previous page
    } catch (error) {
      console.error(error);
      toast.error("Failed to login. Please check credentials or configure Firebase Auth.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success("Successfully logged in with Google! 👋");
      navigate(-1);
    } catch (error) {
      console.error(error);
      toast.error("Google login failed. Enable Google Sign-In in Firebase Console.");
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!phoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }
    const cleanedPhone = phoneNumber.replace(/\s+/g, '');
    if (!cleanedPhone.startsWith('+') || cleanedPhone.length < 10) {
      toast.error("Please enter a valid phone number with country code (e.g. +919876543210)");
      return;
    }

    setSubmitting(true);
    try {
      let appVerifier = window.recaptchaVerifier;
      if (!appVerifier) {
        appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved
          }
        });
        window.recaptchaVerifier = appVerifier;
      }

      const confirmation = await signInWithPhoneNumber(auth, cleanedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      toast.success("Verification code sent! 📱");
    } catch (error) {
      console.error("Error sending OTP:", error);
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (e) {
          console.error("Error clearing recaptcha:", e);
        }
      }
      if (error.code === 'auth/invalid-phone-number') {
        toast.error("Invalid phone number format. Use country code (e.g. +919876543210)");
      } else if (error.code === 'auth/too-many-requests') {
        toast.error("Too many attempts. Please try again later.");
      } else {
        toast.error("Failed to send code. Make sure Phone authentication is enabled in Firebase Console.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      toast.error("Please enter a valid 6-digit verification code");
      return;
    }
    setSubmitting(true);
    try {
      const cred = await confirmationResult.confirm(otpCode);
      await upsertUserDoc(cred.user);
      toast.success("Successfully logged in! 👋");
      navigate(-1);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      if (error.code === 'auth/invalid-verification-code') {
        toast.error("Incorrect verification code. Please check and try again.");
      } else {
        toast.error("Verification failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 page-transition">
      <SEO title="Log In" description={`Log in to your ${BRAND_CONFIG.name} account to track order status and leave custom reviews.`} />

      <div className="bg-white border border-brand-100 rounded-3xl p-8 shadow-soft space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-pastel-navy">Welcome Back</h1>
          <p className="text-xs text-gray-500">Log in to track your personalized gift orders</p>
        </div>

        {/* Segmented Tab Switcher */}
        <div className="flex bg-pastel-pink/10 p-1 rounded-2xl border border-brand-100/50">
          <button
            type="button"
            onClick={() => { setLoginMethod('email'); }}
            className={`flex-1 text-center py-2.5 rounded-xl font-bold text-xs transition-all ${
              loginMethod === 'email'
                ? 'bg-brand-500 text-white shadow-soft'
                : 'text-pastel-navy hover:bg-brand-50/50'
            }`}
          >
            Email Login
          </button>
          <button
            type="button"
            onClick={() => { setLoginMethod('phone'); }}
            className={`flex-1 text-center py-2.5 rounded-xl font-bold text-xs transition-all ${
              loginMethod === 'phone'
                ? 'bg-brand-500 text-white shadow-soft'
                : 'text-pastel-navy hover:bg-brand-50/50'
            }`}
          >
            Phone Login
          </button>
        </div>

        {/* Email Login Form */}
        {loginMethod === 'email' && (
          <form onSubmit={handleLogin} className="space-y-4">
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
                  placeholder="••••••••"
                  className="w-full bg-pastel-pink/30 text-xs border border-brand-100 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl shadow-premium text-xs transition-all disabled:opacity-50 focus:outline-none"
            >
              {submitting ? "Signing In..." : "Log In"}
            </button>
          </form>
        )}

        {/* Phone Login Form */}
        {loginMethod === 'phone' && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Mobile Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+919876543210"
                      className="w-full bg-pastel-pink/30 text-xs border border-brand-100 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-300"
                    />
                  </div>
                  <span className="text-[9px] text-gray-400 block mt-1">Include country code prefix (e.g. +91 for India)</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl shadow-premium text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 focus:outline-none"
                >
                  <Smartphone size={16} />
                  {submitting ? "Sending Code..." : "Send Verification Code"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">6-Digit Verification Code</label>
                  <div className="relative">
                    <CheckCircle className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                    <input
                      type="text"
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      maxLength={6}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      className="w-full bg-pastel-pink/30 text-xs border border-brand-100 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-300 tracking-[0.25em] text-center font-bold"
                    />
                  </div>
                  <span className="text-[9px] text-gray-400 block mt-1 text-center">We sent a SMS security code to {phoneNumber}</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl shadow-premium text-xs transition-all disabled:opacity-50 focus:outline-none"
                >
                  {submitting ? "Verifying..." : "Verify & Log In"}
                </button>

                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtpCode(''); }}
                  className="w-full text-center text-xs text-brand-500 hover:underline font-bold block pt-1 focus:outline-none"
                >
                  Change Phone Number
                </button>
              </form>
            )}
          </div>
        )}

        {/* Hidden recaptcha element for Firebase auth */}
        <div id="recaptcha-container"></div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-brand-50"></div>
          <span className="flex-shrink mx-4 text-[10px] text-gray-400 uppercase font-extrabold tracking-wider">or</span>
          <div className="flex-grow border-t border-brand-50"></div>
        </div>

        {/* Google Authentication */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full bg-white border border-brand-100 hover:bg-brand-50 text-pastel-navy font-bold py-3 rounded-xl shadow-soft text-xs flex items-center justify-center gap-2 transition-all focus:outline-none"
        >
          <Chrome size={16} className="text-red-500" />
          Continue with Google
        </button>

        <p className="text-center text-xs text-gray-500">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand-500 hover:underline font-bold">
            Sign Up
          </Link>
        </p>

        {/* Firebase Config Notice */}
        <div className="bg-brand-50/50 rounded-xl p-3 border border-brand-100/20 text-[10px] text-gray-400 flex items-start gap-2">
          <AlertCircle size={14} className="text-brand-500 flex-shrink-0 mt-0.5" />
          <span>Note: Firebase auth requires you to enable email/password, google, and phone sign-in on your dashboard panel.</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
