import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'circle' | 'banner' | 'thumbnail';
  width?: string | number;
  height?: string | number;
  count?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'text',
  width,
  height,
  count = 1
}) => {
  const getSkeletonClass = () => {
    switch (variant) {
      case 'text':
        return 'skeleton-text';
      case 'card':
        return 'skeleton-card';
      case 'circle':
        return 'skeleton-circle';
      case 'banner':
        return 'skeleton-banner';
      case 'thumbnail':
        return 'skeleton-thumbnail';
      default:
        return 'skeleton-text';
    }
  };

  const skeletonStyle = {
    width: width || undefined,
    height: height || undefined,
  };

  const shimmerVariants = {
    hidden: { x: '-100%' },
    visible: { 
      x: '100%',
      transition: {
        duration: 1.5,
        ease: 'linear',
        repeat: Infinity,
      }
    }
  };

  const renderSkeleton = (index: number) => (
    <div 
      key={index}
      className={`skeleton ${getSkeletonClass()} ${className}`}
      style={skeletonStyle}
    >
      <motion.div
        className="skeleton-shimmer"
        variants={shimmerVariants}
        initial="hidden"
        animate="visible"
      />
    </div>
  );

  return (
    <>
      {Array.from({ length: count }, (_, index) => renderSkeleton(index))}
    </>
  );
};

// Specialized skeleton components for different sections
export const HeroSkeleton: React.FC = () => (
  <div className="hero-skeleton">
    <div className="hero-skeleton-content">
      <Skeleton variant="text" width="200px" height="24px" />
      <Skeleton variant="text" width="600px" height="48px" />
      <Skeleton variant="text" width="400px" height="20px" count={3} />
      <div className="hero-skeleton-buttons">
        <Skeleton variant="card" width="150px" height="50px" />
        <Skeleton variant="card" width="150px" height="50px" />
      </div>
    </div>
    <div className="hero-skeleton-image">
      <Skeleton variant="banner" />
    </div>
  </div>
);

export const CarouselSkeleton: React.FC<{ title?: boolean }> = ({ title = true }) => (
  <div className="carousel-skeleton">
    {title && (
      <div className="carousel-skeleton-header">
        <Skeleton variant="text" width="250px" height="32px" />
      </div>
    )}
    <div className="carousel-skeleton-items">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="carousel-skeleton-item">
          <Skeleton variant="thumbnail" />
          <Skeleton variant="text" width="100%" height="16px" />
          <Skeleton variant="text" width="70%" height="14px" />
        </div>
      ))}
    </div>
  </div>
);

export const Top10Skeleton: React.FC = () => (
  <div className="top10-skeleton">
    <div className="top10-skeleton-header">
      <Skeleton variant="text" width="200px" height="32px" />
      <div className="top10-skeleton-tabs">
        <Skeleton variant="card" width="80px" height="32px" count={3} />
      </div>
    </div>
    <div className="top10-skeleton-list">
      {Array.from({ length: 10 }, (_, index) => (
        <div key={index} className="top10-skeleton-item">
          <div className="top10-skeleton-rank">
            <Skeleton variant="text" width="20px" height="24px" />
          </div>
          <Skeleton variant="thumbnail" width="60px" height="90px" />
          <div className="top10-skeleton-info">
            <Skeleton variant="text" width="200px" height="18px" />
            <Skeleton variant="text" width="150px" height="14px" />
            <Skeleton variant="text" width="100px" height="14px" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const GridSkeleton: React.FC<{ columns?: number; rows?: number }> = ({ 
  columns = 4, 
  rows = 3 
}) => (
  <div className="grid-skeleton" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
    {Array.from({ length: columns * rows }, (_, index) => (
      <div key={index} className="grid-skeleton-item">
        <Skeleton variant="thumbnail" />
        <Skeleton variant="text" width="100%" height="16px" />
        <Skeleton variant="text" width="70%" height="14px" />
      </div>
    ))}
  </div>
);

export const LoadingScreen: React.FC = () => (
  <div className="loading-screen">
    <div className="loading-content">
      {/* Hero Section Skeleton */}
      <HeroSkeleton />
      
      {/* Carousel Skeletons */}
      <CarouselSkeleton />
      <CarouselSkeleton />
      
      {/* Top 10 Skeleton */}
      <Top10Skeleton />
      
      {/* More Carousels */}
      <CarouselSkeleton />
      <CarouselSkeleton />
    </div>
  </div>
);

export default Skeleton;
