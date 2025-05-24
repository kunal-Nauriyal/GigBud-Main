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

  // Remove token validation - we'll trust stored tokens
  // Token validation can be done on actual API calls instead

  useEffect(() => {
    const checkAuthStatus = () => {
      const storedToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      
      if (storedToken && storedToken !== "undefined" && storedToken !== "null" && storedToken.trim() !== "") {
        // Simply restore the login state from stored token
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        setToken(storedToken);
        setIsLoggedIn(true);
      }
      
      setInitialCheckDone(true);
    };

    checkAuthStatus();
  }, []);

  // Add API response interceptor to handle token expiration
  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          // Token might be expired or invalid
          console.warn("Unauthorized response, clearing auth state");
          clearAuthState();
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on component unmount
    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const login = (newToken, rememberMe = false) => {
    if (!newToken || newToken === "undefined" || newToken === "null") {
      console.error("Invalid token provided to login");
      return;
    }

    try {
      if (rememberMe) {
        localStorage.setItem("accessToken", newToken);
        // Remove from sessionStorage if it exists
        sessionStorage.removeItem("accessToken");
      } else {
        sessionStorage.setItem("accessToken", newToken);
        // Remove from localStorage if it exists
        localStorage.removeItem("accessToken");
      }
      
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const logout = () => {
    clearAuthState();
    window.location.href = '/'; // Full page reload to clear state
  };

  // Don't render children until initial auth check is complete
  if (!initialCheckDone) {
    return <div>Loading...</div>; // Or your loading component
  }

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