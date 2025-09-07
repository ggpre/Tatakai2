'use client';

import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigation } from '@/contexts/NavigationContext';
import TVAnimeCard from './TVAnimeCard';

interface Anime {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  year?: number;
  rating?: number;
  episode?: number;
  duration?: string;
  status?: string;
}

interface TVCarouselProps {
  title: string;
  animes: Anime[];
  onAnimeClick?: (anime: Anime) => void;
}

const TVCarousel: React.FC<TVCarouselProps> = ({ title, animes, onAnimeClick }) => {
  const { registerElement, unregisterElement } = useNavigation();
  const carouselRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  if (!animes || animes.length === 0) {
    return null;
  }

  const carouselId = title.replace(/\s+/g, '-').toLowerCase();

  useEffect(() => {
    // Register all cards in this carousel for navigation
    animes.forEach((anime, index) => {
      const cardId = `${carouselId}-card-${index}`;
      setTimeout(() => {
        const element = document.querySelector(`[data-carousel-card="${cardId}"]`) as HTMLElement;
        if (element) {
          registerElement(cardId, element);
        }
      }, 100);
    });

    return () => {
      animes.forEach((anime, index) => {
        const cardId = `${carouselId}-card-${index}`;
        unregisterElement(cardId);
      });
    };
  }, [animes, registerElement, unregisterElement, carouselId]);

  const scrollLeft = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <div className="tv-carousel" ref={carouselRef}>
      <div className="tv-carousel__header">
        <h2 className="tv-carousel__title">{title}</h2>
        <div className="tv-carousel__controls">
          <button 
            className="tv-carousel__button"
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            className="tv-carousel__button"
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      <div className="tv-carousel__container">
        <div className="tv-carousel__track" ref={trackRef}>
          {animes.map((anime, index) => (
            <div 
              key={`${carouselId}-${anime.id}-${index}`}
              className="tv-carousel__slide"
              data-carousel-card={`${carouselId}-card-${index}`}
            >
              <TVAnimeCard
                anime={anime}
                onClick={() => onAnimeClick?.(anime)}
                index={index}
                carouselId={carouselId}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TVCarousel;
