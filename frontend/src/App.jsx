// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Chat from "./pages/Chat";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />   {/* Landing page */}
        <Route path="/chat" element={<Chat />} /> {/* Chatbot interface */}
      </Routes>
    </Router>
  );
}