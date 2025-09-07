import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Star, Clock, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRemoteNavigation } from '@/context/RemoteNavigationContext';
import type { Anime } from '@/services/api';

interface TVAnimeCardProps {
  anime: Anime;
  index: number;
  onSelect?: (anime: Anime) => void;
  onInfo?: (anime: Anime) => void;
  focusId?: string;
  showPreview?: boolean;
}

const TVAnimeCard: React.FC<TVAnimeCardProps> = ({
  anime,
  index,
  onSelect,
  onInfo,
  focusId,
  showPreview = true,
}) => {
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { registerElement, currentFocusId } = useRemoteNavigation();

  const elementId = focusId || `anime-card-${anime.id}-${index}`;
  const isFocused = currentFocusId === elementId;

  // Register the card for TV navigation
  useEffect(() => {
    if (cardRef.current) {
      registerElement(elementId, cardRef.current);
    }
  }, [registerElement, elementId]);

  // Show preview when focused (with delay)
  useEffect(() => {
    if (isFocused && showPreview) {
      const timer = setTimeout(() => {
        setIsPreviewVisible(true);
      }, 500); // 500ms delay before showing preview
      return () => clearTimeout(timer);
    } else {
      setIsPreviewVisible(false);
    }
  }, [isFocused, showPreview]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.keyCode) {
      case 13: // Enter/OK
        event.preventDefault();
        onSelect?.(anime);
        break;
      case 403: // Red button - Info
        event.preventDefault();
        onInfo?.(anime);
        break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="relative group"
    >
      <Card
        ref={cardRef}
        tabIndex={0}
        className={`
          relative overflow-hidden cursor-pointer transition-all duration-300
          min-h-[400px] w-full
          ${isFocused 
            ? 'ring-4 ring-primary border-primary scale-105 shadow-2xl shadow-primary/25' 
            : 'border-border hover:border-primary/50'
          }
          focus:outline-none focus:ring-4 focus:ring-primary focus:border-primary
        `}
        onKeyDown={handleKeyDown}
        onClick={() => onSelect?.(anime)}
      >
        {/* Poster Image */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={anime.poster}
            alt={anime.name}
            className={`
              w-full h-full object-cover transition-all duration-500
              ${isFocused ? 'scale-110' : 'scale-100'}
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
          
          {/* Loading placeholder */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Episode count badge */}
          {anime.episodes && (anime.episodes.sub || anime.episodes.dub) && (
            <div className="absolute top-3 right-3">
              <Badge 
                size="lg" 
                className="bg-black/70 text-white border-none backdrop-blur-sm"
              >
                <Clock className="w-4 h-4 mr-1" />
                {anime.episodes.sub || anime.episodes.dub}
              </Badge>
            </div>
          )}

          {/* Rating badge */}
          {anime.rating && (
            <div className="absolute top-3 left-3">
              <Badge 
                size="lg" 
                className="bg-primary/80 text-primary-foreground border-none backdrop-blur-sm"
              >
                <Star className="w-4 h-4 mr-1" />
                {anime.rating}
              </Badge>
            </div>
          )}

          {/* Focus overlay with action buttons */}
          {isFocused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center"
            >
              <div className="flex space-x-4">
                <Button
                  size="lg"
                  className="h-14 w-14 rounded-full bg-primary/90 hover:bg-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect?.(anime);
                  }}
                >
                  <Play className="w-6 h-6 fill-current" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 w-14 rounded-full border-white/70 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onInfo?.(anime);
                  }}
                >
                  <Info className="w-6 h-6" />
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Card Content */}
        <CardContent className="p-tv-md">
          <div className="space-y-2">
            {/* Title */}
            <h3 className={`
              font-semibold text-tv-lg leading-tight line-clamp-2
              ${isFocused ? 'text-primary' : 'text-foreground'}
              transition-colors duration-300
            `}>
              {anime.name}
            </h3>

            {/* Type and Duration */}
            <div className="flex items-center justify-between text-tv-sm text-muted-foreground">
              {anime.type && (
                <span className="capitalize">{anime.type}</span>
              )}
              {anime.duration && (
                <span>{anime.duration}</span>
              )}
            </div>

            {/* Sub/Dub info */}
            {anime.episodes && (
              <div className="flex space-x-2">
                {anime.episodes.sub && (
                  <Badge variant="secondary" size="sm">
                    SUB
                  </Badge>
                )}
                {anime.episodes.dub && (
                  <Badge variant="secondary" size="sm">
                    DUB
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Extended Preview Panel */}
      {isPreviewVisible && showPreview && (
        <motion.div
          initial={{ opacity: 0, x: -20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="absolute left-full top-0 z-50 ml-tv-md w-96 max-w-sm"
        >
          <Card className="bg-background/95 backdrop-blur-lg border-primary/50 shadow-2xl">
            <CardContent className="p-tv-lg">
              <div className="space-y-tv-md">
                <h4 className="text-tv-xl font-bold text-primary">
                  {anime.name}
                </h4>
                
                {anime.jname && anime.jname !== anime.name && (
                  <p className="text-tv-base text-muted-foreground">
                    {anime.jname}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {anime.type && (
                    <Badge size="lg" variant="outline">
                      {anime.type}
                    </Badge>
                  )}
                  {anime.rating && (
                    <Badge size="lg" className="bg-primary/20 text-primary">
                      ⭐ {anime.rating}
                    </Badge>
                  )}
                </div>

                {anime.episodes && (
                  <div className="text-tv-base">
                    <p className="text-muted-foreground">
                      Episodes: {anime.episodes.sub || anime.episodes.dub}
                    </p>
                    <div className="flex space-x-2 mt-2">
                      {anime.episodes.sub && (
                        <Badge variant="secondary">
                          {anime.episodes.sub} SUB
                        </Badge>
                      )}
                      {anime.episodes.dub && (
                        <Badge variant="secondary">
                          {anime.episodes.dub} DUB
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-tv-md">
                  <p className="text-tv-sm text-muted-foreground">
                    Press OK to watch • Red button for info
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TVAnimeCard;
