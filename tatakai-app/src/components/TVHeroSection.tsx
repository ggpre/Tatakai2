'use client';

import { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { ChevronLeft, ChevronRight, Play, Plus, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Anime {
  id: string;
  name: string;
  poster: string;
  description: string;
  type: string;
  episodes?: {
    sub?: number;
    dub?: number;
  };
}

interface TVHeroSectionProps {
  spotlightAnimes?: Anime[];
}

export default function TVHeroSection({ spotlightAnimes = [] }: TVHeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { registerElement, unregisterElement } = useNavigation();
  const router = useRouter();

  // Refs for navigation elements
  const playRef = useRef<HTMLButtonElement>(null);
  const infoRef = useRef<HTMLButtonElement>(null);
  const addRef = useRef<HTMLButtonElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // Ensure currentIndex is within bounds
  const safeCurrentIndex = Math.min(currentIndex, Math.max(0, spotlightAnimes.length - 1));
  const currentAnime = spotlightAnimes.length > 0 ? spotlightAnimes[safeCurrentIndex] : null;

  // Auto-rotate spotlight every 8 seconds
  useEffect(() => {
    if (spotlightAnimes.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % spotlightAnimes.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [spotlightAnimes.length]);

  // Register navigation elements
  useEffect(() => {
    if (playRef.current) registerElement('hero-play', playRef.current);
    if (infoRef.current) registerElement('hero-info', infoRef.current);
    if (addRef.current) registerElement('hero-add', addRef.current);
    if (prevRef.current) registerElement('hero-prev', prevRef.current);
    if (nextRef.current) registerElement('hero-next', nextRef.current);

    return () => {
      unregisterElement('hero-play');
      unregisterElement('hero-info');
      unregisterElement('hero-add');
      unregisterElement('hero-prev');
      unregisterElement('hero-next');
    };
  }, [registerElement, unregisterElement]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? spotlightAnimes.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % spotlightAnimes.length);
  };

  const handlePlay = () => {
    if (currentAnime) {
      router.push(`/anime/${currentAnime.id}`);
    }
  };

  const handleInfo = () => {
    if (currentAnime) {
      router.push(`/anime/${currentAnime.id}`);
    }
  };

  // No early return - render conditionally inside JSX
  return (
    <div className="tv-hero-section">
      {!currentAnime ? (
        <div className="tv-hero-loading">
          <div className="tv-hero-content">
            <h2>No Featured Anime Available</h2>
          </div>
        </div>
      ) : (
        <>
          {/* Background Image */}
          <div 
            className="tv-hero-background"
            style={{
              backgroundImage: `url(${currentAnime.poster})`,
            }}
          >
            <div className="tv-hero-overlay" />
          </div>

          {/* Content */}
          <div className="tv-hero-content">
            <div className="tv-hero-info">
              <h1 className="tv-hero-title">{currentAnime.name}</h1>
              
              <div className="tv-hero-meta">
                <span className="tv-hero-type">{currentAnime.type}</span>
                {currentAnime.episodes && (
                  <>
                    {currentAnime.episodes.sub && (
                      <span className="tv-hero-episodes">SUB: {currentAnime.episodes.sub}</span>
                    )}
                    {currentAnime.episodes.dub && (
                      <span className="tv-hero-episodes">DUB: {currentAnime.episodes.dub}</span>
                    )}
                  </>
                )}
              </div>

              <p className="tv-hero-description">
                {currentAnime.description?.length > 200 
                  ? `${currentAnime.description.substring(0, 200)}...`
                  : currentAnime.description
                }
              </p>

              {/* Action Buttons */}
              <div className="tv-hero-actions">
                <button 
                  ref={playRef}
                  className="tv-hero-btn tv-hero-btn-primary"
                  onClick={handlePlay}
                >
                  <Play className="tv-hero-btn-icon" />
                  Watch Now
                </button>
                
                <button 
                  ref={infoRef}
                  className="tv-hero-btn tv-hero-btn-secondary"
                  onClick={handleInfo}
                >
                  <Info className="tv-hero-btn-icon" />
                  More Info
                </button>
                
                <button 
                  ref={addRef}
                  className="tv-hero-btn tv-hero-btn-secondary"
                >
                  <Plus className="tv-hero-btn-icon" />
                  My List
                </button>
              </div>
            </div>

            {/* Navigation Controls */}
            {spotlightAnimes.length > 1 && (
              <div className="tv-hero-navigation">
                <button 
                  ref={prevRef}
                  className="tv-hero-nav-btn"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="tv-hero-nav-icon" />
                </button>
                
                <div className="tv-hero-indicators">
                  {spotlightAnimes.map((_, index) => (
                    <div
                      key={index}
                      className={`tv-hero-indicator ${index === safeCurrentIndex ? 'active' : ''}`}
                    />
                  ))}
                </div>
                
                <button 
                  ref={nextRef}
                  className="tv-hero-nav-btn"
                  onClick={handleNext}
                >
                  <ChevronRight className="tv-hero-nav-icon" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
