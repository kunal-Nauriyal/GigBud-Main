import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { taskAPI } from '../services/api';
import { toast } from 'react-toastify';
import './TaskReceiverDashboard.css';

// Tab list with icons for sidebar
const TAB_LIST = [
  { key: "available", label: "Available Tasks", icon: "🧭" },
  { key: "applied", label: "Applied Tasks", icon: "✅" },
  { key: "saved", label: "Saved Tasks", icon: "📌" },
  { key: "ongoing", label: "Ongoing Tasks", icon: "🚧" },
  { key: "completed", label: "Completed Tasks", icon: "🏁" },
];

const TaskReceiverDashboard = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [activeTab, setActiveTab] = useState('available');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [location, setLocation] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [ratings, setRatings] = useState({});
  const [sortBy, setSortBy] = useState('deadline');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error('Please login to continue');
      navigate('/');
      return;
    }

    fetchTasks();
  }, [isLoggedIn, navigate, activeTab, location]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      const normalizedLocation = location?.toLowerCase().trim();

      switch (activeTab) {
        case 'available':
          response = await taskAPI.getAvailableTasks(normalizedLocation);
          break;
        case 'applied':
          response = await taskAPI.getAppliedTasks();
          break;
        case 'saved':
          response = await taskAPI.getSavedTasks();
          break;
        case 'ongoing':
          response = await taskAPI.getOngoingTasks();
          break;
        case 'completed':
          response = await taskAPI.getCompletedTasks();
          break;
        default:
          response = await taskAPI.getAvailableTasks(normalizedLocation);
      }

      if (response.success) {
        const taskArray = Array.isArray(response.data) ? response.data : [];
        console.log(`Fetched ${taskArray.length} tasks from backend`, taskArray);
        setTasks(taskArray);
      } else {
        throw new Error(response.message || 'Failed to fetch tasks');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch tasks';
      setError(errorMsg);
      toast.error(errorMsg);

      if (err.response?.status === 401) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get the location display value from task
  const getLocationDisplay = (task) => {
    // Check for object-based location (In-Person)
    if (task.location && typeof task.location === 'object') {
      if (task.location.address) {
        return task.location.address;
      }
      if (task.location.name) {
        return task.location.name;
      }
    }
    // Check for simple workLocation property
    if (task.workLocation && task.workLocation !== 'Online') {
      return task.workLocation;
    }
    // Default to location string if present and not 'Online'
    if (typeof task.location === 'string' && task.location !== 'Online') {
      return task.location;
    }
    // Return 'Remote' as the fallback for tasks with online/remote location
    return 'Remote';
  };

  const handleApplyTask = async (taskId) => {
    try {
      setLoading(true);
      const response = await taskAPI.applyForTask(taskId);
      if (response.success) {
        toast.success('Application submitted successfully');
        fetchTasks();
      } else {
        throw new Error(response.message || 'Failed to apply for task');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to apply for task');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTask = async (taskId) => {
    try {
      setLoading(true);
      const response = await taskAPI.saveTask(taskId);
      if (response.success) {
        toast.success('Task saved successfully');
        fetchTasks();
      } else {
        throw new Error(response.message || 'Failed to save task');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Instead of using lat/lng directly, we'll use reverse geocoding
        // For now, we'll just set a placeholder
        setLocationInput("Current Location");
        toast.info("Using your current location");
      },
      () => alert("Unable to retrieve your location.")
    );
  };

  const handleSaveLocation = () => {
    const normalized = locationInput.toLowerCase().trim();
    setLocation(normalized);
    setLocationSearchQuery(''); // Reset location search when setting new base location
    setShowLocationModal(false);
    toast.success(`Location set to: ${normalized}`);
    fetchTasks();
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleMarkComplete = async (taskId) => {
    try {
      setLoading(true);
      const response = await taskAPI.completeTask(taskId);
      if (response.success) {
        toast.success('Task marked as complete');
        fetchTasks();
      } else {
        throw new Error(response.message || 'Failed to mark task as complete');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to mark task as complete');
    } finally {
      setLoading(false);
    }
  };

  const handleRate = (taskId, rating) => {
    setRatings({ ...ratings, [taskId]: rating });
  };

  const handleLocationSearch = (e) => {
    setLocationSearchQuery(e.target.value);
  };

  const filteredTasks = tasks
    .filter(task => {
      // First filter by title/description search query
      const matchesSearch = !searchQuery || 
        task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Then filter by location search
      const taskLocation = getLocationDisplay(task).toLowerCase();
      const matchesLocation = !locationSearchQuery ||
        taskLocation.includes(locationSearchQuery.toLowerCase());
      
      return matchesSearch && matchesLocation;
    })
    .filter(task => {
      if (filterType === 'all') return true;
      return task.type === filterType;
    })
    .sort((a, b) => {
      if (sortBy === 'deadline') return new Date(a.deadline) - new Date(b.deadline);
      if (sortBy === 'budgetHigh') return (b.budget || b.budgetPerHour || 0) - (a.budget || a.budgetPerHour || 0);
      if (sortBy === 'budgetLow') return (a.budget || a.budgetPerHour || 0) - (b.budget || b.budgetPerHour || 0);
      return 0;
    });

  // Task List Panels
  const renderAvailableTasks = () => (
    <div className="gigbud-task-list">
      {filteredTasks.length > 0 ? (
        filteredTasks.map(task => (
          <div
            key={task._id}
            className="gigbud-task-card"
            onClick={() => handleTaskClick(task)}
          >
            <div className="task-title-row">
              <span className="task-title">{task.title || task.jobType || "Untitled Task"}</span>
              <span className="task-location">
                {getLocationDisplay(task)}
              </span>
            </div>
            <div className="task-desc">{task.description ? task.description.substring(0, 100) + '...' : 'No description available'}</div>
            <div className="task-meta">
              <span>Budget: <b>₹{task.budget || task.budgetPerHour || 'Negotiable'}</b></span>
              <span>Deadline: <b>{task.deadline ? new Date(task.deadline).toLocaleString() : 'Flexible'}</b></span>
              <span>Type: <b>{task.type || 'Regular'}</b></span>
            </div>
            <div className="task-actions" onClick={(e) => e.stopPropagation()}>
              <button
                className="apply"
                onClick={(e) => {
                  e.stopPropagation();
                  handleApplyTask(task._id);
                }}
              >
                Apply
              </button>
              <button
                className="save"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveTask(task._id);
                }}
              >
                Save
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="no-tasks-message">
          {locationSearchQuery 
            ? `No tasks found matching location "${locationSearchQuery}". Try a different search term.` 
            : 'No available tasks found in your area. Try changing your location.'}
        </p>
      )}
    </div>
  );

  const renderAppliedTasks = () => (
    <div className="gigbud-task-list">
      {filteredTasks.length > 0 ? (
        filteredTasks.map(task => (
          <div
            key={task._id}
            className="gigbud-task-card"
            onClick={() => handleTaskClick(task)}
          >
            <div className="task-title-row">
              <span className="task-title">{task.title || task.jobType || "Untitled Task"}</span>
              <span className="task-status-badge applied">Awaiting Approval</span>
            </div>
            <div className="task-desc">{task.description ? task.description.substring(0, 100) + '...' : 'No description available'}</div>
            <div className="task-meta">
              <span>Budget: <b>₹{task.budget || task.budgetPerHour || 'Negotiable'}</b></span>
              <span>Deadline: <b>{task.deadline ? new Date(task.deadline).toLocaleString() : 'Flexible'}</b></span>
              <span>Type: <b>{task.type || 'Regular'}</b></span>
            </div>
          </div>
        ))
      ) : (
        <p className="no-tasks-message">No applied tasks yet.</p>
      )}
    </div>
  );

  const renderSavedTasks = () => (
    <div className="gigbud-task-list">
      {filteredTasks.length > 0 ? (
        filteredTasks.map(task => (
          <div
            key={task._id}
            className="gigbud-task-card"
            onClick={() => handleTaskClick(task)}
          >
            <div className="task-title-row">
              <span className="task-title">{task.title || task.jobType || "Untitled Task"}</span>
              <span className="task-status-badge saved">Saved</span>
            </div>
            <div className="task-desc">{task.description ? task.description.substring(0, 100) + '...' : 'No description available'}</div>
            <div className="task-meta">
              <span>Budget: <b>₹{task.budget || task.budgetPerHour || 'Negotiable'}</b></span>
              <span>Deadline: <b>{task.deadline ? new Date(task.deadline).toLocaleString() : 'Flexible'}</b></span>
              <span>Type: <b>{task.type || 'Regular'}</b></span>
            </div>
            <div className="task-actions" onClick={(e) => e.stopPropagation()}>
              <button
                className="apply"
                onClick={(e) => {
                  e.stopPropagation();
                  handleApplyTask(task._id);
                }}
              >
                Apply
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="no-tasks-message">No saved tasks yet.</p>
      )}
    </div>
  );

  const renderOngoingTasks = () => (
    <div className="gigbud-task-list">
      {filteredTasks.length > 0 ? (
        filteredTasks.map(task => (
          <div
            key={task._id}
            className="gigbud-task-card"
            onClick={() => handleTaskClick(task)}
          >
            <div className="task-title-row">
              <span className="task-title">{task.title || task.jobType || "Untitled Task"}</span>
              <span className="task-status-badge inprogress">In Progress</span>
            </div>
            <div className="task-desc">{task.description ? task.description.substring(0, 100) + '...' : 'No description available'}</div>
            <div className="task-meta">
              <span>Budget: <b>₹{task.budget || task.budgetPerHour || 'Negotiable'}</b></span>
              <span>Deadline: <b>{task.deadline ? new Date(task.deadline).toLocaleString() : 'Flexible'}</b></span>
              <span>Type: <b>{task.type || 'Regular'}</b></span>
            </div>
            <div className="task-actions" onClick={(e) => e.stopPropagation()}>
              <button
                className="mark-complete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkComplete(task._id);
                }}
              >
                Mark as Complete
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="no-tasks-message">No ongoing tasks yet.</p>
      )}
    </div>
  );

  const renderCompletedTasks = () => (
    <div className="gigbud-task-list">
      {filteredTasks.length > 0 ? (
        filteredTasks.map(task => (
          <div
            key={task._id}
            className="gigbud-task-card"
            onClick={() => handleTaskClick(task)}
          >
            <div className="task-title-row">
              <span className="task-title">{task.title || task.jobType || "Untitled Task"}</span>
              <span className="task-status-badge completed">Completed</span>
            </div>
            <div className="task-desc">{task.description ? task.description.substring(0, 100) + '...' : 'No description available'}</div>
            <div className="task-meta">
              <span>Budget: <b>₹{task.budget || task.budgetPerHour || 'Negotiable'}</b></span>
              <span>Deadline: <b>{task.deadline ? new Date(task.deadline).toLocaleString() : 'Flexible'}</b></span>
              <span>Type: <b>{task.type || 'Regular'}</b></span>
            </div>
            <div className="gigbud-rating">
              <span>Your Rating:</span>
              {[1,2,3,4,5].map(star => (
                <span
                  key={star}
                  className={`star${ratings[task._id] >= star ? '' : ' inactive'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRate(task._id, star);
                  }}
                >★</span>
              ))}
              {ratings[task._id] && <span style={{ marginLeft: 8 }}>{ratings[task._id]}/5</span>}
            </div>
          </div>
        ))
      ) : (
        <p className="no-tasks-message">No completed tasks yet.</p>
      )}
    </div>
  );

  const renderMainContent = () => {
    switch (activeTab) {
      case 'available':
        return renderAvailableTasks();
      case 'applied':
        return renderAppliedTasks();
      case 'saved':
        return renderSavedTasks();
      case 'ongoing':
        return renderOngoingTasks();
      case 'completed':
        return renderCompletedTasks();
      default:
        return renderAvailableTasks();
    }
  };

  return (
    <div className="dashboard-container">
      {loading && <div className="loading-overlay">Loading...</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Sidebar */}
      <div className="gigbud-sidebar">
        <div className="sidebar-header">
          <h1>Task Receiver</h1>
          <p>Welcome, {user?.name || 'User'}!</p>
        </div>
        <div className="gigbud-sidebar-tabs">
          {/* Location button */}
          <button
            className="gigbud-tab-btn"
            onClick={() => setShowLocationModal(true)}
          >
            <span style={{ fontSize: 22, marginRight: 12 }}>📍</span>
            Add Location
            {location && (
              <span className="location-badge">({location})</span>
            )}
          </button>
          
          {/* Tab buttons */}
          {TAB_LIST.map(tab => (
            <button
              key={tab.key}
              className={`gigbud-tab-btn${activeTab === tab.key ? " active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span style={{ fontSize: 22, marginRight: 12 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}

          {/* Sort and Filter UI */}
          <div className="gigbud-sidebar-filters">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="deadline">Deadline</option>
              <option value="budgetHigh">Budget High to Low</option>
              <option value="budgetLow">Budget Low to High</option>
            </select>

            <label>Filter by Type:</label>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="time">Time-Based</option>
              <option value="regular">Regular Tasks</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="gigbud-main">
        <div className="gigbud-panel">
          {/* Panel Title */}
          <h2 className="gigbud-panel-title">
            {TAB_LIST.find(t => t.key === activeTab)?.icon || "📍"} {TAB_LIST.find(t => t.key === activeTab)?.label || "Available Tasks"}
          </h2>
          
          {/* Search bar row with two search inputs */}
          <div className="gigbud-searchbar-row">
            <input
              className="gigbud-searchbar"
              type="text"
              placeholder="🔍 Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            {/* Location search input - NEW! */}
            <input
              className="gigbud-searchbar location-search"
              type="text"
              placeholder="📍 Filter by location..."
              value={locationSearchQuery}
              onChange={handleLocationSearch}
            />
          </div>
          
          {/* Display selected location filter if any */}
          {locationSearchQuery && (
            <div className="active-location-filter">
              <span>Filtering by location: <strong>{locationSearchQuery}</strong></span>
              <button 
                className="clear-filter-btn"
                onClick={() => setLocationSearchQuery('')}
              >
                ✕
              </button>
            </div>
          )}
          
          {/* Task Lists */}
          {renderMainContent()}
        </div>
      </main>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="gigbud-modal-bg" onClick={() => setShowLocationModal(false)}>
          <div className="gigbud-modal" onClick={e => e.stopPropagation()}>
            <h2>Set Your Location</h2>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Enter city name, area, or address"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
              />
              <button className="use-location" onClick={handleUseMyLocation}>Use My Current Location</button>
              <div className="modal-actions">
                <button className="cancel" onClick={() => setShowLocationModal(false)}>Cancel</button>
                <button className="save" onClick={handleSaveLocation} disabled={!locationInput}>Save Location</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {isModalOpen && selectedTask && (
        <div className="gigbud-modal-bg" onClick={handleCloseModal}>
          <div className="gigbud-modal task-details-modal" onClick={e => e.stopPropagation()}>
            <h2>{selectedTask.title || selectedTask.jobType || "Untitled Task"}</h2>
            <div className="task-details-content">
              <div className="task-details-section">
                <h3>Description</h3>
                <p>{selectedTask.description || "No description available"}</p>
              </div>
              
              <div className="task-details-section">
                <h3>Details</h3>
                <div className="task-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Budget:</span>
                    <span className="detail-value">₹{selectedTask.budget || selectedTask.budgetPerHour || 'Negotiable'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Deadline:</span>
                    <span className="detail-value">
                      {selectedTask.deadline ? new Date(selectedTask.deadline).toLocaleString() : 'Flexible'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">
                      {getLocationDisplay(selectedTask)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">{selectedTask.status || 'Open'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{selectedTask.type || 'Regular'}</span>
                  </div>
                </div>
              </div>

              <div className="task-details-section">
                <h3>Requirements</h3>
                <ul className="requirements-list">
                  {selectedTask.requirements?.map((req, index) => (
                    <li key={index}>{req}</li>
                  )) || <li>No specific requirements listed</li>}
                </ul>
              </div>
            </div>

            <div className="modal-actions">
              <button className="cancel" onClick={handleCloseModal}>Close</button>
              {activeTab === 'available' && (
                <>
                  <button
                    className="apply"
                    onClick={() => handleApplyTask(selectedTask._id)}
                  >
                    Apply
                  </button>
                  <button
                    className="save"
                    onClick={() => handleSaveTask(selectedTask._id)}
                  >
                    Save
                  </button>
                </>
              )}
              {activeTab === 'saved' && (
                <button
                  className="apply"
                  onClick={() => handleApplyTask(selectedTask._id)}
                >
                  Apply
                </button>
              )}
              {activeTab === 'ongoing' && (
                <button
                  className="mark-complete"
                  onClick={() => handleMarkComplete(selectedTask._id)}
                >
                  Mark as Complete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskReceiverDashboard;