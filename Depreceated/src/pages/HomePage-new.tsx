import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AnimeAPI, type HomePageData } from '../services/api';
import TVHeroSection from '../components/tv/TVHeroSection';
import TVAnimeCarousel from '../components/tv/TVAnimeCarousel';
import TVTop10Section from '../components/tv/TVTop10Section';
import { LoadingScreen } from '../components/tv/Skeleton';

interface HomePageProps {
  onAnimeSelect?: (id: string) => void;
  onSearch?: () => void;
  onSettings?: () => void;
  onBack?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ 
  onAnimeSelect, 
  onSearch, 
  onSettings, 
  onBack 
}) => {
  const [homeData, setHomeData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching home page data...');
        const data = await AnimeAPI.getHomePage();
        
        if (data && data.success) {
          setHomeData(data);
          console.log('Home data set successfully');
        } else {
          console.error('API response success is false:', data);
          setError('Failed to load anime data');
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
        setError('Unable to connect to anime service');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !homeData?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="text-6xl">🎌</div>
          <h2 className="text-2xl font-bold text-primary">Connection Issue</h2>
          <p className="text-secondary">Unable to connect to anime service. Please check your connection and try again.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const { data } = homeData;

  // Helper functions to convert anime objects to IDs
  const handleSpotlightSelect = (anime: any) => {
    if (onAnimeSelect && anime?.id) {
      onAnimeSelect(anime.id);
    }
  };

  const handleAnimeSelect = (anime: any) => {
    if (onAnimeSelect && anime?.id) {
      onAnimeSelect(anime.id);
    }
  };

  const handleTop10Select = (anime: any) => {
    if (onAnimeSelect && anime?.id) {
      onAnimeSelect(anime.id);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {data.spotlightAnimes && data.spotlightAnimes.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <TVHeroSection 
            spotlightAnimes={data.spotlightAnimes}
            onAnimeSelect={handleSpotlightSelect}
          />
        </motion.div>
      )}

      {/* Content Sections */}
      <div className="space-y-12 pb-16">
        {/* Latest Episodes */}
        {data.latestEpisodeAnimes && data.latestEpisodeAnimes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="px-6"
          >
            <TVAnimeCarousel
              title="Latest Episodes"
              animes={data.latestEpisodeAnimes}
              sectionId="latest-episodes"
              onAnimeSelect={handleAnimeSelect}
            />
          </motion.div>
        )}

        {/* Top 10 Section */}
        {data.top10Animes && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="px-6"
          >
            <TVTop10Section 
              top10Data={data.top10Animes}
              onAnimeSelect={handleTop10Select}
            />
          </motion.div>
        )}

        {/* Trending Anime */}
        {data.trendingAnimes && data.trendingAnimes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="px-6"
          >
            <TVAnimeCarousel
              title="Trending Now"
              animes={data.trendingAnimes}
              sectionId="trending"
              onAnimeSelect={handleAnimeSelect}
            />
          </motion.div>
        )}

        {/* Most Popular */}
        {data.mostPopularAnimes && data.mostPopularAnimes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="px-6"
          >
            <TVAnimeCarousel
              title="Most Popular"
              animes={data.mostPopularAnimes}
              sectionId="popular"
              onAnimeSelect={handleAnimeSelect}
            />
          </motion.div>
        )}

        {/* Top Airing */}
        {data.topAiringAnimes && data.topAiringAnimes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="px-6"
          >
            <TVAnimeCarousel
              title="Currently Airing"
              animes={data.topAiringAnimes}
              sectionId="airing"
              onAnimeSelect={handleAnimeSelect}
            />
          </motion.div>
        )}

        {/* Most Favorite */}
        {data.mostFavoriteAnimes && data.mostFavoriteAnimes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="px-6"
          >
            <TVAnimeCarousel
              title="Top Rated"
              animes={data.mostFavoriteAnimes}
              sectionId="favorite"
              onAnimeSelect={handleAnimeSelect}
            />
          </motion.div>
        )}

        {/* Recently Completed */}
        {data.latestCompletedAnimes && data.latestCompletedAnimes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="px-6"
          >
            <TVAnimeCarousel
              title="Recently Completed"
              animes={data.latestCompletedAnimes}
              sectionId="completed"
              onAnimeSelect={handleAnimeSelect}
            />
          </motion.div>
        )}

        {/* Top Upcoming */}
        {data.topUpcomingAnimes && data.topUpcomingAnimes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.6 }}
            className="px-6"
          >
            <TVAnimeCarousel
              title="Upcoming Anime"
              animes={data.topUpcomingAnimes}
              sectionId="upcoming"
              onAnimeSelect={handleAnimeSelect}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
