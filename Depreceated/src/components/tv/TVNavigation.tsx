import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Search, 
  Tv, 
  Film, 
  TrendingUp, 
  Settings, 
  User,
  Gamepad2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CircleDot,
  RotateCcw,
  Volume2,
  Play,
  Pause,
  FastForward,
  Rewind,
  X
} from 'lucide-react';
import { REMOTE_KEYS } from '@/context/RemoteNavigationContext';

interface TVNavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const TVNavigation: React.FC<TVNavigationProps> = ({ currentPage, onNavigate }) => {
  const [showRemoteGuide, setShowRemoteGuide] = useState(false);
  const [selectedNavItem, setSelectedNavItem] = useState(0);

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home, page: 'home' },
    { id: 'search', label: 'Search', icon: Search, page: 'search' },
    { id: 'trending', label: 'Trending', icon: TrendingUp, page: 'trending' },
    { id: 'movies', label: 'Movies', icon: Film, page: 'movies' },
    { id: 'tv-series', label: 'TV Series', icon: Tv, page: 'tv-series' },
    { id: 'settings', label: 'Settings', icon: Settings, page: 'settings' },
  ];

  const remoteControls = [
    {
      category: 'Navigation',
      controls: [
        { key: '↑ ↓ ← →', description: 'Navigate between items', icon: ArrowUp },
        { key: 'OK/Enter', description: 'Select item', icon: CircleDot },
        { key: 'Back', description: 'Go back', icon: RotateCcw },
      ]
    },
    {
      category: 'Media Controls',
      controls: [
        { key: 'Play/Pause', description: 'Play or pause video', icon: Play },
        { key: 'Forward', description: 'Fast forward', icon: FastForward },
        { key: 'Rewind', description: 'Rewind', icon: Rewind },
        { key: 'Volume', description: 'Adjust volume', icon: Volume2 },
      ]
    },
    {
      category: 'Quick Actions',
      controls: [
        { key: 'Red Button', description: 'Search', icon: Search },
        { key: 'Green Button', description: 'Home', icon: Home },
        { key: 'Yellow Button', description: 'Settings', icon: Settings },
        { key: 'Blue Button', description: 'Remote Guide', icon: Gamepad2 },
      ]
    }
  ];

  // Handle navigation with arrow keys
  useEffect(() => {
    const handleNavigation = (event: KeyboardEvent) => {
      if (showRemoteGuide) {
        if (event.keyCode === REMOTE_KEYS.BACK || event.keyCode === REMOTE_KEYS.BLUE) {
          setShowRemoteGuide(false);
          event.preventDefault();
        }
        return;
      }

      switch (event.keyCode) {
        case REMOTE_KEYS.LEFT:
          setSelectedNavItem(prev => Math.max(0, prev - 1));
          event.preventDefault();
          break;
        case REMOTE_KEYS.RIGHT:
          setSelectedNavItem(prev => Math.min(navigationItems.length - 1, prev + 1));
          event.preventDefault();
          break;
        case REMOTE_KEYS.ENTER:
        case REMOTE_KEYS.OK:
          onNavigate(navigationItems[selectedNavItem].page);
          event.preventDefault();
          break;
        case REMOTE_KEYS.BLUE:
          setShowRemoteGuide(true);
          event.preventDefault();
          break;
      }
    };

    document.addEventListener('keydown', handleNavigation);
    return () => document.removeEventListener('keydown', handleNavigation);
  }, [selectedNavItem, showRemoteGuide, onNavigate, navigationItems]);

  // Set selected item based on current page
  useEffect(() => {
    const currentIndex = navigationItems.findIndex(item => item.page === currentPage);
    if (currentIndex !== -1) {
      setSelectedNavItem(currentIndex);
    }
  }, [currentPage, navigationItems]);

  return (
    <>
      {/* Main Navigation Bar */}
      <motion.nav 
        className="tv-navigation"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="nav-container">
          {/* Logo */}
          <motion.div 
            className="nav-logo"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <div className="logo-glass">
              <span className="logo-text">Tatakai</span>
              <div className="logo-accent"></div>
            </div>
          </motion.div>

          {/* Navigation Items */}
          <div className="nav-items">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentPage === item.page;
              const isSelected = selectedNavItem === index;
              
              return (
                <motion.button
                  key={item.id}
                  className={`nav-item ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''}`}
                  data-focusable="true"
                  data-focus-id={`nav-${item.id}`}
                  onClick={() => onNavigate(item.page)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <div className="nav-item-content">
                    <Icon size={20} className="nav-item-icon" />
                    <span className="nav-item-label">{item.label}</span>
                  </div>
                  {isActive && (
                    <motion.div 
                      className="nav-item-indicator"
                      layoutId="nav-indicator"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* User Profile & Remote Guide */}
          <div className="nav-actions">
            <motion.button
              className="nav-action-btn"
              data-focusable="true"
              data-focus-id="remote-guide-btn"
              onClick={() => setShowRemoteGuide(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Remote Control Guide (Blue Button)"
            >
              <Gamepad2 size={20} />
            </motion.button>
            
            <motion.button
              className="nav-action-btn user-profile"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <User size={20} />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Remote Control Guide Popup */}
      <AnimatePresence>
        {showRemoteGuide && (
          <motion.div
            className="remote-guide-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowRemoteGuide(false)}
          >
            <motion.div
              className="remote-guide-modal"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="modal-title-section">
                  <Gamepad2 size={28} className="modal-icon" />
                  <h2 className="modal-title">Remote Control Guide</h2>
                </div>
                <button
                  className="modal-close-btn"
                  onClick={() => setShowRemoteGuide(false)}
                >
                  <X size={24} />
                </button>
              </div>

              <div className="modal-content">
                {remoteControls.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="control-category">
                    <h3 className="category-title">{category.category}</h3>
                    <div className="controls-grid">
                      {category.controls.map((control, controlIndex) => {
                        const ControlIcon = control.icon;
                        return (
                          <motion.div
                            key={controlIndex}
                            className="control-item"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: categoryIndex * 0.1 + controlIndex * 0.05 }}
                          >
                            <div className="control-key">
                              <ControlIcon size={20} className="control-icon" />
                              <span className="key-label">{control.key}</span>
                            </div>
                            <span className="control-description">{control.description}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-footer">
                <p className="footer-text">Press <strong>Blue Button</strong> anytime to toggle this guide</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TVNavigation;
