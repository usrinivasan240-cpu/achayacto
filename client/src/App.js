import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import DonorDashboard from './components/Dashboard/DonorDashboard';
import NGODashboard from './components/Dashboard/NGODashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import Navigation from './components/Layout/Navigation';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const renderDashboard = () => {
    if (!user) return <Navigate to="/login" />;
    
    switch (user.role) {
      case 'donor':
        return <DonorDashboard user={user} onLogout={handleLogout} />;
      case 'ngo':
        return <NGODashboard user={user} onLogout={handleLogout} />;
      case 'admin':
        return <AdminDashboard user={user} onLogout={handleLogout} />;
      default:
        return <Navigate to="/login" />;
    }
  };

  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            {isAuthenticated && <Navigation user={user} onLogout={handleLogout} />}
            <Routes>
              <Route 
                path="/login" 
                element={
                  isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
                } 
              />
              <Route 
                path="/register" 
                element={
                  isAuthenticated ? <Navigate to="/dashboard" /> : <Register onLogin={handleLogin} />
                } 
              />
              <Route 
                path="/dashboard" 
                element={renderDashboard()} 
              />
              <Route 
                path="/" 
                element={
                  isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
                } 
              />
            </Routes>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;