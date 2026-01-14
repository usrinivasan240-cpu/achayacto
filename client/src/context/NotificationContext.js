import React, { createContext, useState, useContext, useEffect } from 'react';
import { io } from 'socket.io-client';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    // Listen for new donations
    newSocket.on('new_donation', (data) => {
      addNotification({
        type: 'success',
        title: 'New Food Donation Available',
        message: `${data.title} is now available nearby`,
        data
      });
    });

    // Listen for donation claims
    newSocket.on('donation_claimed', (data) => {
      addNotification({
        type: 'info',
        title: 'Donation Claimed',
        message: 'Your donation has been claimed by an NGO',
        data
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const addNotification = (notification) => {
    const id = Date.now();
    const newNotification = { ...notification, id, timestamp: new Date() };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearNotifications,
      socket
    }}>
      {children}
    </NotificationContext.Provider>
  );
};