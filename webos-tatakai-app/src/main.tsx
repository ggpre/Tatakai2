import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Hide loading screen when React is ready
const hideLoadingScreen = () => {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    loadingScreen.style.transition = 'opacity 0.5s ease-out';
    setTimeout(() => {
      loadingScreen.remove();
    }, 500);
  }
};

// WebOS specific initialization
const initWebOS = () => {
  // Set up WebOS TV specific features
  if (typeof window !== 'undefined' && 'webOSTV' in window) {
    console.log('WebOS TV detected');
    
    // Hide loading screen after WebOS is ready
    if ((window as any).webOSTV.platformBack) {
      (window as any).webOSTV.platformBack.getMenuKey = () => {
        // Handle menu key press
        console.log('Menu key pressed');
      };
    }
  }
  
  // Always hide loading screen after a maximum timeout
  setTimeout(hideLoadingScreen, 1000);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Initialize WebOS features when DOM is ready
document.addEventListener('DOMContentLoaded', initWebOS);

// Also initialize immediately in case DOMContentLoaded already fired
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWebOS);
} else {
  initWebOS();
}