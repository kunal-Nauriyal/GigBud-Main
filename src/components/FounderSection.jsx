import React from 'react';
import './FounderSection.css';
import Founder from "/src/assets/images/me.jpg"; // Swapped

const FounderSection = () => {
  return (
    <section id="founder" className="founder-section">
      <div className="container">
        <div className="founder-content">
          <div className="founder-text">
            <h2 className="section-title">Meet the Founder</h2>
            <p>
              Hi, I'm <strong>Kunal</strong>, the mind behind <strong>GigBud.in</strong>. As an engineer 
              and visionary, I've always believed in creating solutions that empower people. With GigBud, 
              my goal is to revolutionize local gig work by making task-based earning accessible, simple, 
              and trustworthy for everyone.
            </p>
            <p>
              Driven by a passion for innovation and community building, I'm on a mission to help 
              individuals become more self-reliant, productive, and successful in the fast-changing 
              world of work.
            </p>
            <div className="founder-cta">
              <button className="connect-btn">Connect With Me</button>
            </div>
          </div>
          <div className="founder-image">
            <div className="image-container">
                          <img src={Founder} alt="Kunal - Founder" />
            </div>
            <div className="founder-info">
              <h3>Mr.Kunal Nauriyal</h3>
              <p>Founder & CEO</p>
              <div className="social-links">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="linkedin-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderSection;