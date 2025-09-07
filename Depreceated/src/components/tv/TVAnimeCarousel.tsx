import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TVAnimeCard from './TVAnimeCard';
import { useRemoteNavigation } from '@/context/RemoteNavigationContext';
import type { Anime } from '@/services/api';

interface TVAnimeCarouselProps {
  title: string;
  animes: Anime[];
  sectionId: string;
  onAnimeSelect?: (anime: Anime) => void;
  onAnimeInfo?: (anime: Anime) => void;
  itemsPerView?: number;
}

const TVAnimeCarousel: React.FC<TVAnimeCarouselProps> = ({
  title,
  animes,
  sectionId,
  onAnimeSelect,
  onAnimeInfo,
  itemsPerView = 6,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { registerElement, currentFocusId } = useRemoteNavigation();

  const totalPages = Math.ceil(animes.length / itemsPerView);
  const currentItems = animes.slice(
    currentPage * itemsPerView,
    (currentPage + 1) * itemsPerView
  );

  // Register carousel navigation elements
  useEffect(() => {
    const prevButtonId = `${sectionId}-prev`;
    const nextButtonId = `${sectionId}-next`;
    
    const prevButton = carouselRef.current?.querySelector(`[data-focus-id="${prevButtonId}"]`);
    const nextButton = carouselRef.current?.querySelector(`[data-focus-id="${nextButtonId}"]`);

    if (prevButton) registerElement(prevButtonId, prevButton as HTMLElement);
    if (nextButton) registerElement(nextButtonId, nextButton as HTMLElement);
  }, [registerElement, sectionId, currentPage]);

  const goToPreviousPage = () => {
    if (currentPage > 0 && !isNavigating) {
      setIsNavigating(true);
      setCurrentPage(prev => prev - 1);
      setTimeout(() => setIsNavigating(false), 300);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages - 1 && !isNavigating) {
      setIsNavigating(true);
      setCurrentPage(prev => prev + 1);
      setTimeout(() => setIsNavigating(false), 300);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const focusedElement = currentFocusId;
    
    // Handle navigation within carousel
    if (focusedElement?.startsWith(`${sectionId}-anime-`)) {
      switch (event.keyCode) {
        case 37: // Left arrow
          event.preventDefault();
          if (focusedElement.includes('-0') && currentPage > 0) {
            // Jump to previous page
            goToPreviousPage();
          }
          break;
        case 39: // Right arrow
          event.preventDefault();
          const itemIndex = parseInt(focusedElement.split('-').pop() || '0');
          if (itemIndex === currentItems.length - 1 && currentPage < totalPages - 1) {
            // Jump to next page
            goToNextPage();
          }
          break;
        case 404: // Green button - Quick page navigation
          event.preventDefault();
          goToNextPage();
          break;
        case 405: // Yellow button - Quick page navigation
          event.preventDefault();
          goToPreviousPage();
          break;
      }
    }
  };

  return (
    <section 
      ref={carouselRef}
      className="w-full py-tv-xl"
      onKeyDown={handleKeyDown}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-tv-lg px-tv-xl">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-tv-3xl font-bold text-foreground"
        >
          {title}
        </motion.h2>

        {/* Navigation Buttons */}
        {totalPages > 1 && (
          <div className="flex space-x-tv-md">
            <Button
              data-focus-id={`${sectionId}-prev`}
              variant="outline"
              size="lg"
              disabled={currentPage === 0}
              onClick={goToPreviousPage}
              className={`
                w-14 h-14 rounded-full transition-all duration-200
                ${currentFocusId === `${sectionId}-prev` 
                  ? 'ring-4 ring-primary scale-110' 
                  : ''
                }
                ${currentPage === 0 ? 'opacity-50' : 'hover:scale-110'}
              `}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            <Button
              data-focus-id={`${sectionId}-next`}
              variant="outline"
              size="lg"
              disabled={currentPage === totalPages - 1}
              onClick={goToNextPage}
              className={`
                w-14 h-14 rounded-full transition-all duration-200
                ${currentFocusId === `${sectionId}-next` 
                  ? 'ring-4 ring-primary scale-110' 
                  : ''
                }
                ${currentPage === totalPages - 1 ? 'opacity-50' : 'hover:scale-110'}
              `}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        )}
      </div>

      {/* Page Indicators */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mb-tv-lg">
          {Array.from({ length: totalPages }, (_, index) => (
            <motion.div
              key={index}
              className={`
                w-3 h-3 rounded-full transition-all duration-300
                ${index === currentPage 
                  ? 'bg-primary scale-125' 
                  : 'bg-muted-foreground/30'
                }
              `}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>
      )}

      {/* Carousel Content */}
      <div className="relative overflow-hidden">
        <motion.div
          animate={{ 
            x: 0,
            opacity: isNavigating ? 0.7 : 1,
          }}
          transition={{ 
            duration: 0.3,
            ease: "easeInOut"
          }}
          className="px-tv-xl"
        >
          <div className={`
            grid gap-tv-lg auto-cols-max
            grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6
          `}>
            {currentItems.map((anime, index) => (
              <TVAnimeCard
                key={`${anime.id}-${currentPage}-${index}`}
                anime={anime}
                index={index}
                focusId={`${sectionId}-anime-${currentPage}-${index}`}
                onSelect={onAnimeSelect}
                onInfo={onAnimeInfo}
                showPreview={true}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Navigation Hints */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-tv-lg px-tv-xl"
      >
        <div className="flex justify-center space-x-tv-lg text-tv-sm text-muted-foreground">
          <span>← → Navigate</span>
          <span>OK to watch</span>
          <span>🔴 for info</span>
          {totalPages > 1 && (
            <>
              <span>🟢 Next page</span>
              <span>🟡 Previous page</span>
            </>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default TVAnimeCarousel;
