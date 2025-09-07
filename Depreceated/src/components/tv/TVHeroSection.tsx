import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Star, Clock, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useRemoteNavigation } from '../../context/RemoteNavigationContext';
import type { SpotlightAnime } from '../../services/api';

interface TVHeroSectionProps {
  spotlightAnimes: SpotlightAnime[];
  onAnimeSelect?: (anime: SpotlightAnime) => void;
}

const TVHeroSection: React.FC<TVHeroSectionProps> = ({ 
  spotlightAnimes, 
  onAnimeSelect 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { registerElement, currentFocusId } = useRemoteNavigation();
  
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const infoButtonRef = useRef<HTMLButtonElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  const currentAnime = spotlightAnimes[currentIndex];

  // Register focusable elements
  useEffect(() => {
    if (playButtonRef.current) {
      registerElement('hero-play-button', playButtonRef.current);
    }
    if (infoButtonRef.current) {
      registerElement('hero-info-button', infoButtonRef.current);
    }
    if (addButtonRef.current) {
      registerElement('hero-add-button', addButtonRef.current);
    }
  }, [registerElement, currentIndex]);

  // Auto-rotation with pause on focus
  useEffect(() => {
    if (isAutoPlaying && spotlightAnimes.length > 1) {
      // Pause auto-rotation when hero buttons are focused
      const heroButtonsFocused = [
        'hero-play-button',
        'hero-info-button',
        'hero-add-button'
      ].includes(currentFocusId || '');

      if (!heroButtonsFocused) {
        const interval = setInterval(() => {
          setCurrentIndex((prev) => (prev + 1) % spotlightAnimes.length);
        }, 8000);
        return () => clearInterval(interval);
      }
    }
  }, [isAutoPlaying, spotlightAnimes.length, currentFocusId]);

  if (!currentAnime) return null;

  return (
    <div className="relative h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(${currentAnime.poster})`,
            }}
          >
            {/* TV-optimized gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
          </div>

          {/* Content - TV Safe Area */}
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-7xl mx-auto px-tv-xl w-full">
              <div className="max-w-4xl">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  {/* Rank Badge */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center space-x-4 mb-tv-lg"
                  >
                    <Badge 
                      size="xl" 
                      className="bg-primary/20 text-primary border-primary/30 focus:ring-4 focus:ring-primary"
                    >
                      <Star className="w-6 h-6 mr-2" />
                      #{currentAnime.rank} Spotlight
                    </Badge>
                    {currentAnime.otherInfo && (
                      <div className="flex space-x-2">
                        {currentAnime.otherInfo.slice(0, 2).map((info, index) => (
                          <Badge key={index} variant="secondary" size="lg">
                            {info}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </motion.div>

                  {/* Title - TV-optimized size */}
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-tv-4xl md:text-tv-5xl lg:text-tv-6xl font-bold text-foreground mb-tv-lg leading-none"
                  >
                    {currentAnime.name}
                  </motion.h1>

                  {/* Japanese Name */}
                  {currentAnime.jname && currentAnime.jname !== currentAnime.name && (
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      className="text-tv-xl text-muted-foreground mb-tv-lg"
                    >
                      {currentAnime.jname}
                    </motion.p>
                  )}

                  {/* Episode Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="flex items-center space-x-6 mb-tv-lg text-tv-lg"
                  >
                    {currentAnime.episodes?.sub && (
                      <div className="flex items-center space-x-2">
                        <Clock className="w-6 h-6 text-primary" />
                        <span className="text-foreground">
                          {currentAnime.episodes.sub} Episodes
                        </span>
                      </div>
                    )}
                    {currentAnime.episodes?.dub && (
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-muted-foreground">
                          {currentAnime.episodes.dub} Dubbed
                        </span>
                      </div>
                    )}
                  </motion.div>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                    className="text-tv-lg text-muted-foreground mb-tv-2xl leading-relaxed max-w-3xl"
                  >
                    {currentAnime.description && currentAnime.description.length > 200
                      ? `${currentAnime.description.substring(0, 200)}...`
                      : currentAnime.description}
                  </motion.p>

                  {/* Action Buttons - TV-optimized */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="flex space-x-tv-lg"
                  >
                    <Button
                      ref={playButtonRef}
                      size="xl"
                      className="min-w-[200px] h-16 text-tv-xl font-semibold focus:ring-4 focus:ring-primary focus:scale-105 transition-all"
                      onFocus={() => setIsAutoPlaying(false)}
                      onBlur={() => setIsAutoPlaying(true)}
                      onClick={() => onAnimeSelect && onAnimeSelect(currentAnime)}
                    >
                      <Play className="w-8 h-8 mr-3 fill-current" />
                      Watch Now
                    </Button>

                    <Button
                      ref={infoButtonRef}
                      variant="outline"
                      size="xl"
                      className="min-w-[180px] h-16 text-tv-xl font-semibold border-2 focus:ring-4 focus:ring-primary focus:scale-105 transition-all"
                      onFocus={() => setIsAutoPlaying(false)}
                      onBlur={() => setIsAutoPlaying(true)}
                      onClick={() => onAnimeSelect && onAnimeSelect(currentAnime)}
                    >
                      <Info className="w-8 h-8 mr-3" />
                      More Info
                    </Button>

                    <Button
                      ref={addButtonRef}
                      variant="ghost"
                      size="xl"
                      className="w-16 h-16 text-tv-xl focus:ring-4 focus:ring-primary focus:scale-105 transition-all"
                      onFocus={() => setIsAutoPlaying(false)}
                      onBlur={() => setIsAutoPlaying(true)}
                    >
                      <Plus className="w-8 h-8" />
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Spotlight Indicators */}
          <div className="absolute bottom-8 right-8 z-20">
            <div className="flex space-x-2">
              {spotlightAnimes.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-primary scale-125'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TVHeroSection;
