import React from 'react';
import { Link } from 'react-router-dom';
import AboutSection from '../components/AboutSection';
import FeedbackSection from '../components/FeedbackSection';
import FounderSection from '../components/FounderSection';
import Footer from '../components/Footer';
import './Home.css';

const Home = () => {
  return (
    <div>
      {/* Hero Section - Keeping your original design */}
      <div className="home-container">
        <h1 className="main-heading">GigBud</h1>
        <p className="tagline">A Place where Buying Time is Easy</p>
        
        <div className="hero-buttons">
          <Link to="/task-provider" className="btn primary-btn">Get Started</Link>
         
        </div>
      </div>
      
      {/* About Section */}
      <AboutSection />
      
      {/* Feedback Section */}
      <FeedbackSection />
      
      {/* Founder Section */}
      <FounderSection />
      
      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Join our growing community of task providers and time buyers today.</p>
          <div className="cta-buttons">
            <Link to="/taskform" className="btn primary-btn">Post a Task</Link>
           
          </div>
        </div>
      </section>
       {/* footer Section */}
       <Footer />
    </div>
  );
};

export default Home;