import React, { useState } from "react";
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
    role: "buyer",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);
  const handleFileRemove = () => setSelectedFile(null);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Task Title is required.";
    if (!formData.description.trim()) newErrors.description = "Task Description is required.";
    if (!formData.deadline) newErrors.deadline = "Deadline is required.";
    if (!formData.timeRequirement || formData.timeRequirement <= 0)
      newErrors.timeRequirement = "Valid time (hours) is required.";
    if (!formData.budgetPerHour || formData.budgetPerHour <= 0)
      newErrors.budgetPerHour = "Valid hourly budget is required.";
    if (!formData.role) newErrors.role = "Role is required.";
    if (formData.mode === "on-site") {
      if (!formData.lat.trim()) newErrors.lat = "Latitude is required.";
      if (!formData.lng.trim()) newErrors.lng = "Longitude is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("You must be logged in to create a task.");
        window.location.href = "/login";
        return;
      }

      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });
      if (selectedFile) payload.append("attachment", selectedFile);

      const response = await fetch("http://localhost:3000/api/tasks/task/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
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
          role: "buyer",
        });
        setSelectedFile(null);
      } else {
        if (response.status === 401) {
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
          return;
        }
        alert("Failed to submit task: " + (result.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error submitting task:", err);
      if (err.message.includes("401")) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return;
      }
      alert("Something went wrong while submitting the task.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Post Your Task</h2>
          <span className="close-button" onClick={onClose}>×</span>
        </div>
        <form className="task-form" onSubmit={handleSubmit}>
          <input
            name="title"
            placeholder="Task Title"
            value={formData.title}
            onChange={handleChange}
          />
          {errors.title && <p className="error">{errors.title}</p>}

          <textarea
            name="description"
            placeholder="Task Description"
            value={formData.description}
            onChange={handleChange}
          />
          {errors.description && <p className="error">{errors.description}</p>}

          <input
            type="datetime-local"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
          />
          {errors.deadline && <p className="error">{errors.deadline}</p>}

          <select name="mode" value={formData.mode} onChange={handleChange}>
            <option value="remote">Online</option>
            <option value="on-site">In Person</option>
          </select>

          {formData.mode === "on-site" && (
            <>
              <input
                name="lat"
                placeholder="Latitude"
                value={formData.lat}
                onChange={handleChange}
              />
              {errors.lat && <p className="error">{errors.lat}</p>}

              <input
                name="lng"
                placeholder="Longitude"
                value={formData.lng}
                onChange={handleChange}
              />
              {errors.lng && <p className="error">{errors.lng}</p>}
            </>
          )}

          <input
            type="number"
            name="timeRequirement"
            placeholder="Time in hours"
            value={formData.timeRequirement}
            onChange={handleChange}
          />
          {errors.timeRequirement && <p className="error">{errors.timeRequirement}</p>}

          <input
            type="number"
            name="budgetPerHour"
            placeholder="INR/hour"
            value={formData.budgetPerHour}
            onChange={handleChange}
          />
          {errors.budgetPerHour && <p className="error">{errors.budgetPerHour}</p>}

          <textarea
            name="notes"
            placeholder="Extra notes"
            value={formData.notes}
            onChange={handleChange}
          />

          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="buyer">Buyer</option>
            <option value="provider">Provider</option>
          </select>
          {errors.role && <p className="error">{errors.role}</p>}

          <input type="file" onChange={handleFileChange} />
          {selectedFile && (
            <div>
              <span>{selectedFile.name}</span>
              <button type="button" onClick={handleFileRemove}>Remove</button>
            </div>
          )}

          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
