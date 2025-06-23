import React, { useState, useEffect } from "react";
import "./BuyingTimeForm.css";

// API Base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const BuyingTimeForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    deadline: "",
    timeRequirement: "",
    jobType: "",
    skills: [],
    workMode: "Remote",
    location: "",
    lat: "",
    lng: "",
    budgetPerHour: "",
    additionalNotes: "",
  });

  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    validateForm();
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        skills: checked
          ? [...prev.skills, value]
          : prev.skills.filter((skill) => skill !== value),
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }

    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required.";
    if (!formData.deadline.trim()) newErrors.deadline = "Deadline is required.";
    if (!formData.timeRequirement || isNaN(formData.timeRequirement))
      newErrors.timeRequirement = "Valid time is required.";
    if (!formData.jobType.trim()) newErrors.jobType = "Job type is required.";
    if (!formData.budgetPerHour || isNaN(formData.budgetPerHour))
      newErrors.budgetPerHour = "Valid budget is required.";

    if (formData.workMode === "on-site") {
      if (!formData.lat || !formData.lng) {
        newErrors.lat = "Latitude required.";
        newErrors.lng = "Longitude required.";
      }
    }

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    validateForm();

    if (!isFormValid) {
      alert("❌ Please fill all required fields.");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("You must be logged in.");
      window.location.href = "/login";
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.additionalNotes || "No description provided.",
      deadline: formData.deadline,
      timeRequirement: parseFloat(formData.timeRequirement),
      budgetPerHour: parseFloat(formData.budgetPerHour),
      mode: formData.workMode.toLowerCase(),
      notes: formData.skills.join(", "),
    };

    if (formData.workMode === "on-site") {
      payload.lat = parseFloat(formData.lat);
      payload.lng = parseFloat(formData.lng);
    }

    try {
      setLoading(true);
      // 1. Create the task
      const createRes = await fetch(`${API_BASE_URL}/tasks/task/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const createData = await createRes.json();
      if (!createRes.ok) {
        if (createRes.status === 401) {
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
          return;
        }
        throw new Error(createData.message || "Task creation failed");
      }

      // 2. Accept the task
      const taskId = createData.data._id;
      const acceptRes = await fetch(`${API_BASE_URL}/tasks/task/accept/${taskId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const acceptData = await acceptRes.json();
      if (!acceptRes.ok) {
        if (acceptRes.status === 401) {
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
          return;
        }
        throw new Error(acceptData.message || "Accepting task failed");
      }

      alert("✅ Task submitted and accepted!");
      onSubmit(acceptData.data); // Pass accepted task to parent
      onClose(); // Close modal
    } catch (err) {
      console.error("Submit error:", err.message);
      if (err.message.includes("401")) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return;
      }
      alert("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Buying Time</h2>
          <span className="close-button" onClick={onClose}>
            ×
          </span>
        </div>

        <div className="modal-content">
          <form className="buying-time-form" onSubmit={handleSubmit}>
            <label>
              Title:
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={errors.title ? "input-error" : ""}
              />
            </label>

            <label>
              Deadline:
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className={errors.deadline ? "input-error" : ""}
              />
            </label>

            <label>
              Time Required (in hours):
              <input
                type="number"
                name="timeRequirement"
                value={formData.timeRequirement}
                onChange={handleChange}
                className={errors.timeRequirement ? "input-error" : ""}
              />
            </label>

            <label>
              Budget per Hour (₹):
              <input
                type="number"
                name="budgetPerHour"
                value={formData.budgetPerHour}
                onChange={handleChange}
                className={errors.budgetPerHour ? "input-error" : ""}
              />
            </label>

            <label>
              Job Type:
              <input
                type="text"
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                className={errors.jobType ? "input-error" : ""}
              />
            </label>

            <label>
              Preferred Skills:
              <div className="checkbox-group">
                {["Communication", "Technical", "Writing", "Driving"].map((skill) => (
                  <label key={skill}>
                    <input
                      type="checkbox"
                      name="skills"
                      value={skill}
                      checked={formData.skills.includes(skill)}
                      onChange={handleChange}
                    />
                    {skill}
                  </label>
                ))}
              </div>
            </label>

            <label>
              Work Mode:
              <select name="workMode" value={formData.workMode} onChange={handleChange}>
                <option value="Remote">Remote</option>
                <option value="on-site">On-Site</option>
              </select>
            </label>

            {formData.workMode === "on-site" && (
              <>
                <label>
                  Latitude:
                  <input
                    type="number"
                    name="lat"
                    value={formData.lat}
                    onChange={handleChange}
                    className={errors.lat ? "input-error" : ""}
                  />
                </label>
                <label>
                  Longitude:
                  <input
                    type="number"
                    name="lng"
                    value={formData.lng}
                    onChange={handleChange}
                    className={errors.lng ? "input-error" : ""}
                  />
                </label>
              </>
            )}

            <label>
              Additional Notes:
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
              />
            </label>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BuyingTimeForm;
