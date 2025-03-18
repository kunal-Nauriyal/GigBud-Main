import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './DashboardNavbar.css';

const DashboardNavbar = () => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
            Provider Dashboard
          </Link>
        </li>
        <li>
          <Link 
            to="/time-buyer-dashboard" 
            className={`dashboard-link ${location.pathname === "/time-buyer-dashboard" ? "active" : ""}`}
          >
            Time Buyer Dashboard
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
      </ul>
      
      {/* Mobile dropdown toggle */}
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
              to="/time-buyer-dashboard" 
              className={`dashboard-dropdown-item ${location.pathname === "/time-buyer-dashboard" ? "active" : ""}`}
              onClick={toggleDropdown}
            >
              Time Buyer Dashboard
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

// Helper function to get the name of the active dashboard
function getActiveDashboardName(pathname) {
  if (pathname === "/task-provider-dashboard") return "Provider Dashboard";
  if (pathname === "/time-buyer-dashboard") return "Time Buyer Dashboard";
  if (pathname === "/task-receiver-dashboard") return "Task Receiver Dashboard";
  return "Select Dashboard";
}

export default DashboardNavbar;