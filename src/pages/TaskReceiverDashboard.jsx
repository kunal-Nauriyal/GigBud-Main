import React, { useState, useEffect } from "react";
import "./TaskReceiverDashboard.css";

const TaskManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("newTasks");
  const [selectedTask, setSelectedTask] = useState(null);
  const [savedTasks, setSavedTasks] = useState([]);
  const [appliedTasks, setAppliedTasks] = useState([]);
  const [sortOrder, setSortOrder] = useState("deadline");
  const [filterType, setFilterType] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showControlsPanel, setShowControlsPanel] = useState(window.innerWidth > 768); // Controls Panel Hidden by Default on Mobile

  useEffect(() => {
    const handleResize = () => {
      setShowControlsPanel(window.innerWidth > 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleControlsPanel = () => {
    setShowControlsPanel(!showControlsPanel);
  };

  const allTasks = [
    { 
      id: 1, 
      type: "time-based", 
      title: "Technical Writing Assistance", 
      budget: 1500, 
      deadline: "2025-03-25", 
      duration: "10 hours",
      description: "Need help with technical documentation for a software project. Looking for someone with experience in writing API documentation and user guides.", 
      category: "Writing",
      employer: "TechDocs Inc.",
      location: "Remote",
      skills: ["Technical Writing", "API Documentation", "User Guides"],
      requirements: "At least 2 years of experience in technical writing. Familiarity with software development processes."
    },
    { 
      id: 2, 
      type: "regular", 
      title: "House Cleaning Service", 
      budget: 800, 
      deadline: "2025-03-22", 
      duration: null,
      description: "Deep cleaning required for a 2BHK apartment. Tasks include dusting, mopping, bathroom cleaning, and kitchen organization.", 
      category: "Cleaning",
      employer: "John Smith",
      location: "Mumbai, Maharashtra",
      skills: ["Cleaning", "Organization", "Time Management"],
      requirements: "Experience in professional cleaning services. Must bring own cleaning supplies."
    },
    { 
      id: 3, 
      type: "time-based", 
      title: "Personal Driving Assistant", 
      budget: 2000, 
      deadline: "2025-03-28", 
      duration: "20 hours",
      description: "Need a driver for a week to help with daily commute and errands. Must have valid license and clean driving record.", 
      category: "Driving",
      employer: "Emily Johnson",
      location: "Delhi, NCR",
      skills: ["Driving", "Navigation", "Time Management"],
      requirements: "Valid driving license with at least 3 years of experience. Knowledge of local roads and traffic patterns."
    },
    { 
      id: 4, 
      type: "regular", 
      title: "Content Writing for Blog", 
      budget: 1200, 
      deadline: "2025-03-30", 
      duration: null,
      description: "Need 5 blog posts written about digital marketing trends. Each post should be approximately 1000 words with SEO optimization.", 
      category: "Writing",
      employer: "Digital Marketing Pro",
      location: "Remote",
      skills: ["Content Writing", "SEO", "Digital Marketing"],
      requirements: "Portfolio of published blog posts. Understanding of SEO best practices."
    },
    { 
      id: 5, 
      type: "time-based", 
      title: "Online Research Assistant", 
      budget: 1800, 
      deadline: "2025-04-05", 
      duration: "15 hours",
      description: "Looking for someone to conduct online research for an academic project. Will involve data collection, organization, and basic analysis.", 
      category: "Research",
      employer: "Academic Solutions",
      location: "Remote",
      skills: ["Research", "Data Analysis", "Organization"],
      requirements: "Background in academic research. Proficiency in data organization tools."
    }
  ];

  const getFilteredTasks = () => {
    switch (selectedTab) {
      case "newTasks":
        return allTasks.filter(task => !appliedTasks.includes(task.id) && !savedTasks.includes(task.id));
      case "appliedTasks":
        return allTasks.filter(task => appliedTasks.includes(task.id));
      case "savedTasks":
        return allTasks.filter(task => savedTasks.includes(task.id));
      case "ongoingTasks":
        return [];
      case "completedTasks":
        return [];
      default:
        return allTasks;
    }
  };

  const sortedTasks = getFilteredTasks().sort((a, b) => {
    if (sortOrder === "deadline") {
      return new Date(a.deadline) - new Date(b.deadline);
    } else if (sortOrder === "lowToHigh") {
      return a.budget - b.budget;
    } else {
      return b.budget - a.budget;
    }
  }).filter(task => {
    if (filterType === "all") return true;
    return task.type === filterType;
  });

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTask(null);
  };

  const handleApplyClick = (e, taskId) => {
    e.stopPropagation();
    if (!appliedTasks.includes(taskId)) {
      setAppliedTasks([...appliedTasks, taskId]);
    }
  };

  const handleSaveClick = (e, taskId) => {
    e.stopPropagation();
    if (!savedTasks.includes(taskId)) {
      setSavedTasks([...savedTasks, taskId]);
    }
  };

  const handleWithdrawClick = (e, taskId) => {
    e.stopPropagation();
    setAppliedTasks(appliedTasks.filter(id => id !== taskId));
  };

  const handleUnsaveClick = (e, taskId) => {
    e.stopPropagation();
    setSavedTasks(savedTasks.filter(id => id !== taskId));
  };

  const handleCreateTask = () => {
    // Implementation for creating a new task
    alert("Create Task functionality will be implemented");
  };

  const getTabTitle = () => {
    switch (selectedTab) {
      case "newTasks": return "Available Tasks";
      case "appliedTasks": return "Your Applied Tasks";
      case "savedTasks": return "Your Saved Tasks";
      case "ongoingTasks": return "Tasks In Progress";
      case "completedTasks": return "Completed Tasks";
      default: return "Tasks";
    }
  };

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showModal]);

  return (
    <div>
      <h1 className="Headline">TASK MANAGEMENT DASHBOARD</h1>
      <div className="dashboard-container">

        {/* Toggle Button for Controls Panel (Manage Your Tasks) */}
        <button
          className="task-list-toggle"
          onClick={toggleControlsPanel}
          aria-label={showControlsPanel ? "Hide Controls" : "Show Controls"}
        >
          {showControlsPanel ? "←" : "→"}
        </button>

        {/* RIGHT SIDE: Task List Panel (Always Visible) */}
        <div className="task-list-panel show">
          <h2 className="panel-title">{getTabTitle()}</h2>
          <div className="task-list">
            {sortedTasks.length > 0 ? (
              sortedTasks.filter(task =>
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.employer.toLowerCase().includes(searchQuery.toLowerCase())
              ).map(task => (
                <div
                  key={task.id}
                  className={`task-card ${selectedTask?.id === task.id ? "selected" : ""}`}
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="task-card-header">
                    <span className={`task-type-badge ${task.type}`}>
                      {task.type === "time-based" ? "Time-Based" : "Regular Task"}
                    </span>
                    <h3>{task.title}</h3>
                  </div>
                  <div className="task-card-info">
                    <p><strong>💰 Budget:</strong> ₹{task.budget}</p>
                    <p><strong>🕒 Deadline:</strong> {task.deadline}</p>
                    {task.duration && <p><strong>⏳ Duration:</strong> {task.duration}</p>}
                    <p><strong>👤 Employer:</strong> {task.employer}</p>
                  </div>
                  
                  {/* Task Action Buttons */}
                  <div className="task-action-buttons">
                    {selectedTab === "newTasks" && (
                      <>
                        <button 
                          className="apply-button" 
                          onClick={(e) => handleApplyClick(e, task.id)}
                        >
                          Apply
                        </button>
                        <button 
                          className="save-button" 
                          onClick={(e) => handleSaveClick(e, task.id)}
                        >
                          Save
                        </button>
                      </>
                    )}
                    {selectedTab === "appliedTasks" && (
                      <button 
                        className="withdraw-button" 
                        onClick={(e) => handleWithdrawClick(e, task.id)}
                      >
                        Withdraw
                      </button>
                    )}
                    {selectedTab === "savedTasks" && (
                      <>
                        <button 
                          className="apply-button" 
                          onClick={(e) => handleApplyClick(e, task.id)}
                        >
                          Apply
                        </button>
                        <button 
                          className="unsave-button" 
                          onClick={(e) => handleUnsaveClick(e, task.id)}
                        >
                          Unsave
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-tasks-message">
                <p>No tasks found in this category.</p>
              </div>
            )}
          </div>
        </div>

        {/* LEFT SIDE: Controls Panel (Manage Your Tasks) - Hidden on Mobile */}
        {showControlsPanel && (
          <div className="controls-panel">
            <h2 className="sidebar-title">Manage Your Tasks</h2>
            <div className="tabs">
              <button className={selectedTab === "newTasks" ? "active" : ""} onClick={() => setSelectedTab("newTasks")}>📂 New Tasks</button>
              <button className={selectedTab === "appliedTasks" ? "active" : ""} onClick={() => setSelectedTab("appliedTasks")}>✅ Applied Tasks</button>
              <button className={selectedTab === "savedTasks" ? "active" : ""} onClick={() => setSelectedTab("savedTasks")}>🔖 Saved Tasks</button>
              <button className={selectedTab === "ongoingTasks" ? "active" : ""} onClick={() => setSelectedTab("ongoingTasks")}>⏳ Ongoing Tasks</button>
              <button className={selectedTab === "completedTasks" ? "active" : ""} onClick={() => setSelectedTab("completedTasks")}>🎯 Completed Tasks</button>
            </div>

            <div className="search-filter-container">
              <input
                type="text"
                placeholder="🔍 Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-bar sidebar-search"
              />
              <div className="filters">
                <label>🗕 Sort by:</label>
                <select onChange={(e) => setSortOrder(e.target.value)}>
                  <option value="deadline">Deadline</option>
                  <option value="lowToHigh">Budget: Low to High</option>
                  <option value="highToLow">Budget: High to Low</option>
                </select>
              </div>
              <div className="filters">
                <label>🏷 Filter by Task Type:</label>
                <select onChange={(e) => setFilterType(e.target.value)}>
                  <option value="all">All Types</option>
                  <option value="regular">Regular Tasks</option>
                  <option value="time-based">Time-Based Tasks</option>
                </select>
              </div>
            </div>
            
            {/* Create Task Button */}
            <button className="create-task-button" onClick={handleCreateTask}>
              + Create Task
            </button>
          </div>
        )}

        {/* Task Details Modal */}
        {showModal && selectedTask && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={closeModal}>×</button>
              <div className="modal-header">
                <span className={`task-type-badge ${selectedTask.type}`}>
                  {selectedTask.type === "time-based" ? "Time-Based" : "Regular Task"}
                </span>
                <h2>{selectedTask.title}</h2>
                <p className="task-category">{selectedTask.category}</p>
              </div>
              
              <div className="modal-body">
                <div className="modal-section">
                  <h3>Description</h3>
                  <p>{selectedTask.description}</p>
                </div>
                
                <div className="modal-section modal-details">
                  <div className="detail-item">
                    <span className="detail-label">💰 Budget</span>
                    <span className="detail-value">₹{selectedTask.budget}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">🕒 Deadline</span>
                    <span className="detail-value">{selectedTask.deadline}</span>
                  </div>
                  {selectedTask.duration && (
                    <div className="detail-item">
                      <span className="detail-label">⏳ Duration</span>
                      <span className="detail-value">{selectedTask.duration}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">👤 Employer</span>
                    <span className="detail-value">{selectedTask.employer}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">📍 Location</span>
                    <span className="detail-value">{selectedTask.location}</span>
                  </div>
                </div>
                
                <div className="modal-section">
                  <h3>Required Skills</h3>
                  <div className="skills-list">
                    {selectedTask.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
                
                <div className="modal-section">
                  <h3>Requirements</h3>
                  <p>{selectedTask.requirements}</p>
                </div>
              </div>
              
              <div className="modal-footer">
                {!appliedTasks.includes(selectedTask.id) && (
                  <button 
                    className="apply-button modal-button" 
                    onClick={(e) => {
                      handleApplyClick(e, selectedTask.id);
                      closeModal();
                    }}
                  >
                    Apply for this Task
                  </button>
                )}
                {!savedTasks.includes(selectedTask.id) ? (
                  <button 
                    className="save-button modal-button" 
                    onClick={(e) => {
                      handleSaveClick(e, selectedTask.id);
                      closeModal();
                    }}
                  >
                    Save for Later
                  </button>
                ) : (
                  <button 
                    className="unsave-button modal-button" 
                    onClick={(e) => {
                      handleUnsaveClick(e, selectedTask.id);
                      closeModal();
                    }}
                  >
                    Remove from Saved
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManagement;