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

  // Determine if we're on a dashboard page
  const isDashboardPage = location.pathname.includes("dashboard");

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleAuthDropdown = () => {
    setShowAuthDropdown(!showAuthDropdown);
  };

  // Close dropdowns when clicking outside
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

  // Handle scroll events
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
    handleLogout();      // clears auth/session
    navigate("/");       // redirects to landing page
  };

  return (
    <nav className={`navbar ${scrollingDown ? "navbar-hidden" : ""}`}>
      <div className="logo">
        <Link to="/" className="nav-link">GigBud</Link>
      </div>

      <div className="center-nav">
        <ul className="nav-links">
          <li>
            <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>Home</Link>
          </li>
          <li>
            <Link to="/about" className={`nav-link ${location.pathname === "/about" ? "active" : ""}`}>About</Link>
          </li>
          <li>
            <Link to="/services" className={`nav-link ${location.pathname === "/services" ? "active" : ""}`}>Services</Link>
          </li>
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
                <li>
                  <Link to="/" className={`mobile-nav-link ${location.pathname === "/" ? "active" : ""}`} onClick={() => setIsOpen(false)}>Home</Link>
                </li>
                <li>
                  <Link to="/about" className={`mobile-nav-link ${location.pathname === "/about" ? "active" : ""}`} onClick={() => setIsOpen(false)}>About</Link>
                </li>
                <li>
                  <Link to="/services" className={`mobile-nav-link ${location.pathname === "/services" ? "active" : ""}`} onClick={() => setIsOpen(false)}>Services</Link>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="auth-container" ref={authDropdownRef}>
          {isDashboardPage ? (
            <button onClick={handleLogoutAndRedirect} className="auth-button">Logout</button>
          ) : (
            <>
              <div className="auth-dropdown-toggle" onClick={toggleAuthDropdown}>
                {isLoggedIn ? "Account" : "Login / Signup"} ▼
              </div>
              {showAuthDropdown && (
                <div className="auth-dropdown">
                  {isLoggedIn ? (
                    <>
                      <button onClick={handleLogoutAndRedirect} className="auth-dropdown-item">Logout</button>
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
