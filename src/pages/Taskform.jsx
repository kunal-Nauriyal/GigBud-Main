import React, { useState, useEffect } from "react";
import { taskAPI } from '../services/api';
import "./Taskform.css";

const initialNormalTask = {
  title: "",
  description: "",
  deadline: "",
  budget: "",
  location: "Online",
  contact: "Chat",
  address: "", // Added address field instead of coordinates
};

const initialTimeBuyerTask = {
  timeRequirement: "",
  jobType: "",
  skills: [],
  workMode: "Online",
  workLocation: "",
  budgetPerHour: "",
  additionalNotes: "",
  address: "", // Added address field instead of coordinates
};

const skillOptions = [
  "Communication",
  "Technical",
  "Cooking",
  "Driving",
  "Writing",
  "Cleaning",
];

const TaskForm = ({ onClose }) => {
  const [taskType, setTaskType] = useState("normal");
  const [formData, setFormData] = useState(initialNormalTask);
  const [timeBuyerData, setTimeBuyerData] = useState(initialTimeBuyerTask);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    if (taskType === "normal") validateNormalTask();
    else validateTimeBuyerTask();
    // eslint-disable-next-line
  }, [formData, timeBuyerData, taskType]);

  // --- Normal Task Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "location") {
      setFormData({ 
        ...formData, 
        [name]: value,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  // --- Time Buyer Handlers ---
  const handleTimeBuyerChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "workMode") {
      setTimeBuyerData({ 
        ...timeBuyerData, 
        [name]: value,
      });
    } else if (type === "checkbox") {
      setTimeBuyerData((prev) => ({
        ...prev,
        skills: checked
          ? [...prev.skills, value]
          : prev.skills.filter((skill) => skill !== value),
      }));
    } else {
      setTimeBuyerData({ ...timeBuyerData, [name]: value });
    }
    
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  // --- File Handlers ---
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileRemove = (e) => {
    e.preventDefault();
    setSelectedFile(null);
  };

  // --- Validation ---
  const validateNormalTask = () => {
    let newErrors = {};
    if (!formData.title?.trim()) newErrors.title = "Task Title is required.";
    if (!formData.description?.trim()) newErrors.description = "Task Description is required.";
    if (!formData.deadline) {
      newErrors.deadline = "Deadline is required.";
    } else {
      const deadlineDate = new Date(formData.deadline);
      if (deadlineDate <= new Date()) {
        newErrors.deadline = "Deadline must be in the future.";
      }
    }
    if (!formData.budget || isNaN(formData.budget) || parseFloat(formData.budget) <= 0) {
      newErrors.budget = "Valid budget amount is required.";
    }
    if (formData.location === "In-Person") {
      if (!formData.address?.trim()) {
        newErrors.address = "Location address is required for in-person tasks.";
      }
    }

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  };

  const validateTimeBuyerTask = () => {
    let newErrors = {};
    if (!timeBuyerData.timeRequirement?.trim()) newErrors.timeRequirement = "Time Requirement is required.";
    if (!timeBuyerData.jobType?.trim()) newErrors.jobType = "Job Type is required.";
    if (timeBuyerData.workMode === "In-Person") {
      if (!timeBuyerData.workLocation?.trim()) {
        newErrors.workLocation = "Location is required for in-person work.";
      }
    }
    if (!timeBuyerData.budgetPerHour?.trim() || timeBuyerData.budgetPerHour <= 0)
      newErrors.budgetPerHour = "Valid budget is required.";
    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  };

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      alert("Please fill all required fields! ⚠️");
      return;
    }

    try {
      const currentDate = new Date();
      const formattedCurrentDate = currentDate.toISOString().split('T')[0];
      
      let taskData = {};
      
      if (taskType === "normal") {
        taskData = {
          taskType,
          title: formData.title,
          description: formData.description,
          deadline: formData.deadline,
          budget: formData.budget,
          contact: formData.contact,
          postedDate: formattedCurrentDate,
          status: "pending",
          createdAt: new Date().toISOString(),
          displayName: formData.title,
          displayDate: formattedCurrentDate,
          // Updated location handling - using address instead of coordinates
          location: formData.location === "In-Person" ? {
            mode: "In-Person",
            address: formData.address
          } : "Online"
        };
      } else {
        const skillsString = timeBuyerData.skills.join(", ");
        
        taskData = {
          taskType,
          title: timeBuyerData.jobType,
          description: `${timeBuyerData.timeRequirement} ${timeBuyerData.jobType} work requiring ${skillsString} skills.${timeBuyerData.additionalNotes ? " " + timeBuyerData.additionalNotes : ""}`,
          budget: timeBuyerData.budgetPerHour,
          deadline: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          postedDate: formattedCurrentDate,
          status: "pending",
          createdAt: new Date().toISOString(),
          displayName: timeBuyerData.jobType,
          displayDate: formattedCurrentDate,
          timeRequirement: timeBuyerData.timeRequirement,
          jobType: timeBuyerData.jobType,
          skills: timeBuyerData.skills,
          workMode: timeBuyerData.workMode,
          workLocation: timeBuyerData.workMode === "In-Person" ? timeBuyerData.workLocation : "Online",
          budgetPerHour: timeBuyerData.budgetPerHour,
          additionalNotes: timeBuyerData.additionalNotes,
          // Updated location handling - using address instead of coordinates
          location: timeBuyerData.workMode === "In-Person" ? {
            mode: "In-Person",
            address: timeBuyerData.workLocation
          } : "Online"
        };
      }

      // Clean up undefined values
      Object.keys(taskData).forEach(key => {
        if (taskData[key] === undefined) {
          delete taskData[key];
        }
      });

      const formDataToSend = new FormData();
      
      Object.keys(taskData).forEach(key => {
        if (key === 'skills' && Array.isArray(taskData[key])) {
          formDataToSend.append(key, JSON.stringify(taskData[key]));
        } else if (key === 'deadline' && taskData[key]) {
          formDataToSend.append(key, new Date(taskData[key]).toISOString());
        } else if (taskData[key] != null) {
          // Handle nested location object
          if (key === 'location' && typeof taskData[key] === 'object') {
            formDataToSend.append('location[mode]', taskData[key].mode);
            formDataToSend.append('address', taskData[key].address);
          } else {
            formDataToSend.append(key, taskData[key]);
          }
        }
      });

      if (taskType === "normal" && selectedFile) {
        formDataToSend.append("attachment", selectedFile);
      }

      console.log('Sending task data:', {
        ...Object.fromEntries(formDataToSend.entries())
      });

      const response = await taskAPI.createTask(formDataToSend);
      console.log('Server response:', response);

      alert("Task successfully submitted! ✅");
      setFormData(initialNormalTask);
      setTimeBuyerData(initialTimeBuyerTask);
      setSelectedFile(null);
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Task creation error:", error.response?.data || error);
      alert(error.response?.data?.message || error.message || "Failed to create task! ⚠️");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container taskform-modern-container">
        <div className="modal-header taskform-header">
          <h2>📝 Post a New Task</h2>
          <span className="close-button" onClick={onClose}>✖</span>
        </div>
        <div className="modal-content taskform-content">
          <form className="task-form" onSubmit={handleSubmit} autoComplete="off">
            {/* Task Type Selection */}
            <div className="form-section">
              <h3 className="section-title">What do you want to post?</h3>
              <div className="task-type-row">
                <label className="task-type-radio">
                  <input
                    type="radio"
                    name="taskType"
                    value="normal"
                    checked={taskType === "normal"}
                    onChange={() => setTaskType("normal")}
                  />
                  Normal Task
                </label>
                <label className="task-type-radio">
                  <input
                    type="radio"
                    name="taskType"
                    value="timebuyer"
                    checked={taskType === "timebuyer"}
                    onChange={() => setTaskType("timebuyer")}
                  />
                  Book Someone's Time
                </label>
              </div>
            </div>

            {/* Normal Task Form */}
            {taskType === "normal" && (
              <>
                <div className="form-section">
                  <h3 className="section-title">Task Details</h3>
                  <div className="form-group">
                    <label htmlFor="title">Task Title <span className="required">*</span></label>
                    <input
                      id="title"
                      type="text"
                      name="title"
                      placeholder="E.g., Grocery Shopping"
                      value={formData.title}
                      onChange={handleChange}
                      className={errors.title ? "input-error" : ""}
                    />
                    {errors.title && <p className="error-text">{errors.title}</p>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="description">Task Description <span className="required">*</span></label>
                    <textarea
                      id="description"
                      name="description"
                      placeholder="Describe the task briefly"
                      value={formData.description}
                      onChange={handleChange}
                      className={errors.description ? "input-error" : ""}
                      rows={4}
                    />
                    {errors.description && <p className="error-text">{errors.description}</p>}
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="section-title">Task Logistics</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="location">Location</label>
                      <select 
                        id="location" 
                        name="location" 
                        value={formData.location} 
                        onChange={handleChange}
                      >
                        <option>Online</option>
                        <option>In-Person</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="deadline">Deadline <span className="required">*</span></label>
                      <input
                        id="deadline"
                        type="datetime-local"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleChange}
                        className={errors.deadline ? "input-error" : ""}
                      />
                      {errors.deadline && <p className="error-text">{errors.deadline}</p>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="budget">Budget (INR) <span className="required">*</span></label>
                      <input
                        id="budget"
                        type="number"
                        name="budget"
                        placeholder="Amount in INR"
                        value={formData.budget}
                        onChange={handleChange}
                        className={errors.budget ? "input-error" : ""}
                      />
                      {errors.budget && <p className="error-text">{errors.budget}</p>}
                    </div>
                  </div>

                  {/* Address field for In-Person tasks */}
                  {formData.location === "In-Person" && (
                    <div className="form-group">
                      <label htmlFor="address">Location Address <span className="required">*</span></label>
                      <input
                        id="address"
                        type="text"
                        name="address"
                        placeholder="Enter the task location"
                        value={formData.address}
                        onChange={handleChange}
                        className={errors.address ? "input-error" : ""}
                      />
                      {errors.address && <p className="error-text">{errors.address}</p>}
                    </div>
                  )}
                </div>

                {/* File Attachment Section - Only for Normal Task */}
                <div className="form-section">
                  <h3 className="section-title">Attachment (Optional)</h3>
                  <div className="form-group attachment-group-modern">
                    <label htmlFor="attachment" className="attachment-label">
                      <span className="attachment-icon">📎</span> Upload File
                    </label>
                    <div className="file-upload-modern">
                      <input id="attachment" type="file" onChange={handleFileChange} />
                      {selectedFile && (
                        <div className="file-preview-modern">
                          <span>{selectedFile.name}</span>
                          <button className="delete-file-button" onClick={handleFileRemove}>❌</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Time Buyer Form */}
            {taskType === "timebuyer" && (
              <>
                <div className="form-section">
                  <h3 className="section-title">Time Booking Details</h3>
                  <div className="form-group">
                    <label>Time Requirement <span className="required">*</span></label>
                    <input
                      type="text"
                      name="timeRequirement"
                      placeholder="Select hours or days"
                      value={timeBuyerData.timeRequirement}
                      onChange={handleTimeBuyerChange}
                      className={errors.timeRequirement ? "input-error" : ""}
                    />
                    {errors.timeRequirement && <p className="error-text">{errors.timeRequirement}</p>}
                  </div>
                  <div className="form-group">
                    <label>Job Type <span className="required">*</span></label>
                    <input
                      type="text"
                      name="jobType"
                      placeholder="E.g., Personal Assistance, Technical Work"
                      value={timeBuyerData.jobType}
                      onChange={handleTimeBuyerChange}
                      className={errors.jobType ? "input-error" : ""}
                    />
                    {errors.jobType && <p className="error-text">{errors.jobType}</p>}
                  </div>
                  <div className="form-group">
                    <label>Preferred Skills</label>
                    <div className="checkbox-group">
                      {skillOptions.map((skill) => (
                        <label key={skill} className="checkbox-label">
                          <input
                            type="checkbox"
                            value={skill}
                            checked={timeBuyerData.skills.includes(skill)}
                            onChange={handleTimeBuyerChange}
                          />
                          {skill}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Work Mode</label>
                    <select 
                      name="workMode" 
                      value={timeBuyerData.workMode} 
                      onChange={handleTimeBuyerChange}
                    >
                      <option>Online</option>
                      <option>In-Person</option>
                    </select>
                  </div>
                  {timeBuyerData.workMode === "In-Person" && (
                    <div className="form-group">
                      <label>Location Address <span className="required">*</span></label>
                      <input
                        type="text"
                        name="workLocation"
                        placeholder="Enter location address"
                        value={timeBuyerData.workLocation}
                        onChange={handleTimeBuyerChange}
                        className={errors.workLocation ? "input-error" : ""}
                      />
                      {errors.workLocation && <p className="error-text">{errors.workLocation}</p>}
                    </div>
                  )}
                  <div className="form-group">
                    <label>Budget per Hour <span className="required">*</span></label>
                    <input
                      type="number"
                      name="budgetPerHour"
                      placeholder="Enter budget"
                      value={timeBuyerData.budgetPerHour}
                      onChange={handleTimeBuyerChange}
                      className={errors.budgetPerHour ? "input-error" : ""}
                    />
                    {errors.budgetPerHour && <p className="error-text">{errors.budgetPerHour}</p>}
                  </div>
                  <div className="form-group">
                    <label>Additional Notes (Optional)</label>
                    <textarea
                      name="additionalNotes"
                      placeholder="Any special instructions..."
                      value={timeBuyerData.additionalNotes}
                      onChange={handleTimeBuyerChange}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-actions">
              <button type="button" className="secondary-button" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="submit-button" disabled={!isFormValid}>
                Post Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;