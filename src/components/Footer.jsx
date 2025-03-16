import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo-section">
          <h2 className="footer-logo">GigBud</h2>
          <p className="footer-tagline">Now Buying time Is Super Easy</p>
        </div>

        <div className="footer-links">
          <div className="footer-links-column">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/about">About</a></li>
              <li><a href="/services">Services</a></li>
              <li><a href="/provider-dashboard">Provider Dashboard</a></li>
            </ul>
          </div>

          <div className="footer-links-column">
            <h3>Dashboards</h3>
            <ul>
              <li><a href="/time-buyer-dashboard">Time Buyer Dashboard</a></li>
              <li><a href="/task-receiver-dashboard">Task Receiver Dashboard</a></li>
              <li><a href="/contact">Contact Us</a></li>
              <li><a href="/faqs">FAQs</a></li>
            </ul>
          </div>

          <div className="footer-links-column">
            <h3>Legal</h3>
            <ul>
              <li><a href="/privacy-policy">Privacy Policy</a></li>
              <li><a href="/terms-of-service">Terms of Service</a></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h3>Contact Us</h3>
            <p><i className="icon-location"></i> Delhi</p>
            <p>
              <i className="icon-email"></i>
              <a href="mailto:mrkunalnauriyal294@gmail.com">mrkunalnauriyal294@gmail.com</a>
            </p>
            <div className="footer-social">
              <a href="https://www.linkedin.com/in/kunal-nauriyal-k-d-495b601ba" target="_blank" rel="noopener noreferrer">
                <i className="icon-linkedin"></i>
              </a>
              <a href="https://www.instagram.com/pvtt__k__d__n__/" target="_blank" rel="noopener noreferrer">
                <i className="icon-instagram"></i>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <i className="icon-twitter"></i>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <i className="icon-youtube"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} GigBud. All Rights Reserved.</p>
        <p>Created by Mr. Kunal Nauriyal</p>
      </div>
    </footer>
  );
};

export default Footer;