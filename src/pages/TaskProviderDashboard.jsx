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
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('providerActiveTab') || 'posted';
  });
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
  const [isPolling, setIsPolling] = useState(false);

  const getDisplayStatus = (status) => {
    switch (status) {
      case 'pending':
        return 'open';
      case 'accepted':
        return 'assigned';
      case 'ready-for-review':
        return 'pending approval';
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

  // Polling effect to refresh tasks every 5 seconds
  useEffect(() => {
    if (!initialCheckDone || !isLoggedIn) return;
    const interval = setInterval(() => {
      setIsPolling(true);
      fetchTasks().finally(() => setIsPolling(false));
    }, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [activeTab, user, initialCheckDone, isLoggedIn]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskAPI.getProviderTasks();
      if (response.success) {
        let filteredTasks = response.data || [];
        console.log('DEBUG: Full task response:', JSON.stringify(filteredTasks, null, 2));
        switch (activeTab) {
          case 'posted':
            filteredTasks = filteredTasks.filter(task =>
              [
                'pending',
                'applied',
                'accepted',
                'in-progress',
                'ready-for-review',
                'completed',
                'awaiting-approval'
              ].includes(task.status)
            );
            break;
          case 'ongoing':
            filteredTasks = filteredTasks.filter(task => 
              task.status === 'accepted' || 
              task.status === 'awaiting-approval' || 
              task.status === 'ready-for-review'
            );
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

    // Count tasks with ratings
    const ratedTasks = completedTasks.filter(task => task.creatorRating && task.creatorRating > 0);
    
    if (ratedTasks.length === 0) {
      setAverageRating(0);
      return;
    }

    // Calculate average of rated tasks
    const totalRatings = ratedTasks.reduce((sum, task) => {
      return sum + (task.creatorRating || 0);
    }, 0);

    const avgRating = (totalRatings / ratedTasks.length).toFixed(1);
    setAverageRating(avgRating);
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
        throw new Error('Invalid API response');
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
      await fetchTasks(); // Ensure tasks are refreshed immediately
    } catch (err) {
      toast.error(err.message || 'Failed to update task status');
    }
  };

  const handleApproveCompletion = async (taskId) => {
    try {
      setLoading(true);
      await taskAPI.approveCompletion(taskId);
      toast.success('Task completion approved');
      setTaskCreated(prev => !prev);
      await fetchTasks(); // Refresh tasks to move to completed section
      if (activeTab === 'ongoing') {
        setActiveTab('completed'); // Switch to completed tab to show the task
      }
    } catch (err) {
      toast.error(err.message || 'Failed to approve completion');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async (taskId, applicantId) => {
    try {
      await taskAPI.assignTask(taskId, applicantId);
      toast.success('Task assigned successfully');
      setTaskCreated(prev => !prev);
      setIsModalOpen(false);
      await fetchTasks(); // Refresh tasks after assignment
    } catch (err) {
      toast.error(err.message || 'Failed to assign task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskAPI.deleteTask(taskId);
      toast.success('Task deleted successfully');
      setTaskCreated(prev => !prev);
      await fetchTasks(); // Refresh tasks after deletion
    } catch (err) {
      toast.error(err.message || 'Failed to delete task');
    }
  };

  const handleViewProfile = (applicant) => {
    console.log('=== DEBUG: Viewing profile for applicant ===');
    console.log('Full applicant object:', applicant);
    console.log('Applicant user object:', applicant.user);
    console.log('Available image URLs:');
    console.log('- applicant.user?.avatar:', applicant.user?.avatar);
    console.log('- applicant.user?.profilePictureUrl:', applicant.user?.profilePictureUrl);
    console.log('- applicant.user?.photo:', applicant.user?.photo);
    console.log('- applicant.user?.profilePicture:', applicant.user?.profilePicture);
    console.log('- applicant.avatar:', applicant.avatar);
    console.log('- applicant.profilePictureUrl:', applicant.profilePictureUrl);
    console.log('==========================================');
    
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
      // Submit rating first
      await taskAPI.rateTask(ratingModalTask._id, currentRating, 'provider');
      
      // Update tasks state with new rating
      const updatedTasks = tasks.map(task =>
        task._id === ratingModalTask._id
          ? { ...task, creatorRating: currentRating }
          : task
      );
      
      setTasks(updatedTasks);
      
      // Recalculate average rating with updated tasks
      calculateAverageRating(updatedTasks);
      
      toast.success('Rating submitted successfully');
      setRatingModalTask(null);
      setCurrentRating(0);
      setHoverRating(0);
      
      // Refresh tasks to ensure we have the latest data
      await fetchTasks();
    } catch (err) {
      console.error('Rating submission error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to submit rating';
      toast.error(errorMsg);
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
              <p>Applicants: {task.applicants?.length || 0}</p>
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
              {(task.status === 'awaiting-approval' || task.status === 'ready-for-review') && (
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
        <>
          {console.log('DEBUG: providerProfile:', providerProfile)}
          {console.log('DEBUG: avatar URL:', editProviderMode ? editableProviderProfile.avatar : providerProfile.avatar)}
          <div className="profile-modal-content" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div className="profile-image-row">
              <img 
                src={editProviderMode ? (editableProviderProfile.avatar || DEFAULT_PROFILE_IMAGE) : (providerProfile.avatar || DEFAULT_PROFILE_IMAGE)} 
                alt="Profile" 
                className="profile-image" 
                onError={(e) => {
                  e.target.src = DEFAULT_PROFILE_IMAGE;
                }}
              />
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
                      {renderStarRating(parseFloat(averageRating))}
                      ({averageRating}/5 from {tasks.filter(t => t.status === 'completed' && t.creatorRating && t.creatorRating > 0).length} rated tasks out of {tasks.filter(t => t.status === 'completed').length} total completed tasks)
                    </>
                  ) : tasks.filter(t => t.status === 'completed').length > 0 ? (
                    `No ratings yet (${tasks.filter(t => t.status === 'completed').length} completed tasks)`
                  ) : (
                    'No completed tasks yet'
                  )}
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
        </>
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

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    localStorage.setItem('providerActiveTab', tabKey);
  };

  if (!initialCheckDone) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      {loading && !isPolling && <div className="loading-overlay">Loading...</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="sidebar">
        <div className="sidebar-header">
          <h1>Task Provider</h1>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => handleTabChange('create')}
          >
            ➕ Create Task
          </button>
          <button 
            className={`nav-item ${activeTab === 'posted' ? 'active' : ''}`}
            onClick={() => handleTabChange('posted')}
          >
            📋 My Posted Tasks
          </button>
          <button 
            className={`nav-item ${activeTab === 'ongoing' ? 'active' : ''}`}
            onClick={() => handleTabChange('ongoing')}
          >
            🚧 Ongoing Tasks
          </button>
          <button 
            className={`nav-item ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => handleTabChange('completed')}
          >
            ✅ Completed Tasks
          </button>
          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabChange('profile')}
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
                          src={selectedTask.completedBy?.avatar || 
                               selectedTask.completedBy?.profilePictureUrl || 
                               selectedTask.completedBy?.photo || 
                               selectedTask.completedBy?.profilePicture || 
                               selectedTask.assignedTo?.avatar || 
                               selectedTask.assignedTo?.profilePictureUrl || 
                               selectedTask.assignedTo?.photo || 
                               selectedTask.assignedTo?.profilePicture || 
                               DEFAULT_PROFILE_IMAGE}
                          alt="Completed by"
                          className="applicant-image"
                          style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            console.log('Completed by image failed to load:', e.target.src);
                            e.target.src = DEFAULT_PROFILE_IMAGE;
                          }}
                          onLoad={() => {
                            console.log('Completed by image loaded successfully');
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
                    ) : (selectedTask.status === 'accepted' || 
                         selectedTask.status === 'ready-for-review' || 
                         selectedTask.status === 'awaiting-approval') && selectedTask.assignedTo ? (
                      <div className="applicant-card">
                        <img 
                          src={selectedTask.assignedTo.avatar || 
                               selectedTask.assignedTo.profilePictureUrl || 
                               selectedTask.assignedTo.photo || 
                               selectedTask.assignedTo.profilePicture || 
                               DEFAULT_PROFILE_IMAGE}
                          alt="Assigned applicant"
                          className="applicant-image"
                          style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            console.log('Assigned applicant image failed to load:', e.target.src);
                            e.target.src = DEFAULT_PROFILE_IMAGE;
                          }}
                          onLoad={() => {
                            console.log('Assigned applicant image loaded successfully');
                          }}
                        />
                        <div className="applicant-info">
                          <h4>{selectedTask.assignedTo.name || 'Unnamed User'}</h4>
                          <p>Email: {selectedTask.assignedTo.email || 'Not available'}</p>
                          <p>Phone: {selectedTask.assignedTo.phone || 'Not available'}</p>
                          <span className={`status-badge ${getDisplayStatus(selectedTask.status)}`}>
                            {getDisplayStatus(selectedTask.status)}
                          </span>
                        </div>
                        <div className="applicant-actions">
                          <button
                            className="secondary-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewProfile({ user: selectedTask.assignedTo });
                            }}
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    ) : (
                      getApplicantsForTask(selectedTask._id).map(applicant => {
                        console.log('Rendering applicant card for:', applicant);
                        const userData = applicant.user || applicant; // Fallback to applicant if user is not nested
                        const imageUrl = userData.avatar ||
                                        userData.profilePictureUrl ||
                                        userData.photo ||
                                        userData.profilePicture ||
                                        DEFAULT_PROFILE_IMAGE;
                        
                        console.log('Using image URL:', imageUrl);
                        
                        return (
                          <div key={applicant._id} className="applicant-card">
                            <img 
                              src={imageUrl}
                              alt="Applicant's profile picture"
                              className="applicant-image"
                              style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                console.log('Applicant card image failed to load:', e.target.src);
                                e.target.src = DEFAULT_PROFILE_IMAGE;
                              }}
                              onLoad={() => {
                                console.log('Applicant card image loaded successfully:', imageUrl);
                              }}
                            />
                            <div className="applicant-info">
                              <h4>{userData.name || 'Unnamed User'}</h4>
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
                                  handleAssignTask(selectedTask._id, userData._id || applicant._id);
                                }}
                              >
                                Assign To
                              </button>
                            </div>
                          </div>
                        );
                      })
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
            {console.log('DEBUG: Rendering View Profile modal with viewingProfile:', viewingProfile)}
            {(() => {
              const userData = viewingProfile.user || viewingProfile; // Fallback to viewingProfile if user is not nested
              return (
                <>
                  <h2>{userData.name || 'Applicant Profile'}</h2>
                  <div className="profile-details">
                    <div className="profile-image-section">
                      <img 
                        src={userData.avatar || userData.profilePictureUrl || userData.photo || userData.profilePicture || DEFAULT_PROFILE_IMAGE}
                        alt="Profile" 
                        className="profile-image" 
                        style={{
                          width: '120px',
                          height: '120px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '3px solid #ddd',
                          marginBottom: '20px'
                        }}
                        onError={(e) => {
                          console.log('Image failed to load, using default');
                          e.target.src = DEFAULT_PROFILE_IMAGE;
                        }}
                        onLoad={() => {
                          console.log('Profile image loaded successfully');
                        }}
                      />
                    </div>
                    
                    <div className="profile-fields">
                      <div className="profile-field">
                        <label>Name:</label>
                        <span>{userData.name || 'Not available'}</span>
                      </div>
                      
                      <div className="profile-field">
                        <label>Email:</label>
                        <span>{userData.email || 'Not available'}</span>
                      </div>
                      
                      <div className="profile-field">
                        <label>Phone:</label>
                        <span>{userData.phone || 'Not available'}</span>
                      </div>
                      
                      <div className="profile-field">
                        <label>Age:</label>
                        <span>{userData.age || 'Not specified'}</span>
                      </div>
                      
                      <div className="profile-field">
                        <label>Profession:</label>
                        <span>{userData.profession || 'Not specified'}</span>
                      </div>
                      
                      <div className="profile-field">
                        <label>Rating:</label>
                        <span>
                          {viewingProfile.rating ? (
                            <>
                              {viewingProfile.rating} ⭐
                              {userData.completedTasks && (
                                <small> ({userData.completedTasks} tasks completed)</small>
                              )}
                            </>
                          ) : (
                            'No rating yet'
                          )}
                        </span>
                      </div>
                      
                      {userData.skills && userData.skills.length > 0 && (
                        <div className="profile-field">
                          <label>Skills:</label>
                          <span>
                            {Array.isArray(userData.skills) 
                              ? userData.skills.join(", ") 
                              : userData.skills
                            }
                          </span>
                        </div>
                      )}
                      
                      {userData.bio && (
                        <div className="profile-field">
                          <label>Bio:</label>
                          <p>{userData.bio}</p>
                        </div>
                      )}
                      
                      {userData.experience && (
                        <div className="profile-field">
                          <label>Experience:</label>
                          <span>{userData.experience}</span>
                        </div>
                      )}
                      
                      {userData.location && (
                        <div className="profile-field">
                          <label>Location:</label>
                          <span>{renderLocation(userData.location)}</span>
                        </div>
                      )}
                      
                      {viewingProfile.appliedAt && (
                        <div className="profile-field">
                          <label>Applied On:</label>
                          <span>{new Date(viewingProfile.appliedAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                      )}
                      
                      {viewingProfile.coverLetter && (
                        <div className="profile-field">
                          <label>Cover Letter:</label>
                          <p>{viewingProfile.coverLetter}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="profile-modal-actions">
                    <button 
                      className="primary-button"
                      onClick={() => setViewingProfile(null)}
                    >
                      Close
                    </button>
                  </div>
                </>
              );
            })()}
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