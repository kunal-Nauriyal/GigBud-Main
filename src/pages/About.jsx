import React from 'react';
import './About.css';
import Footer from '../components/Footer';
import Founder from '../components/FounderSection';
import rightImage from "/src/assets/images/leftsideman.jpeg";
// Import icons for the How It Works section


const AboutSection = () => {
    return (
      <div>
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

        {/* Mission & Vision Statement Section */}
        <section className="mission-vision-section">
          <div className="container">
            <div className="mission-vision-content">
              <div className="mission-box">
                            <h3>Our Mission</h3>
                            <span>"GigBud – Where Time Meets Opportunity "</span>
                            <p> 
                                At GigBud , our mission is to empower individuals by creating a self-reliant, connected community where time and skills can be exchanged effortlessly and ethically.

We aim to make task-based work not only accessible and rewarding but also a catalyst for economic growth, student empowerment, and community engagement. By simplifying how people offer and receive help, we’re fostering a culture of trust, productivity, and mutual support—one task at a time.</p>
              </div>
              <div className="vision-box">
                            <h3>Our Vision</h3>
                            <span>"Bringing the Gig Economy to Your Doorstep."</span>
                <p>We envision a future where GigBud.in is the leading platform for hyperlocal gigs—a digital ecosystem where every individual can effortlessly monetize their time and skills while meeting real-world needs around them.

Our vision is to revolutionize the gig economy by creating a frictionless, trusted, and scalable platform that empowers students, freelancers, and everyday individuals to work on their terms, while building stronger, more efficient local communities globally.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works-section">
          <div className="container">
            <h2 className="section-title">How It Works</h2>
            <div className="steps-container">
              <div className="step-box">
                <div className="step-icon">
                  <img src="" alt="Post a Task" />
                </div>
                <h3>Post a Task</h3>
                <p>Describe what you need, set your budget and timeline.</p>
              </div>
              
              <div className="step-connector"></div>
              
              <div className="step-box">
                <div className="step-icon">
                  <img src="" alt="Connect Locally" /> 
                </div>
                <h3>Connect Locally</h3>
                <p>Nearby taskers respond, you choose the best match.</p>
              </div>
              
              <div className="step-connector"></div>
              
              <div className="step-box">
                <div className="step-icon">
                  <img src="" alt="Get It Done & Pay" />
                </div>
                <h3>Get It Done & Pay</h3>
                <p>Track progress, complete the task, and pay securely.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose GigBud Section */}
        <section className="why-choose-section">
          <div className="container">
            <h2 className="section-title">Why Choose GigBud?</h2>
            <div className="features-grid">
              <div className="feature-box">
                <div className="check-icon">✅</div>
                <h3>Hyperlocal Focus</h3>
                <p>Connect with people in your immediate vicinity for faster service and community building.</p>
              </div>
              
              <div className="feature-box">
                <div className="check-icon">✅</div>
                <h3>Designed for Students</h3>
                <p>Flexible opportunities that fit around your study schedule and provide valuable income.</p>
              </div>
              
              <div className="feature-box">
                <div className="check-icon">✅</div>
                <h3>Instant Task Matching</h3>
                <p>Our algorithm connects you with the right people for your task within minutes.</p>
              </div>
              
              <div className="feature-box">
                <div className="check-icon">✅</div>
                <h3>Transparent Payments</h3>
                <p>Clear pricing, no hidden fees, and secure payment processing after task completion.</p>
              </div>
            </div>
          </div>
        </section>
        {/* <Founder /> */}
        <Footer />
      </div>
    );
};

export default AboutSection;