import React, { useState, useEffect } from "react";
import "./BuyingTimeForm.css";

const BuyingTimeForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    deadline: "",
    timeRequirement: "",
    jobType: "",
    skills: [],
    workMode: "Online",
    location: "",
    budgetPerHour: "",
    additionalNotes: "",
    buyer: "Test Buyer", // Replace with dynamic user if needed
  });

  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

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

    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required.";
    if (!formData.deadline.trim()) newErrors.deadline = "Deadline is required.";
    if (!formData.timeRequirement || isNaN(formData.timeRequirement) || Number(formData.timeRequirement) <= 0)
      newErrors.timeRequirement = "Enter a valid number of hours.";
    if (!formData.jobType.trim()) newErrors.jobType = "Job Type is required.";
    if (formData.workMode === "In-Person" && !formData.location.trim())
      newErrors.location = "Location is required.";
    if (!formData.budgetPerHour || isNaN(formData.budgetPerHour) || Number(formData.budgetPerHour) <= 0)
      newErrors.budgetPerHour = "Valid budget is required.";

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    validateForm();

    if (isFormValid) {
      const formattedData = {
        title: formData.title,
        deadline: formData.deadline,
        timeRequirement: Number(formData.timeRequirement),
        jobType: formData.jobType,
        skills: formData.skills,
        workMode: formData.workMode,
        location: formData.workMode === "In-Person" ? formData.location : "",
        budgetPerHour: Number(formData.budgetPerHour),
        description: formData.additionalNotes,
        buyer: formData.buyer,
      };
      onSubmit(formattedData);
    } else {
      alert("Please fill all required fields!");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Buying Time</h2>
          <span className="close-button" onClick={onClose}>
            &#10006;
          </span>
        </div>

        <div className="modal-content">
          <form className="buying-time-form" onSubmit={handleSubmit}>

            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Cleaning, Tutoring"
                className={errors.title ? "input-error" : ""}
              />
              {errors.title && <p className="error-text">{errors.title}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="deadline">Deadline</label>
              <input
                id="deadline"
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className={errors.deadline ? "input-error" : ""}
              />
              {errors.deadline && <p className="error-text">{errors.deadline}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="timeRequirement">Time Requirement (hours)</label>
              <input
                id="timeRequirement"
                type="number"
                name="timeRequirement"
                value={formData.timeRequirement}
                onChange={handleChange}
                placeholder="e.g., 5"
                className={errors.timeRequirement ? "input-error" : ""}
              />
              {errors.timeRequirement && <p className="error-text">{errors.timeRequirement}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="jobType">Job Type</label>
              <select
                id="jobType"
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                className={errors.jobType ? "input-error" : ""}
              >
                <option value="">Select Job Type</option>
                <option value="Tutoring">Tutoring</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Delivery">Delivery</option>
              </select>
              {errors.jobType && <p className="error-text">{errors.jobType}</p>}
            </div>

            <div className="form-group">
              <label>Skills Required</label>
              <label>
                <input
                  type="checkbox"
                  name="skills"
                  value="Cleaning"
                  onChange={handleChange}
                  checked={formData.skills.includes("Cleaning")}
                /> Cleaning
              </label>
              <label>
                <input
                  type="checkbox"
                  name="skills"
                  value="Tutoring"
                  onChange={handleChange}
                  checked={formData.skills.includes("Tutoring")}
                /> Tutoring
              </label>
              <label>
                <input
                  type="checkbox"
                  name="skills"
                  value="Delivery"
                  onChange={handleChange}
                  checked={formData.skills.includes("Delivery")}
                /> Delivery
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="workMode">Work Mode</label>
              <select
                id="workMode"
                name="workMode"
                value={formData.workMode}
                onChange={handleChange}
              >
                <option value="Online">Online</option>
                <option value="In-Person">In-Person</option>
              </select>
            </div>

            {formData.workMode === "In-Person" && (
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Location"
                  className={errors.location ? "input-error" : ""}
                />
                {errors.location && <p className="error-text">{errors.location}</p>}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="budgetPerHour">Budget per Hour (₹)</label>
              <input
                id="budgetPerHour"
                type="number"
                name="budgetPerHour"
                value={formData.budgetPerHour}
                onChange={handleChange}
                className={errors.budgetPerHour ? "input-error" : ""}
              />
              {errors.budgetPerHour && <p className="error-text">{errors.budgetPerHour}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="additionalNotes">Additional Notes</label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                placeholder="Any additional details?"
              />
            </div>

            <div className="form-actions">
              <button type="submit" disabled={!isFormValid}>Submit</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BuyingTimeForm;
