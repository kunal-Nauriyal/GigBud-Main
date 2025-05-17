import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { taskAPI } from "../services/api";
import { toast } from "react-toastify";
import "./TaskReceiver.css";

const TaskReceiver = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationInput, setLocationInput] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("Please login to continue");
      navigate("/");
      return;
    }

    // Check if user has location set
    if (user?.location) {
      setLocation(user.location);
    }

    fetchAvailableTasks();
  }, [isLoggedIn, navigate, user?.location]);

  const fetchAvailableTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await taskAPI.getAvailableTasks(location || user?.location);
      
      if (response.success) {
        setTasks(response.data || []);
      } else {
        throw new Error(response.message || "Failed to fetch tasks");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch tasks";
      setError(errorMsg);
      toast.error(errorMsg);
      
      if (err.response?.status === 401) {
        navigate("/");
      }
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
        setLocationInput(`Lat: ${pos.coords.latitude.toFixed(3)}, Lng: ${pos.coords.longitude.toFixed(3)}`);
      },
      () => alert("Unable to retrieve your location.")
    );
  };

  const handleSaveLocation = async () => {
    try {
      setLoading(true);
      const response = await taskAPI.updateUserLocation(locationInput);
      
      if (response.success) {
        setLocation(locationInput);
        setShowLocationModal(false);
        toast.success("Location updated successfully");
        fetchAvailableTasks();
      } else {
        throw new Error(response.message || "Failed to update location");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update location");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTask = async (taskId) => {
    try {
      setLoading(true);
      const response = await taskAPI.applyForTask(taskId);
      
      if (response.success) {
        toast.success("Application submitted successfully");
        fetchAvailableTasks();
      } else {
        throw new Error(response.message || "Failed to apply for task");
      }
    } catch (err) {
      toast.error(err.message || "Failed to apply for task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="task-receiver-container">
      {/* Header */}
      <div className="task-receiver-header">
        <h2 className="task-receiver-title">Task Receiver</h2>
        <p className="welcome-message">Welcome, {user?.name || "User"}!</p>
        <button 
          className="location-button"
          onClick={() => setShowLocationModal(true)}
        >
          📍 {location || "Set Location"}
        </button>
      </div>

      {/* Loading and Error States */}
      {loading && <div className="loading-overlay">Loading...</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Info Sections */}
      <div className="task-receiver-content">
        {/* Left Box */}
        <div className="task-receiver-box">
          <p><em>Find Tasks & Earn!</em> Browse available tasks posted by providers and complete them to earn money.</p>
          <Link to="/dashboard/receiver" className="task-receiver-btn">
            Go to Dashboard
          </Link>
        </div>

        {/* Right Box - Available Tasks Preview */}
        <div className="task-receiver-box tasks-preview">
          <h3>Available Tasks Near You</h3>
          {location ? (
            tasks.length > 0 ? (
              <div className="task-preview-list">
                {tasks.slice(0, 3).map(task => (
                  <div key={task._id} className="task-preview-card">
                    <h4>{task.title}</h4>
                    <p className="task-description">{task.description.substring(0, 100)}...</p>
                    <div className="task-meta">
                      <span>Budget: ₹{task.budget}</span>
                      <span>Location: {task.location}</span>
                    </div>
                    <button
                      className="apply-button"
                      onClick={() => handleApplyTask(task._id)}
                      disabled={loading}
                    >
                      {loading ? "Applying..." : "Quick Apply"}
                    </button>
                  </div>
                ))}
                {tasks.length > 3 && (
                  <Link to="/dashboard/receiver" className="view-all-link">
                    View all {tasks.length} tasks →
                  </Link>
                )}
              </div>
            ) : (
              <p>No tasks available in your area. Try changing your location.</p>
            )
          ) : (
            <div className="location-prompt">
              <p>Please set your location to see available tasks nearby.</p>
              <button
                className="set-location-button"
                onClick={() => setShowLocationModal(true)}
              >
                Set Location
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Location Modal */}
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
              <button 
                className="secondary-button"
                onClick={handleUseMyLocation}
              >
                Use My Current Location
              </button>
              <div className="modal-actions">
                <button 
                  className="primary-button"
                  onClick={handleSaveLocation}
                  disabled={!locationInput || loading}
                >
                  {loading ? "Saving..." : "Save Location"}
                </button>
                <button 
                  className="secondary-button"
                  onClick={() => setShowLocationModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TaskReceiver;