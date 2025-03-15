import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollingDown, setScrollingDown] = useState(false);
  const location = useLocation(); // Get the current route

  const toggleMenu = () => {
    setIsOpen(!isOpen);
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
      <div className="logo">
        <Link to="/" className="nav-link">GigBud</Link>
      </div>

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
          <Link to="/task-provider-dashboard" className={`nav-link ${location.pathname === "/task-provider-dashboard" ? "active" : ""}`}>
            Provider Dashboard
          </Link>
        </li>
        <li>
          <Link to="/time-buyer-dashboard" className={`nav-link ${location.pathname === "/time-buyer-dashboard" ? "active" : ""}`}>
            Time Buyer Dashboard
          </Link>
        </li>
        <li>
          <Link to="/task-receiver-dashboard" className={`nav-link ${location.pathname === "/task-receiver-dashboard" ? "active" : ""}`}>
            Task Receiver Dashboard
          </Link>
        </li>
      </ul>

      <div className="menu-container">
        <div className="menu-icon" onClick={toggleMenu}>&#9776;</div>
        {isOpen && (
          <ul className="dropdown-menu">
            <li>
              <Link to="/contact" className="nav-link">Contact</Link>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
