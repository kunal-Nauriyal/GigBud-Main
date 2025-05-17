import React from 'react';
import './TaskDetailsModal.css';

const TaskDetailsModal = ({ isOpen, onClose, task }) => {
  if (!isOpen || !task) return null;

  // Mock profile data - in real app, this would come from your backend
  const getAssignedProfile = (assignedTo) => {
    const profiles = {
      'Alice Johnson': {
        name: 'Alice Johnson',
        rating: 4.8,
        completedTasks: 45,
        skills: ['UI/UX Design', 'Mobile App Development', 'Figma'],
        bio: 'Experienced UI/UX designer with a passion for creating beautiful and functional mobile applications.',
        joinDate: '2023-06-15'
      },
      'Bob Wilson': {
        name: 'Bob Wilson',
        rating: 4.9,
        completedTasks: 78,
        skills: ['Content Writing', 'SEO', 'Technical Writing'],
        bio: 'Professional content writer specializing in technology and business topics.',
        joinDate: '2023-01-10'
      }
    };
    return profiles[assignedTo] || null;
  };

  const assignedProfile = task.assignedTo ? getAssignedProfile(task.assignedTo) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>{task.title}</h2>
          <span className={`status-badge ${task.status}`}>{task.status}</span>
        </div>

        <div className="modal-body">
          <div className="detail-section">
            <h3>Task Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Posted Date:</label>
                <span>{task.date}</span>
              </div>
              {task.assignedTo && (
                <div className="detail-item">
                  <label>Assigned To:</label>
                  <span>{task.assignedTo}</span>
                </div>
              )}
              {task.completedBy && (
                <div className="detail-item">
                  <label>Completed By:</label>
                  <span>{task.completedBy}</span>
                </div>
              )}
              {task.description && (
                <div className="detail-item full-width">
                  <label>Description:</label>
                  <p>{task.description}</p>
                </div>
              )}
              {task.budget && (
                <div className="detail-item">
                  <label>Budget:</label>
                  <span>${task.budget}</span>
                </div>
              )}
              {task.deadline && (
                <div className="detail-item">
                  <label>Deadline:</label>
                  <span>{task.deadline}</span>
                </div>
              )}
            </div>
          </div>

          {assignedProfile && (
            <div className="detail-section">
              <h3>Assigned Person Profile</h3>
              <div className="profile-details">
                <div className="profile-header">
                  <h4>{assignedProfile.name}</h4>
                  <div className="profile-rating">
                    <span>{assignedProfile.rating} ⭐</span>
                    <span className="completed-tasks">{assignedProfile.completedTasks} tasks completed</span>
                  </div>
                </div>
                <div className="profile-bio">
                  <p>{assignedProfile.bio}</p>
                </div>
                <div className="profile-skills">
                  <h5>Skills</h5>
                  <div className="skills-list">
                    {assignedProfile.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="profile-meta">
                  <span>Member since: {assignedProfile.joinDate}</span>
                </div>
              </div>
            </div>
          )}

          {task.applicants && task.applicants.length > 0 && (
            <div className="detail-section">
              <h3>Applicants</h3>
              <div className="applicants-list">
                {task.applicants.map(applicant => (
                  <div key={applicant.id} className="applicant-item">
                    <div className="applicant-info">
                      <h4>{applicant.name}</h4>
                      <p>Rating: {applicant.rating} ⭐</p>
                      <p>Proposed Price: ${applicant.proposedPrice}</p>
                    </div>
                    <button className="primary-button">Assign</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="secondary-button" onClick={onClose}>Close</button>
          {task.status === 'open' && (
            <button className="primary-button">Edit Task</button>
          )}
          {task.status === 'ongoing' && (
            <button className="primary-button">Mark as Complete</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal; 