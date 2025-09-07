import React, { useEffect, useState, useCallback } from 'react';
import { AnimeAPI } from '../services/api';
import TVVideoPlayer from '../components/tv/TVVideoPlayer';
import LoadingScreen from '../components/tv/LoadingScreen';

interface VideoPlayerPageProps {
  animeId: string;
  episodeNumber?: number;
  episodeId?: string;
  onExit?: () => void;
  onEpisodeChange?: (animeId: string, episodeNumber: number) => void;
}

interface Episode {
  number: number;
  title: string;
  episodeId: string;
  isFiller: boolean;
}

// Remove unused EpisodeServersResponse interface

interface EpisodeSourcesResponse {
  success: boolean;
  data: {
    headers: Record<string, string>;
    sources: Array<{
      url: string;
      isM3U8: boolean;
      quality?: string;
    }>;
    subtitles: Array<{
      lang: string;
      url: string;
    }>;
    anilistID: number | null;
    malID: number | null;
  };
}

interface AnimeEpisodesResponse {
  success: boolean;
  data: {
    totalEpisodes: number;
    episodes: Episode[];
  };
}

interface AnimeInfoResponse {
  success: boolean;
  data: {
    anime: {
      info: {
        name: string;
        poster: string;
        description: string;
        stats: {
          rating: string;
          quality: string;
          episodes: {
            sub: number;
            dub: number;
          };
          type: string;
          duration: string;
        };
      };
      moreInfo: {
        aired: string;
        genres: string[];
        status: string;
        studios: string;
        duration: string;
      };
    };
  };
}

const VideoPlayerPage: React.FC<VideoPlayerPageProps> = ({
  animeId: rawAnimeId,
  episodeNumber = 1,
  episodeId,
  onExit,
  onEpisodeChange,
}) => {
  // Clean animeId to remove any query parameters
  const animeId = rawAnimeId.split('?')[0];
  
  const [episodes, setEpisodes] = useState<AnimeEpisodesResponse | null>(null);
  const [currentEpisodeId, setCurrentEpisodeId] = useState<string>('');
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  // Remove unused servers state
  const [sources, setSources] = useState<EpisodeSourcesResponse | null>(null);
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'sub' | 'dub' | 'raw'>('sub');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animeInfo, setAnimeInfo] = useState<AnimeInfoResponse['data']['anime'] | null>(null);

  // Refresh function
  const refreshPage = useCallback(() => {
    window.location.reload();
  }, []);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'r':
          event.preventDefault();
          refreshPage();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [refreshPage]);

  const fetchSources = useCallback(async (episodeId: string, server: string, category: 'sub' | 'dub' | 'raw') => {
    try {
      console.log(`Fetching TV sources for server: ${server}, category: ${category}`);
      const sourcesData = await AnimeAPI.getStreamingSources(episodeId, server, category);
      
      if (sourcesData.success) {
        setSources(sourcesData);
        console.log('TV Video Sources loaded:', sourcesData.data.sources);
      } else {
        console.error('Sources API returned success: false');
        throw new Error('Failed to load video sources');
      }
    } catch (err) {
      console.error('Error fetching TV sources:', err);
      setError(`Unable to load video sources: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  useEffect(() => {
    const fetchEpisodeData = async () => {
      console.log('=== TV WATCH PAGE DEBUG ===');
      console.log('animeId:', animeId);
      console.log('episodeNumber:', episodeNumber);
      console.log('episodeId:', episodeId);
      
      if (!animeId) {
        setError('No anime ID provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('Using cleaned animeId:', animeId);
        
        // Get episodes list
        console.log('Fetching episodes for TV anime:', animeId);
        const episodesData = await AnimeAPI.getAnimeEpisodes(animeId);
        
        // Get anime info
        try {
          const animeData = await AnimeAPI.getAnimeDetails(animeId);
          if (animeData.success) {
            setAnimeInfo(animeData.data.anime);
          }
        } catch (err) {
          console.log('Could not fetch anime info:', err);
        }
        
        if (!episodesData.success || !episodesData.data?.episodes || !episodesData.data.episodes.length) {
          setError('No episodes found for this anime');
          setLoading(false);
          return;
        }
        
        setEpisodes(episodesData);
        
        // Determine which episode to load
        let targetEpisode;
        if (episodeId) {
          // Direct episode ID provided
          targetEpisode = episodesData.data.episodes.find(ep => ep.episodeId === episodeId);
        } else if (episodeNumber) {
          // Find by episode number
          targetEpisode = episodesData.data.episodes.find(ep => ep.number === episodeNumber);
        }
        
        if (!targetEpisode) {
          // Default to first episode
          targetEpisode = episodesData.data.episodes[0];
        }
        
        console.log('Target episode for TV:', targetEpisode);
        setCurrentEpisode(targetEpisode);
        setCurrentEpisodeId(targetEpisode.episodeId);
        
        // Use default server settings
        const defaultServer = 'hd-1';
        const defaultCategory: 'sub' | 'dub' | 'raw' = 'sub';
        
        setSelectedServer(defaultServer);
        setSelectedCategory(defaultCategory);
        
        // Fetch sources directly with default settings
        
        console.log('Using default TV server:', defaultServer, 'category:', defaultCategory);
        
        // Fetch sources
        await fetchSources(targetEpisode.episodeId, defaultServer, defaultCategory);
        
        setLoading(false);
        
      } catch (err) {
        console.error('Error in TV watch page:', err);
        setError('Failed to load episode data');
        setLoading(false);
      }
    };

    fetchEpisodeData();
  }, [animeId, episodeNumber, episodeId, fetchSources]);

  const handleNextEpisode = useCallback(() => {
    if (!episodes?.data?.episodes || !currentEpisode || episodes.data.episodes.length === 0) return;
    
    const currentIndex = episodes.data.episodes.findIndex(ep => ep.number === currentEpisode.number);
    if (currentIndex >= 0 && currentIndex < episodes.data.episodes.length - 1) {
      const nextEpisode = episodes.data.episodes[currentIndex + 1];
      if (onEpisodeChange) {
        onEpisodeChange(animeId, nextEpisode.number);
      }
    }
  }, [episodes, currentEpisode, animeId, onEpisodeChange]);

  const handlePreviousEpisode = useCallback(() => {
    if (!episodes?.data?.episodes || !currentEpisode || episodes.data.episodes.length === 0) return;
    
    const currentIndex = episodes.data.episodes.findIndex(ep => ep.number === currentEpisode.number);
    if (currentIndex > 0) {
      const prevEpisode = episodes.data.episodes[currentIndex - 1];
      if (onEpisodeChange) {
        onEpisodeChange(animeId, prevEpisode.number);
      }
    }
  }, [episodes, currentEpisode, animeId, onEpisodeChange]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center space-y-6">
          <div className="text-red-500 text-8xl">⚠️</div>
          <h2 className="text-4xl font-bold text-white">Video Error</h2>
          <p className="text-2xl text-gray-300">{error}</p>
          <div className="flex gap-6 justify-center">
            <button 
              className="tv-button bg-blue-600 hover:bg-blue-700 text-white text-2xl px-8 py-4 rounded-lg"
              onClick={refreshPage}
              data-focusable="true"
            >
              Retry (R)
            </button>
            <button 
              className="tv-button bg-red-600 hover:bg-red-700 text-white text-2xl px-8 py-4 rounded-lg"
              onClick={onExit}
              data-focusable="true"
            >
              Back to Anime
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!sources?.data?.sources || sources.data.sources.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center space-y-6">
          <div className="text-yellow-500 text-8xl">📺</div>
          <h2 className="text-4xl font-bold text-white">No Video Sources</h2>
          <p className="text-2xl text-gray-300">No streaming sources available for this episode</p>
          <div className="flex gap-6 justify-center">
            <button 
              className="tv-button bg-blue-600 hover:bg-blue-700 text-white text-2xl px-8 py-4 rounded-lg"
              onClick={refreshPage}
              data-focusable="true"
            >
              Retry (R)
            </button>
            <button 
              className="tv-button bg-gray-600 hover:bg-gray-700 text-white text-2xl px-8 py-4 rounded-lg"
              onClick={onExit}
              data-focusable="true"
            >
              Back to Anime
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TVVideoPlayer
      sources={sources.data.sources}
      subtitles={sources.data.subtitles}
      animeTitle={animeInfo?.info.name || 'Unknown Anime'}
      episodeTitle={currentEpisode ? `Episode ${currentEpisode.number}${currentEpisode.title ? ` - ${currentEpisode.title}` : ''}` : 'Unknown Episode'}
      onExit={onExit}
      onNextEpisode={handleNextEpisode}
      onPreviousEpisode={handlePreviousEpisode}
    />
  );
};

export default VideoPlayerPage;
