import React from 'react';
import './AboutSection.css';

import rightImage from "/src/assets/images/leftsideman.jpeg"; // Swapped

const AboutSection = () => {
  return (
    <section id="about" className="about-section">
      <div className="container">
        <div className="about-content">
          <div className="about-image">
                      <img src={rightImage} alt="GigBud Community" />
          </div>
          <div className="about-text">
            <h2>Empowering Everyone to Work & Earn Locally</h2>
            <p>
              Welcome to <strong>GigBud.in</strong>, where everyone becomes both an employer and a gig worker. 
              Our platform bridges the gap between daily needs and instant solutions by connecting people 
              within their locality for task-based services.
            </p>
            <p>
              Whether it's picking up groceries, running errands, or getting small jobs done, 
              <strong> GigBud</strong> offers a seamless, secure, and efficient way to get things done—and get paid for it.
            </p>
            <p>
              With a strong focus on <strong>student empowerment, local employment</strong>, and 
              <strong> community building</strong>, we're transforming how people work and earn in the gig economy. 
              Your next task, your next earning—both are just a few taps away.
            </p>
            <button className="learn-more-btn">Learn More</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;