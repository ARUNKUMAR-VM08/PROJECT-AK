import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../services/firebase';
import { USER_ROLES } from '../utils/constants';
import logger from '../utils/logger';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin]         = useState(false);
  const [loading, setLoading]         = useState(true);

  // ── Fetch Firestore user doc (for role) ──────────────────────────────────
  const fetchUserRole = async (user) => {
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        return snap.data().role === USER_ROLES.ADMIN;
      }
      return false;
    } catch (err) {
      logger.warn('fetchUserRole failed (offline mode):', err.code);
      return false;
    }
  };

  // ── Auth state listener ──────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const admin = await fetchUserRole(user);
        setIsAdmin(admin);
        logger.info('Auth state: user =', user.uid, '| admin =', admin);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // ── Create / upsert Firestore user document ──────────────────────────────
  const upsertUserDoc = async (user, extra = {}) => {
    try {
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          uid: user.uid,
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          role: USER_ROLES.USER,
          createdAt: serverTimestamp(),
          ...extra,
        });
      }
    } catch (err) {
      logger.warn('upsertUserDoc failed:', err.code);
    }
  };

  // ── Public auth methods ──────────────────────────────────────────────────
  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const signup = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    await upsertUserDoc(cred.user, { displayName });
    return cred;
  };

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    await upsertUserDoc(cred.user);
    return cred;
  };

  const logout = () => signOut(auth);

  const value = { currentUser, isAdmin, loading, login, signup, loginWithGoogle, logout, upsertUserDoc };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
