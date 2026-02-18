import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import MayorDashboard from './pages/MayorDashboard';

import { useAuth } from './context/AuthContext';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={user ? (user.role === 'mayor' ? "/admin" : "/dashboard") : "/login"} />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'mayor' ? "/admin" : "/dashboard"} />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to={user.role === 'mayor' ? "/admin" : "/dashboard"} />} />

        <Route
          path="/dashboard"
          element={user && user.role !== 'mayor' ? <UserDashboard /> : <Navigate to="/login" />}
        />

        <Route
          path="/admin"
          element={user && user.role === 'mayor' ? <MayorDashboard /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
