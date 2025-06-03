import React, { useState, useEffect } from 'react';
import './TaskProviderDashboard.css';
import TaskDetailsModal from '../components/TaskDetailsModal';
import TaskForm from './Taskform';
import { taskAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const DEFAULT_PROFILE_IMAGE = 'https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383.jpg?w=360';

const TaskProviderDashboard = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, initialCheckDone } = useAuth();
  const [activeTab, setActiveTab] = useState('posted');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplicantsTask, setSelectedApplicantsTask] = useState(null);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showApplicantProfileModal, setShowApplicantProfileModal] = useState(false);
  const [showTaskFormModal, setShowTaskFormModal] = useState(false);
  const [providerProfile, setProviderProfile] = useState(null);
  const [editProviderMode, setEditProviderMode] = useState(false);
  const [editableProviderProfile, setEditableProviderProfile] = useState(null);
  const [taskCreated, setTaskCreated] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [ratingModalTask, setRatingModalTask] = useState(null);
  const [currentRating, setCurrentRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  const getDisplayStatus = (status) => {
    switch (status) {
      case 'pending':
        return 'open';
      case 'accepted':
        return 'assigned';
      case 'awaiting-approval':
        return 'pending approval';
      case 'completed':
        return 'closed';
      default:
        return status;
    }
  };

  useEffect(() => {
    if (!initialCheckDone) return;

    if (!isLoggedIn) {
      toast.error('Please login to continue');
      navigate('/');
      return;
    }

    if (user) {
      const initialProfile = {
        avatar: user.avatar || DEFAULT_PROFILE_IMAGE,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        age: user.age || '',
        profession: user.profession || '',
      };
      setProviderProfile(initialProfile);
      setEditableProviderProfile(initialProfile);
    }

    fetchTasks();
    fetchUserProfile();
  }, [isLoggedIn, navigate, activeTab, taskCreated, user, initialCheckDone]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskAPI.getProviderTasks();
      if (response.success) {
        let filteredTasks = response.data || [];
        switch (activeTab) {
          case 'posted':
            filteredTasks = filteredTasks.filter(task => task.status === 'pending' || task.status === 'accepted' || task.status === 'completed' || task.status === 'awaiting-approval');
            break;
          case 'ongoing':
            filteredTasks = filteredTasks.filter(task => task.status === 'accepted' || task.status === 'awaiting-approval');
            break;
          case 'completed':
            filteredTasks = filteredTasks.filter(task => task.status === 'completed');
            break;
          default:
            break;
        }
        setTasks(filteredTasks);
        calculateAverageRating(filteredTasks);
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

  const calculateAverageRating = (tasks) => {
    const completedTasks = tasks.filter(task => task.status === 'completed');
    if (completedTasks.length === 0) {
      setAverageRating(0);
      return;
    }

    const totalRatings = completedTasks.reduce((sum, task) => {
      return sum + (task.creatorRating || 0);
    }, 0);

    setAverageRating((totalRatings / completedTasks.length).toFixed(1));
  };

  const fetchUserProfile = async () => {
    try {
      setProfileLoading(true);
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }
      const res = await axios.get('http://localhost:3000/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('Response from /api/users/me:', res.data);
      
      if (!res.data || !res.data.success) {
        throw new Error('Invalid API response structure');
      }

      const apiUser = res.data.data;
      if (!apiUser) {
        throw new Error('User data not found in response');
      }

      const profileData = {
        avatar: user?.avatar || apiUser.avatar || DEFAULT_PROFILE_IMAGE,
        name: user?.name || apiUser.name,
        email: user?.email || apiUser.email,
        phone: apiUser.phone || user?.phone || '',
        age: apiUser.age || user?.age || '',
        profession: apiUser.profession || user?.profession || '',
      };

      setProviderProfile(profileData);
      setEditableProviderProfile(profileData);
    } catch (err) {
      console.error('Failed to load user profile:', err);
      
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/');
        return;
      }
      
      if (user) {
        const fallbackProfile = {
          avatar: user.avatar || DEFAULT_PROFILE_IMAGE,
          name: user.name,
          email: user.email,
          phone: user.phone || 'Not available',
          age: user.age || 'Not specified',
          profession: user.profession || 'Not specified',
        };
        setProviderProfile(fallbackProfile);
        setEditableProviderProfile(fallbackProfile);
      } else {
        const defaultProfile = {
          avatar: DEFAULT_PROFILE_IMAGE,
          name: 'Unnamed User',
          email: 'email@example.com',
          phone: 'Not available',
          age: 'Not specified',
          profession: 'Not specified',
        };
        setProviderProfile(defaultProfile);
        setEditableProviderProfile(defaultProfile);
      }
      
      toast.error('Failed to load profile from API.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      setLoading(true);
      await taskAPI.createTask(taskData);
      toast.success('Task created successfully');
      setShowTaskFormModal(false);
      setActiveTab('posted');
      setTaskCreated(prev => !prev);
    } catch (err) {
      toast.error(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (taskId) => {
    try {
      await taskAPI.completeTask(taskId);
      toast.success('Task marked as complete - awaiting your approval');
      setTaskCreated(prev => !prev);
    } catch (err) {
      toast.error(err.message || 'Failed to update task status');
    }
  };

  const handleApproveCompletion = async (taskId) => {
    try {
      await taskAPI.approveCompletion(taskId);
      toast.success('Task completion approved');
      setTaskCreated(prev => !prev);
    } catch (err) {
      toast.error(err.message || 'Failed to approve completion');
    }
  };

  const handleAssignTask = async (taskId, applicantId) => {
    try {
      await taskAPI.assignTask(taskId, applicantId);
      toast.success('Task assigned successfully');
      setTaskCreated(prev => !prev);
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to assign task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskAPI.deleteTask(taskId);
      toast.success('Task deleted successfully');
      setTaskCreated(prev => !prev);
    } catch (err) {
      toast.error(err.message || 'Failed to delete task');
    }
  };

  const handleViewProfile = (applicant) => {
    setViewingProfile(applicant);
  };

  const handleGiveRating = (task) => {
    setRatingModalTask(task);
    setCurrentRating(task.creatorRating || task.workerRating || 0);
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
            ? { ...task, creatorRating: currentRating }
            : task
        )
      );

      await taskAPI.rateTask(ratingModalTask._id, currentRating, 'provider');
      toast.success('Rating submitted successfully');
      
      // Recalculate average rating
      const updatedTasks = tasks.map(task =>
        task._id === ratingModalTask._id
          ? { ...task, creatorRating: currentRating }
          : task
      );
      calculateAverageRating(updatedTasks);

      setRatingModalTask(null);
      setCurrentRating(0);
      setHoverRating(0);
    } catch (err) {
      console.error('Rating submission error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to submit rating';
      toast.error(errorMsg);
      
      // Revert optimistic update if there was an error
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === ratingModalTask._id
            ? { ...task, creatorRating: ratingModalTask.creatorRating }
            : task
        )
      );
    }
  };

  useEffect(() => {
    if (activeTab === 'create') {
      setShowTaskFormModal(true);
    } else {
      setShowTaskFormModal(false);
    }
  }, [activeTab]);

  const handleCloseTaskForm = () => {
    setShowTaskFormModal(false);
    setActiveTab('posted');
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleViewAllApplicants = (task) => {
    setSelectedApplicantsTask(task);
    setShowApplicantsModal(true);
  };

  const handleCloseApplicantsModal = () => {
    setShowApplicantsModal(false);
    setSelectedApplicantsTask(null);
  };

  const getTaskDisplayTitle = (task) => {
    return task.jobType || task.title || "Untitled Task";
  };

  const getApplicantsForTask = (taskId) => {
    const task = tasks.find(t => t._id === taskId);
    return task?.applicants || [];
  };

  const renderLocation = (location) => {
    if (!location) return null;
    
    if (typeof location === 'string') {
      return location;
    }
    
    if (typeof location === 'object') {
      if (location.address) return location.address;
      if (location.coordinates) return `Location: ${location.coordinates.join(', ')}`;
      return JSON.stringify(location);
    }
    
    return location;
  };

  const handleEditProviderProfile = () => {
    setEditProviderMode(true);
    setEditableProviderProfile({...providerProfile});
  };

  const handleProviderProfileInputChange = (e) => {
    setEditableProviderProfile({ 
      ...editableProviderProfile, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSaveProviderProfile = async () => {
    try {
      if (!editableProviderProfile?.name) {
        toast.error('Name is a required field');
        return;
      }

      const updated = {
        name: editableProviderProfile.name,
        avatar: editableProviderProfile.avatar,
        age: editableProviderProfile.age || '',
        profession: editableProviderProfile.profession || '',
        phone: editableProviderProfile.phone || '',
        email: editableProviderProfile.email || '',
      };

      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      const response = await axios.put('http://localhost:3000/api/users/me', updated, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data && response.data.success) {
        setProviderProfile(editableProviderProfile);
        setEditProviderMode(false);
        toast.success('Profile updated successfully');
        fetchUserProfile();
      } else {
        throw new Error(response.data?.message || 'Update failed');
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/');
      } else if (err.response?.status === 400) {
        toast.error(err.response.data?.message || 'Invalid data provided');
      } else {
        toast.error(err.response?.data?.message || err.message || 'Update failed');
      }
    }
  };

  const handleCancelProviderEdit = () => {
    setEditProviderMode(false);
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

  const renderCreateTask = () => (
    <>
      {showTaskFormModal && (
        <TaskForm onClose={handleCloseTaskForm} onSubmit={handleCreateTask} />
      )}
    </>
  );

  const renderPostedTasks = () => (
    <div className="panel-content">
      <h2>My Posted Tasks</h2>
      <div className="task-list">
        {tasks.length > 0 ? (
          tasks.map(task => (
            <div
              key={task._id}
              className="task-card"
              onClick={() => handleTaskClick(task)}
              style={{ cursor: 'pointer' }}
            >
              <h3>{getTaskDisplayTitle(task)}</h3>
              <p>Posted: {new Date(task.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              <span className={`status-badge ${getDisplayStatus(task.status)}`}>{getDisplayStatus(task.status)}</span>
              {task.applicants?.length > 0 && (
                <p>Applicants: {task.applicants.length}</p>
              )}
            </div>
          ))
        ) : (
          <p>No tasks found. Create a new task to get started.</p>
        )}
      </div>
    </div>
  );

  const renderOngoingTasks = () => (
    <div className="panel-content">
      <h2>Ongoing Tasks</h2>
      <div className="task-list">
        {tasks.length > 0 ? (
          tasks.map(task => (
            <div
              key={task._id}
              className="task-card"
              onClick={() => handleTaskClick(task)}
              style={{ cursor: 'pointer' }}
            >
              <h3>{getTaskDisplayTitle(task)}</h3>
              <p>Assigned to: {task.assignedTo?.name || 'Unknown'}</p>
              <span className={`status-badge ${getDisplayStatus(task.status)}`}>{getDisplayStatus(task.status)}</span>
              {task.status === 'accepted' && (
                <button
                  className="primary-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkComplete(task._id);
                  }}
                >
                  Mark as Complete
                </button>
              )}
              {task.status === 'awaiting-approval' && (
                <button
                  className="primary-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApproveCompletion(task._id);
                  }}
                >
                  Approve Completion
                </button>
              )}
            </div>
          ))
        ) : (
          <p>No ongoing tasks found.</p>
        )}
      </div>
    </div>
  );

  const renderCompletedTasks = () => (
    <div className="panel-content">
      <h2>Completed Tasks</h2>
      <div className="task-list">
        {tasks.length > 0 ? (
          tasks.map(task => (
            <div
              key={task._id}
              className="task-card"
              onClick={() => handleTaskClick(task)}
              style={{ cursor: 'pointer' }}
            >
              <h3>{getTaskDisplayTitle(task)}</h3>
              <p>Completed by: {task.assignedTo?.name || task.completedBy?.name || 'Unknown'}</p>
              <span className={`status-badge ${getDisplayStatus(task.status)}`}>{getDisplayStatus(task.status)}</span>
              <div className="task-rating prominent-rating">
                <h4>Your Rating:</h4>
                {task.creatorRating ? (
                  <div className="existing-rating">
                    {renderStarRating(task.creatorRating)}
                  </div>
                ) : (
                  <div className="no-rating">
                    <p>Not yet rated</p>
                    <button
                      className="primary-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGiveRating(task);
                      }}
                    >
                      Rate Task
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No completed tasks found.</p>
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="panel-content">
      <h2>Profile</h2>
      {profileLoading || !initialCheckDone ? (
        <div className="loading-spinner">Loading profile...</div>
      ) : providerProfile ? (
        <div className="profile-modal-content">
          <div className="profile-image-row">
            <img 
              src={editProviderMode ? editableProviderProfile.avatar : providerProfile.avatar} 
              alt="Profile" 
              className="profile-image" 
              onError={(e) => {
                e.target.src = DEFAULT_PROFILE_IMAGE;
              }}
            />
            {editProviderMode && (
              <div className="profile-image-edit">
                <input 
                  type="text" 
                  name="avatar" 
                  value={editableProviderProfile.avatar} 
                  onChange={handleProviderProfileInputChange} 
                  placeholder="Avatar URL" 
                  className="profile-image-input" 
                />
                <button 
                  className="small-button"
                  onClick={() => setEditableProviderProfile({
                    ...editableProviderProfile,
                    avatar: DEFAULT_PROFILE_IMAGE
                  })}
                >
                  Use Default
                </button>
              </div>
            )}
          </div>
          <div className="profile-fields">
            <div className="profile-field">
              <label>Name:</label>
              {editProviderMode ? (
                <input 
                  type="text" 
                  name="name" 
                  value={editableProviderProfile.name} 
                  onChange={handleProviderProfileInputChange} 
                  required
                />
              ) : (
                <span>{providerProfile.name}</span>
              )}
            </div>
            <div className="profile-field">
              <label>Email:</label>
              {editProviderMode ? (
                <input 
                  type="email" 
                  name="email" 
                  value={editableProviderProfile.email} 
                  onChange={handleProviderProfileInputChange} 
                />
              ) : (
                <span>{providerProfile.email}</span>
              )}
            </div>
            <div className="profile-field">
              <label>Age:</label>
              {editProviderMode ? (
                <input 
                  type="number" 
                  name="age" 
                  value={editableProviderProfile.age} 
                  onChange={handleProviderProfileInputChange} 
                  min="0"
                />
              ) : (
                <span>{providerProfile.age || 'Not specified'}</span>
              )}
            </div>
            <div className="profile-field">
              <label>Profession:</label>
              {editProviderMode ? (
                <input 
                  type="text" 
                  name="profession" 
                  value={editableProviderProfile.profession} 
                  onChange={handleProviderProfileInputChange} 
                />
              ) : (
                <span>{providerProfile.profession || 'Not specified'}</span>
              )}
            </div>
            <div className="profile-field">
              <label>Phone:</label>
              {editProviderMode ? (
                <input 
                  type="tel" 
                  name="phone" 
                  value={editableProviderProfile.phone} 
                  onChange={handleProviderProfileInputChange} 
                />
              ) : (
                <span>{providerProfile.phone || 'Not provided'}</span>
              )}
            </div>
            <div className="profile-field">
              <label>Average Rating:</label>
              <span>
                {averageRating > 0 ? (
                  <>
                    {renderStarRating(averageRating)}
                    ({averageRating}/5 from {tasks.filter(t => t.status === 'completed' && t.creatorRating).length} tasks)
                  </>
                ) : 'No ratings yet'}
              </span>
            </div>
          </div>
          <div className="profile-modal-actions">
            {editProviderMode ? (
              <>
                <button className="primary-button" onClick={handleSaveProviderProfile}>Save</button>
                <button className="secondary-button" onClick={handleCancelProviderEdit}>Cancel</button>
              </>
            ) : (
              <button className="primary-button" onClick={handleEditProviderProfile}>Edit</button>
            )}
          </div>
        </div>
      ) : (
        <p>Failed to load profile</p>
      )}
    </div>
  );

  const renderMainContent = () => {
    switch (activeTab) {
      case 'create':
        return renderCreateTask();
      case 'posted':
        return renderPostedTasks();
      case 'ongoing':
        return renderOngoingTasks();
      case 'completed':
        return renderCompletedTasks();
      case 'profile':
        return renderProfile();
      default:
        return renderCreateTask();
    }
  };

  if (!initialCheckDone) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      {loading && <div className="loading-overlay">Loading...</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="sidebar">
        <div className="sidebar-header">
          <h1>Task Provider</h1>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            ➕ Create Task
          </button>
          <button 
            className={`nav-item ${activeTab === 'posted' ? 'active' : ''}`}
            onClick={() => setActiveTab('posted')}
          >
            📋 My Posted Tasks
          </button>
          <button 
            className={`nav-item ${activeTab === 'ongoing' ? 'active' : ''}`}
            onClick={() => setActiveTab('ongoing')}
          >
            🚧 Ongoing Tasks
          </button>
          <button 
            className={`nav-item ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            ✅ Completed Tasks
          </button>
          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            🧑‍💼 Profile
          </button>
        </nav>
      </div>
      
      <main className="main-content">
        {renderMainContent()}
      </main>

      {isModalOpen && selectedTask && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>×</button>
            <div className="modal-header">
              <h2>{selectedTask.jobType || selectedTask.title || "Untitled Task"}</h2>
              <span className={`status-badge ${getDisplayStatus(selectedTask.status)}`}>{getDisplayStatus(selectedTask.status)}</span>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Task Details</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Posted Date:</label>
                    <span>{selectedTask.createdAt ? new Date(selectedTask.createdAt).toLocaleDateString() : "Not available"}</span>
                  </div>
                  {selectedTask.deadline && (
                    <div className="detail-item">
                      <label>Deadline:</label>
                      <span>{new Date(selectedTask.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                  {selectedTask.description && (
                    <div className="detail-item full-width">
                      <label>Description:</label>
                      <p>{selectedTask.description}</p>
                    </div>
                  )}
                  {selectedTask.timeRequirement && (
                    <div className="detail-item">
                      <label>Time Required:</label>
                      <span>{selectedTask.timeRequirement}</span>
                    </div>
                  )}
                  {selectedTask.jobType && (
                    <div className="detail-item">
                      <label>Job Type:</label>
                      <span>{selectedTask.jobType}</span>
                    </div>
                  )}
                  {selectedTask.skills?.length > 0 && (
                    <div className="detail-item full-width">
                      <label>Skills:</label>
                      <span>{Array.isArray(selectedTask.skills) ? selectedTask.skills.join(", ") : selectedTask.skills}</span>
                    </div>
                  )}
                  {selectedTask.mode || selectedTask.workMode ? (
                    <div className="detail-item">
                      <label>Mode:</label>
                      <span>{selectedTask.mode || selectedTask.workMode}</span>
                    </div>
                  ) : null}
                  {selectedTask.location && (
                    <div className="detail-item">
                      <label>Location:</label>
                      <span>{renderLocation(selectedTask.location)}</span>
                    </div>
                  )}
                  {selectedTask.budgetPerHour ? (
                    <div className="detail-item">
                      <label>Budget/Hour:</label>
                      <span>₹ {selectedTask.budgetPerHour}</span>
                    </div>
                  ) : selectedTask.budget ? (
                    <div className="detail-item">
                      <label>Budget:</label>
                      <span>₹ {selectedTask.budget}</span>
                    </div>
                  ) : null}
                  {selectedTask.additionalNotes && (
                    <div className="detail-item full-width">
                      <label>Additional Notes:</label>
                      <p>{selectedTask.additionalNotes}</p>
                    </div>
                  )}
                  {selectedTask.status === 'completed' && (
                    <div className="detail-item">
                      <label>Your Rating:</label>
                      <span>
                        {selectedTask.creatorRating ? (
                          renderStarRating(selectedTask.creatorRating)
                        ) : (
                          <span>Not yet rated</span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {getApplicantsForTask(selectedTask._id).length > 0 && (
                <div className="detail-section">
                  <h3>{selectedTask.status === 'completed' ? 'Completed By' : 'Applicants'}</h3>
                  <div className="applicants-list">
                    {selectedTask.status === 'completed' ? (
                      <div className="applicant-card">
                        <img 
                          src={selectedTask.completedBy?.profilePictureUrl || selectedTask.assignedTo?.profilePictureUrl || DEFAULT_PROFILE_IMAGE}
                          alt="Completed by"
                          className="applicant-image"
                          onError={(e) => {
                            e.target.src = DEFAULT_PROFILE_IMAGE;
                          }}
                        />
                        <div className="applicant-info">
                          <h4>{selectedTask.completedBy?.name || selectedTask.assignedTo?.name || 'Unnamed User'}</h4>
                          <p>Email: {selectedTask.completedBy?.email || selectedTask.assignedTo?.email || 'Not available'}</p>
                          <p>Phone: {selectedTask.completedBy?.phone || selectedTask.assignedTo?.phone || 'Not available'}</p>
                          <span className="status-badge completed">Completed</span>
                          {selectedTask.creatorRating && (
                            <p>Your Rating: {renderStarRating(selectedTask.creatorRating)}</p>
                          )}
                        </div>
                      </div>
                    ) : selectedTask.status === 'accepted' && selectedTask.assignedTo ? (
                      <div className="applicant-card">
                        <img 
                          src={selectedTask.assignedTo.profilePictureUrl || DEFAULT_PROFILE_IMAGE}
                          alt="Assigned applicant"
                          className="applicant-image"
                          onError={(e) => {
                            e.target.src = DEFAULT_PROFILE_IMAGE;
                          }}
                        />
                        <div className="applicant-info">
                          <h4>{selectedTask.assignedTo.name || 'Unnamed User'}</h4>
                          <p>Email: {selectedTask.assignedTo.email || 'Not available'}</p>
                          <p>Phone: {selectedTask.assignedTo.phone || 'Not available'}</p>
                          <span className="status-badge assigned">Assigned</span>
                        </div>
                      </div>
                    ) : (
                      getApplicantsForTask(selectedTask._id).map(applicant => (
                        <div key={applicant._id} className="applicant-card">
                          <img 
                            src={applicant.user?.profilePictureUrl || DEFAULT_PROFILE_IMAGE}
                            alt="Applicant's profile picture"
                            className="applicant-image"
                            onError={(e) => {
                              e.target.src = DEFAULT_PROFILE_IMAGE;
                            }}
                          />
                          <div className="applicant-info">
                            <h4>{applicant.user?.name || 'Unnamed User'}</h4>
                            <p>Rating: {applicant.rating || 'No rating'} ⭐</p>
                          </div>
                          <div className="applicant-actions">
                            <button
                              className="secondary-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewProfile(applicant);
                              }}
                            >
                              View Profile
                            </button>
                            <button
                              className="primary-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssignTask(selectedTask._id, applicant.user._id);
                              }}
                            >
                              Assign To
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {selectedTask.status === 'completed' && !selectedTask.creatorRating && (
              <div className="modal-footer">
                <button
                  className="primary-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGiveRating(selectedTask);
                  }}
                >
                  Rate Task
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {viewingProfile && (
        <div className="modal-overlay" onClick={() => setViewingProfile(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setViewingProfile(null)}>×</button>
            <h2>{viewingProfile.user?.name || 'Applicant Profile'}</h2>
            <div className="profile-details">
              <img 
                src={viewingProfile.user?.profilePictureUrl || DEFAULT_PROFILE_IMAGE}
                alt="Profile" 
                className="profile-image" 
                onError={(e) => {
                  e.target.src = DEFAULT_PROFILE_IMAGE;
                }}
              />
              <div className="profile-field">
                <label>Email:</label>
                <span>{viewingProfile.user?.email || 'Not available'}</span>
              </div>
              <div className="profile-field">
                <label>Rating:</label>
                <span>{viewingProfile.rating || 'No rating'} ⭐</span>
              </div>
              {viewingProfile.user?.phone && (
                <div className="profile-field">
                  <label>Phone:</label>
                  <span>{viewingProfile.user.phone}</span>
                </div>
              )}
              {viewingProfile.user?.skills && (
                <div className="profile-field">
                  <label>Skills:</label>
                  <span>{Array.isArray(viewingProfile.user.skills) ? viewingProfile.user.skills.join(", ") : viewingProfile.user.skills}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {ratingModalTask && (
        <div className="modal-overlay" onClick={() => setRatingModalTask(null)}>
          <div className="modal-content rating-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setRatingModalTask(null)}>×</button>
            <h2>Rate Task: {getTaskDisplayTitle(ratingModalTask)}</h2>
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

export default TaskProviderDashboard;