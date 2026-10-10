import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../utils/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const timeoutId = setTimeout(async () => {
        try {
          const data = await authApi.me();
          setUser(data.user);
        } catch (err) {
          // Only clear auth on 401 (unauthorized), not on other errors
          if (err.response?.status === 401) {
            clearAuth();
          } else {
            // Keep the user logged in - token is valid, just a transient error
            console.warn('Failed to fetch user profile:', err.message);
          }
        } finally {
          setLoading(false);
        }
      }, 3000); // 3 second timeout

      return () => clearTimeout(timeoutId);
    } else {
      setLoading(false);
    }
  }, []);

  function login(token, userData) {
    localStorage.setItem('token', token);
    if (userData?.id) localStorage.setItem('user_id', String(userData.id));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  function clearAuth() {
    localStorage.removeItem('token');
    setUser(null);
  }

  const value = { user, loading, login, logout, clearAuth };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
