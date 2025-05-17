import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './DashboardNavbar.css';

const DashboardNavbar = () => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // This is a critical check - if not logged in, don't render anything
  if (!isLoggedIn) {
    return null;
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="dashboard-navbar">
      {/* Desktop view tabs */}
      <ul className="dashboard-nav-links">
        <li>
          <Link
            to="/task-provider-dashboard"
            className={`dashboard-link ${location.pathname === "/task-provider-dashboard" ? "active" : ""}`}
          >
           Task Provider Dashboard
          </Link>
        </li>
        
        <li>
          <Link
            to="/task-receiver-dashboard"
            className={`dashboard-link ${location.pathname === "/task-receiver-dashboard" ? "active" : ""}`}
          >
            Task Receiver Dashboard
          </Link>
        </li>
        <li>
          
        </li>
      </ul>

      {/* Mobile dropdown */}
      <div className="dashboard-mobile-menu">
        <button className="dashboard-dropdown-toggle" onClick={toggleDropdown}>
          {getActiveDashboardName(location.pathname)} <span className="dropdown-arrow">▼</span>
        </button>

        {isDropdownOpen && (
          <div className="dashboard-dropdown-menu">
            <Link
              to="/task-provider-dashboard"
              className={`dashboard-dropdown-item ${location.pathname === "/task-provider-dashboard" ? "active" : ""}`}
              onClick={toggleDropdown}
            >
              Provider Dashboard
            </Link>
            
            <Link
              to="/task-receiver-dashboard"
              className={`dashboard-dropdown-item ${location.pathname === "/task-receiver-dashboard" ? "active" : ""}`}
              onClick={toggleDropdown}
            >
              Task Receiver Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

function getActiveDashboardName(pathname) {
  if (pathname === "/task-provider-dashboard") return "Provider Dashboard";
  //if (pathname === "/time-buyer-dashboard") return "Time Buyer Dashboard";
  if (pathname === "/task-receiver-dashboard") return "Task Receiver Dashboard";
  return "Select Dashboard";
}

export default DashboardNavbar;