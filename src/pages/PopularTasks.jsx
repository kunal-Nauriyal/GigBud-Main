import React, { useState } from 'react';
import './PopularTasks.css';
import Footer from "../components/Footer";

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

const PopularTasks = () => {
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="popular-tasks-container">
      {/* Cloud-style paragraph containers */}
      <div className="info-container">
       
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
                  e.target.src = placeholderImage;
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
      
      <Footer />
    </div>
  );
};

export default PopularTasks;