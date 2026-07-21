import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem('isGuest') === 'true');

  const isAuthenticated = !!token && token !== 'null' && token !== 'undefined';
  const userType = isAuthenticated ? 'authenticated' : isGuest ? 'guest' : null;

  const login = (userData, tokenValue) => {
    if (tokenValue) {
      localStorage.setItem('token', tokenValue);
      setToken(tokenValue);
    }
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      if (userData.email) {
        localStorage.setItem('userId', userData.email);
      }
      setUser(userData);
    }
    localStorage.removeItem('isGuest');
    setIsGuest(false);
  };

  const continueAsGuest = () => {
    localStorage.setItem('isGuest', 'true');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    setToken(null);
    setUser(null);
    setIsGuest(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('isGuest');
    setToken(null);
    setUser(null);
    setIsGuest(false);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isGuest,
        isAuthenticated,
        userType,
        login,
        continueAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
