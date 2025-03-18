import React, { useState } from 'react';
import './PopularTasks.css';
import Footer from "../components/Footer";

// ✅ Correct image imports
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


const tasks = [
    { id: 1, name: 'Furniture Assembling', image: fur },
    { id: 2, name: 'Mount Art or Shelves', image: mount },
    { id: 3, name: 'Note Taking', image: note },
    { id: 4, name: 'Packing & Moving', image: moving },
    { id: 5, name: 'Cleaning', image: clean },
    { id: 6, name: 'Plumbing', image: plumbing },
    { id: 7, name: 'Electrical Chaos', image: electric },
    { id: 8, name: 'Needing Someone', image: lifting },
    { id: 9, name: 'TV Setup', image: tv },
    { id: 10, name: 'Grocery Cooking', image: cooking },
    { id: 11, name: 'New People Gathering', image: gathering },
    { id: 12, name: 'Homework', image: homework },
];

const PopularTasks = () => {
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="popular-tasks-container">
      {/* Cloud-style paragraph containers */}
      <div className="info-container">
        
        <h2 className="section-title">GigBud Advantages</h2>
        <p className="info-cloud left-cloud">
          Ever felt stuck when an urgent task popped up, but you had no one to help? 🚀 GigBud connects you with people around, making life simpler and tasks easier.
        </p>
        <p className="info-cloud right-cloud">
          Imagine needing someone to assemble furniture last minute or help with moving. 🏠 With GigBud, you find assistance in seconds, making daily life stress-free!
        </p>
      </div>

      <div className="popular-tasks">
        {tasks.slice(0, showAll ? tasks.length : 4).map((task) => (
          <div key={task.id} className="task">
            <div className="task-content">
              <img 
                src={task.image} 
                alt={task.name} 
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = placeholder; 
                  console.error(`Failed to load image: ${task.image}`);
                }}
              />
              <p className="task-name">{task.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Show More Button */}
      <div className="button-container">
        <button onClick={() => setShowAll(!showAll)} className="show-more-btn">
          {showAll ? "Show Less" : "Show More"}
        </button>
      </div>
      <Footer/>
    </div>
  );
};

export default PopularTasks;
