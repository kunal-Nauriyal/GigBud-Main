import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './DashboardNavbar.css';

const DashboardNavbar = () => {
  const location = useLocation();

  return (
    <div className="dashboard-navbar">
      <ul className="dashboard-nav-links">
        <li>
          <Link to="/task-provider-dashboard" className={`dashboard-link ${location.pathname === "/task-provider-dashboard" ? "active" : ""}`}>
            Provider Dashboard
          </Link>
        </li>
        <li>
          <Link to="/time-buyer-dashboard" className={`dashboard-link ${location.pathname === "/time-buyer-dashboard" ? "active" : ""}`}>
            Time Buyer Dashboard
          </Link>
        </li>
        <li>
          <Link to="/task-receiver-dashboard" className={`dashboard-link ${location.pathname === "/task-receiver-dashboard" ? "active" : ""}`}>
            Task Receiver Dashboard
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default DashboardNavbar;
