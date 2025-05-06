import React, { useState, useEffect } from "react";
import "./TaskForm.css";

const TaskForm = ({ onClose, onTaskCreated }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    timeRequirement: "",
    budgetPerHour: "",
    lat: "",
    lng: "",
    mode: "remote",
    notes: "",
    role: "buyer" // default role
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    validateForm();
  }, [formData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Task Title is required.";
    if (!formData.description.trim()) newErrors.description = "Task Description is required.";
    if (!formData.deadline.trim()) newErrors.deadline = "Deadline is required.";
    if (!formData.timeRequirement || formData.timeRequirement <= 0) newErrors.timeRequirement = "Valid time (hours) is required.";
    if (!formData.budgetPerHour || formData.budgetPerHour <= 0) newErrors.budgetPerHour = "Valid hourly budget is required.";
    if (!formData.role) newErrors.role = "Role is required.";

    if (formData.mode === "on-site" && (!formData.lat || !formData.lng)) {
      if (!formData.lat) newErrors.lat = "Latitude is required.";
      if (!formData.lng) newErrors.lng = "Longitude is required.";
    }

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    validateForm();
    if (!isFormValid) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = new FormData();
      for (const key in formData) {
        payload.append(key, formData[key]);
      }
      if (selectedFile) {
        payload.append("attachment", selectedFile);
      }

      const response = await fetch("http://localhost:3000/api/tasks/task/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: payload
      });

      const result = await response.json();
      if (response.ok) {
        alert("Task successfully submitted!");
        onTaskCreated(result.data);
        setFormData({
          title: "",
          description: "",
          deadline: "",
          timeRequirement: "",
          budgetPerHour: "",
          lat: "",
          lng: "",
          mode: "remote",
          notes: "",
          role: "buyer"
        });
        setSelectedFile(null);
      } else {
        alert("Failed to submit task: " + result.message);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Post Your Task</h2>
          <span className="close-button" onClick={onClose}>×</span>
        </div>
        <div className="modal-content">
          <form className="task-form" onSubmit={handleSubmit}>
            <input name="title" placeholder="Task Title" value={formData.title} onChange={handleChange} />
            {errors.title && <p>{errors.title}</p>}

            <textarea name="description" placeholder="Task Description" value={formData.description} onChange={handleChange} />
            {errors.description && <p>{errors.description}</p>}

            <input type="datetime-local" name="deadline" value={formData.deadline} onChange={handleChange} />
            {errors.deadline && <p>{errors.deadline}</p>}

            <select name="mode" value={formData.mode} onChange={handleChange}>
              <option value="remote">Online</option>
              <option value="on-site">In Person</option>
            </select>

            {formData.mode === "on-site" && (
              <>
                <input name="lat" placeholder="Latitude" value={formData.lat} onChange={handleChange} />
                {errors.lat && <p>{errors.lat}</p>}
                <input name="lng" placeholder="Longitude" value={formData.lng} onChange={handleChange} />
                {errors.lng && <p>{errors.lng}</p>}
              </>
            )}

            <input name="timeRequirement" type="number" placeholder="Time in hours" value={formData.timeRequirement} onChange={handleChange} />
            {errors.timeRequirement && <p>{errors.timeRequirement}</p>}

            <input name="budgetPerHour" type="number" placeholder="INR/hour" value={formData.budgetPerHour} onChange={handleChange} />
            {errors.budgetPerHour && <p>{errors.budgetPerHour}</p>}

            <textarea name="notes" placeholder="Extra notes" value={formData.notes} onChange={handleChange} />

            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="buyer">Buyer</option>
              <option value="provider">Provider</option>
            </select>
            {errors.role && <p>{errors.role}</p>}

            <input type="file" onChange={handleFileChange} />
            {selectedFile && (
              <div>
                <span>{selectedFile.name}</span>
                <button type="button" onClick={handleFileRemove}>Remove</button>
              </div>
            )}

            <button type="submit" disabled={!isFormValid}>Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
