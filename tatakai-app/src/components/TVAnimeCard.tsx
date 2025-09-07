'use client';

import React, { useRef, useEffect } from 'react';
import { Play, Star, Clock } from 'lucide-react';
import { useNavigation } from '@/contexts/NavigationContext';

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

interface TVAnimeCardProps {
  anime: Anime;
  onClick?: () => void;
  index: number;
  carouselId: string;
}

const TVAnimeCard: React.FC<TVAnimeCardProps> = ({ anime, onClick, index, carouselId }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { registerElement, unregisterElement } = useNavigation();
  const cardId = `${carouselId}-card-${index}`;

  useEffect(() => {
    if (cardRef.current) {
      registerElement(cardId, cardRef.current);
    }

    return () => {
      unregisterElement(cardId);
    };
  }, [cardId, registerElement, unregisterElement]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      ref={cardRef}
      className="tv-card"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Watch ${anime.title}`}
    >
      {/* Card Image */}
      <div className="tv-card__image">
        <img
          src={anime.image}
          alt={anime.title}
          className="tv-card__image"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-anime.jpg';
          }}
        />
        
        {/* Overlay with Play Button */}
        <div className="tv-card__overlay">
          <div className="tv-card__play">
            <Play className="w-8 h-8" />
          </div>
        </div>
      </div>
      
      {/* Card Content */}
      <div className="tv-card__content">
        <h3 className="tv-card__title">{anime.title}</h3>
        
        {anime.subtitle && (
          <p className="tv-card__subtitle">{anime.subtitle}</p>
        )}
        
        <div className="tv-card__meta">
          {anime.status && (
            <span className="tv-card__badge">{anime.status}</span>
          )}
          
          <div className="tv-card__info">
            {anime.rating && (
              <div className="tv-card__rating">
                <Star className="w-3 h-3" />
                <span>{anime.rating}</span>
              </div>
            )}
            
            {anime.duration && (
              <div className="tv-card__duration">
                <Clock className="w-3 h-3" />
                <span>{anime.duration}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVAnimeCard;
