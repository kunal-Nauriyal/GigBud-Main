import React, { useState, useEffect } from "react";
import "./TaskProviderDashboard.css";
import TaskForm from "./Taskform"; // Import the Task Form component

const TaskProviderDashboard = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Grocery Shopping Assistance",
      description: "Need someone to shop for groceries and deliver them to my home.",
      budget: 500,
      deadline: "2025-03-20T18:00",
      applicants: [
        { id: 1, name: "Ravi Kumar", profession: "Freelancer", age: 27, gender: "Male", price: 450, rating: 4.5 },
        { id: 2, name: "Anjali Singh", profession: "Student", age: 22, gender: "Female", price: 470, rating: 4.8 },
      ],
    },
    {
      id: 2,
      title: "Math Tutor for High School",
      description: "Looking for an online tutor for algebra and calculus.",
      budget: 1200,
      deadline: "2025-03-25T10:00",
      applicants: [],
    },
  ]);

  const [selectedTask, setSelectedTask] = useState(tasks[0]);
  const [showFilters, setShowFilters] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTaskList, setShowTaskList] = useState(window.innerWidth > 768); // Hide task list on mobile by default

  // Handle window resize to track device width
  useEffect(() => {
    const handleResize = () => {
      setShowTaskList(window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle task list visibility for mobile
  const toggleTaskList = () => {
    setShowTaskList(!showTaskList);
  };

  return (
    <div className="heading">
      <h1 className="Headline">Provider Dashboard</h1>

      <div className="dashboard-container">
        {/* Task List Toggle Button (Only visible on mobile) */}
        <button 
          className="task-list-toggle" 
          onClick={toggleTaskList}
          aria-label={showTaskList ? "Hide Task List" : "Show Task List"}
        >
          {showTaskList ? "←" : "→"}
        </button>

        {/* Left Side - Task List */}
        <div className={`task-list ${showTaskList ? 'show' : 'hide'}`}>
          <div className="task-header">
            <h2>Your Tasks</h2>
            <button className="filter-button" onClick={() => setShowFilters(true)}>Filters</button>
          </div>

          <div className="task-cards-container">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`task-card ${selectedTask.id === task.id ? "selected" : ""}`}
                onClick={() => { 
                  setSelectedTask(task);
                  // On mobile, hide task list after selection
                  if (window.innerWidth <= 768) {
                    setShowTaskList(false);
                  }
                }}
              >
                <h3>{task.title}</h3>
                <p>Budget: ₹{task.budget}</p>
                <p>Deadline: {new Date(task.deadline).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <button className="create-task-button" onClick={() => setShowTaskForm(true)}>+ Create Task</button>
        </div>

        {/* Right Side - Task Details & Applicants */}
        <div className="task-details">
          <h2>Task Details</h2>
          <h3 className="task-title">{selectedTask.title}</h3>
          <p><strong>Description:</strong> {selectedTask.description}</p>
          <p><strong>Budget:</strong> ₹{selectedTask.budget}</p>
          <p><strong>Deadline:</strong> {new Date(selectedTask.deadline).toLocaleString()}</p>

          <h3>Applicants</h3>
          {selectedTask.applicants.length === 0 ? (
            <p className="Applicants">No Applicants Yet</p>
          ) : (
            <div className="applicants-container">
              {selectedTask.applicants.map((applicant) => (
                <div key={applicant.id} className="applicant-card">
                  <div className="applicant-info">
                    <div className="profile-pic-placeholder">Picture</div>
                    <div className="applicant-details">
                      <p className="applicant-name"><strong>{applicant.name}</strong></p>
                      <p className="applicant-meta">{applicant.profession}, {applicant.age}, {applicant.gender}</p>
                      <p className="applicant-price">Proposed Price: ₹{applicant.price}</p>
                      <div className="rating">⭐ {applicant.rating}</div>
                    </div>
                  </div>
                  <button className="chat-button" onClick={() => alert("This feature will be available in a future update.")}>Chat</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <div className="filter-modal" onClick={() => setShowFilters(false)}>
          <div className="filter-content" onClick={(e) => e.stopPropagation()}>
            <h3>Filter Tasks</h3>
            <button onClick={() => setTasks([...tasks].sort((a, b) => new Date(a.deadline) - new Date(b.deadline)))}>Sort by Date</button>
            <button onClick={() => setTasks([...tasks].sort((a, b) => a.budget - b.budget))}>Price: Low to High</button>
            <button onClick={() => setTasks([...tasks].sort((a, b) => b.budget - a.budget))}>Price: High to Low</button>
            <button className="close-button" onClick={() => setShowFilters(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="task-form-modal">
          <div className="task-form-content">
            <TaskForm onClose={() => setShowTaskForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskProviderDashboard;