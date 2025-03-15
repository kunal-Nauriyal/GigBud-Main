import React, { useState } from "react";
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
  
  // Sample data for tasks
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
      employer: "TechDocs Inc."
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
      employer: "John Smith"
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
      employer: "Emily Johnson"
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
      employer: "Digital Marketing Pro"
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
      employer: "Academic Solutions"
    }
  ];
  
  // Filtering tasks based on selected tab
  const getFilteredTasks = () => {
    switch(selectedTab) {
      case "newTasks":
        return allTasks.filter(task => !appliedTasks.includes(task.id) && !savedTasks.includes(task.id));
      case "appliedTasks":
        return allTasks.filter(task => appliedTasks.includes(task.id));
      case "savedTasks":
        return allTasks.filter(task => savedTasks.includes(task.id));
      case "ongoingTasks":
        // In a real app, this would be determined by tasks status
        return [];
      case "completedTasks":
        // In a real app, this would be determined by tasks status
        return [];
      default:
        return allTasks;
    }
  };
  
  // Sorting functionality
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
  
  // Handle task card click
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };
  
  // Handle apply button click
  const handleApplyClick = (e, taskId) => {
    e.stopPropagation();
    if (!appliedTasks.includes(taskId)) {
      setAppliedTasks([...appliedTasks, taskId]);
    }
  };
  
  // Handle save task button click
  const handleSaveClick = (e, taskId) => {
    e.stopPropagation();
    if (!savedTasks.includes(taskId)) {
      setSavedTasks([...savedTasks, taskId]);
    }
  };
  
  // Handle withdraw application
  const handleWithdrawClick = (e, taskId) => {
    e.stopPropagation();
    setAppliedTasks(appliedTasks.filter(id => id !== taskId));
  };
  
  // Handle unsave task
  const handleUnsaveClick = (e, taskId) => {
    e.stopPropagation();
    setSavedTasks(savedTasks.filter(id => id !== taskId));
  };
  
  // Get dynamic title based on selected tab
  const getTabTitle = () => {
    switch(selectedTab) {
      case "newTasks": return "Available Tasks";
      case "appliedTasks": return "Your Applied Tasks";
      case "savedTasks": return "Your Saved Tasks";
      case "ongoingTasks": return "Tasks In Progress";
      case "completedTasks": return "Completed Tasks";
      default: return "Tasks";
    }
  };
  
  return (
    <div>
       <h1 className="Headline">TASK MANAGEMENT DASHBOARD</h1>
    <div className="dashboard-container">
      
      <div className="content">
        {/* Left Panel - Navigation & Filters */}
        <div className="controls-panel">
          <h2 className="sidebar-title">Manage Your Tasks</h2>
          
          <div className="tabs">
            <button 
              className={selectedTab === "newTasks" ? "active" : ""} 
              onClick={() => setSelectedTab("newTasks")}
            >
              📂 New Tasks
            </button>
            <button 
              className={selectedTab === "appliedTasks" ? "active" : ""} 
              onClick={() => setSelectedTab("appliedTasks")}
            >
              ✅ Applied Tasks
            </button>
            <button 
              className={selectedTab === "savedTasks" ? "active" : ""} 
              onClick={() => setSelectedTab("savedTasks")}
            >
              🔖 Saved Tasks
            </button>
            <button 
              className={selectedTab === "ongoingTasks" ? "active" : ""} 
              onClick={() => setSelectedTab("ongoingTasks")}
            >
              ⏳ Ongoing Tasks
            </button>
            <button 
              className={selectedTab === "completedTasks" ? "active" : ""} 
              onClick={() => setSelectedTab("completedTasks")}
            >
              🎯 Completed Tasks
            </button>
          </div>
          
          <div className="search-filter-container">
            <div className="search-container">
              <input
                type="text"
                placeholder="🔍 Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-bar sidebar-search"
              />
            </div>
            
            <div className="filters">
              <label>📅 Sort by:</label>
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
        </div>

        {/* Right Panel - Task Listings */}
        <div className="task-list-panel">
          <h2 className="panel-title">{getTabTitle()}</h2>
          
          <div className="task-list">
            {sortedTasks
              .filter(task => 
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.employer.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(task => (
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
                  
                  <div className="task-card-actions">
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
                          Save for Later
                        </button>
                      </>
                    )}
                    
                    {selectedTab === "appliedTasks" && (
                      <button 
                        className="withdraw-button" 
                        onClick={(e) => handleWithdrawClick(e, task.id)}
                      >
                        Withdraw Application
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
                          Remove from Saved
                        </button>
                      </>
                    )}
                    
                    {selectedTab === "ongoingTasks" && (
                      <button className="complete-button">
                        Mark as Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
            {sortedTasks.length === 0 && (
              <div className="no-tasks-message">
                <p>No tasks found in this category.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Task Details Modal */}
      {showModal && selectedTask && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedTask.title}</h2>
              <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="task-details-section">
                <span className={`task-type-badge ${selectedTask.type}`}>
                  {selectedTask.type === "time-based" ? "Time-Based" : "Regular Task"}
                </span>
                
                <div className="detail-row">
                  <p><strong>Budget:</strong> ₹{selectedTask.budget}</p>
                  <p><strong>Deadline:</strong> {selectedTask.deadline}</p>
                  {selectedTask.duration && <p><strong>Duration:</strong> {selectedTask.duration}</p>}
                </div>
                
                <div className="detail-row">
                  <p><strong>Employer:</strong> {selectedTask.employer}</p>
                  <p><strong>Category:</strong> {selectedTask.category}</p>
                </div>
                
                <div className="description-section">
                  <h3>Full Description</h3>
                  <p>{selectedTask.description}</p>
                </div>
                
                <div className="modal-actions">
                  {!appliedTasks.includes(selectedTask.id) && (
                    <button 
                      className="apply-button modal-button" 
                      onClick={(e) => {
                        handleApplyClick(e, selectedTask.id);
                        setShowModal(false);
                      }}
                    >
                      Apply for This Task
                    </button>
                  )}
                  
                  {appliedTasks.includes(selectedTask.id) && (
                    <button 
                      className="withdraw-button modal-button"
                      onClick={(e) => {
                        handleWithdrawClick(e, selectedTask.id);
                        setShowModal(false);
                      }}
                    >
                      Withdraw Application
                    </button>
                  )}
                  
                  {!savedTasks.includes(selectedTask.id) && !appliedTasks.includes(selectedTask.id) && (
                    <button 
                      className="save-button modal-button"
                      onClick={(e) => {
                        handleSaveClick(e, selectedTask.id);
                        setShowModal(false);
                      }}
                    >
                      Save for Later
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
      </div>
  );
};

export default TaskManagement ;