import React, { useState, useEffect } from 'react';
import './TaskProviderDashboard.css';
import TaskDetailsModal from '../components/TaskDetailsModal';
import TaskForm from './Taskform';
import { taskAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TaskProviderDashboard = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [activeTab, setActiveTab] = useState('posted');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplicantsTask, setSelectedApplicantsTask] = useState(null);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showApplicantProfileModal, setShowApplicantProfileModal] = useState(false);
  const [showTaskFormModal, setShowTaskFormModal] = useState(false);
  const [providerProfile, setProviderProfile] = useState({
    image: user?.avatar || 'https://randomuser.me/api/portraits/men/45.jpg',
    name: user?.name || '',
    age: '',
    profession: '',
    phone: '',
    email: user?.email || '',
    phoneVerified: false,
    emailVerified: false,
  });
  const [editProviderMode, setEditProviderMode] = useState(false);
  const [editableProviderProfile, setEditableProviderProfile] = useState({
    image: user?.avatar || 'https://randomuser.me/api/portraits/men/45.jpg',
    name: user?.name || '',
    age: '',
    profession: '',
    phone: '',
    email: user?.email || '',
    phoneVerified: false,
    emailVerified: false,
  });
  const [taskCreated, setTaskCreated] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error('Please login to continue');
      navigate('/');
      return;
    }

    if (user) {
      setProviderProfile(prev => ({
        ...prev,
        image: user.avatar || prev.image,
        name: user.name || '',
        email: user.email || ''
      }));
      setEditableProviderProfile(prev => ({
        ...prev,
        image: user.avatar || prev.image,
        name: user.name || '',
        email: user.email || ''
      }));
    }

    fetchTasks();
  }, [isLoggedIn, navigate, activeTab, taskCreated, user]);

  const getDisplayStatus = (status) => {
    switch (status) {
      case 'pending':
        return 'open';
      case 'accepted':
        return 'assigned';
      case 'completed':
        return 'closed';
      default:
        return status;
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskAPI.getProviderTasks();

      if (response.success) {
        let filteredTasks = response.data || [];
        switch (activeTab) {
          case 'posted':
            filteredTasks = filteredTasks.filter(task => task.status === 'pending' || task.status === 'accepted' || task.status === 'completed');
            break;
          case 'ongoing':
            filteredTasks = filteredTasks.filter(task => task.status === 'accepted');
            break;
          case 'completed':
            filteredTasks = filteredTasks.filter(task => task.status === 'completed');
            break;
          default:
            break;
        }
        setTasks(filteredTasks);
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
      toast.success('Task marked as complete');
      setTaskCreated(prev => !prev);
    } catch (err) {
      toast.error(err.message || 'Failed to update task status');
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

  const handleGiveRating = (taskId) => {
    console.log(`Giving rating for task ${taskId}`);
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
              <button
                className="primary-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkComplete(task._id);
                }}
              >
                Mark as Complete
              </button>
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
              <button
                className="primary-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGiveRating(task._id);
                }}
              >
                Give Rating
              </button>
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
      <div className="profile-modal-content">
        <div className="profile-image-row">
          <img 
            src={editProviderMode ? editableProviderProfile.image : providerProfile.image} 
            alt="Profile" 
            className="profile-image" 
          />
          {editProviderMode && (
            <input 
              type="text" 
              name="image" 
              value={editableProviderProfile.image} 
              onChange={handleProviderProfileInputChange} 
              placeholder="Image URL" 
              className="profile-image-input" 
            />
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
              />
            ) : (
              <span>{providerProfile.name || 'Not specified'}</span>
            )}
          </div>
          <div className="profile-field">
            <label>Email:</label>
            <span>{providerProfile.email || 'Not specified'}</span>
            <span className={`verify-badge ${providerProfile.emailVerified ? 'verified' : 'not-verified'}`}>
              {providerProfile.emailVerified ? '✔ Verified' : 'Not Verified'}
            </span>
          </div>
          <div className="profile-field">
            <label>Age:</label>
            {editProviderMode ? (
              <input 
                type="number" 
                name="age" 
                value={editableProviderProfile.age} 
                onChange={handleProviderProfileInputChange} 
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
                type="text" 
                name="phone" 
                value={editableProviderProfile.phone} 
                onChange={handleProviderProfileInputChange} 
              />
            ) : (
              <span>{providerProfile.phone || 'Not specified'}</span>
            )}
            <span className={`verify-badge ${providerProfile.phoneVerified ? 'verified' : 'not-verified'}`}>
              {providerProfile.phoneVerified ? '✔ Verified' : 'Not Verified'}
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

  const [editMode, setEditMode] = useState(false);
  const [editableProfile, setEditableProfile] = useState(null);

  const handleEditProfile = () => {
    setEditMode(true);
    setEditableProfile(getApplicantProfile(selectedApplicant));
  };

  const handleProfileInputChange = (e) => {
    setEditableProfile({ ...editableProfile, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = () => {
    setEditMode(false);
    setSelectedApplicant(editableProfile);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditableProfile(null);
  };

  const handleEditProviderProfile = () => {
    setEditProviderMode(true);
    setEditableProviderProfile(providerProfile);
  };

  const handleProviderProfileInputChange = (e) => {
    setEditableProviderProfile({ ...editableProviderProfile, [e.target.name]: e.target.value });
  };

  const handleSaveProviderProfile = () => {
    setProviderProfile(editableProviderProfile);
    setEditProviderMode(false);
  };

  const handleCancelProviderEdit = () => {
    setEditProviderMode(false);
    setEditableProviderProfile(providerProfile);
  };

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
                </div>
              </div>

              {selectedTask.status === 'pending' && getApplicantsForTask(selectedTask._id).length > 0 && (
                <div className="detail-section">
                  <h3>Applicants</h3>
                  <div className="applicants-list">
                    {getApplicantsForTask(selectedTask._id).map(applicant => (
                      <div key={applicant._id} className="applicant-card">
                        <h4>{applicant.user?.name || 'Unnamed User'}</h4>
                        <p>Rating: {applicant.rating || 'No rating'} ⭐</p>
                        <p>Proposed Price: ₹{applicant.proposedPrice || 'Not specified'}</p>
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
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {viewingProfile && (
        <div className="modal-overlay" onClick={() => setViewingProfile(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setViewingProfile(null)}>×</button>
            <h2>{viewingProfile.user?.name || 'Applicant Profile'}</h2>
            <div className="profile-details">
              {viewingProfile.user?.image && (
                <img src={viewingProfile.user.image} alt="Profile" className="profile-image" />
              )}
              <div className="profile-field">
                <label>Email:</label>
                <span>{viewingProfile.user?.email || 'Not available'}</span>
              </div>
              <div className="profile-field">
                <label>Rating:</label>
                <span>{viewingProfile.rating || 'No rating'} ⭐</span>
              </div>
              <div className="profile-field">
                <label>Proposed Price:</label>
                <span>₹{viewingProfile.proposedPrice || 'Not specified'}</span>
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
    </div>
  );
};

export default TaskProviderDashboard;