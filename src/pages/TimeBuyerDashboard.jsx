import React, { useState, useEffect } from "react";
import "./TimeBuyerDashboard.css";
import BuyingTimeForm from "./BuyingTimeForm"; // Import the Buying Time Form

const TimeBuyerDashboard = () => {
  const [timeBookings, setTimeBookings] = useState([
    {
      id: 1,
      buyer: "Rahul Sharma",
      hours: 5,
      workMode: "Online",
      jobType: "Coding Tutor",
      skills: ["JavaScript", "React"],
      location: "",
      budgetPerHour: 300,
      applicants: [
        { id: 1, name: "Amit Verma", rating: 4.5, price: 280 },
        { id: 2, name: "Sneha Gupta", rating: 4.8, price: 320 },
      ],
    },
    {
      id: 2,
      buyer: "Priya Verma",
      hours: 3,
      workMode: "In-Person",
      jobType: "Personal Trainer",
      skills: ["Fitness", "Diet Planning"],
      location: "Delhi",
      budgetPerHour: 500,
      applicants: [
        { id: 3, name: "Ravi Mehta", rating: 4.6, price: 450 },
        { id: 4, name: "Neha Singh", rating: 4.9, price: 490 },
      ],
    },
  ]);

  const [selectedBooking, setSelectedBooking] = useState(timeBookings[0] || null);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [showBookingList, setShowBookingList] = useState(window.innerWidth > 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setShowBookingList(window.innerWidth > 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleBookingList = () => {
    setShowBookingList(!showBookingList);
  };

  const handleFormSubmit = (newBooking) => {
    setTimeBookings([...timeBookings, { id: timeBookings.length + 1, ...newBooking }]);
    setShowForm(false);
  };

  return (
    <div className="heading">
      <h1 className="Headline">Time Buyer Dashboard</h1>

      <div className="dashboard-container">
        {/* Toggle Button (Mobile) */}
        <button 
          className="task-list-toggle"
          onClick={toggleBookingList}
          aria-label={showBookingList ? "Hide Booking List" : "Show Booking List"}
        >
          {showBookingList ? "←" : "→"}
        </button>

        {/* Booking List */}
        <div className={`task-list ${showBookingList ? "show" : "hide"}`}>
          <div className="task-header">
            <h2>Your Bookings</h2>
            <button className="filter-button" onClick={() => setShowFilters(true)}>Filters</button>
          </div>

          <div className="task-cards-container">
            {timeBookings.map((booking) => (
              <div 
                key={booking.id} 
                className={`task-card ${selectedBooking?.id === booking.id ? "selected" : ""}`}
                onClick={() => {
                  setSelectedBooking(booking);
                  if (window.innerWidth <= 768) {
                    setShowBookingList(false);
                  }
                }}
              >
                <h3>{booking.jobType}</h3>
                <p><strong>Buyer:</strong> {booking.buyer}</p>
                <p><strong>Hours:</strong> {booking.hours}</p>
                <p><strong>Mode:</strong> {booking.workMode}</p>
                {booking.location && <p><strong>Location:</strong> {booking.location}</p>}
                <p><strong>Budget per Hour:</strong> ₹{booking.budgetPerHour}</p>
              </div>
            ))}
          </div>

          <button className="create-task-button" onClick={() => setShowForm(true)}>+ Book Time</button>
        </div>

        {/* Booking Details */}
        <div className="task-details">
          <h2>Booking Details</h2>
          {selectedBooking ? (
            <>
              <h3>{selectedBooking.jobType}</h3>
              <p><strong>Buyer:</strong> {selectedBooking.buyer}</p>
              <p><strong>Hours:</strong> {selectedBooking.hours}</p>
              <p><strong>Mode:</strong> {selectedBooking.workMode}</p>
              {selectedBooking.location && <p><strong>Location:</strong> {selectedBooking.location}</p>}
              <p><strong>Budget per Hour:</strong> ₹{selectedBooking.budgetPerHour}</p>

              <h3>Applicants</h3>
              {selectedBooking.applicants.length > 0 ? (
                selectedBooking.applicants.map((applicant) => (
                  <div key={applicant.id} className="applicant-card">
                    <p><strong>{applicant.name}</strong></p>
                    <p>⭐ {applicant.rating}</p>
                    <p>Proposed Price: ₹{applicant.price}</p>
                    <button 
                      className="chat-button" 
                      onClick={() => alert("This feature will be available in a future update.")}
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

      {/* Time Buying Form Modal */}
      {showForm && (
        <div className="task-form-modal" onClick={() => setShowForm(false)}>
          <div className="task-form-content" onClick={(e) => e.stopPropagation()}>
            <BuyingTimeForm onClose={() => setShowForm(false)} onSubmit={handleFormSubmit} />
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilters && (
        <div className="filter-modal" onClick={() => setShowFilters(false)}>
          <div className="filter-content" onClick={(e) => e.stopPropagation()}>
            <h3>Filter Bookings</h3>
            <button onClick={() => setTimeBookings([...timeBookings].sort((a, b) => a.hours - b.hours))}>Sort by Hours</button>
            <button onClick={() => setTimeBookings([...timeBookings].sort((a, b) => a.budgetPerHour - b.budgetPerHour))}>Price: Low to High</button>
            <button onClick={() => setTimeBookings([...timeBookings].sort((a, b) => b.budgetPerHour - a.budgetPerHour))}>Price: High to Low</button>
            <button className="close-button" onClick={() => setShowFilters(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeBuyerDashboard;
