import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ openLoginModal, isLoggedIn, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollingDown, setScrollingDown] = useState(false);
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const location = useLocation();

  // Determine if we're on a dashboard page
  const isDashboardPage = location.pathname.includes("dashboard");

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleAuthDropdown = () => {
    setShowAuthDropdown(!showAuthDropdown);
  };

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      setScrollingDown(window.scrollY > lastScrollY);
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrollingDown ? "navbar-hidden" : ""}`}>
      {/* Logo on left */}
      <div className="logo">
        <Link to="/" className="nav-link">GigBud</Link>
      </div>

      {/* Center nav links */}
      <div className="center-nav">
        <ul className={`nav-links ${isOpen ? "open" : ""}`}>
          <li>
            <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>Home</Link>
          </li>
          <li>
            <Link to="/about" className={`nav-link ${location.pathname === "/about" ? "active" : ""}`}>About</Link>
          </li>
          <li>
            <Link to="/services" className={`nav-link ${location.pathname === "/services" ? "active" : ""}`}>Services</Link>
          </li>
          <li>
            <Link to="/contact" className={`nav-link ${location.pathname === "/contact" ? "active" : ""}`}>Contact Us</Link>
          </li>
        </ul>
      </div>

      {/* Right corner menu */}
      <div className="right-nav">
        {/* Mobile menu toggle */}
        <div className="mobile-menu">
          <div className="menu-icon" onClick={toggleMenu}>&#8942;</div>
          {isOpen && (
            <ul className="dropdown-menu">
              <li>
                <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>Home</Link>
              </li>
              <li>
                <Link to="/about" className={`nav-link ${location.pathname === "/about" ? "active" : ""}`}>About</Link>
              </li>
              <li>
                <Link to="/services" className={`nav-link ${location.pathname === "/services" ? "active" : ""}`}>Services</Link>
              </li>
              <li>
                <Link to="/contact" className={`nav-link ${location.pathname === "/contact" ? "active" : ""}`}>Contact Us</Link>
              </li>
            </ul>
          )}
        </div>
        
        {/* Login/Signup buttons */}
        <div className="auth-container">
          {isDashboardPage ? (
            <button onClick={handleLogout} className="auth-button">Logout</button>
          ) : (
            <>
              <div className="auth-dropdown-toggle" onClick={toggleAuthDropdown}>
                {isLoggedIn ? "Account" : "Login / Signup"} ▼
              </div>
              {showAuthDropdown && (
                <div className="auth-dropdown">
                  {isLoggedIn ? (
                    <>
                      <button onClick={handleLogout} className="auth-dropdown-item">Logout</button>
                      <Link to="/profile" className="auth-dropdown-item">Profile</Link>
                    </>
                  ) : (
                    <>
                      <button onClick={openLoginModal} className="auth-dropdown-item">Login</button>
                      <Link to="/signup" className="auth-dropdown-item">Signup</Link>
                    </>
                  )}
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