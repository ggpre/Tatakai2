'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { AnimeAPI, type Anime } from '@/lib/api';
import { ArrowLeft, Clock, Calendar, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import TVNavbar from '@/components/TVNavbar';

const TVRecentlyAddedPage: React.FC = () => {
  const router = useRouter();
  const { registerElement, unregisterElement } = useNavigation();
  const containerRef = useRef<HTMLDivElement>(null);

  const [recentAnimes, setRecentAnimes] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [scrollPosition, setScrollPosition] = useState(0);

  // Register for navigation
  useEffect(() => {
    if (containerRef.current) {
      registerElement('tv-recently-page', containerRef.current);
      return () => unregisterElement('tv-recently-page');
    }
  }, [registerElement, unregisterElement]);

  // Load recently added
  useEffect(() => {
    loadRecentlyAdded();
  }, [currentPage]);

  // D-pad navigation with improved scrolling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (recentAnimes.length > 0) {
            const itemsPerRow = 4;
            setSelectedIndex(prev => {
              const newIndex = prev - itemsPerRow;
              if (newIndex >= 0) {
                // Check if we need to scroll up
                const currentRow = Math.floor(prev / itemsPerRow);
                const newRow = Math.floor(newIndex / itemsPerRow);
                if (newRow < Math.floor(scrollPosition / 100)) {
                  setScrollPosition(newRow * 100);
                }
                return newIndex;
              }
              return prev;
            });
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (recentAnimes.length > 0) {
            const itemsPerRow = 4;
            setSelectedIndex(prev => {
              const newIndex = prev + itemsPerRow;
              if (newIndex < recentAnimes.length) {
                // Check if we need to scroll down
                const currentRow = Math.floor(prev / itemsPerRow);
                const newRow = Math.floor(newIndex / itemsPerRow);
                const visibleRows = 3; // Visible rows on screen
                if (newRow >= Math.floor(scrollPosition / 100) + visibleRows) {
                  setScrollPosition((newRow - visibleRows + 1) * 100);
                }
                return newIndex;
              }
              return prev;
            });
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          if (recentAnimes.length > 0) {
            setSelectedIndex(prev => prev > 0 ? prev - 1 : recentAnimes.length - 1);
          } else if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (recentAnimes.length > 0) {
            setSelectedIndex(prev => prev < recentAnimes.length - 1 ? prev + 1 : 0);
          } else if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
          }
          break;

        case 'Enter':
          e.preventDefault();
          if (recentAnimes.length > 0) {
            const selectedAnime = recentAnimes[selectedIndex];
            router.push(`/anime/${selectedAnime.id}`);
          }
          break;

        case 'Backspace':
        case 'Escape':
          e.preventDefault();
          router.back();
          break;

        case 'r':
        case 'R':
          e.preventDefault();
          refreshData();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [recentAnimes, selectedIndex, currentPage, totalPages, router]);

  const loadRecentlyAdded = async () => {
    setIsLoading(true);
    try {
      // Try to get recently updated animes
      const response = await AnimeAPI.getAnimeByCategory('recently-updated', currentPage);

      if (response.success) {
        setRecentAnimes(response.data.animes || []);
        setTotalPages(response.data.totalPages || 1);
        setSelectedIndex(0);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to load recently added:', error);
      // Fallback: try to get home page data
      try {
        const homeResponse = await AnimeAPI.getHomePage();
        if (homeResponse.success) {
          setRecentAnimes(homeResponse.data.latestEpisodeAnimes || []);
          setTotalPages(1);
          setSelectedIndex(0);
          setLastUpdated(new Date());
        }
      } catch (fallbackError) {
        console.error('Fallback failed:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    setCurrentPage(1);
    loadRecentlyAdded();
  };

  const goBack = () => {
    router.back();
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div ref={containerRef} className="tv-recently-page">
      <TVNavbar />
      
      <div className="tv-recently-container">
        {/* Header */}
        <div className="tv-recently-header">
          <button className="tv-back-btn" onClick={goBack}>
            <ArrowLeft size={24} />
            <span>Back</span>
          </button>
          <div className="tv-title-section">
            <h1>Recently Added</h1>
            <div className="tv-last-updated">
              <Clock size={16} />
              <span>Updated {formatTimeAgo(lastUpdated)}</span>
            </div>
          </div>
          <button className="tv-refresh-btn" onClick={refreshData}>
            <RefreshCw size={20} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Bar */}
        <div className="tv-stats-bar">
          <div className="tv-stat">
            <Calendar size={16} />
            <span>{recentAnimes.length} Recently Added</span>
          </div>
          <div className="tv-stat">
            <span>Page {currentPage} of {totalPages}</span>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="tv-loading">
            <div className="tv-loading-spinner"></div>
            <p>Loading recently added anime...</p>
          </div>
        )}

        {/* Recently Added Grid */}
        {!isLoading && recentAnimes.length > 0 && (
          <div 
            className="tv-recently-grid"
            style={{ transform: `translateY(-${scrollPosition}px)` }}
          >
            {recentAnimes.map((anime, index) => (
              <div
                key={anime.id}
                className={`tv-anime-card ${selectedIndex === index ? 'tv-selected' : ''}`}
              >
                <div className="tv-anime-poster">
                  <img src={anime.poster} alt={anime.name} />
                  <div className="tv-anime-overlay">
                    <div className="tv-anime-type">
                      {anime.type || 'Series'}
                    </div>
                    <div className="tv-anime-new-badge">
                      NEW
                    </div>
                  </div>
                </div>
                <div className="tv-anime-info">
                  <h3>{anime.name}</h3>
                  {anime.jname && (
                    <p className="tv-anime-jname">{anime.jname}</p>
                  )}
                  <div className="tv-anime-meta">
                    {anime.episodes && (
                      <span className="tv-anime-episodes">
                        Episodes: {anime.episodes.sub || anime.episodes.dub || 'N/A'}
                      </span>
                    )}
                    {anime.duration && (
                      <span className="tv-anime-duration">{anime.duration}</span>
                    )}
                  </div>
                  {anime.description && (
                    <p className="tv-anime-description">
                      {anime.description.length > 100 
                        ? `${anime.description.substring(0, 100)}...` 
                        : anime.description
                      }
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Recently Added */}
        {!isLoading && recentAnimes.length === 0 && (
          <div className="tv-no-recently">
            <Clock size={48} />
            <p>No recently added anime found</p>
            <p>Check back later for new content</p>
            <button className="tv-retry-btn" onClick={refreshData}>
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        )}

        {/* Pagination Info */}
        {recentAnimes.length > 0 && (
          <div className="tv-pagination">
            <p>
              Use ← → to change pages • Currently on page {currentPage} of {totalPages}
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="tv-instructions">
          <p>Use D-pad to navigate • Enter to select • R to refresh • ← → for pages</p>
        </div>
      </div>

      <style jsx>{`
        .tv-recently-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
          color: white;
          font-family: 'Inter', sans-serif;
        }

        .tv-recently-container {
          padding: 20px 40px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .tv-recently-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .tv-back-btn,
        .tv-refresh-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid transparent;
          padding: 12px 16px;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tv-back-btn:hover,
        .tv-refresh-btn:hover {
          background: rgba(255, 107, 53, 0.2);
          border-color: #ff6b35;
        }

        .tv-title-section {
          text-align: center;
        }

        .tv-title-section h1 {
          margin: 0 0 8px 0;
          font-size: 32px;
          font-weight: 700;
          background: linear-gradient(45deg, #ff6b35, #f7931e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .tv-last-updated {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 14px;
          opacity: 0.7;
        }

        .tv-stats-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .tv-stat {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .tv-loading {
          text-align: center;
          padding: 60px;
        }

        .tv-loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid #e50914;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .tv-recently-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
          transition: transform 0.3s ease;
          overflow: hidden;
          max-height: 600px; /* Limit visible area */
        }

        .tv-anime-card {
          display: flex;
          gap: 16px;
          background: #1a1a1a;
          border: 2px solid transparent;
          border-radius: 12px;
          padding: 16px;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .tv-anime-card.tv-selected {
          background: rgba(229, 9, 20, 0.2);
          border-color: #e50914;
          transform: scale(1.02);
          box-shadow: 0 0 20px rgba(229, 9, 20, 0.5);
        }

        .tv-anime-poster {
          position: relative;
          flex-shrink: 0;
          width: 100px;
          height: 140px;
          border-radius: 8px;
          overflow: hidden;
        }

        .tv-anime-poster img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .tv-anime-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.8) 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 8px;
        }

        .tv-anime-type {
          align-self: flex-start;
          background: rgba(229, 9, 20, 0.9);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
        }

        .tv-anime-new-badge {
          align-self: flex-end;
          background: #4ade80;
          color: #000;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
        }

        .tv-anime-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tv-anime-info h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          line-height: 1.3;
        }

        .tv-anime-jname {
          margin: 0;
          font-size: 14px;
          opacity: 0.7;
          line-height: 1.2;
        }

        .tv-anime-meta {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .tv-anime-episodes,
        .tv-anime-duration {
          font-size: 12px;
          opacity: 0.8;
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .tv-anime-description {
          margin: 0;
          font-size: 13px;
          opacity: 0.8;
          line-height: 1.4;
        }

        .tv-no-recently {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          text-align: center;
          opacity: 0.7;
        }

        .tv-no-recently svg {
          margin-bottom: 20px;
          opacity: 0.5;
        }

        .tv-no-recently p {
          margin: 8px 0;
          font-size: 16px;
        }

        .tv-retry-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 107, 53, 0.2);
          border: 2px solid #ff6b35;
          padding: 12px 20px;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          margin-top: 20px;
          transition: all 0.2s ease;
        }

        .tv-retry-btn:hover {
          background: rgba(255, 107, 53, 0.3);
        }

        .tv-pagination {
          text-align: center;
          margin-bottom: 20px;
          font-size: 14px;
          opacity: 0.8;
        }

        .tv-instructions {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          font-size: 12px;
          opacity: 0.7;
          background: rgba(0, 0, 0, 0.8);
          padding: 8px 16px;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
};

export default TVRecentlyAddedPage;
