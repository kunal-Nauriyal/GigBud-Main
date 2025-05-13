import React, { useState, useEffect } from 'react';
import './LoginSignup.css';
import { useAuth } from "../context/AuthContext";

function LoginModal({ isOpen, onClose }) {
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();

  // Add useEffect for body scroll management
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  // Form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

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
      try {
        const res = await fetch("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: loginEmail,
            password: loginPassword,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Login failed.");
          return;
        }

        const token = data?.data?.accessToken;

        if (!token) {
          alert("Missing token in response");
          console.error("Login response missing token:", data);
          return;
        }

        localStorage.setItem("accessToken", token);
        login(token);

        alert("Login successful!");
        onClose();

      } catch (err) {
        console.error("Login error:", err);
        alert("Login error");
      }

    } else {
      if (signupPassword !== signupConfirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: signupName,
            email: signupEmail,
            password: signupPassword,
          }),
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
          <form onSubmit={handleSubmit} className="form">
            {isLoginForm ? (
              <>
                <div className="input-group">
                  <label htmlFor="login-email">Email</label>
                  <input
                    type="email"
                    id="login-email"
                    className="input-field"
                    placeholder="Enter your email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
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
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
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
              </>
            ) : (
              <>
                <div className="input-group">
                  <label htmlFor="signup-name">Full Name</label>
                  <input
                    type="text"
                    id="signup-name"
                    className="input-field"
                    placeholder="Enter your full name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
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
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
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
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
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
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
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
