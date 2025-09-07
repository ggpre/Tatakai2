'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Square, Settings, Subtitles, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigation } from '@/contexts/NavigationContext';
import type Hls from 'hls.js';

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
  onNextEpisode?: () => void;
  onPrevEpisode?: () => void;
  autoPlay?: boolean;
  episodeTitle?: string;
}

const TVVideoPlayer: React.FC<TVVideoPlayerProps> = ({ 
  sources, 
  subtitles = [], 
  onNextEpisode, 
  onPrevEpisode,
  autoPlay = false,
  episodeTitle 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { registerElement, unregisterElement } = useNavigation();

  // Video states
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
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // TV Control states
  const [selectedControl, setSelectedControl] = useState<string>('play-pause');
  const [showSettings, setShowSettings] = useState(false);
  const [settingsOption, setSettingsOption] = useState<'quality' | 'speed' | 'subtitles'>('quality');

  // Initialize video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !sources.length) return;

    const source = sources[0];
    setIsLoading(true);
    setError(null);

    if (source.isM3U8) {
      // Load HLS
      import('hls.js').then((HlsModule) => {
        const Hls = HlsModule.default;
        
        if (Hls.isSupported()) {
          if (hlsRef.current) {
            hlsRef.current.destroy();
          }

          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });

          hlsRef.current = hls;
          hls.loadSource(source.url);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false);
            if (autoPlay) {
              video.play().catch(console.error);
            }
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS Error:', data);
            if (data.fatal) {
              setError('Failed to load video');
              setIsLoading(false);
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source.url;
          setIsLoading(false);
          if (autoPlay) {
            video.play().catch(console.error);
          }
        } else {
          setError('HLS not supported');
          setIsLoading(false);
        }
      });
    } else {
      video.src = source.url;
      setIsLoading(false);
      if (autoPlay) {
        video.play().catch(console.error);
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [sources, autoPlay]);

  // Register for navigation
  useEffect(() => {
    if (containerRef.current) {
      registerElement('tv-video-player', containerRef.current);
      return () => unregisterElement('tv-video-player');
    }
  }, [registerElement, unregisterElement]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, []);

  // D-pad controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;

      // Show controls on any key press
      setShowControls(true);
      if (controlsTimeout) clearTimeout(controlsTimeout);
      const timeout = setTimeout(() => {
        if (!showSettings) setShowControls(false);
      }, 5000);
      setControlsTimeout(timeout);

      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          if (showSettings) {
            handleSettingsAction();
          } else {
            handleControlAction();
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (showSettings) {
            navigateSettings('up');
          } else {
            navigateControls('up');
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (showSettings) {
            navigateSettings('down');
          } else {
            navigateControls('down');
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          if (showSettings) {
            adjustSetting('decrease');
          } else {
            // Seek backward 10 seconds
            video.currentTime = Math.max(0, video.currentTime - 10);
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (showSettings) {
            adjustSetting('increase');
          } else {
            // Seek forward 10 seconds
            video.currentTime = Math.min(duration, video.currentTime + 10);
          }
          break;

        case 'Escape':
        case 'Backspace':
          e.preventDefault();
          if (showSettings) {
            setShowSettings(false);
          } else if (isFullscreen) {
            exitFullscreen();
          }
          break;

        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedControl, showSettings, settingsOption, controlsTimeout, isFullscreen, duration]);

  // Control navigation
  const navigateControls = (direction: 'up' | 'down' | 'left' | 'right') => {
    const controls = ['play-pause', 'volume', 'prev-episode', 'next-episode', 'stop', 'settings'];
    const currentIndex = controls.indexOf(selectedControl);
    
    if (direction === 'down') {
      setSelectedControl(controls[(currentIndex + 1) % controls.length]);
    } else if (direction === 'up') {
      setSelectedControl(controls[(currentIndex - 1 + controls.length) % controls.length]);
    }
  };

  const navigateSettings = (direction: 'up' | 'down') => {
    const options: ('quality' | 'speed' | 'subtitles')[] = ['quality', 'speed', 'subtitles'];
    const currentIndex = options.indexOf(settingsOption);
    
    if (direction === 'down') {
      setSettingsOption(options[(currentIndex + 1) % options.length]);
    } else if (direction === 'up') {
      setSettingsOption(options[(currentIndex - 1 + options.length) % options.length]);
    }
  };

  const handleControlAction = () => {
    switch (selectedControl) {
      case 'play-pause':
        togglePlayPause();
        break;
      case 'volume':
        toggleMute();
        break;
      case 'prev-episode':
        onPrevEpisode?.();
        break;
      case 'next-episode':
        onNextEpisode?.();
        break;
      case 'stop':
        stop();
        break;
      case 'settings':
        setShowSettings(true);
        break;
    }
  };

  const handleSettingsAction = () => {
    // Settings actions will be handled by adjustSetting
    setShowSettings(false);
  };

  const adjustSetting = (direction: 'increase' | 'decrease') => {
    const video = videoRef.current;
    if (!video) return;

    switch (settingsOption) {
      case 'speed':
        const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
        const currentSpeedIndex = speeds.indexOf(playbackRate);
        if (direction === 'increase' && currentSpeedIndex < speeds.length - 1) {
          const newSpeed = speeds[currentSpeedIndex + 1];
          setPlaybackRate(newSpeed);
          video.playbackRate = newSpeed;
        } else if (direction === 'decrease' && currentSpeedIndex > 0) {
          const newSpeed = speeds[currentSpeedIndex - 1];
          setPlaybackRate(newSpeed);
          video.playbackRate = newSpeed;
        }
        break;
      
      case 'subtitles':
        const subtitleOptions = ['off', ...subtitles.map(sub => sub.lang)];
        const currentSubIndex = subtitleOptions.indexOf(currentSubtitle);
        if (direction === 'increase' && currentSubIndex < subtitleOptions.length - 1) {
          setCurrentSubtitle(subtitleOptions[currentSubIndex + 1]);
        } else if (direction === 'decrease' && currentSubIndex > 0) {
          setCurrentSubtitle(subtitleOptions[currentSubIndex - 1]);
        }
        break;
    }
  };

  // Video controls
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(console.error);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  };

  const stop = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  const enterFullscreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
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

  if (error) {
    return (
      <div className="tv-video-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="tv-video-player"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }}
        playsInline
        crossOrigin="anonymous"
      >
        {subtitles.map((subtitle) => (
          <track
            key={subtitle.lang}
            kind="subtitles"
            src={subtitle.url}
            srcLang={subtitle.lang}
            label={subtitle.label || subtitle.lang}
            default={currentSubtitle === subtitle.lang}
          />
        ))}
      </video>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="tv-video-loading">
          <div className="tv-loading-spinner"></div>
          <p>Loading video...</p>
        </div>
      )}

      {/* Episode Title */}
      {episodeTitle && showControls && (
        <div className="tv-episode-title">
          <h2>{episodeTitle}</h2>
        </div>
      )}

      {/* Controls Overlay */}
      {showControls && !isLoading && (
        <div className="tv-video-controls">
          {/* Progress Bar */}
          <div className="tv-progress-container">
            <div className="tv-progress-bar">
              <div 
                className="tv-progress-fill"
                style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
              />
            </div>
            <div className="tv-time-display">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="tv-controls-grid">
            <button
              className={`tv-control-btn ${selectedControl === 'play-pause' ? 'tv-selected' : ''}`}
              data-control="play-pause"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              className={`tv-control-btn ${selectedControl === 'volume' ? 'tv-selected' : ''}`}
              data-control="volume"
            >
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              <span>{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>

            {onPrevEpisode && (
              <button
                className={`tv-control-btn ${selectedControl === 'prev-episode' ? 'tv-selected' : ''}`}
                data-control="prev-episode"
              >
                <SkipBack size={24} />
                <span>Previous</span>
              </button>
            )}

            {onNextEpisode && (
              <button
                className={`tv-control-btn ${selectedControl === 'next-episode' ? 'tv-selected' : ''}`}
                data-control="next-episode"
              >
                <SkipForward size={24} />
                <span>Next</span>
              </button>
            )}

            <button
              className={`tv-control-btn ${selectedControl === 'stop' ? 'tv-selected' : ''}`}
              data-control="stop"
            >
              <Square size={24} />
              <span>Stop</span>
            </button>

            <button
              className={`tv-control-btn ${selectedControl === 'settings' ? 'tv-selected' : ''}`}
              data-control="settings"
            >
              <Settings size={24} />
              <span>Settings</span>
            </button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="tv-settings-panel">
              <h3>Settings</h3>
              <div className="tv-settings-options">
                <div className={`tv-setting-option ${settingsOption === 'speed' ? 'tv-selected' : ''}`}>
                  <span>Playback Speed</span>
                  <span>{playbackRate}x</span>
                </div>
                <div className={`tv-setting-option ${settingsOption === 'subtitles' ? 'tv-selected' : ''}`}>
                  <span>Subtitles</span>
                  <span>{currentSubtitle === 'off' ? 'Off' : currentSubtitle}</span>
                </div>
              </div>
              <p className="tv-settings-hint">Use ← → to adjust, Enter to close</p>
            </div>
          )}

          {/* Instructions */}
          <div className="tv-video-instructions">
            <p>Use D-pad to navigate • Enter to select • ← → to seek • Space to play/pause</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .tv-video-player {
          font-family: 'Inter', sans-serif;
        }

        .tv-video-loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: white;
        }

        .tv-loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .tv-episode-title {
          position: absolute;
          top: 40px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          padding: 12px 24px;
          border-radius: 8px;
          color: white;
          text-align: center;
        }

        .tv-episode-title h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .tv-video-controls {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
          padding: 40px 40px 20px;
          color: white;
        }

        .tv-progress-container {
          margin-bottom: 24px;
        }

        .tv-progress-bar {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .tv-progress-fill {
          height: 100%;
          background: #ff6b35;
          transition: width 0.1s ease;
        }

        .tv-time-display {
          text-align: center;
          font-size: 14px;
          opacity: 0.9;
        }

        .tv-time-display span {
          margin: 0 4px;
        }

        .tv-controls-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .tv-control-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid transparent;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tv-control-btn.tv-selected {
          background: rgba(255, 107, 53, 0.2);
          border-color: #ff6b35;
          transform: scale(1.05);
        }

        .tv-control-btn span {
          font-size: 12px;
          font-weight: 500;
        }

        .tv-settings-panel {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.95);
          padding: 24px;
          border-radius: 12px;
          min-width: 300px;
          border: 2px solid #ff6b35;
        }

        .tv-settings-panel h3 {
          margin: 0 0 16px 0;
          text-align: center;
          font-size: 18px;
        }

        .tv-settings-options {
          margin-bottom: 16px;
        }

        .tv-setting-option {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 8px;
          transition: all 0.2s ease;
        }

        .tv-setting-option.tv-selected {
          background: rgba(255, 107, 53, 0.2);
          border: 1px solid #ff6b35;
        }

        .tv-settings-hint {
          text-align: center;
          font-size: 12px;
          opacity: 0.7;
          margin: 0;
        }

        .tv-video-instructions {
          text-align: center;
          font-size: 12px;
          opacity: 0.7;
        }

        .tv-video-error {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: #000;
          color: white;
          text-align: center;
          font-size: 18px;
        }
      `}</style>
    </div>
  );
};

export default TVVideoPlayer;
