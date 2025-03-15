import React, { useState, useEffect } from "react";
import "./BuyingTimeForm.css";

const BuyingTimeForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    timeRequirement: "",
    jobType: "",
    skills: [],
    workMode: "Online",
    location: "",
    budgetPerHour: "",
    additionalNotes: "",
  });

  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    validateForm();
  }, [formData]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prevData) => ({
        ...prevData,
        skills: checked
          ? [...prevData.skills, value]
          : prevData.skills.filter((skill) => skill !== value),
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Validate form fields
  const validateForm = () => {
    let newErrors = {};

    if (!formData.timeRequirement.trim()) newErrors.timeRequirement = "Time Requirement is required.";
    if (!formData.jobType.trim()) newErrors.jobType = "Job Type is required.";
    if (formData.workMode === "In-Person" && !formData.location.trim()) newErrors.location = "Location is required.";
    if (!formData.budgetPerHour.trim() || formData.budgetPerHour <= 0) newErrors.budgetPerHour = "Valid budget is required.";

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid) {
      alert("Buying Time Task successfully submitted! ✅");
      setFormData({
        timeRequirement: "",
        jobType: "",
        skills: [],
        workMode: "Online",
        location: "",
        budgetPerHour: "",
        additionalNotes: "",
      });
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
          <h2>Buying Time</h2>
          <span className="close-button" onClick={onClose}>&#10006;</span>
        </div>

        {/* Scrollable Form */}
        <div className="modal-content">
          <form className="buying-time-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Time Requirement</label>
              <input
                type="text"
                name="timeRequirement"
                placeholder="Select hours or days"
                value={formData.timeRequirement}
                onChange={handleChange}
                className={errors.timeRequirement ? "input-error" : ""}
              />
              {errors.timeRequirement && <p className="error-text">{errors.timeRequirement}</p>}
            </div>

            <div className="form-group">
              <label>Job Type (Dropdown / Description)</label>
              <input
                type="text"
                name="jobType"
                placeholder="E.g., Personal Assistance, Technical Work"
                value={formData.jobType}
                onChange={handleChange}
                className={errors.jobType ? "input-error" : ""}
              />
              {errors.jobType && <p className="error-text">{errors.jobType}</p>}
            </div>

            <div className="form-group">
              <label>Preferred Skills (Checkboxes)</label>
              <div className="checkbox-group">
                {["Communication", "Technical", "Cooking", "Driving", "Writing", "Cleaning"].map((skill) => (
                  <label key={skill}>
                    <input
                      type="checkbox"
                      value={skill}
                      checked={formData.skills.includes(skill)}
                      onChange={handleChange}
                    />
                    {skill}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Work Mode</label>
              <select name="workMode" value={formData.workMode} onChange={handleChange}>
                <option>Online</option>
                <option>In-Person</option>
              </select>
            </div>

            {formData.workMode === "In-Person" && (
              <div className="form-group">
                <label>Location (If In-Person)</label>
                <input
                  type="text"
                  name="location"
                  placeholder="Enter location"
                  value={formData.location}
                  onChange={handleChange}
                  className={errors.location ? "input-error" : ""}
                />
                {errors.location && <p className="error-text">{errors.location}</p>}
              </div>
            )}

            <div className="form-group">
              <label>Budget per Hour</label>
              <input
                type="number"
                name="budgetPerHour"
                placeholder="Enter budget"
                value={formData.budgetPerHour}
                onChange={handleChange}
                className={errors.budgetPerHour ? "input-error" : ""}
              />
              {errors.budgetPerHour && <p className="error-text">{errors.budgetPerHour}</p>}
            </div>

            <div className="form-group">
              <label>Additional Notes (Optional)</label>
              <textarea
                name="additionalNotes"
                placeholder="Any special instructions..."
                value={formData.additionalNotes}
                onChange={handleChange}
              />
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

export default BuyingTimeForm;
