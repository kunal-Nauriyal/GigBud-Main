import React from "react";
import { Link } from "react-router-dom";
import "./TaskReceiver.css";

const TaskReceiver = () => {
  return (
    <section className="task-receiver-container">
      {/* Header */}
      <div className="task-receiver-header">
        <h2 className="task-receiver-title">Task Receiver</h2>
      </div>

      {/* Info Sections */}
      <div className="task-receiver-content">
        {/* Left Box */}
        <div className="task-receiver-box">
          <p><em>Find Tasks & Earn!</em> Browse available tasks posted by providers and complete them to earn money.</p>
          <Link to="/available-tasks" className="task-receiver-btn">View Available Tasks</Link>
        </div>

       
      </div>
    </section>
  );
};

export default TaskReceiver;
