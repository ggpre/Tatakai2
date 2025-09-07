import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Star, Crown, Calendar, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRemoteNavigation } from '@/context/RemoteNavigationContext';
import type { Top10Anime } from '@/services/api';

interface TVTop10SectionProps {
  top10Data: {
    today: Top10Anime[];
    week: Top10Anime[];
    month: Top10Anime[];
  };
  onAnimeSelect?: (anime: Top10Anime) => void;
}

const TVTop10Section: React.FC<TVTop10SectionProps> = ({
  top10Data,
  onAnimeSelect,
}) => {
  const [activeTab, setActiveTab] = useState('today');
  const { registerElement, currentFocusId } = useRemoteNavigation();
  const sectionRef = useRef<HTMLDivElement>(null);

  const tabData = [
    { id: 'today', label: 'Today', icon: Star, data: top10Data.today },
    { id: 'week', label: 'This Week', icon: Calendar, data: top10Data.week },
    { id: 'month', label: 'This Month', icon: TrendingUp, data: top10Data.month },
  ];

  const currentData = tabData.find(tab => tab.id === activeTab)?.data || [];

  // Register tab triggers for navigation
  useEffect(() => {
    tabData.forEach(tab => {
      const trigger = sectionRef.current?.querySelector(`[data-tab-id="${tab.id}"]`);
      if (trigger) {
        registerElement(`top10-tab-${tab.id}`, trigger as HTMLElement);
      }
    });
  }, [registerElement]);

  const handleTabKeyDown = (event: React.KeyboardEvent, tabId: string) => {
    switch (event.keyCode) {
      case 13: // Enter
        event.preventDefault();
        setActiveTab(tabId);
        break;
      case 37: // Left arrow
        event.preventDefault();
        const currentIndex = tabData.findIndex(tab => tab.id === tabId);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabData.length - 1;
        setActiveTab(tabData[prevIndex].id);
        break;
      case 39: // Right arrow
        event.preventDefault();
        const currentIdx = tabData.findIndex(tab => tab.id === tabId);
        const nextIndex = currentIdx < tabData.length - 1 ? currentIdx + 1 : 0;
        setActiveTab(tabData[nextIndex].id);
        break;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-8 h-8 text-yellow-500" />;
      case 2:
        return <Crown className="w-7 h-7 text-gray-400" />;
      case 3:
        return <Crown className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-tv-lg font-bold text-primary">{rank}</span>
          </div>
        );
    }
  };

  return (
    <section ref={sectionRef} className="w-full py-tv-2xl">
      <div className="max-w-7xl mx-auto px-tv-xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-tv-xl"
        >
          <h2 className="text-tv-4xl font-bold text-foreground mb-tv-md">
            Top 10 Anime
          </h2>
          <p className="text-tv-lg text-muted-foreground">
            Most popular anime right now
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-3 mb-tv-xl">
            {tabData.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  data-tab-id={tab.id}
                  className={`
                    text-tv-xl py-tv-lg
                    ${currentFocusId === `top10-tab-${tab.id}` 
                      ? 'ring-4 ring-primary' 
                      : ''
                    }
                  `}
                  onKeyDown={(e) => handleTabKeyDown(e, tab.id)}
                >
                  <Icon className="w-6 h-6 mr-3" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tab Content */}
          {tabData.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-tv-lg"
              >
                {tab.data.slice(0, 10).map((anime, index) => (
                  <TopAnimeCard
                    key={anime.id}
                    anime={anime}
                    rank={index + 1}
                    onSelect={onAnimeSelect}
                    focusId={`top10-${tab.id}-${index}`}
                  />
                ))}
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Navigation Hints */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-tv-xl text-center"
        >
          <p className="text-tv-sm text-muted-foreground">
            Use ← → to switch tabs • Press OK to watch • Numbers 1-9 for quick access
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// Individual Top Anime Card Component
interface TopAnimeCardProps {
  anime: Top10Anime;
  rank: number;
  onSelect?: (anime: Top10Anime) => void;
  focusId: string;
}

const TopAnimeCard: React.FC<TopAnimeCardProps> = ({
  anime,
  rank,
  onSelect,
  focusId,
}) => {
  const { registerElement, currentFocusId } = useRemoteNavigation();
  const cardRef = useRef<HTMLDivElement>(null);
  const isFocused = currentFocusId === focusId;

  useEffect(() => {
    if (cardRef.current) {
      registerElement(focusId, cardRef.current);
    }
  }, [registerElement, focusId]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.keyCode) {
      case 13: // Enter
        event.preventDefault();
        onSelect?.(anime);
        break;
      case 48 + rank: // Number key (0-9)
        if (rank <= 9) {
          event.preventDefault();
          onSelect?.(anime);
        }
        break;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-8 h-8 text-yellow-500" />;
      case 2:
        return <Crown className="w-7 h-7 text-gray-400" />;
      case 3:
        return <Crown className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-tv-lg font-bold text-primary">{rank}</span>
          </div>
        );
    }
  };

  return (
    <Card
      ref={cardRef}
      tabIndex={0}
      className={`
        relative overflow-hidden cursor-pointer transition-all duration-300
        ${isFocused 
          ? 'ring-4 ring-primary border-primary scale-105 shadow-xl' 
          : 'border-border hover:border-primary/50'
        }
        focus:outline-none
      `}
      onKeyDown={handleKeyDown}
      onClick={() => onSelect?.(anime)}
    >
      <CardContent className="p-0">
        <div className="flex items-center space-x-tv-lg p-tv-lg">
          {/* Rank */}
          <div className="flex-shrink-0">
            {getRankIcon(rank)}
          </div>

          {/* Poster */}
          <div className="flex-shrink-0 w-20 h-28 rounded-lg overflow-hidden">
            <img
              src={anime.poster}
              alt={anime.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className={`
              text-tv-xl font-semibold mb-2 line-clamp-2
              ${isFocused ? 'text-primary' : 'text-foreground'}
              transition-colors duration-300
            `}>
              {anime.name}
            </h3>

            <div className="space-y-2">
              {/* Episode Info */}
              {anime.episodes && (
                <div className="flex space-x-3 text-tv-base">
                  {anime.episodes.sub && (
                    <Badge variant="secondary" size="sm">
                      SUB {anime.episodes.sub}
                    </Badge>
                  )}
                  {anime.episodes.dub && (
                    <Badge variant="secondary" size="sm">
                      DUB {anime.episodes.dub}
                    </Badge>
                  )}
                </div>
              )}

              {/* Quick Access Hint */}
              {rank <= 9 && (
                <p className="text-tv-sm text-muted-foreground">
                  Press {rank} for quick access
                </p>
              )}
            </div>
          </div>

          {/* Play Button */}
          {isFocused && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-shrink-0"
            >
              <Button
                size="lg"
                className="w-14 h-14 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.(anime);
                }}
              >
                <Play className="w-6 h-6 fill-current" />
              </Button>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TVTop10Section;
