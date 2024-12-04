import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Home } from "../pages/Home";
import { Login } from "../pages/Login";
import { Signup } from "../pages/Signup";
import { Profile } from "../pages/Profile";
import { Logout } from "../pages/Logout";

// Helper function to check authentication status
const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Restrict access to authenticated routes */}
      <Route
        path="/"
        element={isAuthenticated() ? <Home /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/profile"
        element={isAuthenticated() ? <Profile /> : <Navigate to="/login" replace />}
      />
      
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/logout" element={<Logout />} />
    </Routes>
  );
};