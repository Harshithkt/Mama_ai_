import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ uid: 'mock-user-123', email: 'mother@example.com' });
  const [userProfile, setUserProfile] = useState({ name: 'Simulated Mother', role: 'mother', email: 'mother@example.com' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Mock login: default to ASHA worker if email contains 'asha', otherwise mother
    const role = email.includes('asha') ? 'asha' : 'mother';
    const profile = { name: role === 'asha' ? 'ASHA Worker' : 'Simulated Mother', role: role, email: email };
    setUser({ uid: 'mock-user-123', email: email });
    setUserProfile(profile);
    return profile;
  };

  const signup = async (email, password, name, role, extraProfile = {}) => {
    const profile = { name, role, email, ...extraProfile, createdAt: new Date().toISOString() };
    setUser({ uid: 'mock-user-123', email: email });
    setUserProfile(profile);
    return profile;
  };

  const logout = () => {
    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
