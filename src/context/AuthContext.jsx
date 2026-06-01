import React, { createContext, useState, useEffect } from 'react';

/**
 * Course Alignment: CO4 (Context API)
 * 
 * Purpose: 
 * This file creates a global Context for Authentication. Instead of passing the user
 * login state through multiple layers of components (prop drilling), we use the Context API
 * to make the 'user' object accessible anywhere in our React application.
 */

// 1. Create the context
export const AuthContext = createContext();

// 2. Create the Provider component
export const AuthProvider = ({ children }) => {
  // State Hook (CO3): Manages the current logged-in user
  const [user, setUser] = useState(null);
  
  // State Hook (CO3): Prevents rendering protected routes until auth check is complete
  const [loading, setLoading] = useState(true);

  // Effect Hook (CO3): Runs once when the application starts to check for existing login
  useEffect(() => {
    // In a real application, we would check localStorage or call an API here.
    // For this academic project, we simulate an auth check.
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  /**
   * Login function.
   * For the academic project, we use simple role-based login:
   * Username: "admin" -> logs in as Admin
   * Username: "nurse" -> logs in as Nurse
   */
  const login = (username, password) => {
    let role = null;
    if (username === 'admin') role = 'ADMIN';
    if (username === 'nurse') role = 'NURSE';

    if (role) {
      const userData = { username, role };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true; // Login success
    }
    return false; // Login failed
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // The value object contains all the data and functions we want to share globally
  const value = {
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
