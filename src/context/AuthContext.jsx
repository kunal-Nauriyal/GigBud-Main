import React, { createContext, useContext, useState, useEffect } from "react";
import api from '../services/api';

// Create the context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize with false to ensure no protected components render on page load
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Check for token in localStorage on initial load
  useEffect(() => {
    // Clear approach - start by assuming not logged in
    const checkToken = () => {
      const storedToken = localStorage.getItem("accessToken");
      
      if (storedToken) {
        try {
          // Set up API with token
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          setToken(storedToken);
          setIsLoggedIn(true);
        } catch (error) {
          // If token is invalid, clear it
          console.error("Invalid token:", error);
          localStorage.removeItem("accessToken");
          delete api.defaults.headers.common['Authorization'];
        }
      }
      
      // Mark initial check as complete
      setInitialCheckDone(true);
    };

    checkToken();
  }, []);

  const login = (newToken) => {
    // Save token
    localStorage.setItem("accessToken", newToken);
    setToken(newToken);
    setIsLoggedIn(true);
    
    // Set up API
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    // Clear token
    localStorage.removeItem("accessToken");
    setToken(null);
    setIsLoggedIn(false);
    
    // Clear API headers
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider 
      value={{ 
        token, 
        isLoggedIn, 
        login, 
        logout, 
        initialCheckDone 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};