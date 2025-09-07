import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RemoteNavigationProvider, REMOTE_KEYS } from './context/RemoteNavigationContext';
import TVHeroSection from './components/tv/TVHeroSection';
import TVAnimeCarousel from './components/tv/TVAnimeCarousel';
import TVTop10Section from './components/tv/TVTop10Section';
import LoadingScreen from './components/tv/LoadingScreen';
import AnimeDetailsPage from './pages/AnimeDetailsPage';
import VideoPlayerPage from './pages/VideoPlayerPage';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';
import { AnimeAPI, type HomePageData, type Anime } from './services/api';
import './styles/globals.css';

type AppPage = 'home' | 'anime-details' | 'video-player' | 'search' | 'settings';

interface AppState {
  currentPage: AppPage;
  selectedAnime: Anime | null;
  selectedAnimeId: string;
  selectedEpisodeNumber: number;
}

const App: React.FC = () => {
  const [homeData, setHomeData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [appState, setAppState] = useState<AppState>({
    currentPage: 'home',
    selectedAnime: null,
    selectedAnimeId: '',
    selectedEpisodeNumber: 1,
  });

  // Fetch home data when on home page
  useEffect(() => {
    const fetchHomeData = async () => {
      if (appState.currentPage !== 'home') return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching home page data for WebOS...');
        const data = await AnimeAPI.getHomePage();
        
        if (data.success && data.data) {
          setHomeData(data);
          setRetryAttempt(0); // Reset retry count on success
          console.log('Home data loaded successfully');
        } else {
          throw new Error('Failed to load home page data');
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
        setError(errorMessage);
        
        // Auto-retry logic for network issues
        if (retryAttempt < 3 && (errorMessage.includes('timeout') || errorMessage.includes('aborted') || errorMessage.includes('network'))) {
          console.log(`Auto-retrying in 2 seconds... (attempt ${retryAttempt + 1}/3)`);
          setTimeout(() => {
            setRetryAttempt(prev => prev + 1);
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [appState.currentPage, retryAttempt]);

  // Manual retry function
  const retryFetchData = () => {
    setRetryAttempt(prev => prev + 1);
  };

  // Navigation functions
  const navigateToHome = () => {
    setAppState(prev => ({ ...prev, currentPage: 'home' }));
  };

  const navigateToAnimeDetails = (anime: Anime) => {
    setAppState(prev => ({
      ...prev,
      currentPage: 'anime-details',
      selectedAnime: anime,
      selectedAnimeId: anime.id,
    }));
  };

  const navigateToVideoPlayer = (animeId: string, episodeNumber: number = 1) => {
    setAppState(prev => ({
      ...prev,
      currentPage: 'video-player',
      selectedAnimeId: animeId,
      selectedEpisodeNumber: episodeNumber,
    }));
  };

  const navigateToSearch = () => {
    setAppState(prev => ({ ...prev, currentPage: 'search' }));
  };

  const navigateToSettings = () => {
    setAppState(prev => ({ ...prev, currentPage: 'settings' }));
  };

  // Handle anime selection from carousels
  const handleAnimeSelect = (anime: Anime) => {
    console.log('Selected anime:', anime);
    navigateToAnimeDetails(anime);
  };

  // Handle WebOS remote control keys for global navigation
  useEffect(() => {
    const handleGlobalKeys = (event: KeyboardEvent) => {
      switch (event.keyCode) {
        case REMOTE_KEYS.RED: // Red button - Search
          event.preventDefault();
          if (appState.currentPage !== 'search') {
            navigateToSearch();
          }
          break;
        case REMOTE_KEYS.GREEN: // Green button - Home
          event.preventDefault();
          if (appState.currentPage !== 'home') {
            navigateToHome();
          }
          break;
        case REMOTE_KEYS.YELLOW: // Yellow button - Settings
          event.preventDefault();
          if (appState.currentPage !== 'settings') {
            navigateToSettings();
          }
          break;
        case REMOTE_KEYS.BLUE: // Blue button - Reserved for future use
          event.preventDefault();
          console.log('Blue button pressed - Reserved for future features');
          break;
      }
    };

    document.addEventListener('keydown', handleGlobalKeys);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeys);
    };
  }, [appState.currentPage]);

  // Handle WebOS app visibility events
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('App visible');
        // Retry failed requests when app becomes visible again
        if (error && appState.currentPage === 'home' && !homeData) {
          console.log('Retrying data fetch after app became visible');
          setRetryAttempt(prev => prev + 1);
        }
      } else {
        console.log('App hidden');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [error, appState.currentPage, homeData]);

  // Render home page content
  const renderHomePage = () => {
    if (loading) {
      return <LoadingScreen />;
    }

    if (error) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8 tv-safe-area">
          <div className="text-center space-y-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-4xl font-bold text-white">Connection Error</h2>
            <p className="text-2xl text-gray-300 max-w-2xl">
              {error}
            </p>
            <p className="text-xl text-gray-400">
              Please check your internet connection and try again.
            </p>
            <div className="space-x-4">
              <button 
                className="tv-button bg-red-600 hover:bg-red-700 text-white text-2xl px-8 py-4 rounded-lg focus:ring-2 focus:ring-red-500"
                onClick={retryFetchData}
                data-focusable="true"
              >
                Retry
              </button>
              <button 
                className="tv-button bg-gray-600 hover:bg-gray-700 text-white text-2xl px-8 py-4 rounded-lg focus:ring-2 focus:ring-gray-500"
                onClick={() => window.location.reload()}
                data-focusable="true"
              >
                Reload App
              </button>
            </div>
            {retryAttempt > 0 && (
              <p className="text-lg text-yellow-400">
                Retry attempt: {retryAttempt}/3
              </p>
            )}
          </div>
        </div>
      );
    }

    if (!homeData?.data) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center tv-safe-area">
          <div className="text-center space-y-6">
            <h2 className="text-4xl font-bold text-white">No Data Available</h2>
            <p className="text-2xl text-gray-400">Unable to load anime content</p>
          </div>
        </div>
      );
    }

    const { data } = homeData;
    const fadeInUp = {
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0 }
    };

    return (
      <div className="min-h-screen bg-black text-white">
        {/* Hero Section */}
        {data.spotlightAnimes && data.spotlightAnimes.length > 0 && (
          <TVHeroSection 
            spotlightAnimes={data.spotlightAnimes}
            onAnimeSelect={handleAnimeSelect}
          />
        )}

        {/* Main Content */}
        <div className="tv-container">
          {/* Latest Episodes */}
          {data.latestEpisodeAnimes && data.latestEpisodeAnimes.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
              className="mb-12"
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
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.4 }}
              className="mb-12"
            >
              <TVTop10Section
                top10Data={data.top10Animes}
                onAnimeSelect={handleAnimeSelect}
              />
            </motion.div>
          )}

          {/* Trending Anime */}
          {data.trendingAnimes && data.trendingAnimes.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.6 }}
              className="mb-12"
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
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.8 }}
              className="mb-12"
            >
              <TVAnimeCarousel
                title="Most Popular"
                animes={data.mostPopularAnimes}
                sectionId="most-popular"
                onAnimeSelect={handleAnimeSelect}
              />
            </motion.div>
          )}

          {/* Top Airing */}
          {data.topAiringAnimes && data.topAiringAnimes.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 1.0 }}
              className="mb-12"
            >
              <TVAnimeCarousel
                title="Currently Airing"
                animes={data.topAiringAnimes}
                sectionId="top-airing"
                onAnimeSelect={handleAnimeSelect}
              />
            </motion.div>
          )}

          {/* Most Favorite */}
          {data.mostFavoriteAnimes && data.mostFavoriteAnimes.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 1.2 }}
              className="mb-12"
            >
              <TVAnimeCarousel
                title="Top Rated"
                animes={data.mostFavoriteAnimes}
                sectionId="most-favorite"
                onAnimeSelect={handleAnimeSelect}
              />
            </motion.div>
          )}

          {/* Recently Completed */}
          {data.latestCompletedAnimes && data.latestCompletedAnimes.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 1.4 }}
              className="mb-12"
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
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 1.6 }}
              className="pb-16"
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

        {/* Global Navigation Hints */}
        <div className="fixed bottom-8 left-0 right-0 tv-safe-area">
          <div className="tv-container">
            <div className="flex justify-center gap-8 text-lg text-gray-400 bg-black bg-opacity-50 rounded-lg py-4 px-8">
              <span>🔴 Search</span>
              <span>🟢 Home</span>
              <span>🟡 Settings</span>
              <span>🔵 More</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render current page
  const renderCurrentPage = () => {
    switch (appState.currentPage) {
      case 'anime-details':
        return (
          <AnimeDetailsPage
            animeId={appState.selectedAnimeId}
            onWatchEpisode={navigateToVideoPlayer}
            onBack={navigateToHome}
          />
        );
      
      case 'video-player':
        return (
          <VideoPlayerPage
            animeId={appState.selectedAnimeId}
            episodeNumber={appState.selectedEpisodeNumber}
            onExit={() => {
              // Go back to anime details if we have a selected anime, otherwise home
              if (appState.selectedAnime) {
                navigateToAnimeDetails(appState.selectedAnime);
              } else {
                navigateToHome();
              }
            }}
            onEpisodeChange={navigateToVideoPlayer}
          />
        );
      
      case 'search':
        return (
          <SearchPage
            onAnimeSelect={handleAnimeSelect}
            onClose={navigateToHome}
          />
        );
      
      case 'settings':
        return (
          <SettingsPage
            onClose={navigateToHome}
          />
        );
      
      case 'home':
      default:
        return renderHomePage();
    }
  };

  return (
    <RemoteNavigationProvider>
      <div className="app-container">
        {renderCurrentPage()}
      </div>
    </RemoteNavigationProvider>
  );
};

export default App;
