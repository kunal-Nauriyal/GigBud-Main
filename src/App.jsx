import React, { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import DashboardNavbar from "./components/DashboardNavbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import TaskProvider from "./pages/TaskProvider";
import TaskProviderDashboard from "./pages/TaskProviderDashboard";
import TimeBuyerDashboard from "./pages/TimeBuyerDashboard";
import TaskReceiverDashboard from "./pages/TaskReceiverDashboard";
import TaskForm from "./pages/Taskform";
import BuyingTimeForm from "./pages/BuyingTimeForm";
import LoginModal from "./pages/LoginModal";

import "./App.css";

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar openLoginModal={openLoginModal} />
        <DashboardNavbar />
        <main className="content">
          <Routes>
            <Route path="/" element={<Home openLoginModal={openLoginModal} />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/task-provider" element={<TaskProvider />} />
            <Route path="/task-provider-dashboard" element={<TaskProviderDashboard />} />
            <Route path="/time-buyer-dashboard" element={<TimeBuyerDashboard />} />
            <Route path="/task-receiver-dashboard" element={<TaskReceiverDashboard />} />
            <Route path="/taskform" element={<TaskForm />} />
            <Route path="/buying-time-form" element={<BuyingTimeForm />} />
          </Routes>
        </main>

        {/* Login Modal */}
        <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
      </div>
    </BrowserRouter>
  );
}

export default App;