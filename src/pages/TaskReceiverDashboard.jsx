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
  const [showControlsPanel, setShowControlsPanel] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Only auto-hide panel on initial load for mobile
      if (mobile && !isMobile) {
        setShowControlsPanel(false);
      } else if (!mobile && isMobile) {
        setShowControlsPanel(true);
      }
    };
    
    // Run once on initial load
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  const toggleControlsPanel = () => {
    setShowControlsPanel(!showControlsPanel);
  };

  const allTasks = [ 
    { id: 1, type: "time-based", title: "Technical Writing Assistance", budget: 1500, deadline: "2025-03-25", duration: "10 hours", description: "Help with technical documentation for a software project.", category: "Writing", employer: "TechDocs Inc.", location: "Remote", skills: ["Technical Writing", "API Documentation"], requirements: "2+ years experience." }, 
    { id: 2, type: "regular", title: "House Cleaning Service", budget: 800, deadline: "2025-03-22", duration: null, description: "Deep cleaning for a 2BHK apartment.", category: "Cleaning", employer: "John Smith", location: "Mumbai", skills: ["Cleaning"], requirements: "Experience in professional cleaning services." }, 
    { id: 3, type: "time-based", title: "Personal Driving Assistant", budget: 2000, deadline: "2025-03-28", duration: "20 hours", description: "Need a driver for daily commute.", category: "Driving", employer: "Emily Johnson", location: "Delhi", skills: ["Driving"], requirements: "Valid license, 3+ years experience." } 
  ];

  const getFilteredTasks = () => {
    switch (selectedTab) {
      case "newTasks":
        return allTasks.filter(task => !appliedTasks.includes(task.id) && !savedTasks.includes(task.id));
      case "appliedTasks":
        return allTasks.filter(task => appliedTasks.includes(task.id));
      case "savedTasks":
        return allTasks.filter(task => savedTasks.includes(task.id));
      default:
        return [];
    }
  };

  const filteredTasks = getFilteredTasks().sort((a, b) => {
    if (sortOrder === "deadline") return new Date(a.deadline) - new Date(b.deadline);
    if (sortOrder === "lowToHigh") return a.budget - b.budget;
    return b.budget - a.budget;
  }).filter(task => {
    if (filterType === "all") return true;
    return task.type === filterType;
  });

  const searchFilteredTasks = filteredTasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.employer.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const getTabTitle = () => {
    switch (selectedTab) {
      case "newTasks": return "Available Tasks";
      case "appliedTasks": return "Your Applied Tasks";
      case "savedTasks": return "Your Saved Tasks";
      default: return "Tasks";
    }
  };

  useEffect(() => {
    document.body.style.overflow = showModal ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [showModal]);

  return (
    <div>
      <h1 className="Headline">TASK MANAGEMENT DASHBOARD</h1>
      <div className="dashboard-container">
        {isMobile && (
          <button className="task-list-toggle" onClick={toggleControlsPanel}>
            {showControlsPanel ? "←" : "→"}
          </button>
        )}

        <div className={`controls-panel ${showControlsPanel ? 'show' : ''}`}>
          <h2 className="sidebar-title">Manage Your Tasks</h2>
          <div className="tabs">
            <button className={selectedTab === "newTasks" ? "active" : ""} onClick={() => setSelectedTab("newTasks")}>📂 New Tasks</button>
            <button className={selectedTab === "appliedTasks" ? "active" : ""} onClick={() => setSelectedTab("appliedTasks")}>✅ Applied Tasks</button>
            <button className={selectedTab === "savedTasks" ? "active" : ""} onClick={() => setSelectedTab("savedTasks")}>🔖 Saved Tasks</button>
          </div>

          <div className="search-filter-container">
            <input type="text" placeholder="🔍 Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-bar" />
            <div className="filters">
              <label>🗕 Sort by:</label>
              <select onChange={(e) => setSortOrder(e.target.value)} value={sortOrder}>
                <option value="deadline">Deadline</option>
                <option value="lowToHigh">Budget: Low to High</option>
                <option value="highToLow">Budget: High to Low</option>
              </select>
            </div>
            <div className="filters">
              <label>🏷 Filter by Task Type:</label>
              <select onChange={(e) => setFilterType(e.target.value)} value={filterType}>
                <option value="all">All Types</option>
                <option value="regular">Regular Tasks</option>
                <option value="time-based">Time-Based Tasks</option>
              </select>
            </div>
          </div>
        </div>

        <div className="task-list-panel">
          <h2 className="panel-title">{getTabTitle()}</h2>
          <div className="task-list">
            {searchFilteredTasks.length > 0 ? (
              searchFilteredTasks.map(task => (
                <div key={task.id} className={`task-card ${selectedTask?.id === task.id ? "selected" : ""}`} onClick={() => handleTaskClick(task)}>
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
                  <div className="task-action-buttons">
                    {selectedTab === "newTasks" && (
                      <>
                        <button className="apply-button" onClick={(e) => handleApplyClick(e, task.id)}>Apply</button>
                        <button className="save-button" onClick={(e) => handleSaveClick(e, task.id)}>Save</button>
                      </>
                    )}
                    {selectedTab === "appliedTasks" && (
                      <button className="withdraw-button" onClick={(e) => handleWithdrawClick(e, task.id)}>Withdraw</button>
                    )}
                    {selectedTab === "savedTasks" && (
                      <>
                        <button className="apply-button" onClick={(e) => handleApplyClick(e, task.id)}>Apply</button>
                        <button className="unsave-button" onClick={(e) => handleUnsaveClick(e, task.id)}>Unsave</button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-tasks-message">
                <p>No tasks found matching your search.</p>
              </div>
            )}
          </div>
        </div>

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
                  <div className="detail-item"><span className="detail-label">💰 Budget</span><span className="detail-value">₹{selectedTask.budget}</span></div>
                  <div className="detail-item"><span className="detail-label">🕒 Deadline</span><span className="detail-value">{selectedTask.deadline}</span></div>
                  {selectedTask.duration && <div className="detail-item"><span className="detail-label">⏳ Duration</span><span className="detail-value">{selectedTask.duration}</span></div>}
                  <div className="detail-item"><span className="detail-label">👤 Employer</span><span className="detail-value">{selectedTask.employer}</span></div>
                  <div className="detail-item"><span className="detail-label">📍 Location</span><span className="detail-value">{selectedTask.location}</span></div>
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
                  <button className="apply-button modal-button" onClick={(e) => { handleApplyClick(e, selectedTask.id); closeModal(); }}>Apply for this Task</button>
                )}
                {!savedTasks.includes(selectedTask.id) ? (
                  <button className="save-button modal-button" onClick={(e) => { handleSaveClick(e, selectedTask.id); closeModal(); }}>Save for Later</button>
                ) : (
                  <button className="unsave-button modal-button" onClick={(e) => { handleUnsaveClick(e, selectedTask.id); closeModal(); }}>Remove from Saved</button>
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