'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimeAPI, type  EpisodeSource, type Subtitle } from '@/lib/api';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipBack, 
  SkipForward, 
  ArrowLeft, 
  Settings,
  Maximize,
  Minimize
} from 'lucide-react';
import { useNavigation } from '@/contexts/NavigationContext';
import type Hls from 'hls.js';

interface Episode {
  episodeId: string;
  number: number;
  title: string;
}

interface StreamingData {
  headers: {
    Referer: string;
    'User-Agent'?: string;
  };
  sources: EpisodeSource[];
  tracks: Subtitle[];
  anilistID: number | null;
  malID: number | null;
}

const TVVideoPlayer: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { registerElement, unregisterElement } = useNavigation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [streamingData, setStreamingData] = useState<StreamingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const animeId = params.id as string;
  const episodeId = params.episodeId as string;

  // Get proxied URL for external video sources
  const getProxiedUrl = (url: string) => {
    // If it's already a proxy URL, return as is
    if (url.startsWith('/api/video-proxy')) {
      return url;
    }
    
    // If it's an external URL, proxy it
    if (url.startsWith('http')) {
      return `/api/video-proxy?url=${encodeURIComponent(url)}`;
    }
    
    return url;
  };

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const data = await AnimeAPI.getAnimeEpisodes(animeId);
        if (data && data.success) {
          setEpisodes(data.data.episodes);
          const episode = data.data.episodes.find((ep: Episode) => ep.episodeId === episodeId);
          if (episode) {
            setCurrentEpisode(episode);
          }
        }
      } catch (err) {
        console.error('Error fetching episodes:', err);
      }
    };

    const fetchStreamingData = async () => {
      try {
        const data = await AnimeAPI.getEpisodeSources(episodeId);
        if (data && data.success) {
          setStreamingData(data.data);
        }
      } catch (err) {
        console.error('Error fetching streaming data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (animeId && episodeId) {
      fetchEpisodes();
      fetchStreamingData();
    }
  }, [animeId, episodeId]);

  // Initialize video with HLS support
  useEffect(() => {
    const initializeVideo = async () => {
      const video = videoRef.current;
      if (!video || !streamingData?.sources[0]) return;

      const source = streamingData.sources[0];
      const proxiedUrl = getProxiedUrl(source.url);

      setLoading(true);
      setError(null);

      try {
        // Check if source is m3u8
        const isM3U8 = source.url.includes('.m3u8') || source.url.includes('m3u8');

        if (isM3U8) {
          console.log('Loading M3U8 stream with HLS.js');
          // Use HLS.js for M3U8 streams
          const Hls = (await import('hls.js')).default;
          
          if (Hls.isSupported()) {
            console.log('HLS.js is supported');
            // Clean up previous HLS instance
            if (hlsRef.current) {
              hlsRef.current.destroy();
              hlsRef.current = null;
            }
            
            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              debug: false,
            });
            
            hlsRef.current = hls;
            
            console.log('Loading HLS source:', proxiedUrl);
            
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              console.log('HLS manifest parsed successfully');
              setLoading(false);
            });
            
            hls.loadSource(proxiedUrl);
            hls.attachMedia(video);
            
            hls.on(Hls.Events.ERROR, (event: unknown, data: { type: string; details: string; fatal: boolean }) => {
              console.error('HLS Error:', data);
              
              if (data.fatal) {
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    console.error('Fatal network error encountered');
                    setError(`Network error: ${data.details}`);
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    console.error('Fatal media error encountered');
                    setError(`Media error: ${data.details}`);
                    break;
                  default:
                    console.error('Fatal error, cannot recover');
                    setError(`HLS error: ${data.details || 'Unknown error'}`);
                    break;
                }
                setLoading(false);
              }
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            console.log('Using native HLS support');
            video.src = proxiedUrl;
            setLoading(false);
          } else {
            setError('HLS not supported on this browser');
            setLoading(false);
          }
        } else {
          // Direct video source
          console.log('Loading direct video source');
          video.src = proxiedUrl;
          setLoading(false);
        }
      } catch (err) {
        console.error('Error initializing video:', err);
        setError('Failed to load video');
        setLoading(false);
      }
    };

    initializeVideo();

    // Cleanup on unmount
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamingData]);

  // Register navigation elements
  useEffect(() => {
    const controls = [
      'back-button',
      'play-pause-button',
      'volume-button',
      'prev-episode-button',
      'next-episode-button',
      'settings-button',
      'fullscreen-button'
    ];

    controls.forEach(id => {
      const element = document.getElementById(id);
      if (element) registerElement(id, element);
    });

    return () => {
      controls.forEach(id => unregisterElement(id));
    };
  }, [registerElement, unregisterElement]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (playing && showControls) {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => clearTimeout(timeout);
  }, [playing, showControls]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (playing) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleVolumeToggle = () => {
    setMuted(!muted);
    if (videoRef.current) {
      videoRef.current.muted = !muted;
    }
  };

  const handlePrevEpisode = () => {
    const currentIndex = episodes.findIndex(ep => ep.episodeId === episodeId);
    if (currentIndex > 0) {
      const prevEpisode = episodes[currentIndex - 1];
      router.push(`/tv/watch/${animeId}/${prevEpisode.episodeId}`);
    }
  };

  const handleNextEpisode = () => {
    const currentIndex = episodes.findIndex(ep => ep.episodeId === episodeId);
    if (currentIndex < episodes.length - 1) {
      const nextEpisode = episodes[currentIndex + 1];
      router.push(`/tv/watch/${animeId}/${nextEpisode.episodeId}`);
    }
  };

  const handleBack = () => {
    router.push(`/anime/${animeId}`);
  };

  const toggleFullscreen = () => {
    if (fullscreen) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
    setFullscreen(!fullscreen);
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="tv-video-player tv-loading">
        <div className="tv-loading-content">
          <div className="tv-loading-spinner"></div>
          <p>Loading episode...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tv-video-player tv-error">
        <div className="tv-error-content">
          <p>Error: {error}</p>
          <button onClick={() => router.back()}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="tv-video-player" onMouseMove={() => setShowControls(true)}>
      {/* Video Element */}
      <video
        ref={videoRef}
        className="tv-video"
        autoPlay
        onClick={handlePlayPause}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        {streamingData?.tracks.map((track, index) => (
          <track
            key={index}
            kind="subtitles"
            src={getProxiedUrl(track.url)}
            label={track.lang}
            srcLang={track.lang.toLowerCase()}
          />
        ))}
      </video>

      {/* Controls Overlay */}
      <div className={`tv-video-controls ${showControls ? 'tv-controls-visible' : 'tv-controls-hidden'}`}>
        {/* Top Controls */}
        <div className="tv-controls-top">
          <button
            id="back-button"
            onClick={handleBack}
            className="tv-control-button"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="tv-episode-info">
            <h2 className="tv-episode-title">
              Episode {currentEpisode?.number}: {currentEpisode?.title}
            </h2>
          </div>

          <button
            id="settings-button"
            className="tv-control-button"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Center Controls */}
        <div className="tv-controls-center">
          <button
            id="prev-episode-button"
            onClick={handlePrevEpisode}
            className="tv-control-button tv-control-button--large"
            disabled={episodes.findIndex(ep => ep.episodeId === episodeId) === 0}
          >
            <SkipBack className="w-8 h-8" />
          </button>

          <button
            id="play-pause-button"
            onClick={handlePlayPause}
            className="tv-control-button tv-control-button--play"
          >
            {playing ? (
              <Pause className="w-12 h-12" />
            ) : (
              <Play className="w-12 h-12" />
            )}
          </button>

          <button
            id="next-episode-button"
            onClick={handleNextEpisode}
            className="tv-control-button tv-control-button--large"
            disabled={episodes.findIndex(ep => ep.episodeId === episodeId) === episodes.length - 1}
          >
            <SkipForward className="w-8 h-8" />
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="tv-controls-bottom">
          <div className="tv-progress-container">
            <div className="tv-progress-bar">
              <div 
                className="tv-progress-filled"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <div className="tv-time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="tv-controls-right">
            <button
              id="volume-button"
              onClick={handleVolumeToggle}
              className="tv-control-button"
            >
              {muted ? (
                <VolumeX className="w-6 h-6" />
              ) : (
                <Volume2 className="w-6 h-6" />
              )}
            </button>

            <button
              id="fullscreen-button"
              onClick={toggleFullscreen}
              className="tv-control-button"
            >
              {fullscreen ? (
                <Minimize className="w-6 h-6" />
              ) : (
                <Maximize className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVVideoPlayer;
