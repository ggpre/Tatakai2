import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// WebOS initialization
const initWebOS = () => {
  // Check if running on WebOS
  if ((window as any).webOSTVjs) {
    console.log('Initializing WebOS TV app...');
    
    // Register for system events
    if ((window as any).webOSTVjs.ready) {
      (window as any).webOSTVjs.ready(() => {
        console.log('WebOS TV is ready');
      });
    }
  }
};

// Initialize the app
const initApp = () => {
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Root container not found');
  }

  const root = createRoot(container);
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // Hide loading screen after React app mounts
  setTimeout(() => {
    if ((window as any).hideLoadingScreen) {
      (window as any).hideLoadingScreen();
    }
  }, 1000);
};

// Start the application
document.addEventListener('DOMContentLoaded', () => {
  initWebOS();
  initApp();
});

// Handle WebOS lifecycle events
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('App hidden');
    // Pause video playback, etc.
  } else {
    console.log('App visible');
    // Resume video playback, etc.
  }
});

// Handle WebOS back button
document.addEventListener('keydown', (event) => {
  if (event.keyCode === 461) { // WebOS back button
    event.preventDefault();
    // Handle back navigation
    console.log('WebOS back button pressed');
  }
});

export {};
