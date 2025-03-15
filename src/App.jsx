import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Services from "./pages/Services";
import TaskProvider from "./pages/TaskProvider"; // Task Provider Page
import TaskProviderDashboard from "./pages/TaskProviderDashboard"; // Task Provider Dashboard
import TimeBuyerDashboard from "./pages/TimeBuyerDashboard"; // Time Buyer Dashboard
import TaskReceiverDashboard from "./pages/TaskReceiverDashboard"; // Task Receiver Dashboard (Newly Added)
import TaskForm from "./pages/Taskform";
import BuyingTimeForm from "./pages/BuyingTimeForm"; // Renamed TaskForm1 for clarity
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/task-provider" element={<TaskProvider />} />
            <Route path="/task-provider-dashboard" element={<TaskProviderDashboard />} />
            <Route path="/time-buyer-dashboard" element={<TimeBuyerDashboard />} />
            <Route path="/task-receiver-dashboard" element={<TaskReceiverDashboard />} /> {/* Added Task Receiver Dashboard */}
            <Route path="/taskform" element={<TaskForm />} />
            <Route path="/buying-time-form" element={<BuyingTimeForm />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
