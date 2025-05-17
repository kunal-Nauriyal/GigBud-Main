import React, { useState, useEffect } from 'react';
import './TaskProviderDashboard.css';
import TaskDetailsModal from '../components/TaskDetailsModal';
import TaskForm from './Taskform';
import { taskAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Mock data for demonstration
const mockApplicants = [
  { id: 1, name: 'John Doe', rating: 4.5, proposedPrice: 500, taskId: 1 },
  { id: 2, name: 'Jane Smith', rating: 4.8, proposedPrice: 450, taskId: 1 },
];

// Provider profile mock data
const initialProviderProfile = {
  image: 'https://randomuser.me/api/portraits/men/45.jpg',
  name: 'John Provider',
  age: 32,
  profession: 'Business Owner',
  phone: '+91-9876543210',
  email: 'john@example.com',
  phoneVerified: true,
  emailVerified: false,
};

const TaskProviderDashboard = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
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
  const [providerProfile, setProviderProfile] = useState(initialProviderProfile);
  const [editProviderMode, setEditProviderMode] = useState(false);
  const [editableProviderProfile, setEditableProviderProfile] = useState(initialProviderProfile);
  const [taskCreated, setTaskCreated] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error('Please login to continue');
      navigate('/');
      return;
    }

    fetchTasks();
  }, [isLoggedIn, navigate, activeTab, taskCreated]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskAPI.getProviderTasks();

      if (response.success) {
        let filteredTasks = response.data || [];
        switch (activeTab) {
          case 'posted':
            filteredTasks = filteredTasks.filter(task => task.status === 'pending');
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
      await taskAPI.acceptTask(taskId);
      toast.success('Task assigned successfully');
      setTaskCreated(prev => !prev);
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

  const handleAssign = (applicantId) => {
    console.log(`Assigned task to applicant ${applicantId}`);
    setTaskCreated(prev => !prev);
  };

  const handleGiveRating = (taskId) => {
    console.log(`Giving rating for task ${taskId}`);
  };

  const applicantsByTask = tasks.map(task => ({
    ...task,
    applicants: mockApplicants.filter(a => a.taskId === task._id)
  }));

  const handleViewAllApplicants = (task) => {
    setSelectedApplicantsTask(task);
    setShowApplicantsModal(true);
  };

  const handleCloseApplicantsModal = () => {
    setShowApplicantsModal(false);
    setSelectedApplicantsTask(null);
  };

  const handleViewApplicantProfile = (applicant) => {
    setSelectedApplicant(applicant);
    setShowApplicantProfileModal(true);
  };

  const handleCloseApplicantProfileModal = () => {
    setShowApplicantProfileModal(false);
  };

  const getTaskDisplayTitle = (task) => {
    return task.jobType || task.title || "Untitled Task";
  };

  // Helper function to render location
  const renderLocation = (location) => {
    if (!location) return null;
    
    if (typeof location === 'string') {
      return location;
    }
    
    if (typeof location === 'object') {
      // Handle GeoJSON or other location objects
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
              <span className={`status-badge ${task.status}`}>{task.status}</span>
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
              <p>Assigned to: {task.assignedTo}</p>
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
              <p>Completed by: {task.completedBy}</p>
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
          <img src={editProviderMode ? editableProviderProfile.image : providerProfile.image} alt="Profile" className="profile-image" />
          {editProviderMode && (
            <input type="text" name="image" value={editableProviderProfile.image} onChange={handleProviderProfileInputChange} placeholder="Image URL" className="profile-image-input" />
          )}
        </div>
        <div className="profile-fields">
          <div className="profile-field">
            <label>Name:</label>
            {editProviderMode ? (
              <input type="text" name="name" value={editableProviderProfile.name} onChange={handleProviderProfileInputChange} />
            ) : (
              <span>{providerProfile.name}</span>
            )}
          </div>
          <div className="profile-field">
            <label>Age:</label>
            {editProviderMode ? (
              <input type="number" name="age" value={editableProviderProfile.age} onChange={handleProviderProfileInputChange} />
            ) : (
              <span>{providerProfile.age}</span>
            )}
          </div>
          <div className="profile-field">
            <label>Profession:</label>
            {editProviderMode ? (
              <input type="text" name="profession" value={editableProviderProfile.profession} onChange={handleProviderProfileInputChange} />
            ) : (
              <span>{providerProfile.profession}</span>
            )}
          </div>
          <div className="profile-field">
            <label>Phone:</label>
            {editProviderMode ? (
              <input type="text" name="phone" value={editableProviderProfile.phone} onChange={handleProviderProfileInputChange} />
            ) : (
              <span>{providerProfile.phone}</span>
            )}
            <span className={`verify-badge ${providerProfile.phoneVerified ? 'verified' : 'not-verified'}`}>{providerProfile.phoneVerified ? '✔ Verified' : 'Not Verified'}</span>
          </div>
          <div className="profile-field">
            <label>Email:</label>
            {editProviderMode ? (
              <input type="email" name="email" value={editableProviderProfile.email} onChange={handleProviderProfileInputChange} />
            ) : (
              <span>{providerProfile.email}</span>
            )}
            <span className={`verify-badge ${providerProfile.emailVerified ? 'verified' : 'not-verified'}`}>{providerProfile.emailVerified ? '✔ Verified' : 'Not Verified'}</span>
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

  const getApplicantsForTask = (taskId) => mockApplicants.filter(a => a.taskId === taskId);

  const getApplicantProfile = (applicant) => ({
    ...applicant,
    image: applicant.image || 'https://randomuser.me/api/portraits/men/32.jpg',
    age: applicant.age || 28,
    profession: applicant.profession || 'Web Developer',
    phone: applicant.phone || '+91-9876543210',
    email: applicant.email || 'applicant@email.com',
    phoneVerified: applicant.phoneVerified !== undefined ? applicant.phoneVerified : true,
    emailVerified: applicant.emailVerified !== undefined ? applicant.emailVerified : false,
  });

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
              <span className={`status-badge ${selectedTask.status}`}>{selectedTask.status}</span>
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

              {getApplicantsForTask(selectedTask._id).length > 0 && (
                <div className="detail-section">
                  <h3>Applicants</h3>
                  <div className="applicants-list">
                    {getApplicantsForTask(selectedTask._id).map(applicant => (
                      <div key={applicant.id} className="applicant-card">
                        <h4>{applicant.name}</h4>
                        <p>Rating: {applicant.rating} ⭐</p>
                        <p>Proposed Price: ₹{applicant.proposedPrice}</p>
                        <button className="primary-button" onClick={() => {
                          setSelectedApplicant(applicant);
                          setShowApplicantProfileModal(true);
                        }}>View Profile</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showApplicantProfileModal && selectedApplicant && (
        <div className="modal-overlay" onClick={() => { setShowApplicantProfileModal(false); setEditMode(false); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-back" onClick={() => { setShowApplicantProfileModal(false); setEditMode(false); }}>&larr; Back</button>
            <button className="modal-close" onClick={() => { setShowApplicantProfileModal(false); setEditMode(false); }}>×</button>
            <div className="modal-header">
              <h2>{editMode ? 'Edit Profile' : `${selectedApplicant.name}'s Profile`}</h2>
            </div>
            <div className="modal-body">
              {(() => {
                const profile = editMode ? editableProfile : getApplicantProfile(selectedApplicant);
                return (
                  <div className="profile-modal-content">
                    <div className="profile-image-row">
                      <img src={profile.image} alt="Profile" className="profile-image" />
                      {editMode && (
                        <input type="text" name="image" value={profile.image} onChange={handleProfileInputChange} placeholder="Image URL" className="profile-image-input" />
                      )}
                    </div>
                    <div className="profile-fields">
                      <div className="profile-field">
                        <label>Name:</label>
                        {editMode ? (
                          <input type="text" name="name" value={profile.name} onChange={handleProfileInputChange} />
                        ) : (
                          <span>{profile.name}</span>
                        )}
                      </div>
                      <div className="profile-field">
                        <label>Age:</label>
                        {editMode ? (
                          <input type="number" name="age" value={profile.age} onChange={handleProfileInputChange} />
                        ) : (
                          <span>{profile.age}</span>
                        )}
                      </div>
                      <div className="profile-field">
                        <label>Profession:</label>
                        {editMode ? (
                          <input type="text" name="profession" value={profile.profession} onChange={handleProfileInputChange} />
                        ) : (
                          <span>{profile.profession}</span>
                        )}
                      </div>
                      <div className="profile-field">
                        <label>Phone:</label>
                        {editMode ? (
                          <input type="text" name="phone" value={profile.phone} onChange={handleProfileInputChange} />
                        ) : (
                          <span>{profile.phone}</span>
                        )}
                        <span className={`verify-badge ${profile.phoneVerified ? 'verified' : 'not-verified'}`}>{profile.phoneVerified ? '✔ Verified' : 'Not Verified'}</span>
                      </div>
                      <div className="profile-field">
                        <label>Email:</label>
                        {editMode ? (
                          <input type="email" name="email" value={profile.email} onChange={handleProfileInputChange} />
                        ) : (
                          <span>{profile.email}</span>
                        )}
                        <span className={`verify-badge ${profile.emailVerified ? 'verified' : 'not-verified'}`}>{profile.emailVerified ? '✔ Verified' : 'Not Verified'}</span>
                      </div>
                    </div>
                    <div className="profile-modal-actions">
                      {editMode ? (
                        <>
                          <button className="primary-button" onClick={handleSaveProfile}>Save</button>
                          <button className="secondary-button" onClick={handleCancelEdit}>Cancel</button>
                        </>
                      ) : (
                        <button className="primary-button" onClick={handleEditProfile}>Edit</button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskProviderDashboard;