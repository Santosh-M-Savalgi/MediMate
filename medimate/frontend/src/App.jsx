import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './styles/components.css';
import './styles/layout.css';

import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Posts from './components/Posts.jsx';
import Appointments from './components/Appointments.jsx';
import Chat from './components/Chat.jsx';
import Ratings from './components/Ratings.jsx';
import Comments from './components/Comments.jsx';
import Dashboard from './components/Dashboard.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { ToastProvider } from './components/ToastContext.jsx';

function App() {
  return (
    <ToastProvider>
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route
        path="/posts"
        element={
          <ProtectedRoute>
            <Navbar />
            <Posts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <Navbar />
            <Appointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Navbar />
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ratings"
        element={
          <ProtectedRoute>
            <Navbar />
            <Ratings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/comments"
        element={
          <ProtectedRoute>
            <Navbar />
            <Comments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Navbar />
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Redirect root "/" to "/login" */}
      <Route path="/" element={<Navigate to="/login" />} />
      {/* Optional: catch-all unknown routes */}
      <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </ToastProvider>
  );
}

export default App;
