import React, { createContext, useContext, useState, useEffect } from "react";
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const clearAuthState = () => {
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("refreshToken");
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setIsLoggedIn(false);
    setUserRole(null);
  };

  const validateToken = async (storedToken) => {
    try {
      // Verify token with backend
      const response = await api.get('/api/auth/verify', {
        headers: {
          Authorization: `Bearer ${storedToken}`
        }
      });
      
      return response.data.valid;
    } catch (error) {
      console.error("Token validation failed:", error);
      return false;
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      const storedToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      
      if (storedToken && storedToken !== "undefined" && storedToken !== "") {
        const isValid = await validateToken(storedToken);
        
        if (isValid) {
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          setToken(storedToken);
          setIsLoggedIn(true);
          // You might want to fetch user role here if needed
        } else {
          clearAuthState();
        }
      }
      setInitialCheckDone(true);
    };

    checkAuthStatus();
  }, []);

  const login = (newToken, rememberMe = false) => {
    if (rememberMe) {
      localStorage.setItem("accessToken", newToken);
    } else {
      sessionStorage.setItem("accessToken", newToken);
    }
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setIsLoggedIn(true);
  };

  const logout = () => {
    clearAuthState();
    window.location.href = '/'; // Full page reload to clear state
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isLoggedIn,
        userRole,
        initialCheckDone,
        login,
        logout
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