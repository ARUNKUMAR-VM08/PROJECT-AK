// mobile-expo/src/context/AuthContext.js
export const isUserAdmin = (user) => user && user.email && (user.email.endsWith('@admin.com') || user.email === 'arunkumarravi.mv@gmail.com');
import React, { createContext, useEffect, useState, useContext } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

export const AuthContext = createContext({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (initializing) setInitializing(false);
    });
    return () => unsub();
  }, []);

  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email, password) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isAdmin = isUserAdmin(user);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, initializing, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
