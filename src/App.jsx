import React, { useState } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import TaskProvider from "./pages/TaskProvider";
import TaskProviderDashboard from "./pages/TaskProviderDashboard";
import TimeBuyerDashboard from "./pages/TimeBuyerDashboard";
import TaskReceiverDashboard from "./pages/TaskReceiverDashboard";
import TaskForm from "./pages/Taskform";
import BuyingTimeForm from "./pages/BuyingTimeForm";
import LoginModal from "./pages/Login";
import Profile from "./pages/Profile";
import { useAuth } from "./context/AuthContext";
import "./App.css";

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isLoggedIn, logout, initialCheckDone } = useAuth();

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  if (!initialCheckDone) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar
          openLoginModal={openLoginModal}
          isLoggedIn={isLoggedIn}
          handleLogout={logout}
        />

        <main className="content" style={{ paddingTop: "70px" }}>
          <Routes>
            <Route path="/" element={<Home openLoginModal={openLoginModal} />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route 
              path="/task-provider" 
              element={isLoggedIn ? <TaskProvider /> : <Navigate to="/" />} 
            />
            <Route 
              path="/task-provider-dashboard" 
              element={isLoggedIn ? <TaskProviderDashboard /> : <Navigate to="/" />} 
            />
            <Route 
              path="/time-buyer-dashboard" 
              element={isLoggedIn ? <TimeBuyerDashboard /> : <Navigate to="/" />} 
            />
            <Route 
              path="/task-receiver-dashboard" 
              element={isLoggedIn ? <TaskReceiverDashboard /> : <Navigate to="/" />} 
            />
            <Route 
              path="/taskform" 
              element={isLoggedIn ? <TaskForm /> : <Navigate to="/" />} 
            />
            <Route 
              path="/buying-time-form" 
              element={isLoggedIn ? <BuyingTimeForm /> : <Navigate to="/" />} 
            />
            <Route 
              path="/profile" 
              element={isLoggedIn ? <Profile /> : <Navigate to="/" />} 
            />
          </Routes>
        </main>

        <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
      </div>
    </BrowserRouter>
  );
}

export default App;