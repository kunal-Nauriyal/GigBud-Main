import React, { useState, useEffect } from 'react';
import './LoginSignup.css';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

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

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  const [formData, setFormData] = useState({
    loginEmail: '',
    loginPassword: '',
    signupName: '',
    signupEmail: '',
    signupPassword: '',
    signupConfirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleForm = (e) => {
    e.preventDefault();
    setIsLoginForm(!isLoginForm);
    setShowOtpForm(false);
    setFormData({
      loginEmail: '',
      loginPassword: '',
      signupName: '',
      signupEmail: '',
      signupPassword: '',
      signupConfirmPassword: ''
    });
  };

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const res = await axios.post("GOOGLE_CALLBACK_URL=https://gigbud-testing2.netlify.app/auth/google/callback
", {
        email: formData.loginEmail
      });
      
      if (res.data.success) {
        setOtpEmail(formData.loginEmail);
        setOtpSent(true);
        setShowOtpForm(true);
        alert("OTP sent to your email!");
      } else {
        alert(res.data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("OTP send error:", err);
      alert(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await axios.post("http://localhost:3000/api/users/login/verify", {
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

      // This part is kept for form submission handling but the button is hidden
      try {
        const res = await fetch("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          credentials: 'include',
          body: JSON.stringify({
            email: formData.loginEmail,
            password: formData.loginPassword,
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          let errorMessage = "Login failed";
          
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch {
            console.error("Server returned HTML instead of JSON:", errorText);
            errorMessage = "Server error - please check if the backend is running";
          }
          
          alert(errorMessage);
          return;
        }

        const data = await res.json();
        const accessToken = data?.data?.accessToken || data?.token;
        
        if (!accessToken) {
          alert("Missing access token in response");
          return;
        }

        await login(accessToken, rememberMe);
        alert("Login successful!");
        onClose();
        navigate(userRole === 'provider' ? "/task-provider-dashboard" : "/task-receiver-dashboard");
      } catch (err) {
        console.error("Login error:", err);
        alert("Login error: " + (err.message || "Network error"));
      } finally {
        setLoading(false);
      }
    } else {
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
        const res = await fetch("http://localhost:3000/api/auth/register", {
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
            console.error("Server returned HTML instead of JSON:", errorText);
            errorMessage = "Server error - please check if the backend is running";
          }
          
          alert(errorMessage);
          return;
        }

        const data = await res.json();
        alert("Signup successful! Please log in.");
        setIsLoginForm(true);
        setFormData({
          loginEmail: formData.signupEmail,
          loginPassword: '',
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
      const res = await fetch("http://localhost:3000/api/auth/google-login", {
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
        let errorMessage = "Google login failed";
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          console.error("Server returned HTML instead of JSON:", errorText);
          errorMessage = "Server error - please check if the backend is running";
        }
        
        alert(errorMessage);
        return;
      }

      const data = await res.json();
      
      // Check if OTP was sent (new flow)
      if (data.success && data.email) {
        setOtpEmail(data.email);
        setOtpSent(true);
        setShowOtpForm(true);
        alert(`OTP sent to ${data.email}! Please check your email and enter the verification code.`);
        return;
      }

      // Fallback for old flow
      const accessToken = data?.token || data?.data?.accessToken;
      
      if (!accessToken) {
        alert("Missing access token from Google login");
        return;
      }

      await login(accessToken, true);
      alert("Google login successful!");
      onClose();
      navigate(userRole === 'provider' ? "/task-provider-dashboard" : "/task-receiver-dashboard");
      
    } catch (error) {
      console.error("Google login error:", error);
      alert("Google login error: " + (error.message || "Network error"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    console.error("Google login failed");
    alert("Google login failed. Please try again or use email login.");
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
                  <div className="input-group">
                    <label htmlFor="login-email">Email</label>
                    <input
                      type="email"
                      id="login-email"
                      name="loginEmail"
                      className="input-field"
                      placeholder="Enter your email"
                      value={formData.loginEmail}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  <button 
                    type="button" 
                    className="btn" 
                    onClick={handleSendOtp}
                    disabled={loading || !formData.loginEmail}
                  >
                    {loading ? "Sending..." : "Generate OTP"}
                  </button>
                  
                 <div className="social-login">
  <p>Or continue with</p>
  <div className="google-login-container">
    <button
      className="btn google-auth-btn"
      type="button"
      onClick={() => {
        window.location.href = `${process.env.REACT_APP_BACKEND_URL}/auth/google`;
      }}
      disabled={loading}
    >
      Sign in with Google
    </button>
  </div>
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
