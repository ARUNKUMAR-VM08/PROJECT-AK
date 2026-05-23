import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED ROUTE — requires logged-in user
// ─────────────────────────────────────────────────────────────────────────────
export const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="min-h-screen flex items-center justify-center bg-pastel-cream"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-pastel-navy">Loading your account…</p>
        </div>
      </div>
    );
  }

  return currentUser ? children : <Navigate to="/login" replace />;
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ROUTE — requires logged-in user with role === 'admin'
// ─────────────────────────────────────────────────────────────────────────────
export const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="min-h-screen flex items-center justify-center bg-pastel-cream"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-pastel-navy">Verifying admin access…</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};
