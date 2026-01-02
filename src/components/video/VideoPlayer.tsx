import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Subtitles,
  Loader2,
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
  FastForward,
  Eye,
} from "lucide-react";
import Hls from "hls.js";
import { useVideoSettings } from "@/hooks/useVideoSettings";
import { VideoSettingsPanel } from "./VideoSettingsPanel";
import { useAniskip } from "@/hooks/useAniskip";
import { getProxiedImageUrl } from "@/lib/api";

interface VideoPlayerProps {
  sources: Array<{ url: string; isM3U8: boolean; quality?: string }>;
  subtitles?: Array<{ lang: string; url: string; label?: string }>;
  headers?: { Referer?: string; "User-Agent"?: string };
  poster?: string;
  onError?: () => void;
  onServerSwitch?: () => void;
  isLoading?: boolean;
  serverName?: string;
  onEpisodeEnd?: () => void;
  malId?: number | null;
  episodeNumber?: number;
  initialSeekSeconds?: number;
  viewCount?: number;
}

function getProxiedUrl(url: string, type: 'video' | 'subtitle' = 'video', referer?: string): string {
  if (!url) return url;

  // Avoid double-proxying already rewritten URLs
  if (url.includes('/functions/v1/rapid-service')) return url;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) return url;

  const params = new URLSearchParams({ url, type });
  if (referer) {
    params.append('referer', referer);
  }
  const apikey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (apikey) params.append('apikey', apikey);
  return `${supabaseUrl}/functions/v1/rapid-service?${params.toString()}`;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function VideoPlayer({
  sources,
  subtitles = [],
  headers,
  poster,
  onError,
  onServerSwitch,
  isLoading = false,
  serverName,
  onEpisodeEnd,
  malId,
  episodeNumber,
  viewCount,
  // optional progress callback provided by parent (watch page)
  onProgressUpdate,
  animeId,
  animeName,
  animePoster,
  episodeId,
  initialSeekSeconds,
}: VideoPlayerProps & { onProgressUpdate?: (progressSeconds: number, durationSeconds?: number, completed?: boolean) => void; animeId?: string; animeName?: string; animePoster?: string; episodeId?: string; initialSeekSeconds?: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { settings } = useVideoSettings();
  const { skipTimes, fetchSkipTimes, getActiveSkip, getSkipLabel } = useAniskip();

  const resolvedPoster = poster ? getProxiedImageUrl(poster) : undefined;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lastSavedProgress, setLastSavedProgress] = useState(0);
  const lastSavedProgressRef = useRef<number>(0);
  const progressIntervalRef = useRef<number | null>(null);
  const PROGRESS_SAVE_INTERVAL = 15; // seconds
  const [volume, setVolume] = useState(settings.volume);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(settings.playbackSpeed);
  const [isMobile, setIsMobile] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>(settings.subtitleLanguage);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [subtitleBlobs, setSubtitleBlobs] = useState<Record<string, string>>({});
  const [activeSkip, setActiveSkip] = useState<ReturnType<typeof getActiveSkip>>(null);

  // Keep a stable ref to the latest progress callback to avoid effect churn
  const progressCallbackRef = useRef<typeof onProgressUpdate | null>(onProgressUpdate);

  const currentSource = sources[0];

  const initialSeekDoneRef = useRef(false);
  const manifestFallbackRef = useRef(false);

  // Apply video settings in real-time when they change
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = settings.playbackSpeed;
      setPlaybackRate(settings.playbackSpeed);
    }
  }, [settings.playbackSpeed]);

  useEffect(() => {
    if (videoRef.current && !isMuted) {
      videoRef.current.volume = settings.volume;
      setVolume(settings.volume);
    }
  }, [settings.volume]);

  useEffect(() => {
    setCurrentSubtitle(settings.subtitleLanguage);
    // Apply subtitle change
    const video = videoRef.current;
    if (video) {
      const tracks = video.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        if (settings.subtitleLanguage === 'off') {
          track.mode = 'disabled';
        } else if (settings.subtitleLanguage === 'auto') {
          // Auto: prefer English, or first track
          const lang = (track.language || track.label || '').toLowerCase();
          if (lang.includes('english') || lang === 'en' || i === 0) {
            track.mode = 'showing';
          } else {
            track.mode = 'hidden';
          }
        } else {
          // Match by language or label
          const lang = (track.language || track.label || '').toLowerCase();
          const target = settings.subtitleLanguage.toLowerCase();
          if (lang.includes(target) || target.includes(lang)) {
            track.mode = 'showing';
          } else {
            track.mode = 'hidden';
          }
        }
      }
    }
  }, [settings.subtitleLanguage]);

  // Prefetch subtitles to ensure CORS and headers are applied correctly
  // Also clear old blobs when subtitles change (e.g., switching between sub/dub)
  useEffect(() => {
    if (!subtitles || subtitles.length === 0) {
      // Clear blobs if no subtitles
      setSubtitleBlobs({});
      return;
    }
    
    let mounted = true;
    
    // Create a key from subtitle URLs to detect changes
    const subtitleKey = subtitles.map(s => s.url).join('|');
    
    // Clear existing blobs and refetch when subtitle sources change
    setSubtitleBlobs({});

    (async () => {
      const apikey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const newBlobs: Record<string, string> = {};
      
      for (const sub of subtitles) {
        if (!mounted) break;
        try {
          const proxied = getProxiedUrl(sub.url, 'subtitle', headers?.Referer);
          const res = await fetch(proxied, {
            headers: {
              apikey: apikey || '',
              Accept: 'text/vtt, text/plain, */*',
            }
          });
          if (res.ok) {
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            newBlobs[sub.lang] = blobUrl;
            if (mounted) setSubtitleBlobs(prev => ({ ...prev, [sub.lang]: blobUrl }));
          } else {
            console.warn('Failed to fetch subtitle via proxy:', sub.lang, res.status);
          }
        } catch (e) {
          console.warn('Error prefetching subtitle', sub.lang, e);
        }
      }
    })();

    return () => { 
      mounted = false; 
    };
  }, [subtitles, headers]);

  // Apply subtitle setting when subtitle blobs are loaded
  useEffect(() => {
    const blobsLoaded = Object.keys(subtitleBlobs).length;
    if (blobsLoaded === 0) return;
    
    // Re-apply current subtitle setting after a short delay for tracks to register
    const timeout = setTimeout(() => {
      handleSubtitleChange(currentSubtitle);
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [subtitleBlobs]);

  // Fetch skip times after manifest parsed when duration is known
  useEffect(() => {
    if (!malId || !episodeNumber) return;

    const onManifestParsed = () => {
      const length = videoRef.current?.duration;
      fetchSkipTimes(malId, episodeNumber, isFinite(length) && length > 0 ? Math.floor(length) : undefined);
    };

    // If duration already available, call immediately
    if (videoRef.current?.duration && isFinite(videoRef.current.duration) && videoRef.current.duration > 0) {
      onManifestParsed();
    }

    // Also call when manifest parsed via HLS
    const handler = () => onManifestParsed();
    const hls = hlsRef.current;
    if (hls) hls.on(Hls.Events.MANIFEST_PARSED, handler);

    return () => {
      if (hls) hls.off(Hls.Events.MANIFEST_PARSED, handler);
    };
  }, [malId, episodeNumber, fetchSkipTimes]);

  // Ensure subtitles are applied when tracks become available
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const applyOnceTracksAvailable = () => {
      const tracks = video.textTracks;
      if (tracks && tracks.length > 0) {
        handleSubtitleChange(currentSubtitle);
      }
    };

    // Try immediately
    applyOnceTracksAvailable();

    // Poll briefly until tracks are available
    let attempts = 0;
    const interval = setInterval(() => {
      attempts += 1;
      applyOnceTracksAvailable();
      if (attempts > 10) clearInterval(interval);
    }, 300);

    return () => clearInterval(interval);
  }, [currentSubtitle, subtitles]);

  // Check for active skip time
  useEffect(() => {
    const skip = getActiveSkip(currentTime);
    setActiveSkip(skip);
  }, [currentTime, getActiveSkip]);

  const handleSkip = useCallback(() => {
    if (activeSkip && videoRef.current) {
      videoRef.current.currentTime = activeSkip.interval.endTime;
      setActiveSkip(null);
    }
  }, [activeSkip]);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const loadVideo = useCallback(
    () => {
      if (!currentSource?.url || !videoRef.current) return;

      setVideoError(null);
      setIsBuffering(true);

      // Clear any existing progress saver when loading a new source
      if (progressIntervalRef.current !== null) {
        clearInterval(progressIntervalRef.current as number);
        progressIntervalRef.current = null;
      }

      const videoUrl = currentSource.url;
      const isM3U8 = currentSource.isM3U8 || videoUrl.includes(".m3u8");
      const referer = headers?.Referer;

      // Clean up previous HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      // Use our backend proxy
      const proxiedUrl = getProxiedUrl(videoUrl, 'video', referer);
      console.log('Loading video via proxy:', proxiedUrl);

      if (isM3U8 && Hls.isSupported()) {
        const hls = new Hls({
          xhrSetup: (xhr) => {
            xhr.timeout = 30000;
            // Include Supabase anon key for function invocation
            try {
              xhr.setRequestHeader('apikey', import.meta.env.VITE_SUPABASE_ANON_KEY);
            } catch (e) {
              // Some browsers may disallow setting certain headers; fail silently
            }
          },
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
        });

        // Start periodic progress saver when HLS is attached
        if (progressIntervalRef.current === null) {
          progressIntervalRef.current = window.setInterval(() => {
            const time = Math.floor(videoRef.current?.currentTime || 0);
            const dur = Math.floor(videoRef.current?.duration || 0) || undefined;
            if (onProgressUpdate && time !== lastSavedProgressRef.current && Math.abs(time - lastSavedProgressRef.current) >= PROGRESS_SAVE_INTERVAL) {
              onProgressUpdate(time, dur, false);
              setLastSavedProgress(time);
              lastSavedProgressRef.current = time;
            }
          }, PROGRESS_SAVE_INTERVAL * 1000);
        }


        hls.loadSource(proxiedUrl);
        hls.attachMedia(videoRef.current);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('HLS manifest parsed successfully');
          setIsBuffering(false);
          videoRef.current?.play().catch(() => {});

          // Once manifest parsed, fetch skip times using known duration
          const length = videoRef.current?.duration;
          if (malId && episodeNumber) {
            fetchSkipTimes(malId, episodeNumber, isFinite(length) && length > 0 ? Math.floor(length) : undefined);
          }

          // Ensure subtitle selection is applied after tracks are available
          if (currentSubtitle && currentSubtitle !== 'off') {
            handleSubtitleChange(currentSubtitle);
          }
                // Rewrite relative URLs to proxied upstream URLs to preserve CORS
          // Apply initial seek (only once)
          if (initialSeekSeconds !== undefined && !initialSeekDoneRef.current) {
            try {
              const seekTo = Math.max(0, Math.min(initialSeekSeconds, Math.floor(videoRef.current?.duration || initialSeekSeconds)));
              if (videoRef.current) videoRef.current.currentTime = seekTo;
              initialSeekDoneRef.current = true;
            } catch (e) {
              console.warn('Failed initial seek:', e);
            }
          }
        });

        hls.on(Hls.Events.ERROR, async (_, data) => {
          console.error('HLS error:', data.type, data.details);

          // Try client-side manifest fetch fallback for manifestLoadError
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR && data.details && String(data.details).toLowerCase().includes('manifest') && !manifestFallbackRef.current) {
            manifestFallbackRef.current = true;
            try {
              console.log('Attempting client-side manifest fetch fallback for', proxiedUrl);
              const apikey = import.meta.env.VITE_SUPABASE_ANON_KEY;
              const res = await fetch(proxiedUrl, { headers: { apikey: apikey || '' }, redirect: 'follow' });
              const text = await res.text().catch(() => '');
              
              // Check if we got a valid manifest
              if (!text || !text.trim().startsWith('#EXTM3U')) {
                console.warn('Manifest fallback returned invalid content');
                setVideoError('Manifest blocked or invalid - try another server');
                onError?.();
                return;
              }
            } catch (e) {
              console.warn('Client-side manifest fetch fallback failed:', e);
            }
          }

          if (data.fatal) {
            // Surface manifest parsing problems explicitly so we can switch servers
            if (data.details && String(data.details).toLowerCase().includes('manifest')) {
              setVideoError('Manifest blocked or invalid - switching server');
              onError?.();
              hls.stopLoad();
              return;
            }

            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error('Network error - attempting recovery');
                if (retryCount < 2) {
                  setRetryCount(prev => prev + 1);
                  hls.startLoad();
                } else {
                  setVideoError("Network error - try another server");
                  onError?.();
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error('Media error - attempting recovery');
                hls.recoverMediaError();
                break;
              default:
                setVideoError("Failed to load video");
                onError?.();
                break;
            }
          }
        });

        hlsRef.current = hls;
      } else if (
        videoRef.current.canPlayType("application/vnd.apple.mpegurl")
      ) {
        // Safari native HLS support
        videoRef.current.src = proxiedUrl;
        videoRef.current.addEventListener("loadedmetadata", () => {
          setIsBuffering(false);
          // Fetch skip times now that duration is available
          const length = videoRef.current?.duration;
          if (malId && episodeNumber) {
            fetchSkipTimes(malId, episodeNumber, isFinite(length) && length > 0 ? Math.floor(length) : undefined);
          }
          // Ensure subtitle selection is applied
          if (currentSubtitle && currentSubtitle !== 'off') {
            handleSubtitleChange(currentSubtitle);
          }

          // Apply initial seek for native HLS / loadedmetadata
          if (initialSeekSeconds !== undefined && !initialSeekDoneRef.current) {
            try {
              const seekTo = Math.max(0, Math.min(initialSeekSeconds, Math.floor(videoRef.current?.duration || initialSeekSeconds)));
              if (videoRef.current) videoRef.current.currentTime = seekTo;
              initialSeekDoneRef.current = true;
            } catch (e) {
              console.warn('Failed initial seek:', e);
            }
          }

          videoRef.current?.play().catch(() => {});
        });

        // Ensure periodic saver for native HLS/native playback
        if (progressIntervalRef.current === null) {
          progressIntervalRef.current = window.setInterval(() => {
            const time = Math.floor(videoRef.current?.currentTime || 0);
            const dur = Math.floor(videoRef.current?.duration || 0) || undefined;
            if (onProgressUpdate && time !== lastSavedProgressRef.current && Math.abs(time - lastSavedProgressRef.current) >= PROGRESS_SAVE_INTERVAL) {
              onProgressUpdate(time, dur, false);
              setLastSavedProgress(time);
              lastSavedProgressRef.current = time;
            }
          }, PROGRESS_SAVE_INTERVAL * 1000);
        }
      } else {
        // Direct playback for non-HLS
        videoRef.current.src = proxiedUrl;
        setIsBuffering(false);

        // Apply initial seek for direct playback if needed
        if (initialSeekSeconds !== undefined && !initialSeekDoneRef.current) {
          try {
            const seekTo = Math.max(0, Math.min(initialSeekSeconds, Math.floor(videoRef.current?.duration || initialSeekSeconds)));
            if (videoRef.current && videoRef.current.readyState >= 1) {
              videoRef.current.currentTime = seekTo;
              initialSeekDoneRef.current = true;
            } else {
              // Wait for loadedmetadata to set the time
              const once = () => {
                try {
                  videoRef.current!.currentTime = seekTo;
                } catch (e) {
                  console.warn('Failed initial seek on metadata:', e);
                }
                initialSeekDoneRef.current = true;
                videoRef.current?.removeEventListener('loadedmetadata', once);
              };
              videoRef.current.addEventListener('loadedmetadata', once);
            }
          } catch (e) {
            console.warn('Failed initial seek:', e);
          }
        }

        // Also start periodic saver
        if (progressIntervalRef.current === null) {
          progressIntervalRef.current = window.setInterval(() => {
            const time = Math.floor(videoRef.current?.currentTime || 0);
            const dur = Math.floor(videoRef.current?.duration || 0) || undefined;
            if (onProgressUpdate && time !== lastSavedProgressRef.current && Math.abs(time - lastSavedProgressRef.current) >= PROGRESS_SAVE_INTERVAL) {
              onProgressUpdate(time, dur, false);
              setLastSavedProgress(time);
              lastSavedProgressRef.current = time;
            }
          }, PROGRESS_SAVE_INTERVAL * 1000);
        }
      }
    },
    [currentSource, headers, onError, retryCount]
  );

  useEffect(() => {
    loadVideo();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [loadVideo]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    const handleEnded = () => {
      // Final save marking completed
      const dur = Math.floor(videoRef.current?.duration || 0) || undefined;
      const finalPos = Math.floor(videoRef.current?.currentTime || 0);
      if (onProgressUpdate) {
        onProgressUpdate(dur ?? finalPos, dur, true);
      }

      if (settings.autoNextEpisode && onEpisodeEnd) {
        onEpisodeEnd();
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("progress", handleProgress);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("progress", handleProgress);
      video.removeEventListener("ended", handleEnded);
    };
  }, [settings.autoNextEpisode, onEpisodeEnd]);

  // Keep latest progress callback without re-subscribing effects
  useEffect(() => {
    progressCallbackRef.current = onProgressUpdate ?? null;
  }, [onProgressUpdate]);

  // Persist final progress on unload or when component unmounts
  useEffect(() => {
    const handleBeforeUnload = () => {
      const time = Math.floor(videoRef.current?.currentTime || 0);
      const dur = Math.floor(videoRef.current?.duration || 0) || undefined;
      if (progressCallbackRef.current) progressCallbackRef.current(time, dur, false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (progressIntervalRef.current !== null) {
        clearInterval(progressIntervalRef.current as number);
        progressIntervalRef.current = null;
      }
      // Save one last time on unmount using the latest callback
      const time = Math.floor(videoRef.current?.currentTime || 0);
      const dur = Math.floor(videoRef.current?.duration || 0) || undefined;
      if (progressCallbackRef.current) progressCallbackRef.current(time, dur, false);
    };
  }, []);

  // Keyboard shortcuts (desktop only)
  useEffect(() => {
    if (isMobile) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      )
        return;

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "arrowleft":
          e.preventDefault();
          skip(-10);
          break;
        case "arrowright":
          e.preventDefault();
          skip(10);
          break;
        case "arrowup":
          e.preventDefault();
          changeVolume(0.1);
          break;
        case "arrowdown":
          e.preventDefault();
          changeVolume(-0.1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobile]);

  // Controls visibility
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const changeVolume = (delta: number) => {
    if (videoRef.current) {
      const newVolume = Math.max(0, Math.min(1, volume + delta));
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume > 0) setIsMuted(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(duration, currentTime + seconds)
      );
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const percent = (clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, percent * duration));
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if ((containerRef.current as any).webkitRequestFullscreen) {
        (containerRef.current as any).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handlePlaybackRateChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
    setShowSettings(false);
  };

  const handleSubtitleChange = (lang: string) => {
    const video = videoRef.current;
    if (!video) return;

    const tracks = video.textTracks;
    console.log('Changing subtitle to:', lang, 'Available tracks:', tracks.length);
    
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      const trackLang = (track.language || track.label || '').toLowerCase();
      
      if (lang === 'off') {
        track.mode = 'disabled';
      } else if (lang === 'auto') {
        // Auto: prefer English, or first track
        if (trackLang.includes('english') || trackLang === 'en' || i === 0) {
          track.mode = 'showing';
          console.log('Auto-enabled track:', track.label, track.language);
        } else {
          track.mode = 'hidden';
        }
      } else if (trackLang.includes(lang.toLowerCase()) || lang.toLowerCase().includes(trackLang)) {
        track.mode = 'showing';
        console.log('Enabled track:', track.label, track.language);
      } else {
        track.mode = 'hidden';
      }
    }
    setCurrentSubtitle(lang);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-black rounded-xl md:rounded-2xl overflow-hidden group touch-manipulation video-player-container video-player-modern"
      onMouseMove={!isMobile ? showControlsTemporarily : undefined}
      onMouseLeave={() => !isMobile && isPlaying && setShowControls(false)}
      onTouchStart={showControlsTemporarily}
    >
      {/* Video Element with enhanced subtitle styling */}
      <video
        ref={videoRef}
        className={`w-full h-full object-contain video-with-subtitles subtitle-${settings.subtitleSize} subtitle-font-${settings.subtitleFont} subtitle-bg-${settings.subtitleBackground}`}
        poster={resolvedPoster}
        playsInline
        crossOrigin="anonymous"
        onClick={togglePlay}
      >
        {subtitles.map((sub, idx) => {
          const blobUrl = subtitleBlobs[sub.lang];
          // Only render track if we have a blob URL (prefetched) to avoid CORS issues
          if (!blobUrl) return null;
          return (
            <track
              key={`${sub.lang}-${idx}`}
              kind="subtitles"
              src={blobUrl}
              srcLang={sub.lang}
              label={sub.label || sub.lang}
              default={idx === 0 && currentSubtitle !== 'off'}
            />
          );
        })}
      </video>

      {/* View Counter Overlay - shows in top right */}
      {viewCount !== undefined && viewCount > 0 && showControls && (
        <div className="absolute top-3 right-3 md:top-4 md:right-4 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/70 backdrop-blur-md text-white/90 text-xs md:text-sm font-medium z-10 transition-all duration-300 border border-white/10">
          <Eye className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
          <span className="font-semibold">{viewCount >= 1000 ? `${(viewCount / 1000).toFixed(1)}K` : viewCount}</span>
          <span className="text-white/50 hidden sm:inline">views</span>
        </div>
      )}

      {/* Loading State */}
      {(isLoading || isBuffering) && !videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="w-6 h-6 md:w-8 md:h-8 text-primary/70" />
              </div>
            </div>
            <span className="text-sm md:text-base text-white/80 font-medium">
              {serverName ? `Loading ${serverName}...` : "Loading..."}
            </span>
          </div>
        </div>
      )}

      {/* Error State */}
      {videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 text-center p-6 md:p-10 max-w-md">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-destructive" />
            </div>
            <p className="text-base md:text-lg text-white font-semibold">{videoError}</p>
            <p className="text-sm text-white/60">Try switching to a different server</p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                onClick={() => {
                  setRetryCount(0);
                  loadVideo();
                }}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center gap-2 transition-all font-medium video-controls-btn"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
              {onServerSwitch && (
                <button
                  onClick={onServerSwitch}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/80 text-primary-foreground flex items-center justify-center gap-2 transition-all font-medium shadow-lg shadow-primary/30"
                >
                  Switch Server
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Center Play Button */}
      {!isPlaying && !isLoading && !isBuffering && !videoError && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/50 via-transparent to-black/20"
        >
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/90 flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-2xl shadow-primary/40 backdrop-blur-sm border border-white/20">
            <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-current ml-1" />
          </div>
        </button>
      )}

      {/* Aniskip Skip Button */}
      {activeSkip && !videoError && (
        <button
          onClick={handleSkip}
          className="absolute bottom-24 md:bottom-28 right-4 md:right-6 px-5 py-3 md:px-6 md:py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-bold flex items-center gap-2.5 shadow-2xl transition-all hover:scale-105 animate-in slide-in-from-right-5 z-20 skip-button-glow border border-white/20"
        >
          <FastForward className="w-5 h-5 md:w-6 md:h-6" />
          <span className="text-sm md:text-base uppercase tracking-wide">{getSkipLabel(activeSkip.skipType)}</span>
        </button>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-x-0 bottom-0 video-controls-gradient p-4 md:p-5 transition-all duration-300 ${
          showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {/* Progress Bar */}
        <div
          className="relative h-1 md:h-1.5 bg-white/20 rounded-full cursor-pointer group/progress mb-4 md:mb-5 video-progress-track"
          onClick={handleSeek}
          onTouchMove={handleSeek}
        >
          {/* Skip Time Markers (yellow) */}
          {skipTimes.map((skip) => {
            const startPercent = duration > 0 ? (skip.interval.startTime / duration) * 100 : 0;
            const widthPercent = duration > 0 ? ((skip.interval.endTime - skip.interval.startTime) / duration) * 100 : 0;
            return (
              <div
                key={skip.skipId}
                className="absolute h-full bg-yellow-400 rounded-full z-10"
                style={{ 
                  left: `${startPercent}%`, 
                  width: `${widthPercent}%` 
                }}
                title={getSkipLabel(skip.skipType)}
              />
            );
          })}
          {/* Buffered */}
          <div
            className="absolute h-full bg-white/30 rounded-full"
            style={{ width: `${bufferedPercent}%` }}
          />
          {/* Progress */}
          <div
            className="absolute h-full bg-gradient-to-r from-primary via-primary to-secondary rounded-full z-20 transition-all"
            style={{ width: `${progress}%` }}
          />
          {/* Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-all z-30 ring-2 ring-primary/50"
            style={{ left: `calc(${progress}% - 8px)` }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between gap-3 md:gap-4">
          {/* Left Controls */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <button
              onClick={togglePlay}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all video-controls-btn"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 md:w-6 md:h-6" />
              ) : (
                <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />
              )}
            </button>

            <button
              onClick={() => skip(-10)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all hidden sm:flex video-controls-btn"
            >
              <SkipBack className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            <button
              onClick={() => skip(10)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all hidden sm:flex video-controls-btn"
            >
              <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {/* Volume - hide on mobile */}
            <div className="hidden md:flex items-center gap-2 group/volume ml-1">
              <button
                onClick={toggleMute}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all video-controls-btn"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <div className="w-0 group-hover/volume:w-24 overflow-hidden transition-all duration-300">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-1.5 accent-primary cursor-pointer bg-white/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                />
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-1.5 ml-2 px-2.5 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
              <span className="text-xs md:text-sm font-medium text-white/90">{formatTime(currentTime)}</span>
              <span className="text-white/40">/</span>
              <span className="text-xs md:text-sm text-white/60">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Subtitle Selector */}
            {subtitles.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSubtitleMenu(!showSubtitleMenu);
                    setShowSettings(false);
                  }}
                  className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${
                    currentSubtitle !== 'off' ? 'text-primary' : ''
                  }`}
                >
                  <Subtitles className="w-4 h-4 md:w-5 md:h-5" />
                </button>

                {showSubtitleMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-background/95 backdrop-blur-sm border border-border rounded-xl p-2 min-w-[120px] md:min-w-[150px]">
                    <div className="text-xs text-muted-foreground px-2 py-1 mb-1">
                      Subtitles
                    </div>
                    <button
                      onClick={() => {
                        handleSubtitleChange('off');
                        setShowSubtitleMenu(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-xs md:text-sm rounded-lg hover:bg-muted transition-colors ${
                        currentSubtitle === 'off'
                          ? "text-primary font-medium"
                          : "text-foreground"
                      }`}
                    >
                      Off
                    </button>
                    {subtitles.map((sub, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handleSubtitleChange(sub.lang);
                          setShowSubtitleMenu(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left text-xs md:text-sm rounded-lg hover:bg-muted transition-colors ${
                          currentSubtitle === sub.lang
                            ? "text-primary font-medium"
                            : "text-foreground"
                        }`}
                      >
                        {sub.label || sub.lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Speed Settings */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSettings(!showSettings);
                  setShowSubtitleMenu(false);
                }}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Settings className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              {showSettings && (
                <div className="absolute bottom-full right-0 mb-2 bg-background/95 backdrop-blur-sm border border-border rounded-xl p-2 min-w-[100px] md:min-w-[120px]">
                  <div className="text-xs text-muted-foreground px-2 py-1 mb-1">
                    Speed
                  </div>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handlePlaybackRateChange(rate)}
                      className={`w-full px-3 py-1.5 text-left text-xs md:text-sm rounded-lg hover:bg-muted transition-colors ${
                        playbackRate === rate
                          ? "text-primary font-medium"
                          : "text-foreground"
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Player Preferences */}
            <button
              onClick={() => setShowSettingsPanel(true)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Player Preferences"
            >
              <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 md:w-5 md:h-5" />
              ) : (
                <Maximize className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <VideoSettingsPanel
        isOpen={showSettingsPanel}
        onClose={() => setShowSettingsPanel(false)}
      />
    </div>
  );
}