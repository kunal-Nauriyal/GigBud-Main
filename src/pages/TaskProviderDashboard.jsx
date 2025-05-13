import React, { useState, useEffect } from "react";
import "./TaskProviderDashboard.css";
import TaskForm from "./TaskForm";

const TaskProviderDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTaskList, setShowTaskList] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => setShowTaskList(window.innerWidth > 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      const res = await fetch("http://localhost:3000/api/tasks/task/list", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error("Expected JSON response");
      }

      const data = await res.json();
      if (res.ok) {
        setTasks(data.data);
        setSelectedTask(data.data[0] || null);
      } else {
        if (res.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
          return;
        }
        console.error("Error fetching tasks:", data.message);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err.message);
      if (err.message.includes("401")) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    }
  };

  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
    setSelectedTask(newTask);
    setShowTaskForm(false);
  };

  return (
    <div className="heading">
      <h1 className="Headline">Provider Dashboard</h1>
      <div className="dashboard-container">
        <button className="task-list-toggle" onClick={() => setShowTaskList((prev) => !prev)}>
          {showTaskList ? "←" : "→"}
        </button>

        <div className={`task-list ${showTaskList ? "show" : "hide"}`}>
          <div className="task-header">
            <h2>Your Tasks</h2>
            <button className="filter-button" onClick={() => setShowFilters(true)}>Filters</button>
          </div>

          <div className="task-cards-container">
            {tasks.map((task) => (
              <div
                key={task._id}
                className={`task-card ${selectedTask?._id === task._id ? "selected" : ""}`}
                onClick={() => {
                  setSelectedTask(task);
                  if (window.innerWidth <= 768) setShowTaskList(false);
                }}
              >
                <h3>{task.title}</h3>
                <p>Budget: ₹{task.budgetPerHour}</p>
                <p>Deadline: {new Date(task.deadline).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <button className="create-task-button" onClick={() => setShowTaskForm(true)}>+ Create Task</button>
        </div>

        <div className="task-details">
          {selectedTask ? (
            <>
              <h2>Task Details</h2>
              <h3 className="task-title">{selectedTask.title}</h3>
              <p><strong>Description:</strong> {selectedTask.description}</p>
              <p><strong>Budget:</strong> ₹{selectedTask.budgetPerHour}</p>
              <p><strong>Deadline:</strong> {new Date(selectedTask.deadline).toLocaleString()}</p>

              <h3>Applicants</h3>
              {selectedTask.applicants?.length ? (
                <div className="applicants-container">
                  {selectedTask.applicants.map((applicant) => (
                    <div key={applicant._id} className="applicant-card">
                      <div className="applicant-info">
                        <div className="profile-pic-placeholder">Picture</div>
                        <div className="applicant-details">
                          <p className="applicant-name"><strong>{applicant.name}</strong></p>
                          <p className="applicant-meta">{applicant.profession}, {applicant.age}, {applicant.gender}</p>
                          <p className="applicant-price">Proposed Price: ₹{applicant.price}</p>
                          <div className="rating">⭐ {applicant.rating}</div>
                        </div>
                      </div>
                      <button className="chat-button" onClick={() => alert("Chat feature coming soon!")}>Chat</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="Applicants">No Applicants Yet</p>
              )}
            </>
          ) : (
            <p>Select a task to view details</p>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="filter-modal" onClick={() => setShowFilters(false)}>
          <div className="filter-content" onClick={(e) => e.stopPropagation()}>
            <h3>Filter Tasks</h3>
            <button onClick={() => setTasks([...tasks].sort((a, b) => new Date(a.deadline) - new Date(b.deadline)))}>Sort by Date</button>
            <button onClick={() => setTasks([...tasks].sort((a, b) => a.budgetPerHour - b.budgetPerHour))}>Price: Low to High</button>
            <button onClick={() => setTasks([...tasks].sort((a, b) => b.budgetPerHour - a.budgetPerHour))}>Price: High to Low</button>
            <button className="close-button" onClick={() => setShowFilters(false)}>Close</button>
          </div>
        </div>
      )}

      {showTaskForm && (
        <div className="task-form-modal">
          <div className="task-form-content">
            <TaskForm onClose={() => setShowTaskForm(false)} onTaskCreated={handleTaskCreated} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskProviderDashboard;
