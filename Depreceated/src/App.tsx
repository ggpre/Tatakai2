import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RemoteNavigationProvider } from './context/RemoteNavigationContext';
import TVLayout from './components/tv/TVLayout';
import { LoadingScreen } from './components/tv/Skeleton';
import HomePage from './pages/HomePage';
import AnimeDetailsPage from './pages/AnimeDetailsPage';
import VideoPlayerPage from './pages/VideoPlayerPage';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';
import './styles/globals.css';

type Page = 'home' | 'details' | 'watch' | 'search' | 'settings';

interface PageData {
  id: Page;
  title: string;
  showNavigation: boolean;
}

const pageData: Record<Page, PageData> = {
  home: { id: 'home', title: 'Tatakai - Home', showNavigation: true },
  details: { id: 'details', title: 'Anime Details', showNavigation: true },
  watch: { id: 'watch', title: 'Now Playing', showNavigation: false },
  search: { id: 'search', title: 'Search Anime', showNavigation: true },
  settings: { id: 'settings', title: 'Settings', showNavigation: true },
};

const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  in: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    scale: 1.05,
    y: -20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedAnimeId, setSelectedAnimeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageHistory, setPageHistory] = useState<Page[]>(['home']);

  useEffect(() => {
    // Enhanced initial load with realistic timing
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Update document title based on current page
    document.title = pageData[currentPage].title;
  }, [currentPage]);

  const navigateToPage = (page: Page, animeId?: string) => {
    if (animeId) {
      setSelectedAnimeId(animeId);
    }
    
    // Update page history for back navigation
    setPageHistory(prev => {
      const newHistory = [...prev];
      if (newHistory[newHistory.length - 1] !== page) {
        newHistory.push(page);
      }
      return newHistory.slice(-5); // Keep last 5 pages
    });
    
    setCurrentPage(page);
  };

  const goBack = () => {
    const history = [...pageHistory];
    if (history.length > 1) {
      history.pop(); // Remove current page
      const previousPage = history[history.length - 1] || 'home';
      setPageHistory(history);
      setCurrentPage(previousPage);
    } else {
      setCurrentPage('home');
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            onAnimeSelect={(id) => navigateToPage('details', id)}
            onSearch={() => navigateToPage('search')}
            onSettings={() => navigateToPage('settings')}
          />
        );
      case 'details':
        return (
          <AnimeDetailsPage
            animeId={selectedAnimeId || ''}
            onWatchEpisode={(episodeId) => navigateToPage('watch', episodeId)}
            onBack={goBack}
          />
        );
      case 'watch':
        return (
          <VideoPlayerPage
            animeId={selectedAnimeId || ''}
            onExit={goBack}
          />
        );
      case 'search':
        return (
          <SearchPage
            onAnimeSelect={(anime: any) => navigateToPage('details', anime.id)}
          />
        );
      case 'settings':
        return (
          <SettingsPage />
        );
      default:
        return (
          <HomePage
            onAnimeSelect={(id) => navigateToPage('details', id)}
            onSearch={() => navigateToPage('search')}
            onSettings={() => navigateToPage('settings')}
          />
        );
    }
  };

  const currentPageData = pageData[currentPage];

  return (
    <RemoteNavigationProvider>
      <TVLayout 
        currentPage={currentPage} 
        onNavigate={(page: string) => navigateToPage(page as Page)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="flex-1"
          >
            {renderCurrentPage()}
          </motion.div>
        </AnimatePresence>
      </TVLayout>
    </RemoteNavigationProvider>
  );
};

export default App;
