import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import TVNavigation from './TVNavigation';

interface TVLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  className?: string;
}

const TVLayout: React.FC<TVLayoutProps> = ({ 
  children, 
  currentPage, 
  onNavigate, 
  className = '' 
}) => {
  const pageVariants = {
    initial: { 
      opacity: 0, 
      y: 30,
      scale: 0.98
    },
    enter: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: -30,
      scale: 1.02,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const contentVariants = {
    initial: { opacity: 0, y: 20 },
    enter: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.2,
        ease: 'easeOut'
      }
    }
  };

  return (
    <div className={`tv-layout ${className}`}>
      {/* Background with subtle gradient */}
      <div className="tv-layout-background">
        <div className="background-gradient" />
        <div className="background-noise" />
      </div>

      {/* Navigation */}
      <TVNavigation currentPage={currentPage} onNavigate={onNavigate} />

      {/* Main Content Area */}
      <motion.main 
        className="tv-layout-main"
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        key={currentPage}
      >
        <motion.div 
          className="tv-layout-content"
          variants={contentVariants}
        >
          {children}
        </motion.div>
      </motion.main>

      {/* TV Safe Area Indicators (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="tv-safe-indicators">
          <div className="safe-indicator safe-top" />
          <div className="safe-indicator safe-bottom" />
          <div className="safe-indicator safe-left" />
          <div className="safe-indicator safe-right" />
        </div>
      )}
    </div>
  );
};

export default TVLayout;
