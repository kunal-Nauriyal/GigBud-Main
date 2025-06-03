import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { taskAPI } from '../services/api';
import { toast } from 'react-toastify';
import LocationDropdown from './LocationDropdown';
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
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortBy, setSortBy] = useState('latest');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [ratings, setRatings] = useState({});
  const [appliedTasks, setAppliedTasks] = useState(new Set());
  const [savedTasks, setSavedTasks] = useState(new Set());
  const [ongoingTasks, setOngoingTasks] = useState(new Set());
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [ratingModalTask, setRatingModalTask] = useState(null);
  const [currentRating, setCurrentRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

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
          response = await taskAPI.getAvailableTasks();
          if (normalizedLocation) {
            response.data = response.data.filter(task => {
              const taskLocation = getLocationDisplay(task).toLowerCase();
              return taskLocation.includes(normalizedLocation);
            });
          }
          break;
        case 'applied':
          response = await taskAPI.getAppliedTasks();
          setAppliedTasks(new Set(response.data.map(task => task._id)));
          break;
        case 'saved':
          response = await taskAPI.getSavedTasks();
          setSavedTasks(new Set(response.data.map(task => task._id)));
          break;
        case 'ongoing':
          response = await taskAPI.getOngoingTasks();
          setOngoingTasks(new Set(response.data.map(task => task._id)));
          break;
        case 'completed':
          response = await taskAPI.getCompletedTasks();
          setCompletedTasks(new Set(response.data.map(task => task._id)));
          break;
        default:
          response = await taskAPI.getAvailableTasks();
      }

      if (response.success) {
        const taskArray = Array.isArray(response.data) ? response.data : [];
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

  const getLocationDisplay = (task) => {
    if (task.location && typeof task.location === 'object') {
      if (task.location.address) {
        return task.location.address;
      }
      if (task.location.name) {
        return task.location.name;
      }
    }
    if (task.workLocation && task.workLocation !== 'Online') {
      return task.workLocation;
    }
    if (typeof task.location === 'string' && task.location !== 'Online') {
      return task.location;
    }
    return 'Remote';
  };

  const handleApplyTask = async (taskId) => {
    try {
      setLoading(true);

      const applyResponse = await taskAPI.applyForTask(taskId);
      if (applyResponse.success) {
        setAppliedTasks(prev => new Set(prev).add(taskId));
        toast.success('Application submitted');
        setActiveTab('applied');
        fetchTasks();
      } else {
        throw new Error(applyResponse.message || 'Failed to apply for task');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to apply for task');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTask = async (taskId) => {
    try {
      setLoading(true);
      
      const response = await taskAPI.saveTask(taskId);
      if (response.success) {
        setSavedTasks(prev => new Set(prev).add(taskId));
        toast.success('Task saved successfully');
        fetchTasks();
      } else {
        throw new Error(response.message || 'Failed to save task');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkOngoing = async (taskId) => {
    try {
      setLoading(true);

      // Apply for task if not already applied
      if (!appliedTasks.has(taskId)) {
        const applyResponse = await taskAPI.applyForTask(taskId);
        if (!applyResponse.success && applyResponse.message !== 'You have already applied for this task') {
          throw new Error(applyResponse.message || 'You must apply before starting the task.');
        }
      }

      // Mark task as ongoing
      const ongoingResponse = await taskAPI.markTaskAsOngoing(taskId);
      if (!ongoingResponse.success) {
        throw new Error(ongoingResponse.message || 'Failed to mark task as in progress');
      }

      // Update UI state after successful API calls
      setOngoingTasks(prev => new Set(prev).add(taskId));
      setAppliedTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });

      toast.success('Task marked as in progress');
      setActiveTab('ongoing');
      setTimeout(fetchTasks, 100); // Ensure state updates before refetching
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to mark task as in progress');
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
        setLocationInput("Current Location");
        setLocation("Current Location");
        toast.info("Using your current location");
        setShowLocationModal(false);
        fetchTasks();
      },
      () => alert("Unable to retrieve your location.")
    );
  };

  const handleSaveLocation = () => {
    const normalized = locationInput.toLowerCase().trim();
    setLocation(normalized);
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
        setOngoingTasks(prev => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        });
        setCompletedTasks(prev => new Set(prev).add(taskId));
        toast.success('Task marked as complete');
        fetchTasks();
        setActiveTab('completed');
      } else {
        throw new Error(response.message || 'Failed to mark task as complete');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to mark task as complete');
    } finally {
      setLoading(false);
    }
  };

  const handleRate = (taskId, rating) => {
    setRatings({ ...ratings, [taskId]: rating });
  };

  const handleGiveRating = (task) => {
    setRatingModalTask(task);
    setCurrentRating(task.workerRating || 0);
    setHoverRating(0);
  };

  const handleRatingSubmit = async () => {
    if (!ratingModalTask || currentRating === 0) {
      toast.error('Please select a rating');
      return;
    }
    try {
      // Optimistically update the UI
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === ratingModalTask._id
            ? { ...task, workerRating: currentRating }
            : task
        )
      );
      await taskAPI.rateTask(ratingModalTask._id, currentRating);
      toast.success('Rating submitted successfully');
      setRatingModalTask(null);
      setCurrentRating(0);
      setHoverRating(0);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to submit rating';
      toast.error(errorMsg);
      // Revert optimistic update if there was an error
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === ratingModalTask._id
            ? { ...task, workerRating: ratingModalTask.workerRating }
            : task
        )
      );
    }
  };

  const renderStarRating = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star${i <= (hoverRating || rating) ? ' filled' : ' inactive'}`}
          style={{ color: i <= (hoverRating || rating) ? '#ffd700' : '#e0e0e0', cursor: 'pointer', fontSize: '1.5rem' }}
          onClick={() => setCurrentRating(i)}
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
        >
          ★
        </span>
      );
    }
    return (
      <div className="star-rating">
        {stars}
        <span className="rating-text">{rating > 0 ? `${rating}/5` : 'Not rated'}</span>
      </div>
    );
  };

  const filteredTasks = tasks
    .filter(task => {
      const matchesSearch = !searchQuery || 
        task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .filter(task => {
      if (filterType === 'all') return true;
      return task.taskType === filterType;
    })
    .sort((a, b) => {
      if (sortBy === 'latest') {
        const aDate = new Date(a.createdAt || a._id);
        const bDate = new Date(b.createdAt || b._id);
        return bDate - aDate;
      }
      if (sortBy === 'deadline') {
        return new Date(a.deadline) - new Date(b.deadline);
      }
      if (sortBy === 'budgetHigh') {
        const aBudget = a.taskType === 'timebuyer' ? a.budgetPerHour : a.budget;
        const bBudget = b.taskType === 'timebuyer' ? b.budgetPerHour : b.budget;
        return (bBudget || 0) - (aBudget || 0);
      }
      if (sortBy === 'budgetLow') {
        const aBudget = a.taskType === 'timebuyer' ? a.budgetPerHour : a.budget;
        const bBudget = b.taskType === 'timebuyer' ? b.budgetPerHour : b.budget;
        return (aBudget || 0) - (bBudget || 0);
      }
      return 0;
    });

  const renderTaskBudget = (task) => {
    if (task.taskType === 'timebuyer') {
      return `₹${task.budgetPerHour || 'Negotiable'}/hr`;
    }
    return `₹${task.budget || 'Negotiable'}`;
  };

  const renderTaskDeadline = (task) => {
    if (task.taskType === 'timebuyer') {
      return task.timeRequirement || 'Flexible';
    }
    return task.deadline ? new Date(task.deadline).toLocaleString() : 'Flexible';
  };

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
              <span>Type: <b>{task.taskType === 'timebuyer' ? 'Time-Based' : 'Regular'}</b></span>
              <span>Budget: <b>{renderTaskBudget(task)}</b></span>
              <span>{task.taskType === 'timebuyer' ? 'Time Needed:' : 'Deadline:'} <b>{renderTaskDeadline(task)}</b></span>
            </div>
            <div className="task-actions" onClick={(e) => e.stopPropagation()}>
              <button
                className={`apply ${appliedTasks.has(task._id) || ongoingTasks.has(task._id) ? 'applied' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!appliedTasks.has(task._id) && !ongoingTasks.has(task._id)) {
                    handleApplyTask(task._id);
                  }
                }}
                disabled={appliedTasks.has(task._id) || ongoingTasks.has(task._id)}
              >
                {(appliedTasks.has(task._id) || ongoingTasks.has(task._id)) ? 'Applied ✓' : 'Apply'}
              </button>
              <button
                className={`save ${savedTasks.has(task._id) ? 'saved' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!savedTasks.has(task._id)) {
                    handleSaveTask(task._id);
                  }
                }}
                disabled={savedTasks.has(task._id)}
              >
                {savedTasks.has(task._id) ? 'Saved ✓' : 'Save'}
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="no-tasks-message">
          {location 
            ? `No available tasks found in ${location}. Try changing your location.`
            : 'No available tasks found. Try setting your location.'}
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
              <span className={`task-status-badge ${task.status === 'in-progress' ? 'inprogress' : 'pending'}`}>
                {task.status === 'in-progress' ? 'In Progress' : 'Awaiting Approval'}
              </span>
            </div>
            <div className="task-desc">{task.description ? task.description.substring(0, 100) + '...' : 'No description available'}</div>
            <div className="task-meta">
              <span>Type: <b>{task.taskType === 'timebuyer' ? 'Time-Based' : 'Regular'}</b></span>
              <span>Budget: <b>{renderTaskBudget(task)}</b></span>
              <span>{task.taskType === 'timebuyer' ? 'Time Needed:' : 'Deadline:'} <b>{renderTaskDeadline(task)}</b></span>
            </div>
            <div className="task-actions" onClick={(e) => e.stopPropagation()}>
              {!ongoingTasks.has(task._id) ? (
                <button
                  className="mark-ongoing"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkOngoing(task._id);
                  }}
                >
                  Mark as Ongoing
                </button>
              ) : (
                <button
                  className="mark-ongoing inprogress"
                  disabled
                >
                  In Progress ✓
                </button>
              )}
              {ongoingTasks.has(task._id) && (
                <button
                  className="mark-complete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkComplete(task._id);
                  }}
                >
                  Mark as Complete
                </button>
              )}
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
              <span>Type: <b>{task.taskType === 'timebuyer' ? 'Time-Based' : 'Regular'}</b></span>
              <span>Budget: <b>{renderTaskBudget(task)}</b></span>
              <span>{task.taskType === 'timebuyer' ? 'Time Needed:' : 'Deadline:'} <b>{renderTaskDeadline(task)}</b></span>
            </div>
            <div className="task-actions" onClick={(e) => e.stopPropagation()}>
              <button
                className={`apply ${appliedTasks.has(task._id) || ongoingTasks.has(task._id) ? 'applied' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!appliedTasks.has(task._id) && !ongoingTasks.has(task._id)) {
                    handleApplyTask(task._id);
                  }
                }}
                disabled={appliedTasks.has(task._id) || ongoingTasks.has(task._id)}
              >
                {(appliedTasks.has(task._id) || ongoingTasks.has(task._id)) ? 'Applied ✓' : 'Apply'}
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
              <span>Type: <b>{task.taskType === 'timebuyer' ? 'Time-Based' : 'Regular'}</b></span>
              <span>Budget: <b>{renderTaskBudget(task)}</b></span>
              <span>{task.taskType === 'timebuyer' ? 'Time Needed:' : 'Deadline:'} <b>{renderTaskDeadline(task)}</b></span>
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
              <span>Type: <b>{task.taskType === 'timebuyer' ? 'Time-Based' : 'Regular'}</b></span>
              <span>Budget: <b>{renderTaskBudget(task)}</b></span>
              <span>{task.taskType === 'timebuyer' ? 'Time Needed:' : 'Deadline:'} <b>{renderTaskDeadline(task)}</b></span>
            </div>
            <div className="gigbud-rating">
              <span>Your Rating:</span>
              {task.workerRating ? (
                renderStarRating(task.workerRating)
              ) : (
                <>
                  <span className="no-rating">Not yet rated</span>
                  <button
                    className="primary-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGiveRating(task);
                    }}
                  >
                    Rate Task
                  </button>
                </>
              )}
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
            {location ? `Location: ${location}` : 'Add Location'}
          </button>
          
          {/* Filter button */}
          <button
            className="gigbud-tab-btn"
            onClick={() => setShowFilterModal(true)}
          >
            <span style={{ fontSize: 22, marginRight: 12 }}>🔍</span>
            Filters
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
        </div>
      </div>

      {/* Main content */}
      <main className="gigbud-main">
        <div className="gigbud-panel">
          {/* Panel Title */}
          <h2 className="gigbud-panel-title">
            {TAB_LIST.find(t => t.key === activeTab)?.icon || "📍"} {TAB_LIST.find(t => t.key === activeTab)?.label || "Available Tasks"}
          </h2>
          
          {/* Search bar */}
          <div className="gigbud-searchbar-row">
            <input
              className="gigbud-searchbar"
              type="text"
              placeholder="🔍 Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Task Lists */}
          {renderMainContent()}
        </div>
      </main>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="gigbud-modal-bg" onClick={() => setShowFilterModal(false)}>
          <div className="gigbud-modal filter-modal" onClick={e => e.stopPropagation()}>
            <div className="filter-modal-header">
              <h2>Filter & Sort Tasks</h2>
              <button className="close-modal" onClick={() => setShowFilterModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="filter-grid">
                {/* Sort Tasks */}
                <div className="filter-row">
                  <div className="filter-label">
                    <span className="filter-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 10l5 5 5-5M7 14l5-5 5 5"/>
                      </svg>
                    </span>
                    <span>Sort Tasks</span>
                  </div>
                  <div className="filter-control">
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      className="filter-select"
                    >
                      <option value="latest">Latest Added</option>
                      <option value="deadline">Earliest Deadline</option>
                      <option value="budgetLow">Lowest Budget</option>
                      <option value="budgetHigh">Highest Budget</option>
                    </select>
                  </div>
                </div>

                <div className="filter-divider"></div>

                {/* Filter by Type */}
                <div className="filter-row">
                  <div className="filter-label">
                    <span className="filter-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                    </span>
                    <span>Filter by Type</span>
                  </div>
                  <div className="filter-control">
                    <select 
                      value={filterType} 
                      onChange={(e) => setFilterType(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">All Types</option>
                      <option value="normal">Regular</option>
                      <option value="timebuyer">One-Time</option>
                      <option value="recurring">Recurring</option>
                    </select>
                  </div>
                </div>

                <div className="filter-divider"></div>

                {/* Location Filter */}
                <div className="filter-row">
                  <div className="filter-label">
                    <span className="filter-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                      </svg>
                    </span>
                    <span>Location</span>
                  </div>
                  <div className="filter-control location-control">
                    <input 
                      type="text" 
                      value={location || "No location set"} 
                      disabled 
                      className="location-input"
                    />
                    <button 
                      className="change-location-btn"
                      onClick={() => {
                        setShowFilterModal(false);
                        setShowLocationModal(true);
                      }}
                    >
                      Change
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="reset-filters"
                  onClick={() => {
                    setSortBy('latest');
                    setFilterType('all');
                  }}
                >
                  Reset Filters
                </button>
                <button 
                  className="apply-filters"
                  onClick={() => setShowFilterModal(false)}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {showLocationModal && (
        <div className="gigbud-modal-bg" onClick={() => setShowLocationModal(false)}>
          <div className="gigbud-modal" onClick={e => e.stopPropagation()}>
            <h2>Set Your Location</h2>
            <div className="modal-body">
              <LocationDropdown
                value={locationInput}
                onChange={setLocationInput}
                onSelect={(loc) => {
                  setLocationInput(loc.name);
                }}
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
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{selectedTask.taskType === 'timebuyer' ? 'Time-Based' : 'Regular'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">{selectedTask.status || 'Open'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">
                      {getLocationDisplay(selectedTask)}
                    </span>
                  </div>
                  
                  {selectedTask.taskType === 'timebuyer' ? (
                    <>
                      <div className="detail-item">
                        <span className="detail-label">Time Requirement:</span>
                        <span className="detail-value">{selectedTask.timeRequirement || 'Not specified'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Job Type:</span>
                        <span className="detail-value">{selectedTask.jobType || 'Not specified'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Skills:</span>
                        <span className="detail-value">
                          {selectedTask.skills?.join(', ') || 'No specific skills listed'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Budget/Hour:</span>
                        <span className="detail-value">₹{selectedTask.budgetPerHour || 'Negotiable'}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="detail-item">
                        <span className="detail-label">Budget:</span>
                        <span className="detail-value">₹{selectedTask.budget || 'Negotiable'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Deadline:</span>
                        <span className="detail-value">
                          {selectedTask.deadline ? new Date(selectedTask.deadline).toLocaleString() : 'Flexible'}
                        </span>
                      </div>
                    </>
                  )}
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
                    className={`apply ${appliedTasks.has(selectedTask._id) || ongoingTasks.has(selectedTask._id) ? 'applied' : ''}`}
                    onClick={() => {
                      if (!appliedTasks.has(selectedTask._id) && !ongoingTasks.has(selectedTask._id)) {
                        handleApplyTask(selectedTask._id);
                      }
                    }}
                    disabled={appliedTasks.has(selectedTask._id) || ongoingTasks.has(selectedTask._id)}
                  >
                    {(appliedTasks.has(selectedTask._id) || ongoingTasks.has(selectedTask._id)) ? 'Applied ✓' : 'Apply'}
                  </button>
                  <button
                    className={`save ${savedTasks.has(selectedTask._id) ? 'saved' : ''}`}
                    onClick={() => {
                      if (!savedTasks.has(selectedTask._id)) {
                        handleSaveTask(selectedTask._id);
                      }
                    }}
                    disabled={savedTasks.has(selectedTask._id)}
                  >
                    {savedTasks.has(selectedTask._id) ? 'Saved ✓' : 'Save'}
                  </button>
                </>
              )}
              {activeTab === 'saved' && (
                <button
                  className={`apply ${appliedTasks.has(selectedTask._id) || ongoingTasks.has(selectedTask._id) ? 'applied' : ''}`}
                  onClick={() => {
                    if (!appliedTasks.has(selectedTask._id) && !ongoingTasks.has(selectedTask._id)) {
                      handleApplyTask(selectedTask._id);
                    }
                  }}
                  disabled={appliedTasks.has(selectedTask._id) || ongoingTasks.has(selectedTask._id)}
                >
                  {(appliedTasks.has(selectedTask._id) || ongoingTasks.has(selectedTask._id)) ? 'Applied ✓' : 'Apply'}
                </button>
              )}
              {activeTab === 'applied' && selectedTask.status !== 'in-progress' && (
                <button
                  className="mark-ongoing"
                  onClick={() => handleMarkOngoing(selectedTask._id)}
                >
                  Mark as Ongoing
                </button>
              )}
              {(activeTab === 'applied' || activeTab === 'ongoing') && selectedTask.status === 'in-progress' && (
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

      {ratingModalTask && (
        <div className="modal-overlay" onClick={() => setRatingModalTask(null)}>
          <div className="modal-content rating-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setRatingModalTask(null)}>×</button>
            <h2>Rate Task: {ratingModalTask.title || ratingModalTask.jobType || 'Untitled Task'}</h2>
            <div className="rating-modal-content">
              <p>Rate the performance for this task:</p>
              {renderStarRating(currentRating)}
              <div className="rating-actions">
                <button 
                  className="primary-button" 
                  onClick={handleRatingSubmit}
                  disabled={currentRating === 0}
                >
                  Submit Rating
                </button>
                <button 
                  className="secondary-button" 
                  onClick={() => setRatingModalTask(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskReceiverDashboard;