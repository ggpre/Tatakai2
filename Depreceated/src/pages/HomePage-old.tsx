import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AnimeAPI, type HomePageData } from '../services/api';
import TVHeroSection from '../components/tv/TVHeroSection';
import TVAnimeCarousel from '../components/tv/TVAnimeCarousel';
import TVTop10Section from '../components/tv/TVTop10Section';
import LoadingScreen from '../components/tv/LoadingScreen';

const HomePage: React.FC = () => {
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
        setError('Unable to connect to anime service. Please check your internet connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 tv-safe-area">
        <div className="text-center space-y-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-4xl font-bold text-white">Connection Error</h2>
          <p className="text-2xl text-gray-300 max-w-2xl">
            {error}
          </p>
          <button 
            className="tv-button bg-red-600 hover:bg-red-700 text-white text-2xl px-8 py-4 rounded-lg"
            onClick={() => window.location.reload()}
            data-focusable="true"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!homeData?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center tv-safe-area">
        <p className="text-2xl text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white tv-safe-area">
      {/* Hero Section */}
      {homeData.data.spotlightAnimes && homeData.data.spotlightAnimes.length > 0 && (
        <TVHeroSection spotlightAnimes={homeData.data.spotlightAnimes} />
      )}

      {/* Main Content */}
      <div className="tv-container">
        {/* Latest Episodes */}
        {homeData.data.latestEpisodeAnimes && homeData.data.latestEpisodeAnimes.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <TVAnimeCarousel
              title="Latest Episodes"
              animes={homeData.data.latestEpisodeAnimes}
              sectionId="latest-episodes"
            />
          </motion.div>
        )}

        {/* Top 10 Section */}
        {homeData.data.top10Animes && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <TVTop10Section 
              top10Data={homeData.data.top10Animes}
            />
          </motion.div>
        )}

        {/* Trending Anime */}
        {homeData.data.trendingAnimes && homeData.data.trendingAnimes.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <TVAnimeCarousel
              title="Trending Now"
              animes={homeData.data.trendingAnimes}
              sectionId="trending"
            />
          </motion.div>
        )}

        {/* Most Popular */}
        {homeData.data.mostPopularAnimes && homeData.data.mostPopularAnimes.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.8 }}
            className="mb-12"
          >
            <TVAnimeCarousel
              title="Most Popular"
              animes={homeData.data.mostPopularAnimes}
              sectionId="popular"
            />
          </motion.div>
        )}

        {/* Top Airing */}
        {homeData.data.topAiringAnimes && homeData.data.topAiringAnimes.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 1.0 }}
            className="mb-12"
          >
            <TVAnimeCarousel
              title="Currently Airing"
              animes={homeData.data.topAiringAnimes}
              sectionId="airing"
            />
          </motion.div>
        )}

        {/* Most Favorite */}
        {homeData.data.mostFavoriteAnimes && homeData.data.mostFavoriteAnimes.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 1.2 }}
            className="mb-12"
          >
            <TVAnimeCarousel
              title="Top Rated"
              animes={homeData.data.mostFavoriteAnimes}
              sectionId="favorite"
            />
          </motion.div>
        )}

        {/* Recently Completed */}
        {homeData.data.latestCompletedAnimes && homeData.data.latestCompletedAnimes.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 1.4 }}
            className="mb-12"
          >
            <TVAnimeCarousel
              title="Recently Completed"
              animes={homeData.data.latestCompletedAnimes}
              sectionId="completed"
            />
          </motion.div>
        )}

        {/* Top Upcoming */}
        {homeData.data.topUpcomingAnimes && homeData.data.topUpcomingAnimes.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 1.6 }}
            className="pb-16"
          >
            <TVAnimeCarousel
              title="Upcoming Anime"
              animes={homeData.data.topUpcomingAnimes}
              sectionId="upcoming"
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
