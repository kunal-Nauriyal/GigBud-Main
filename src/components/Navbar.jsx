// Navbar.jsx (Updated to switch center nav links based on login)

import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ openLoginModal, isLoggedIn, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollingDown, setScrollingDown] = useState(false);
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const authDropdownRef = useRef(null);
  const menuRef = useRef(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleAuthDropdown = () => setShowAuthDropdown(!showAuthDropdown);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (authDropdownRef.current && !authDropdownRef.current.contains(event.target)) {
        setShowAuthDropdown(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      setScrollingDown(window.scrollY > lastScrollY);
      lastScrollY = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogoutAndRedirect = () => {
    handleLogout();
    navigate("/");
  };

  return (
    <nav className={`navbar ${scrollingDown ? "navbar-hidden" : ""}`}>
      <div className="logo">
        <Link to="/" className="nav-link">GigBud</Link>
      </div>

      <div className="center-nav">
        <ul className="nav-links">
          {isLoggedIn ? (
            <>
              <li>
                <Link to="/task-provider-dashboard" className={`nav-link ${location.pathname === "/task-provider-dashboard" ? "active" : ""}`}>
                  Provider Dashboard
                </Link>
              </li>
              <li>
                <Link to="/task-receiver-dashboard" className={`nav-link ${location.pathname === "/task-receiver-dashboard" ? "active" : ""}`}>
                  Receiver Dashboard
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>Home</Link>
              </li>
              <li>
                <Link to="/about" className={`nav-link ${location.pathname === "/about" ? "active" : ""}`}>About</Link>
              </li>
              <li>
                <Link to="/services" className={`nav-link ${location.pathname === "/services" ? "active" : ""}`}>Services</Link>
              </li>
            </>
          )}
        </ul>
      </div>

      <div className="right-nav">
        <div className="mobile-menu" ref={menuRef}>
          <div className="hamburger-menu" onClick={toggleMenu}>
            <span className={`hamburger-line ${isOpen ? "open" : ""}`}></span>
            <span className={`hamburger-line ${isOpen ? "open" : ""}`}></span>
            <span className={`hamburger-line ${isOpen ? "open" : ""}`}></span>
          </div>
          {isOpen && (
            <div className="mobile-dropdown-menu">
              <ul>
                {isLoggedIn ? (
                  <>
                    <li>
                      <Link to="/task-provider-dashboard" className="mobile-nav-link" onClick={() => setIsOpen(false)}>Provider Dashboard</Link>
                    </li>
                    <li>
                      <Link to="/task-receiver-dashboard" className="mobile-nav-link" onClick={() => setIsOpen(false)}>Receiver Dashboard</Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link to="/" className="mobile-nav-link" onClick={() => setIsOpen(false)}>Home</Link>
                    </li>
                    <li>
                      <Link to="/about" className="mobile-nav-link" onClick={() => setIsOpen(false)}>About</Link>
                    </li>
                    <li>
                      <Link to="/services" className="mobile-nav-link" onClick={() => setIsOpen(false)}>Services</Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="auth-container" ref={authDropdownRef}>
          {isLoggedIn ? (
            <button onClick={handleLogoutAndRedirect} className="auth-button">Logout</button>
          ) : (
            <>
              <div className="auth-dropdown-toggle" onClick={toggleAuthDropdown}>
                Login / Signup ▼
              </div>
              {showAuthDropdown && (
                <div className="auth-dropdown">
                  <button onClick={openLoginModal} className="auth-dropdown-item">Login</button>
                  <Link to="/signup" className="auth-dropdown-item">Signup</Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
