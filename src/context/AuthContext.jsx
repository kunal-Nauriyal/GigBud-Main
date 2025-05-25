import React, { createContext, useContext, useState, useEffect } from "react";
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);

  const clearAuthState = () => {
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("refreshToken");
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setIsLoggedIn(false);
    setUserRole(null);
    setUser(null);
  };

  const fetchUserData = async () => {
    try {
      const userResponse = await api.get('/auth/me');

      if (userResponse.data && userResponse.data.success) {
        const userData = userResponse.data.data;
        setUser(userData);
        setUserRole(userData.role);
      } else if (userResponse.data) {
        setUser(userResponse.data);
        setUserRole(userResponse.data.role);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      if (error.response?.status === 401) {
        clearAuthState();
      }
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      const storedToken =
        localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

      if (
        storedToken &&
        storedToken !== "undefined" &&
        storedToken !== "null" &&
        storedToken.trim() !== ""
      ) {
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        setToken(storedToken);
        setIsLoggedIn(true);
        await fetchUserData();
      }

      setInitialCheckDone(true);
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status;

        if (status === 401) {
          console.warn("401 Unauthorized – clearing auth state");
          clearAuthState();
        } else if (status === 403) {
          console.warn("403 Forbidden – user does not have permission for this action");
          // Optional: Show toast/alert in UI
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const login = async (newToken, rememberMe = false) => {
    if (!newToken || newToken === "undefined" || newToken === "null") {
      console.error("Invalid token provided to login");
      return;
    }

    try {
      if (rememberMe) {
        localStorage.setItem("accessToken", newToken);
        sessionStorage.removeItem("accessToken");
      } else {
        sessionStorage.setItem("accessToken", newToken);
        localStorage.removeItem("accessToken");
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setIsLoggedIn(true);
      await fetchUserData();
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const logout = () => {
    clearAuthState();
    window.location.href = '/';
  };

  if (!initialCheckDone) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        isLoggedIn,
        userRole,
        user,
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
