import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import "./Services.css";
import leftImage from "/src/assets/images/rightsideman1.jpeg"; // Swapped
import rightImage from "/src/assets/images/leftsideman.jpeg"; // Swapped


const Services = () => {
  return (
    <section className="services-container">
      {/* Header Section */}
      <div className="services-header">
        <h2 className="services-title">Choose Your Role</h2>
      </div>

      {/* Services Selection */}
      <div className="services-content">
        <img src={rightImage} alt="Task Provider" className="side-image left-image" />

        {/* Central Buttons */}
        <div className="role-selection">
          <Link to="/task-provider" className="role-button top-button">
            I’m a Task Provider
          </Link>
          <Link to="/task-receiver" className="role-button bottom-button">
            I’m a Task Receiver
          </Link>
        </div>

        <img src={leftImage} alt="Task Receiver" className="side-image right-image" />
      </div>
    </section>
    
  );
};

export default Services;
