import React, { useState } from "react";
import "./TaskProvider.css";
import { Link } from "react-router-dom";
import TaskForm from "./Taskform"; // Import Task Form
import BuyingTimeForm from "./BuyingTimeForm"; // Import Buying Time Form

const TaskProvider = () => {
  // State for modals
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showBuyingTimeForm, setShowBuyingTimeForm] = useState(false);

  return (
    <section className="task-provider-container">
      {/* Header Section */}
      <div className="header">
        <h1>Task Provider</h1>
      </div>

      {/* Task Options */}
      <div className="task-options">
        {/* Left Speech Bubble - Creating Task */}
        <div className="speech-bubble left-bubble">
          <p>
            <em>Create a task</em> in just a few clicks! Define what you need,
            set your budget, and let skilled individuals take it from there.
            Whether it's running errands, tutoring, or technical work, post your
            task and get it completed hassle-free!
          </p>
          <button className="action-button" onClick={() => setShowTaskForm(true)}>
            Creating Task
          </button>
        </div>

        {/* Right Speech Bubble - Buying Time */}
        <div className="speech-bubble right-bubble">
          <p>
            Want someone to work for you on your terms? <em>Buy their time!</em>{" "}
            Hire individuals for a fixed duration where they assist you with
            anything you need—be it brainstorming ideas, personal assistance, or
            hands-on support. You control the hours, they deliver the help!
          </p>
          <button className="action-button" onClick={() => setShowBuyingTimeForm(true)}>
            Buying Time
          </button>
        </div>
      </div>

      {/* Show TaskForm Modal if true */}
      {showTaskForm && <TaskForm onClose={() => setShowTaskForm(false)} />}

      {/* Show BuyingTimeForm Modal if true */}
      {showBuyingTimeForm && <BuyingTimeForm onClose={() => setShowBuyingTimeForm(false)} />}
    </section>
  );
};

export default TaskProvider;
