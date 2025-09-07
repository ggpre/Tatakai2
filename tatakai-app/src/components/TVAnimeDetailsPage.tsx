'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimeAPI, type AnimeInfo, type AnimeMoreInfo, type Episode, type Anime } from '@/lib/api';
import { 
  Play, 
  Star, 
  Calendar, 
  Users, 
  Clock, 
  ArrowLeft, 
  Plus,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Share,
  Heart
} from 'lucide-react';
import { useNavigation } from '@/contexts/NavigationContext';
import TVNavbar from '@/components/TVNavbar';
import '@/styles/tv.css';

interface RecommendedAnime extends Anime {}

const TVAnimeDetailsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { registerElement, unregisterElement } = useNavigation();
  
  // State
  const [animeInfo, setAnimeInfo] = useState<AnimeInfo | null>(null);
  const [moreInfo, setMoreInfo] = useState<AnimeMoreInfo | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'episodes' | 'recommendations'>('overview');
  const [selectedEpisode, setSelectedEpisode] = useState<number>(0);
  const [selectedRecommendation, setSelectedRecommendation] = useState<number>(0);

  // Refs for navigation
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const watchButtonRef = useRef<HTMLButtonElement>(null);
  const trailerButtonRef = useRef<HTMLButtonElement>(null);
  const addListButtonRef = useRef<HTMLButtonElement>(null);
  const favoriteButtonRef = useRef<HTMLButtonElement>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const episodeRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});
  const recommendationRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});

  const animeId = params.id as string;

  useEffect(() => {
    const fetchAnimeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch anime info
        const infoData = await AnimeAPI.getAnimeInfo(animeId);
        if (infoData && infoData.success) {
          setAnimeInfo(infoData.data.anime.info);
          setMoreInfo(infoData.data.anime.moreInfo);
        }

        // Fetch episodes
        const episodesData = await AnimeAPI.getAnimeEpisodes(animeId);
        if (episodesData && episodesData.success) {
          setEpisodes(episodesData.data.episodes || []);
        }

        // Mock recommendations (replace with actual API call when available)
        const mockRecommendations = [
          { id: 'rec1', name: 'Attack on Titan', poster: '/mock-poster1.jpg', type: 'TV' },
          { id: 'rec2', name: 'One Piece', poster: '/mock-poster2.jpg', type: 'TV' },
          { id: 'rec3', name: 'Naruto', poster: '/mock-poster3.jpg', type: 'TV' },
          { id: 'rec4', name: 'Dragon Ball Z', poster: '/mock-poster4.jpg', type: 'TV' },
        ];
        setRecommendations(mockRecommendations);

      } catch (err) {
        console.error('Error fetching anime data:', err);
        setError('Unable to load anime information');
      } finally {
        setLoading(false);
      }
    };

    if (animeId) {
      fetchAnimeData();
    }
  }, [animeId]);

  // Register navigation elements
  useEffect(() => {
    // Main action buttons
    if (backButtonRef.current) registerElement('back-button', backButtonRef.current);
    if (watchButtonRef.current) registerElement('watch-button', watchButtonRef.current);
    if (trailerButtonRef.current) registerElement('trailer-button', trailerButtonRef.current);
    if (addListButtonRef.current) registerElement('add-list-button', addListButtonRef.current);
    if (favoriteButtonRef.current) registerElement('favorite-button', favoriteButtonRef.current);
    if (shareButtonRef.current) registerElement('share-button', shareButtonRef.current);

    // Tab buttons
    Object.entries(tabRefs.current).forEach(([key, element]) => {
      if (element) registerElement(`tab-${key}`, element);
    });

    // Episode buttons
    Object.entries(episodeRefs.current).forEach(([key, element]) => {
      if (element) registerElement(`episode-${key}`, element);
    });

    // Recommendation buttons
    Object.entries(recommendationRefs.current).forEach(([key, element]) => {
      if (element) registerElement(`recommendation-${key}`, element);
    });

    return () => {
      unregisterElement('back-button');
      unregisterElement('watch-button');
      unregisterElement('trailer-button');
      unregisterElement('add-list-button');
      unregisterElement('favorite-button');
      unregisterElement('share-button');
      
      Object.keys(tabRefs.current).forEach(key => {
        unregisterElement(`tab-${key}`);
      });
      
      Object.keys(episodeRefs.current).forEach(key => {
        unregisterElement(`episode-${key}`);
      });
      
      Object.keys(recommendationRefs.current).forEach(key => {
        unregisterElement(`recommendation-${key}`);
      });
    };
  }, [registerElement, unregisterElement, episodes, recommendations]);

  // Auto-scroll to selected episode when it changes
  useEffect(() => {
    if (selectedTab === 'episodes') {
      const episodeElement = episodeRefs.current[selectedEpisode];
      if (episodeElement) {
        episodeElement.focus();
        episodeElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }
  }, [selectedEpisode, selectedTab]);

  // Auto-scroll to selected recommendation when it changes
  useEffect(() => {
    if (selectedTab === 'recommendations') {
      const recommendationElement = recommendationRefs.current[selectedRecommendation];
      if (recommendationElement) {
        recommendationElement.focus();
        recommendationElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }
  }, [selectedRecommendation, selectedTab]);

  // D-pad navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (selectedTab === 'episodes') {
            if (selectedEpisode < 4) {
              // If in first row, go to tabs
              const tabElement = tabRefs.current['episodes'];
              if (tabElement) {
                tabElement.focus();
                setSelectedTab('episodes'); // Ensure tab is selected
              }
            } else {
              // Grid navigation: move up by 4 (one row up in 4-column grid)
              const newIndex = Math.max(0, selectedEpisode - 4);
              setSelectedEpisode(newIndex);
              
              // Auto-scroll if needed
              const episodeElement = episodeRefs.current[newIndex];
              if (episodeElement) {
                episodeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
            }
          } else if (selectedTab === 'recommendations' && selectedRecommendation > 0) {
            setSelectedRecommendation(prev => prev - 1);
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (selectedTab === 'episodes') {
            // Grid navigation: move down by 4 (one row down in 4-column grid)
            const newIndex = Math.min(episodes.length - 1, selectedEpisode + 4);
            setSelectedEpisode(newIndex);
            
            // Auto-scroll if needed
            const episodeElement = episodeRefs.current[newIndex];
            if (episodeElement) {
              episodeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          } else if (selectedTab === 'recommendations' && selectedRecommendation < recommendations.length - 1) {
            setSelectedRecommendation(prev => prev + 1);
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          if (selectedTab === 'episodes' && selectedEpisode > 0) {
            // Move to previous episode (left in grid)
            const newIndex = selectedEpisode - 1;
            setSelectedEpisode(newIndex);
            
            // Auto-scroll if needed
            const episodeElement = episodeRefs.current[newIndex];
            if (episodeElement) {
              episodeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          } else if (selectedTab === 'episodes' && selectedEpisode === 0) {
            // Focus navbar when at leftmost edge
            const navHomeElement = document.querySelector('[data-nav-id="nav-home"]') as HTMLElement;
            if (navHomeElement) {
              navHomeElement.focus();
            }
          } else if (selectedTab === 'overview') {
            // Focus navbar from overview tab
            const navHomeElement = document.querySelector('[data-nav-id="nav-home"]') as HTMLElement;
            if (navHomeElement) {
              navHomeElement.focus();
            }
          } else if (selectedTab === 'recommendations') {
            setSelectedTab('episodes');
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (selectedTab === 'episodes' && selectedEpisode < episodes.length - 1) {
            // Move to next episode (right in grid)
            const newIndex = selectedEpisode + 1;
            setSelectedEpisode(newIndex);
            
            // Auto-scroll if needed
            const episodeElement = episodeRefs.current[newIndex];
            if (episodeElement) {
              episodeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          } else if (selectedTab === 'overview') {
            setSelectedTab('episodes');
          } else if (selectedTab === 'episodes') {
            setSelectedTab('recommendations');
          }
          break;

        case 'Enter':
          e.preventDefault();
          if (selectedTab === 'episodes' && episodes[selectedEpisode]) {
            handleEpisodeSelect(episodes[selectedEpisode].episodeId);
          } else if (selectedTab === 'recommendations' && recommendations[selectedRecommendation]) {
            handleRecommendationSelect(recommendations[selectedRecommendation].id);
          }
          break;

        case 'Backspace':
        case 'Escape':
          e.preventDefault();
          handleBack();
          break;

        case 'p':
        case 'P':
          e.preventDefault();
          handleWatch('1');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedTab, selectedEpisode, selectedRecommendation, episodes, recommendations]);

  // Handlers
  const handleBack = () => {
    router.back();
  };

  const handleWatch = (episodeNumber?: string) => {
    const episode = episodeNumber || '1';
    router.push(`/tv/watch/${animeId}?episode=${episode}`);
  };

  const handleTrailer = () => {
    if (animeInfo?.promotionalVideos?.[0]) {
      console.log('Playing trailer:', animeInfo.promotionalVideos[0]);
    }
  };

  const handleAddToList = () => {
    console.log('Adding to list:', animeId);
  };

  const handleFavorite = () => {
    console.log('Adding to favorites:', animeId);
  };

  const handleShare = () => {
    console.log('Sharing anime:', animeId);
  };

  const handleTabChange = (tab: 'overview' | 'episodes' | 'recommendations') => {
    setSelectedTab(tab);
  };

  const handleEpisodeSelect = (episodeNumber: string) => {
    handleWatch(episodeNumber);
  };

  const handleRecommendationSelect = (recommendationId: string) => {
    router.push(`/anime/${recommendationId}`);
  };

  if (loading) {
    return (
      <>
        <TVNavbar />
        <div className="tv-layout-with-navbar">
          <div className="tv-anime-details tv-loading">
            <div className="tv-loading-content">
              <div className="tv-loading-spinner"></div>
              <p>Loading anime details...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !animeInfo) {
    return (
      <>
        <TVNavbar />
        <div className="tv-layout-with-navbar">
          <div className="tv-anime-details tv-error">
            <div className="tv-error-content">
              <h2>Unable to load anime details</h2>
              <p>{error}</p>
              <button
                ref={backButtonRef}
                onClick={handleBack}
                className="tv-button tv-button--primary"
              >
                <ArrowLeft className="w-5 h-5" />
                Go Back
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TVNavbar />
      <div className="tv-layout-with-navbar">
        <div className="tv-anime-details">
          {/* Background */}
          <div className="tv-details-bg">
            <img
              src={animeInfo.poster}
              alt={animeInfo.name}
              className="tv-details-bg__image"
            />
            <div className="tv-details-bg__overlay"></div>
          </div>

          {/* Content */}
          <div className="tv-details-content">
            {/* Header */}
            <div className="tv-details-header">
              <button
                ref={backButtonRef}
                onClick={handleBack}
                className="tv-button tv-button--back"
              >
                <ArrowLeft className="w-6 h-6" />
                Back
              </button>
            </div>

            {/* Main Info */}
            <div className="tv-details-main">
              <div className="tv-details-poster">
                <img
                  src={animeInfo.poster}
                  alt={animeInfo.name}
                  className="tv-details-poster__image"
                />
              </div>

              <div className="tv-details-info">
                <h1 className="tv-details-title">{animeInfo.name}</h1>
                
                <div className="tv-details-meta">
                  <div className="tv-meta-item">
                    <Star className="tv-meta-icon" />
                    <span>{animeInfo.stats.rating}</span>
                  </div>
                  <div className="tv-meta-item">
                    <Calendar className="tv-meta-icon" />
                    <span>{moreInfo?.aired}</span>
                  </div>
                  <div className="tv-meta-item">
                    <Users className="tv-meta-icon" />
                    <span>{animeInfo.stats.episodes.sub} Episodes</span>
                  </div>
                  <div className="tv-meta-item">
                    <Clock className="tv-meta-icon" />
                    <span>{animeInfo.stats.duration}</span>
                  </div>
                </div>

                <div className="tv-details-genres">
                  {moreInfo?.genres.map((genre: string, index: number) => (
                    <span key={index} className="tv-genre-tag">
                      {genre}
                    </span>
                  ))}
                </div>

                <p className="tv-details-description">
                  {animeInfo.description}
                </p>

                {/* Action Buttons */}
                <div className="tv-details-actions">
                  <button
                    ref={watchButtonRef}
                    onClick={() => handleWatch()}
                    className="tv-button tv-button--primary"
                  >
                    <Play className="w-6 h-6" />
                    Watch Now
                  </button>
                  
                  {animeInfo.promotionalVideos?.[0] && (
                    <button
                      ref={trailerButtonRef}
                      onClick={handleTrailer}
                      className="tv-button tv-button--secondary"
                    >
                      <Play className="w-5 h-5" />
                      Trailer
                    </button>
                  )}

                  <button
                    ref={addListButtonRef}
                    onClick={handleAddToList}
                    className="tv-button tv-button--secondary"
                  >
                    <Plus className="w-5 h-5" />
                    My List
                  </button>

                  <button
                    ref={favoriteButtonRef}
                    onClick={handleFavorite}
                    className="tv-button tv-button--secondary"
                  >
                    <Heart className="w-5 h-5" />
                    Favorite
                  </button>

                  <button
                    ref={shareButtonRef}
                    onClick={handleShare}
                    className="tv-button tv-button--secondary"
                  >
                    <Share className="w-5 h-5" />
                    Share
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="tv-details-tabs">
              <div className="tv-tabs-nav">
                <button
                  ref={(el) => { tabRefs.current['overview'] = el; }}
                  onClick={() => handleTabChange('overview')}
                  className={`tv-tab-button ${selectedTab === 'overview' ? 'active' : ''}`}
                >
                  Overview
                </button>
                <button
                  ref={(el) => { tabRefs.current['episodes'] = el; }}
                  onClick={() => handleTabChange('episodes')}
                  className={`tv-tab-button ${selectedTab === 'episodes' ? 'active' : ''}`}
                >
                  Episodes ({episodes.length})
                </button>
                <button
                  ref={(el) => { tabRefs.current['recommendations'] = el; }}
                  onClick={() => handleTabChange('recommendations')}
                  className={`tv-tab-button ${selectedTab === 'recommendations' ? 'active' : ''}`}
                >
                  Recommendations
                </button>
              </div>

              {/* Tab Content */}
              <div className="tv-tabs-content">
                {selectedTab === 'overview' && (
                  <div className="tv-tab-panel">
                    <div className="tv-overview-content">
                      <h3>Synopsis</h3>
                      <p>{animeInfo.description}</p>
                      
                      {moreInfo && (
                        <div className="tv-overview-details">
                          <div className="tv-detail-row">
                            <span className="tv-detail-label">Studio:</span>
                            <span className="tv-detail-value">{moreInfo.studios || 'Unknown'}</span>
                          </div>
                          <div className="tv-detail-row">
                            <span className="tv-detail-label">Status:</span>
                            <span className="tv-detail-value">{moreInfo.status || 'Unknown'}</span>
                          </div>
                          <div className="tv-detail-row">
                            <span className="tv-detail-label">Aired:</span>
                            <span className="tv-detail-value">{moreInfo.aired || 'Unknown'}</span>
                          </div>
                          <div className="tv-detail-row">
                            <span className="tv-detail-label">Aired:</span>
                            <span className="tv-detail-value">{moreInfo.aired || 'Unknown'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedTab === 'episodes' && (
                  <div className="tv-tab-panel">
                    <div className="tv-episodes-grid">
                      {episodes.map((episode, index) => (
                        <button
                          key={index}
                          ref={(el) => { episodeRefs.current[index] = el; }}
                          onClick={() => handleEpisodeSelect(episode.number.toString())}
                          className={`tv-episode-card ${selectedEpisode === index ? 'selected' : ''}`}
                        >
                          <div className="tv-episode-number">Episode {episode.number}</div>
                          <div className="tv-episode-title">{episode.title || `Episode ${episode.number}`}</div>
                          {episode.isFiller && (
                            <div className="tv-episode-filler">Filler</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTab === 'recommendations' && (
                  <div className="tv-tab-panel">
                    <div className="tv-recommendations-grid">
                      {recommendations.map((anime, index) => (
                        <button
                          key={anime.id}
                          ref={(el) => { recommendationRefs.current[index] = el; }}
                          onClick={() => handleRecommendationSelect(anime.id)}
                          className={`tv-recommendation-card ${selectedRecommendation === index ? 'selected' : ''}`}
                        >
                          <img
                            src={anime.poster}
                            alt={anime.name}
                            className="tv-recommendation-poster"
                          />
                          <div className="tv-recommendation-info">
                            <h4 className="tv-recommendation-title">{anime.name}</h4>
                            <span className="tv-recommendation-type">{anime.type}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TVAnimeDetailsPage;
