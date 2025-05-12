import React, { useState } from 'react';
import './LoginSignup.css';
import { useAuth } from "../context/AuthContext";

function LoginModal({ isOpen, onClose }) {
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth(); // ✅ Use login from AuthContext

  const toggleForm = (e) => {
    e.preventDefault();
    setIsLoginForm(!isLoginForm);
  };

  const toggleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoginForm) {
      // ---- LOGIN LOGIC ----
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      try {
        const res = await fetch("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok) {
          alert("Login successful!");
          console.log("Token:", data.data.token);

          login(data.data.token); // ✅ Updates context & localStorage
          onClose(); // Close modal
        } else {
          alert(data.message || "Login failed.");
        }
      } catch (err) {
        console.error("Login error:", err);
        alert("Login error");
      }
    } else {
      // ---- SIGNUP LOGIC ----
      const name = document.getElementById("signup-name").value;
      const email = document.getElementById("signup-email").value;
      const password = document.getElementById("signup-password").value;
      const confirmPassword = document.getElementById("signup-confirm-password").value;

      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (res.ok) {
          alert("Signup successful! Please log in.");
          setIsLoginForm(true);
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
          {isLoginForm ? (
            <form onSubmit={handleSubmit} className="form">
              <div className="input-group">
                <label htmlFor="login-email">Email</label>
                <input
                  type="email"
                  id="login-email"
                  className="input-field"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="login-password">Password</label>
                <input
                  type="password"
                  id="login-password"
                  className="input-field"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <div className="checkbox-container">
                <div
                  className={`custom-checkbox ${rememberMe ? 'checked' : ''}`}
                  onClick={toggleRememberMe}
                ></div>
                <label onClick={toggleRememberMe} className="checkbox-label">Remember me</label>
              </div>
              <div className="forgot-password">
                <a href="#" onClick={(e) => e.preventDefault()}>Forgot Password?</a>
              </div>
              <button type="submit" className="btn">Login</button>
              <div className="switch-form">
                <span>Don't have an account?</span>
                <a href="#" onClick={toggleForm}>Sign up</a>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="form">
              <div className="input-group">
                <label htmlFor="signup-name">Full Name</label>
                <input
                  type="text"
                  id="signup-name"
                  className="input-field"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="signup-email">Email</label>
                <input
                  type="email"
                  id="signup-email"
                  className="input-field"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="signup-password">Password</label>
                <input
                  type="password"
                  id="signup-password"
                  className="input-field"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="signup-confirm-password">Confirm Password</label>
                <input
                  type="password"
                  id="signup-confirm-password"
                  className="input-field"
                  placeholder="Confirm your password"
                  required
                />
              </div>
              <button type="submit" className="btn">Sign Up</button>
              <div className="switch-form">
                <span>Already have an account?</span>
                <a href="#" onClick={toggleForm}>Login</a>
              </div>
            </form>
          )}
        </div>

        <div className="social-login">
          <p>Or continue with</p>
          <div className="social-icons">
            <div className="social-icon"><img src="/api/placeholder/20/20" alt="Google" /></div>
            <div className="social-icon"><img src="/api/placeholder/20/20" alt="LinkedIn" /></div>
            <div className="social-icon"><img src="/api/placeholder/20/20" alt="GitHub" /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
