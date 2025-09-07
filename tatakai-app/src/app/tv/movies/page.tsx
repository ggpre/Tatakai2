'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { AnimeAPI, type Anime } from '@/lib/api';
import { ArrowLeft, Filter, Star, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import TVNavbar from '@/components/TVNavbar';

const TVMoviesPage: React.FC = () => {
  const router = useRouter();
  const { registerElement, unregisterElement } = useNavigation();
  const containerRef = useRef<HTMLDivElement>(null);

  const [movies, setMovies] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'latest' | 'top'>('all');
  const [scrollPosition, setScrollPosition] = useState(0);

  // Register for navigation
  useEffect(() => {
    if (containerRef.current) {
      registerElement('tv-movies-page', containerRef.current);
      return () => unregisterElement('tv-movies-page');
    }
  }, [registerElement, unregisterElement]);

  // Load movies
  useEffect(() => {
    loadMovies();
  }, [currentPage, selectedFilter]);

  // D-pad navigation with improved scrolling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (showFilters) {
            // Navigate filters
            const filters: ('all' | 'latest' | 'top')[] = ['all', 'latest', 'top'];
            const currentIndex = filters.indexOf(selectedFilter);
            setSelectedFilter(filters[(currentIndex - 1 + filters.length) % filters.length]);
          } else if (movies.length > 0) {
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
          if (showFilters) {
            // Navigate filters
            const filters: ('all' | 'latest' | 'top')[] = ['all', 'latest', 'top'];
            const currentIndex = filters.indexOf(selectedFilter);
            setSelectedFilter(filters[(currentIndex + 1) % filters.length]);
          } else if (movies.length > 0) {
            const itemsPerRow = 4;
            setSelectedIndex(prev => {
              const newIndex = prev + itemsPerRow;
              if (newIndex < movies.length) {
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
          if (!showFilters && movies.length > 0) {
            setSelectedIndex(prev => prev > 0 ? prev - 1 : movies.length - 1);
          } else if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (!showFilters && movies.length > 0) {
            setSelectedIndex(prev => prev < movies.length - 1 ? prev + 1 : 0);
          } else if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
          }
          break;

        case 'Enter':
          e.preventDefault();
          if (showFilters) {
            setShowFilters(false);
            setCurrentPage(1);
          } else if (movies.length > 0) {
            const selectedMovie = movies[selectedIndex];
            router.push(`/anime/${selectedMovie.id}`);
          }
          break;

        case 'Backspace':
        case 'Escape':
          e.preventDefault();
          if (showFilters) {
            setShowFilters(false);
          } else {
            router.back();
          }
          break;

        case 'f':
        case 'F':
          e.preventDefault();
          setShowFilters(!showFilters);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [movies, selectedIndex, showFilters, selectedFilter, currentPage, totalPages, router]);

  const loadMovies = async () => {
    setIsLoading(true);
    try {
      let response;
      
      switch (selectedFilter) {
        case 'top':
          response = await AnimeAPI.getAnimeByCategory('top-airing', currentPage);
          break;
        case 'latest':
          response = await AnimeAPI.getAnimeByCategory('recently-updated', currentPage);
          break;
        default:
          response = await AnimeAPI.getAnimeByCategory('movie', currentPage);
          break;
      }

      if (response.success) {
        const animeData = response.data.animes || [];
        // Filter for movies if not using movie category
        const movieData = selectedFilter === 'all' ? animeData : 
          animeData.filter((anime: Anime) => 
            anime.type?.toLowerCase().includes('movie')
          );
        
        setMovies(movieData);
        setTotalPages(response.data.totalPages || 1);
        setSelectedIndex(0);
      }
    } catch (error) {
      console.error('Failed to load movies:', error);
      // Fallback: try to get home page data
      try {
        const homeResponse = await AnimeAPI.getHomePage();
        if (homeResponse.success) {
          const movieData = homeResponse.data.latestEpisodeAnimes.filter((anime: Anime) => 
            anime.type?.toLowerCase().includes('movie')
          );
          setMovies(movieData);
          setTotalPages(1);
          setSelectedIndex(0);
        }
      } catch (fallbackError) {
        console.error('Fallback failed:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  const getFilterLabel = (filter: string) => {
    switch (filter) {
      case 'latest': return 'Latest Movies';
      case 'top': return 'Top Rated';
      default: return 'All Movies';
    }
  };

  return (
    <div ref={containerRef} className="tv-movies-page">
      <TVNavbar />
      
      <div className="tv-movies-container">
        {/* Header */}
        <div className="tv-movies-header">
          <button className="tv-back-btn" onClick={goBack}>
            <ArrowLeft size={24} />
            <span>Back</span>
          </button>
          <h1>Anime Movies</h1>
          <button 
            className={`tv-filter-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
            <span>Filter</span>
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="tv-filter-panel">
            <h3>Filter Movies</h3>
            <div className="tv-filter-options">
              {(['all', 'latest', 'top'] as const).map((filter) => (
                <button
                  key={filter}
                  className={`tv-filter-option ${selectedFilter === filter ? 'selected' : ''}`}
                  onClick={() => setSelectedFilter(filter)}
                >
                  {filter === 'latest' && <Calendar size={16} />}
                  {filter === 'top' && <Star size={16} />}
                  <span>{getFilterLabel(filter)}</span>
                </button>
              ))}
            </div>
            <p className="tv-filter-hint">Press Enter to apply filter</p>
          </div>
        )}

        {/* Current Filter Display */}
        <div className="tv-current-filter">
          <span>Showing: {getFilterLabel(selectedFilter)}</span>
          <span>Page {currentPage} of {totalPages}</span>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="tv-loading">
            <div className="tv-loading-spinner"></div>
            <p>Loading movies...</p>
          </div>
        )}

        {/* Movies Grid */}
        {!isLoading && movies.length > 0 && (
          <div 
            className="tv-movies-grid"
            style={{ transform: `translateY(-${scrollPosition}px)` }}
          >
            {movies.map((movie, index) => (
              <div
                key={movie.id}
                className={`tv-movie-card ${selectedIndex === index ? 'tv-selected' : ''}`}
              >
                <div className="tv-movie-poster">
                  <img src={movie.poster} alt={movie.name} />
                  <div className="tv-movie-overlay">
                    <div className="tv-movie-type">
                      {movie.type || 'Movie'}
                    </div>
                    {movie.rating && (
                      <div className="tv-movie-rating">
                        <Star size={12} />
                        <span>{movie.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="tv-movie-info">
                  <h3>{movie.name}</h3>
                  {movie.jname && (
                    <p className="tv-movie-jname">{movie.jname}</p>
                  )}
                  {movie.duration && (
                    <span className="tv-movie-duration">{movie.duration}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Movies */}
        {!isLoading && movies.length === 0 && (
          <div className="tv-no-movies">
            <p>No movies found</p>
            <p>Try changing the filter or check back later</p>
          </div>
        )}

        {/* Pagination Info */}
        {movies.length > 0 && (
          <div className="tv-pagination">
            <p>
              Use ← → to change pages • Currently on page {currentPage} of {totalPages}
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="tv-instructions">
          <p>Use D-pad to navigate • Enter to select • F for filters • ← → for pages</p>
        </div>
      </div>

      <style jsx>{`
        .tv-movies-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
          color: white;
          font-family: 'Inter', sans-serif;
        }

        .tv-movies-container {
          padding: 20px 40px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .tv-movies-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 30px;
        }

        .tv-back-btn,
        .tv-filter-btn {
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

        .tv-filter-btn.active,
        .tv-back-btn:hover,
        .tv-filter-btn:hover {
          background: rgba(255, 107, 53, 0.2);
          border-color: #ff6b35;
        }

        .tv-movies-header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 700;
          background: linear-gradient(45deg, #ff6b35, #f7931e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .tv-filter-panel {
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid #ff6b35;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .tv-filter-panel h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
        }

        .tv-filter-options {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .tv-filter-option {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid transparent;
          padding: 10px 16px;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tv-filter-option.selected {
          background: rgba(255, 107, 53, 0.2);
          border-color: #ff6b35;
        }

        .tv-filter-hint {
          margin: 0;
          font-size: 12px;
          opacity: 0.7;
        }

        .tv-current-filter {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
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
          border-top: 3px solid #ff6b35;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .tv-movies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .tv-movie-card {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid transparent;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .tv-movie-card.tv-selected {
          background: rgba(229, 9, 20, 0.2);
          border-color: #e50914;
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(229, 9, 20, 0.5);
        }

        .tv-movie-poster {
          position: relative;
          aspect-ratio: 3/4;
          overflow: hidden;
        }

        .tv-movie-poster img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .tv-movie-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.8) 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 12px;
        }

        .tv-movie-type {
          align-self: flex-start;
          background: rgba(229, 9, 20, 0.9);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .tv-movie-rating {
          align-self: flex-end;
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(0, 0, 0, 0.7);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .tv-movie-info {
          padding: 16px;
        }

        .tv-movie-info h3 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          line-height: 1.3;
        }

        .tv-movie-jname {
          margin: 0 0 8px 0;
          font-size: 14px;
          opacity: 0.7;
          line-height: 1.2;
        }

        .tv-movie-duration {
          font-size: 12px;
          opacity: 0.8;
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .tv-no-movies {
          text-align: center;
          padding: 60px 20px;
          opacity: 0.7;
        }

        .tv-no-movies p {
          margin: 8px 0;
          font-size: 16px;
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

export default TVMoviesPage;
