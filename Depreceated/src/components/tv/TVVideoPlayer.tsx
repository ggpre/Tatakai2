import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRemoteNavigation, REMOTE_KEYS } from '../../context/RemoteNavigationContext';
import VideoProxyService from '../../services/videoProxy';

interface VideoSource {
  url: string;
  quality?: string;
  isM3U8: boolean;
  type?: string;
}

interface VideoSubtitle {
  url: string;
  lang: string;
  label?: string;
}

interface TVVideoPlayerProps {
  sources: VideoSource[];
  subtitles?: VideoSubtitle[];
  animeTitle?: string;
  episodeTitle?: string;
  onExit?: () => void;
  onNextEpisode?: () => void;
  onPreviousEpisode?: () => void;
}

const TVVideoPlayer: React.FC<TVVideoPlayerProps> = ({
  sources,
  subtitles,
  animeTitle,
  episodeTitle,
  onExit,
  onNextEpisode,
  onPreviousEpisode,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('off');
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [showPlaybackSettings, setShowPlaybackSettings] = useState(false);
  const [selectedControl, setSelectedControl] = useState<string>('play-pause');

  const { registerElement, currentFocusId } = useRemoteNavigation();

  // Available controls for navigation
  const controls = [
    'play-pause',
    'prev-episode', 
    'next-episode',
    'rewind',
    'fast-forward',
    'volume',
    'subtitles',
    'settings',
    'exit'
  ];

  // Get the best quality source
  const getBestSource = () => {
    if (!sources || sources.length === 0) return null;
    
    // Prefer m3u8 sources
    const m3u8Sources = sources.filter(s => s.isM3U8);
    if (m3u8Sources.length > 0) {
      return m3u8Sources[0];
    }
    
    return sources[0];
  };

  const currentSource = getBestSource();

  // Initialize video source
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentSource) return;

    const loadVideo = async () => {
      try {
        setError(null);
        setIsLoading(true);
        
        const proxiedUrl = VideoProxyService.getProxiedUrl(currentSource.url);
        console.log('Loading TV video source:', proxiedUrl);
        
        if (currentSource.isM3U8) {
          // Use HLS.js for M3U8 streams
          const Hls = (await import('hls.js')).default;
          
          if (Hls.isSupported()) {
            if (hlsRef.current) {
              hlsRef.current.destroy();
            }
            
            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              debug: false,
            });
            
            hlsRef.current = hls;
            
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              console.log('HLS manifest parsed for TV');
              setIsLoading(false);
            });
            
            hls.on(Hls.Events.ERROR, (event, data) => {
              console.error('HLS error:', data);
              if (data.fatal) {
                setError('Failed to load video stream');
              }
            });
            
            hls.loadSource(proxiedUrl);
            hls.attachMedia(video);
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support
            video.src = proxiedUrl;
            setIsLoading(false);
          } else {
            setError('HLS not supported on this device');
          }
        } else {
          // Direct video source
          video.src = proxiedUrl;
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading video:', err);
        setError('Failed to load video');
        setIsLoading(false);
      }
    };

    loadVideo();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentSource]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      // Auto-play next episode
      if (onNextEpisode) {
        onNextEpisode();
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onNextEpisode]);

  // Remote control handling
  const handleRemoteKey = useCallback((keyCode: number) => {
    const video = videoRef.current;
    if (!video) return;

    switch (keyCode) {
      case REMOTE_KEYS.ENTER:
      case REMOTE_KEYS.OK:
      case REMOTE_KEYS.PLAY:
        if (showPlaybackSettings) {
          // Handle settings navigation
        } else {
          togglePlayPause();
        }
        break;
        
      case REMOTE_KEYS.PAUSE:
        video.pause();
        break;
        
      case REMOTE_KEYS.BACK:
        if (showPlaybackSettings) {
          setShowPlaybackSettings(false);
        } else if (onExit) {
          onExit();
        }
        break;
        
      case REMOTE_KEYS.LEFT:
        if (!showPlaybackSettings) {
          // Rewind 10 seconds
          video.currentTime = Math.max(0, video.currentTime - 10);
        } else {
          navigateControls('left');
        }
        break;
        
      case REMOTE_KEYS.RIGHT:
        if (!showPlaybackSettings) {
          // Fast forward 10 seconds
          video.currentTime = Math.min(duration, video.currentTime + 10);
        } else {
          navigateControls('right');
        }
        break;
        
      case REMOTE_KEYS.UP:
        if (!showPlaybackSettings) {
          setShowControls(true);
          resetControlsTimeout();
          navigateControls('up');
        }
        break;
        
      case REMOTE_KEYS.DOWN:
        if (!showPlaybackSettings) {
          navigateControls('down');
        }
        break;
        
      case REMOTE_KEYS.FAST_FORWARD:
        video.currentTime = Math.min(duration, video.currentTime + 30);
        break;
        
      case REMOTE_KEYS.REWIND:
        video.currentTime = Math.max(0, video.currentTime - 30);
        break;
        
      case REMOTE_KEYS.VOLUME_UP:
        setVolume(prev => Math.min(1, prev + 0.1));
        break;
        
      case REMOTE_KEYS.VOLUME_DOWN:
        setVolume(prev => Math.max(0, prev - 0.1));
        break;
        
      case REMOTE_KEYS.MUTE:
        setIsMuted(prev => !prev);
        break;
        
      case REMOTE_KEYS.RED:
        if (onPreviousEpisode) onPreviousEpisode();
        break;
        
      case REMOTE_KEYS.GREEN:
        if (onNextEpisode) onNextEpisode();
        break;
        
      case REMOTE_KEYS.YELLOW:
        setShowPlaybackSettings(prev => !prev);
        break;
        
      case REMOTE_KEYS.BLUE:
        toggleSubtitles();
        break;
    }
    
    // Show controls when any key is pressed
    setShowControls(true);
    resetControlsTimeout();
  }, [showPlaybackSettings, duration, onExit, onNextEpisode, onPreviousEpisode]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const navigateControls = (direction: 'up' | 'down' | 'left' | 'right') => {
    const currentIndex = controls.indexOf(selectedControl);
    
    if (direction === 'left' && currentIndex > 0) {
      setSelectedControl(controls[currentIndex - 1]);
    } else if (direction === 'right' && currentIndex < controls.length - 1) {
      setSelectedControl(controls[currentIndex + 1]);
    }
  };

  const toggleSubtitles = () => {
    if (!subtitles || subtitles.length === 0) return;
    
    const currentIndex = subtitles.findIndex(sub => sub.lang === currentSubtitle);
    if (currentIndex === -1 || currentIndex === subtitles.length - 1) {
      setCurrentSubtitle('off');
    } else {
      setCurrentSubtitle(subtitles[currentIndex + 1].lang);
    }
  };

  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 5000);
  };

  // Update volume
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = volume;
      video.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Register remote control listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      handleRemoteKey(event.keyCode);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRemoteKey]);

  // Hide controls timeout
  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center space-y-6">
          <div className="text-red-500 text-8xl">⚠️</div>
          <h2 className="text-4xl font-bold text-white">Video Error</h2>
          <p className="text-2xl text-gray-300">{error}</p>
          <button 
            className="tv-button bg-red-600 hover:bg-red-700 text-white text-2xl px-8 py-4 rounded-lg"
            onClick={onExit}
            data-focusable="true"
          >
            Back to Anime
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Video */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls={false}
        autoPlay
        playsInline
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
            <p className="text-white text-2xl">Loading video...</p>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"
          >
            {/* Top Info Bar */}
            <div className="absolute top-0 left-0 right-0 p-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">{animeTitle}</h1>
                  <p className="text-lg text-gray-300">{episodeTitle}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg text-white">{formatTime(currentTime)} / {formatTime(duration)}</p>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all"
                    style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                  />
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex justify-center items-center space-x-8">
                <button
                  className={`tv-button p-4 rounded-full ${selectedControl === 'prev-episode' ? 'bg-white text-black' : 'bg-gray-800 text-white'} hover:bg-white hover:text-black`}
                  onClick={onPreviousEpisode}
                  data-focusable="true"
                >
                  <span className="text-2xl">⏮</span>
                </button>

                <button
                  className={`tv-button p-4 rounded-full ${selectedControl === 'rewind' ? 'bg-white text-black' : 'bg-gray-800 text-white'} hover:bg-white hover:text-black`}
                  onClick={() => videoRef.current && (videoRef.current.currentTime -= 10)}
                  data-focusable="true"
                >
                  <span className="text-2xl">⏪</span>
                </button>

                <button
                  className={`tv-button p-6 rounded-full ${selectedControl === 'play-pause' ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'} hover:bg-red-600`}
                  onClick={togglePlayPause}
                  data-focusable="true"
                >
                  <span className="text-3xl">{isPlaying ? '⏸' : '▶'}</span>
                </button>

                <button
                  className={`tv-button p-4 rounded-full ${selectedControl === 'fast-forward' ? 'bg-white text-black' : 'bg-gray-800 text-white'} hover:bg-white hover:text-black`}
                  onClick={() => videoRef.current && (videoRef.current.currentTime += 10)}
                  data-focusable="true"
                >
                  <span className="text-2xl">⏩</span>
                </button>

                <button
                  className={`tv-button p-4 rounded-full ${selectedControl === 'next-episode' ? 'bg-white text-black' : 'bg-gray-800 text-white'} hover:bg-white hover:text-black`}
                  onClick={onNextEpisode}
                  data-focusable="true"
                >
                  <span className="text-2xl">⏭</span>
                </button>

                <button
                  className={`tv-button p-4 rounded-full ${selectedControl === 'volume' ? 'bg-white text-black' : 'bg-gray-800 text-white'} hover:bg-white hover:text-black`}
                  onClick={() => setIsMuted(!isMuted)}
                  data-focusable="true"
                >
                  <span className="text-2xl">{isMuted ? '🔇' : '🔊'}</span>
                </button>

                <button
                  className={`tv-button p-4 rounded-full ${selectedControl === 'subtitles' ? 'bg-white text-black' : 'bg-gray-800 text-white'} hover:bg-white hover:text-black`}
                  onClick={toggleSubtitles}
                  data-focusable="true"
                >
                  <span className="text-2xl">💬</span>
                </button>

                <button
                  className={`tv-button p-4 rounded-full ${selectedControl === 'exit' ? 'bg-white text-black' : 'bg-gray-800 text-white'} hover:bg-white hover:text-black`}
                  onClick={onExit}
                  data-focusable="true"
                >
                  <span className="text-2xl">✕</span>
                </button>
              </div>

              {/* Remote Control Hints */}
              <div className="mt-6 text-center text-gray-400 text-lg">
                <p>Use arrow keys to navigate • OK/Enter to play/pause • Back to exit</p>
                <p>Red: Previous Episode • Green: Next Episode • Yellow: Settings • Blue: Subtitles</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtitles */}
      {currentSubtitle !== 'off' && subtitles && (
        <div className="absolute bottom-24 left-0 right-0 text-center">
          <p className="text-white text-2xl bg-black bg-opacity-75 px-4 py-2 rounded inline-block">
            {/* Subtitle text would go here */}
            Subtitles: {currentSubtitle}
          </p>
        </div>
      )}
    </div>
  );
};

export default TVVideoPlayer;
