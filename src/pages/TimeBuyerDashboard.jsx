import React, { useState, useEffect } from "react";
import "./TimeBuyerDashboard.css";
import BuyingTimeForm from "./BuyingTimeForm";

const API_BASE_URL = "http://localhost:3000/api/tasks";

const TimeBuyerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showBookingList, setShowBookingList] = useState(window.innerWidth > 768);

  useEffect(() => {
    fetchBookings();

    const handleResize = () => setShowBookingList(window.innerWidth > 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        window.location.href = "/login";
        return;
      }

      const response = await fetch(`${API_BASE_URL}/task/list`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setBookings(data.data);
        setSelectedBooking(data.data[0] || null);
      } else {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
          return;
        }
        console.error("Error fetching bookings:", data.message);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error.message);
      if (error.message.includes("401")) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    }
  };

  const handleFormSubmit = (newTask) => {
    setBookings((prev) => [newTask, ...prev]);
    setSelectedBooking(newTask);
    setShowFormModal(false);
  };

  const sortBookings = (criteria) => {
    const sorted = [...bookings];
    if (criteria === "hours") {
      sorted.sort((a, b) => a.timeRequirement - b.timeRequirement);
    } else if (criteria === "priceAsc") {
      sorted.sort((a, b) => a.budgetPerHour - b.budgetPerHour);
    } else if (criteria === "priceDesc") {
      sorted.sort((a, b) => b.budgetPerHour - a.budgetPerHour);
    }
    setBookings(sorted);
  };

  return (
    <div className="heading">
      <h1 className="Headline">Time Buyer Dashboard</h1>

      <div className="dashboard-container">
        <button className="task-list-toggle" onClick={() => setShowBookingList(!showBookingList)}>
          {showBookingList ? "←" : "→"}
        </button>

        {/* Booking List Sidebar */}
        <div className={`task-list ${showBookingList ? "show" : "hide"}`}>
          <div className="task-header">
            <h2>Your Bookings</h2>
            <button className="filter-button" onClick={() => setShowFilterModal(true)}>
              Filters
            </button>
          </div>

          <div className="task-cards-container">
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <div
                  key={booking._id}
                  className={`task-card ${selectedBooking?._id === booking._id ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedBooking(booking);
                    if (window.innerWidth <= 768) setShowBookingList(false);
                  }}
                >
                  <h3>{booking.title}</h3>
                  <p><strong>Deadline:</strong> {new Date(booking.deadline).toLocaleDateString()}</p>
                  <p><strong>Hours:</strong> {booking.timeRequirement}</p>
                  <p><strong>Mode:</strong> {booking.mode}</p>
                  {booking.location?.coordinates && (
                    <p><strong>Location:</strong> [{booking.location.coordinates.join(", ")}]</p>
                  )}
                  <p><strong>Budget per Hour:</strong> ₹{booking.budgetPerHour}</p>
                </div>
              ))
            ) : (
              <p className="no-bookings">No bookings yet.</p>
            )}
          </div>

          <button className="create-task-button" onClick={() => setShowFormModal(true)}>
            + Book Time
          </button>
        </div>

        {/* Booking Detail Section */}
        <div className="task-details">
          <h2>Booking Details</h2>
          {selectedBooking ? (
            <>
              <h3>{selectedBooking.title}</h3>
              <p><strong>Deadline:</strong> {new Date(selectedBooking.deadline).toLocaleDateString()}</p>
              <p><strong>Hours:</strong> {selectedBooking.timeRequirement}</p>
              <p><strong>Mode:</strong> {selectedBooking.mode}</p>
              {selectedBooking.location?.coordinates && (
                <p><strong>Location:</strong> [{selectedBooking.location.coordinates.join(", ")}]</p>
              )}
              <p><strong>Budget per Hour:</strong> ₹{selectedBooking.budgetPerHour}</p>
              <p><strong>Notes:</strong> {selectedBooking.notes || "No notes."}</p>

              <h3>Applicants</h3>
              {selectedBooking.applicants?.length > 0 ? (
                selectedBooking.applicants.map((applicant) => (
                  <div key={applicant._id} className="applicant-card">
                    <p><strong>{applicant.name}</strong></p>
                    <p>⭐ {applicant.rating}</p>
                    <p>Proposed Price: ₹{applicant.proposedPrice}</p>
                    <button
                      className="chat-button"
                      onClick={() => alert("Chat feature coming soon.")}
                    >
                      Chat
                    </button>
                  </div>
                ))
              ) : (
                <p>No applicants yet.</p>
              )}
            </>
          ) : (
            <p>Select a booking to view details.</p>
          )}
        </div>
      </div>

      {/* Booking Form Modal */}
      {showFormModal && (
        <div className="task-form-modal" onClick={() => setShowFormModal(false)}>
          <div className="task-form-content" onClick={(e) => e.stopPropagation()}>
            <BuyingTimeForm onClose={() => setShowFormModal(false)} onSubmit={handleFormSubmit} />
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="filter-modal" onClick={() => setShowFilterModal(false)}>
          <div className="filter-content" onClick={(e) => e.stopPropagation()}>
            <h3>Filter Bookings</h3>
            <button onClick={() => sortBookings("hours")}>Sort by Hours</button>
            <button onClick={() => sortBookings("priceAsc")}>Price: Low to High</button>
            <button onClick={() => sortBookings("priceDesc")}>Price: High to Low</button>
            <button className="close-button" onClick={() => setShowFilterModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeBuyerDashboard;
