import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Google Apps Script configuration for user registration
const GOOGLE_SHEETS_CONFIG = {
  url: 'https://script.google.com/macros/s/AKfycbxgxHEh_UL4TvjDbqepoFG-uRL-hwl-9LHBTbI-vrJar5_j9YX9oV_OAUVFOdTAz6dNDQ/exec',
  headers: {
    'Content-Type': 'application/json'
  }
};

// Function to sync user registration data to Google Sheets
async function syncUserRegistrationToGoogleSheets(userData) {
  try {
    const payload = {
      role: userData.role,
      organizationName: userData.organization || userData.organizationName || '',
      phone: userData.phone || '',
      address: userData.address || '',
      latitude: userData.latitude || '',
      longitude: userData.longitude || ''
    };

    console.log('Syncing user registration to Google Sheets:', payload);

    const response = await axios.post(
      GOOGLE_SHEETS_CONFIG.url,
      payload,
      { headers: GOOGLE_SHEETS_CONFIG.headers }
    );

    console.log('Google Sheets response:', response.data);

    // Check success condition: response.success == true
    if (response.data && response.data.success === true) {
      console.log('Google Sheets sync successful');
      return { success: true, data: response.data };
    } else {
      console.warn('Google Sheets sync returned non-success response:', response.data);
      return { success: false, error: response.data?.message || 'Google Sheets sync failed' };
    }
  } catch (error) {
    console.error('Google Sheets sync failed:', error.message);
    
    // Extract error message from response if available
    let errorMessage = 'Registration failed';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configure axios defaults
  axios.defaults.baseURL = 'http://localhost:5000/api';
  
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true, user: userData };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      // First, register the user in our local database for authentication
      const response = await axios.post('/auth/register', userData);
      const { token: newToken, user: newUser } = response.data;
      
      // Set authentication state
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // Sync user registration data to Google Sheets (fire and forget)
      const googleSheetsResult = await syncUserRegistrationToGoogleSheets(userData);
      
      if (!googleSheetsResult.success) {
        // If Google Sheets sync fails, return the error message
        return { 
          success: false, 
          error: googleSheetsResult.error || 'Registration failed' 
        };
      }
      
      return { success: true, user: newUser };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};