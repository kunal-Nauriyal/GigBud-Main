import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { taskAPI } from '../services/api';
import { toast } from 'react-toastify';
import './TaskReceiverDashboard.css';

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
        setLocationInput(`lat:${pos.coords.latitude.toFixed(3)} lng:${pos.coords.longitude.toFixed(3)}`);
      },
      () => alert("Unable to retrieve your location.")
    );
  };

  const handleSaveLocation = () => {
    const normalized = locationInput.toLowerCase().trim();
    setLocation(normalized);
    setShowLocationModal(false);
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

  const filteredTasks = tasks.filter(task => {
    const taskLocation = task.location?.coordinates?.join(',') || task.workLocation || '';
    if (!searchQuery) return true;
    return (
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      taskLocation.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const renderAvailableTasks = () => (
    <div className="task-list">
      {filteredTasks.length > 0 ? (
        filteredTasks.map(task => (
          <div
            key={task._id}
            className="task-card"
            onClick={() => handleTaskClick(task)}
          >
            <h3>{task.title || task.jobType || "Untitled Task"}</h3>
            <p>{task.description ? task.description.substring(0, 100) + '...' : 'No description available'}</p>
            <div className="task-card-footer">
              <span>
                Location: {task.location?.coordinates
                  ? `Lat: ${task.location.coordinates[1]}, Lng: ${task.location.coordinates[0]}`
                  : task.workLocation || 'Remote'}
              </span>
              <span>Budget: ₹{task.budget || task.budgetPerHour || 'Negotiable'}</span>
            </div>
            <div className="task-card-actions">
              <button
                className="primary-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleApplyTask(task._id);
                }}
              >
                Apply
              </button>
              <button
                className="secondary-button"
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
        <p>No available tasks found in your area. Try changing your location.</p>
      )}
    </div>
  );

  const renderMainContent = () => {
    switch (activeTab) {
      case 'available':
        return renderAvailableTasks();
      default:
        return renderAvailableTasks();
    }
  };

  return (
    <div className="dashboard-container">
      {loading && <div className="loading-overlay">Loading...</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="sidebar">
        <div className="sidebar-header">
          <h1>Task Receiver</h1>
          <p>Welcome, {user?.name || 'User'}!</p>
        </div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'available' ? 'active' : ''}`} onClick={() => setActiveTab('available')}>🧭 Available Tasks</button>
          {/* More tabs like applied, saved, ongoing can go here */}
          <button className="nav-item location-item" onClick={() => setShowLocationModal(true)}>
            📍 {location || 'Set Location'}
          </button>
        </nav>
      </div>

      <main className="main-content">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {renderMainContent()}
      </main>

      {showLocationModal && (
        <div className="modal-overlay" onClick={() => setShowLocationModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowLocationModal(false)}>×</button>
            <h2>Set Your Location</h2>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Enter your location"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
              />
              <button className="secondary-button" onClick={handleUseMyLocation}>Use My Current Location</button>
              <div className="modal-actions">
                <button className="primary-button" onClick={handleSaveLocation} disabled={!locationInput}>Save Location</button>
                <button className="secondary-button" onClick={() => setShowLocationModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskReceiverDashboard;
