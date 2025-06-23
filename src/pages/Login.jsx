import React, { useState, useEffect } from 'react';
import './LoginSignup.css';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

// ✅ Correct API base URL fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

function LoginModal({ isOpen, onClose }) {
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, userRole } = useAuth();
  const navigate = useNavigate();
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [formData, setFormData] = useState({
    signupName: '',
    signupEmail: '',
    signupPassword: '',
    signupConfirmPassword: ''
  });

  useEffect(() => {
    document.body.classList.toggle('modal-open', isOpen);
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleForm = (e) => {
    e.preventDefault();
    setIsLoginForm(!isLoginForm);
    setShowOtpForm(false);
    setFormData({
      signupName: '',
      signupEmail: '',
      signupPassword: '',
      signupConfirmPassword: ''
    });
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/users/login/verify`, {
        email: otpEmail,
        otp: otp
      });

      if (!res.data.success) {
        alert(res.data.message || "OTP verification failed");
        return;
      }

      const accessToken = res.data?.data?.accessToken || res.data?.token;
      if (!accessToken) {
        alert("Missing access token in response");
        return;
      }

      await login(accessToken, rememberMe);
      alert("Login successful!");
      onClose();
      navigate(userRole === 'provider' ? "/task-provider-dashboard" : "/task-receiver-dashboard");
    } catch (err) {
      console.error("OTP login error:", err);
      alert(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isLoginForm) {
      if (showOtpForm) {
        await handleOtpLogin(e);
        return;
      }
    } else {
      // Signup Flow
      if (formData.signupPassword !== formData.signupConfirmPassword) {
        alert("Passwords don't match!");
        setLoading(false);
        return;
      }

      if (formData.signupPassword.length < 6) {
        alert("Password must be at least 6 characters long!");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          credentials: 'include',
          body: JSON.stringify({
            name: formData.signupName,
            email: formData.signupEmail,
            password: formData.signupPassword,
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          let errorMessage = "Signup failed";
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = "Server error - please check if the backend is running";
          }
          alert(errorMessage);
          return;
        }

        const data = await res.json();
        alert("Signup successful! Please log in.");
        setIsLoginForm(true);
        setFormData({
          signupName: '',
          signupEmail: '',
          signupPassword: '',
          signupConfirmPassword: ''
        });
      } catch (err) {
        console.error("Signup error:", err);
        alert("Signup error: " + (err.message || "Network error"));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      if (!credentialResponse?.credential) {
        throw new Error('No credential received from Google');
      }

      const res = await fetch(`${API_BASE_URL}/auth/google-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('API error response:', errorText);
        alert("Google login failed");
        return;
      }

      const data = await res.json();

      if (data.success && data.email) {
        setOtpEmail(data.email);
        setOtpSent(true);
        setShowOtpForm(true);
        alert(`OTP sent to ${data.email}`);
        return;
      }

      const accessToken = data?.token || data?.data?.accessToken;
      if (!accessToken) {
        alert("Missing access token");
        return;
      }

      await login(accessToken, true);
      alert("Google login successful!");
      onClose();
      navigate(userRole === 'provider' ? "/task-provider-dashboard" : "/task-receiver-dashboard");

    } catch (error) {
      console.error("Google login error:", error);
      alert("Google login error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginError = (error) => {
    console.error("Google login failed:", error);
    alert("Google login failed. Try again.");
  };

  if (!isOpen) return null;

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="close-button" onClick={onClose}>×</div>
        <div className="logo-container">
          <div className="logo">GigBud</div>
          <div className="tagline">A Place Where Buying Time is Easy</div>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit} className="form">
            {isLoginForm ? (
              showOtpForm ? (
                <>
                  <div className="input-group">
                    <label>Enter OTP sent to {otpEmail}</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      disabled={loading}
                      maxLength={6}
                    />
                  </div>
                  <button type="submit" className="btn" disabled={loading}>
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => {
                      setShowOtpForm(false);
                      setOtp('');
                      setOtpSent(false);
                    }}
                    disabled={loading}
                  >
                    Back to Login
                  </button>
                </>
              ) : (
                <>
                  <div className="google-login-container">
                    <GoogleLogin
                      onSuccess={handleGoogleLoginSuccess}
                      onError={handleGoogleLoginError}
                      useOneTap={false}
                      theme="filled_blue"
                      text="signin_with"
                      shape="rectangular"
                      size="large"
                      auto_select={false}
                      cancel_on_tap_outside={true}
                    />
                  </div>
                  
                  <div className="switch-form">
                    <span>Don't have an account?</span>
                    <a href="#" onClick={toggleForm}>Sign Up</a>
                  </div>
                </>
              )
            ) : (
              <>
                <div className="input-group">
                  <label htmlFor="signup-name">Full Name</label>
                  <input
                    type="text"
                    id="signup-name"
                    name="signupName"
                    className="input-field"
                    placeholder="Enter your full name"
                    value={formData.signupName}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="signup-email">Email</label>
                  <input
                    type="email"
                    id="signup-email"
                    name="signupEmail"
                    className="input-field"
                    placeholder="Enter your email"
                    value={formData.signupEmail}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="signup-password">Password</label>
                  <input
                    type="password"
                    id="signup-password"
                    name="signupPassword"
                    className="input-field"
                    placeholder="Enter your password (min 6 characters)"
                    value={formData.signupPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="signup-confirm-password">Confirm Password</label>
                  <input
                    type="password"
                    id="signup-confirm-password"
                    name="signupConfirmPassword"
                    className="input-field"
                    placeholder="Confirm your password"
                    value={formData.signupConfirmPassword}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                <button type="submit" className="btn" disabled={loading}>
                  {loading ? "Signing up..." : "Sign Up"}
                </button>
                <div className="switch-form">
                  <span>Already have an account?</span>
                  <a href="#" onClick={toggleForm}>Login</a>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;