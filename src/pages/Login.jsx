import React, { useState, useEffect } from 'react';
import './LoginSignup.css';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function LoginModal({ isOpen, onClose }) {
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoginForm) {
      try {
        const res = await fetch("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.loginEmail,
            password: formData.loginPassword,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Login failed.");
          return;
        }

        const accessToken = data?.data?.accessToken;
        if (!accessToken) {
          alert("Missing access token in response");
          return;
        }

        login(accessToken, rememberMe);
        alert("Login successful!");
        onClose();
        navigate("/task-receiver-dashboard");
      } catch (err) {
        console.error("Login error:", err);
        alert("Login error");
      }
    } else {
      // Signup logic remains the same
      if (formData.signupPassword !== formData.signupConfirmPassword) {
        alert("Passwords don't match!");
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.signupName,
            email: formData.signupEmail,
            password: formData.signupPassword,
          }),
        });

        const data = await res.json();

        if (res.ok) {
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
        } else {
          alert(data.message || "Signup failed.");
        }
      } catch (err) {
        console.error("Signup error:", err);
        alert("Signup error");
      }
    }
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
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="login-password">Password</label>
                  <input
                    type="password"
                    id="login-password"
                    name="loginPassword"
                    className="input-field"
                    placeholder="Enter your password"
                    value={formData.loginPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="hidden-checkbox"
                  />
                  <label 
                    htmlFor="remember-me" 
                    className={`custom-checkbox ${rememberMe ? 'checked' : ''}`}
                  >
                    {rememberMe && '✓'}
                  </label>
                  <span className="checkbox-label">Remember me</span>
                </div>
                <button type="submit" className="btn">Login</button>
                <div className="switch-form">
                  <span>Don't have an account?</span>
                  <a href="#" onClick={toggleForm}>Sign up</a>
                </div>
              </>
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
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="signup-password">Password</label>
                  <input
                    type="password"
                    id="signup-password"
                    name="signupPassword"
                    className="input-field"
                    placeholder="Enter your password"
                    value={formData.signupPassword}
                    onChange={handleChange}
                    required
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
                  />
                </div>
                <button type="submit" className="btn">Sign Up</button>
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