import React, { useState } from "react";
import Footer from "../components/Footer"; // Assuming Footer is a component
import styles from "./Services.module.css";

// Image imports
import fur from '../assets/images/fur.jpg';
import mount from '../assets/images/mount.jpg';
import tv from '../assets/images/tv.jpg';
import moving from '../assets/images/moving.webp';
import clean from '../assets/images/clean.jpg';
import plumbing from '../assets/images/plumbing.jpg';
import electric from '../assets/images/electric.jpg';
import lifting from '../assets/images/lifting.jpg';
import note from '../assets/images/note.jpg';
import cooking from '../assets/images/cooking.jpg';
import gathering from '../assets/images/gathering.webp';
import homework from '../assets/images/homework.jpg';

// Fallback image
const placeholderImage = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22288%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20288%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_189abc8d76d%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_189abc8d76d%22%3E%3Crect%20width%3D%22288%22%20height%3D%22200%22%20fill%3D%22%23eeeeee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22106.37333297729492%22%20y%3D%22106.43333320617676%22%3EImage%20Not%20Found%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';

const tasks = [
  { id: 1, name: 'Furniture Assembling', image: fur },
  { id: 2, name: 'Mount Art or Shelves', image: mount },
  { id: 3, name: 'Note Taking', image: note },
  { id: 4, name: 'Packing & Moving', image: moving },
  { id: 5, name: 'Cleaning', image: clean },
  { id: 6, name: 'Plumbing', image: plumbing },
  { id: 7, name: 'Electrical Help', image: electric },
  { id: 8, name: 'Heavy Lifting', image: lifting },
  { id: 9, name: 'TV Setup', image: tv },
  { id: 10, name: 'Meal Preparation', image: cooking },
  { id: 11, name: 'Event Organizing', image: gathering },
  { id: 12, name: 'Homework Help', image: homework },
];

const Services = () => {
  const [showAll, setShowAll] = useState(false);

  return (
    <div className={styles.servicesContainer}>
      <div className={styles.heroSection}>
        <h1 className={styles.servicesTitle}>Our Services</h1>
        <p className={styles.servicesSubtitle}>
          Find the perfect solution for your needs with our range of services
        </p>
      </div>
      
      <div className={styles.serviceGrid}>
        <div className={styles.serviceCard}>
          <div className={styles.serviceIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <h2>Task Posting</h2>
          <p>Post tasks and find the right person to get the job done quickly and efficiently.</p>
          <a href="#" className={styles.learnMore}>Learn More</a>
        </div>
        
        <div className={styles.serviceCard}>
          <div className={styles.serviceIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <h2>Task Completion</h2>
          <p>Complete tasks and earn money in your free time with flexible scheduling.</p>
          <a href="#" className={styles.learnMore}>Learn More</a>
        </div>
        
        <div className={styles.serviceCard}>
          <div className={styles.serviceIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h2>Secure Payments</h2>
          <p>All payments are handled securely through our platform with escrow protection.</p>
          <a href="#" className={styles.learnMore}>Learn More</a>
        </div>
      </div>
      
      <div className={styles.featuresSection}>
        <div className={styles.featuresHeader}>
          <h2>Why Choose GigBud?</h2>
          <p>Our platform offers several advantages for both task providers and task receivers</p>
        </div>
        
        <div className={styles.featuresList}>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div className={styles.featureContent}>
              <h3>Time-Saving</h3>
              <p>Find help quickly for your tasks or make money in your spare time</p>
            </div>
          </div>
          
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div className={styles.featureContent}>
              <h3>Verified Users</h3>
              <p>Our community is built on trust with verified profiles and reviews</p>
            </div>
          </div>
          
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
            </div>
            <div className={styles.featureContent}>
              <h3>Rating System</h3>
              <p>Build your reputation with our transparent rating and review system</p>
            </div>
          </div>
          
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <div className={styles.featureContent}>
              <h3>Mobile App</h3>
              <p>Manage your tasks on the go with our user-friendly mobile application</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.popularTasksSection}>
        <h2>Popular Tasks</h2>
        
        <div className={styles.infoContainer}>
          <p className={`${styles.infoCloud} ${styles.leftCloud}`}>
            Ever felt stuck when an urgent task popped up, but you had no one to help? 🚀 GigBud connects you with people around, making life simpler and tasks easier.
          </p>
          <p className={`${styles.infoCloud} ${styles.rightCloud}`}>
            Imagine needing someone to assemble furniture last minute or help with moving. 🏠 With GigBud, you find assistance in seconds, making daily life stress-free!
          </p>
        </div>

        <div className={styles.popularTasks}>
          {tasks.slice(0, showAll ? tasks.length : 4).map((task) => (
            <div key={task.id} className={styles.task}>
              <div className={styles.taskContent}>
                <img 
                  src={task.image} 
                  alt={task.name} 
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = placeholderImage;
                  }}
                />
                <p className={styles.taskName}>{task.name}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.buttonContainer}>
          <button onClick={() => setShowAll(!showAll)} className={styles.showMoreBtn}>
            {showAll ? "Show Less" : "Show More"}
          </button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Services;