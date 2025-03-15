import React, { useState, useEffect } from "react";
import "./TaskForm.css";

const TaskForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    budget: "",
    location: "Online",
    contact: "Chat",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    validateForm();
  }, [formData]); // Validate form when formData changes

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" }); // Clear error on input
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  // Validate form fields
  const validateForm = () => {
    let newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Task Title is required.";
    if (!formData.description.trim()) newErrors.description = "Task Description is required.";
    if (!formData.deadline.trim()) newErrors.deadline = "Deadline is required.";
    if (!formData.budget.trim() || formData.budget <= 0) newErrors.budget = "Valid budget is required.";

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid) {
      alert("Task successfully submitted! ✅");
      setFormData({
        title: "",
        description: "",
        deadline: "",
        budget: "",
        location: "Online",
        contact: "Chat",
      });
      setSelectedFile(null);
      setErrors({});
    } else {
      alert("Please fill all required fields! ⚠️");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Header with Close Button */}
        <div className="modal-header">
          <h2>Post Your Task</h2>
          <span className="close-button" onClick={onClose}>&#10006;</span>
        </div>

        {/* Scrollable Form */}
        <div className="modal-content">
          <form className="task-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Task Title</label>
              <input
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
              <label>Task Description</label>
              <textarea
                name="description"
                placeholder="Describe the task briefly"
                value={formData.description}
                onChange={handleChange}
                className={errors.description ? "input-error" : ""}
              />
              {errors.description && <p className="error-text">{errors.description}</p>}
            </div>

            <div className="form-group">
              <label>Task Location</label>
              <select name="location" value={formData.location} onChange={handleChange}>
                <option>Online</option>
                <option>In-Person</option>
              </select>
            </div>

            <div className="form-group">
              <label>Deadline (Date & Time)</label>
              <input
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className={errors.deadline ? "input-error" : ""}
              />
              {errors.deadline && <p className="error-text">{errors.deadline}</p>}
            </div>

            <div className="form-group">
              <label>Budget</label>
              <input
                type="number"
                name="budget"
                placeholder="Amount in INR"
                value={formData.budget}
                onChange={handleChange}
                className={errors.budget ? "input-error" : ""}
              />
              {errors.budget && <p className="error-text">{errors.budget}</p>}
            </div>

            <div className="form-group attachment-group">
              <label>Attachments (Optional)</label>
              <div className="file-upload-container">
                <input type="file" onChange={handleFileChange} />
                {selectedFile && (
                  <div className="file-preview">
                    <span>{selectedFile.name}</span>
                    <button className="delete-file-button" onClick={handleFileRemove}>❌</button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-button" disabled={!isFormValid}>
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
