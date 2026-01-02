import { Play, Star, Plus, Check, Loader2 } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { AnimeCard as AnimeCardType, getProxiedVideoUrl, getProxiedImageUrl } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import { fetchEpisodes, fetchStreamingSources } from "@/lib/api";
import Hls from "hls.js";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchlistItem, useAddToWatchlist, useRemoveFromWatchlist } from "@/hooks/useWatchlist";

interface AnimeCardWithPreviewProps {
  anime: AnimeCardType;
  showPreview?: boolean;
}

export function AnimeCardWithPreview({ anime, showPreview = true }: AnimeCardWithPreviewProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isHovering, setIsHovering] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Watchlist hooks
  const { data: watchlistItem, isLoading: isWatchlistLoading } = useWatchlistItem(anime.id);
  const addToWatchlist = useAddToWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();

  const handleWatchlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation
    if (!user) {
      navigate('/auth');
      return;
    }
    if (watchlistItem) {
      await removeFromWatchlist.mutateAsync(anime.id);
    } else {
      await addToWatchlist.mutateAsync({
        animeId: anime.id,
        animeName: anime.name,
        animePoster: anime.poster,
        status: 'plan_to_watch',
      });
    }
  };

  // Load preview on hover with proper HLS handling
  const loadPreview = useCallback(async () => {
    if (previewUrl || previewError) return;
    
    setIsLoadingPreview(true);
    try {
      const episodes = await fetchEpisodes(anime.id);
      if (episodes?.episodes?.length > 0) {
        const firstEpisode = episodes.episodes[0];
        const sources = await fetchStreamingSources(firstEpisode.episodeId, "hd-2", "sub");
        if (sources?.sources?.length > 0) {
          const source = sources.sources[0];
          const proxiedUrl = getProxiedVideoUrl(source.url, sources.headers?.Referer);
          setPreviewUrl(proxiedUrl);
          
          // Use HLS.js for m3u8 streams
          if (source.isM3U8 && Hls.isSupported() && videoRef.current) {
            if (hlsRef.current) {
              hlsRef.current.destroy();
            }
            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: false,
              maxBufferLength: 10,
              xhrSetup: (xhr) => {
                try {
                  xhr.setRequestHeader('apikey', import.meta.env.VITE_SUPABASE_ANON_KEY || '');
                } catch (e) {}
              },
            });
            hls.loadSource(proxiedUrl);
            hls.attachMedia(videoRef.current);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              if (videoRef.current) {
                // Wait for duration to be available, then jump to random timeframe
                const setRandomTime = () => {
                  if (videoRef.current && videoRef.current.duration && !isNaN(videoRef.current.duration)) {
                    const duration = videoRef.current.duration;
                    // Skip intro (first 90s) and outro (last 90s), pick random position
                    const minTime = Math.min(90, duration * 0.1);
                    const maxTime = Math.max(duration - 90, duration * 0.8);
                    const randomTime = minTime + Math.random() * (maxTime - minTime);
                    videoRef.current.currentTime = randomTime;
                    videoRef.current.play().catch(() => {});
                  } else {
                    // Fallback: start at random 30-120s range if duration not ready
                    videoRef.current!.currentTime = 30 + Math.random() * 90;
                    videoRef.current!.play().catch(() => {});
                  }
                };
                
                // Try immediately, or wait for loadedmetadata
                if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
                  setRandomTime();
                } else {
                  videoRef.current.addEventListener('loadedmetadata', setRandomTime, { once: true });
                  // Fallback after short delay
                  setTimeout(setRandomTime, 500);
                }
              }
            });
            hls.on(Hls.Events.ERROR, (_, data) => {
              if (data.fatal) {
                setPreviewError(true);
              }
            });
            hlsRef.current = hls;
          }
        }
      }
    } catch (error) {
      console.log("Preview not available for:", anime.id);
      setPreviewError(true);
    } finally {
      setIsLoadingPreview(false);
    }
  }, [anime.id, previewUrl, previewError]);

  // Cleanup HLS on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isHovering || !showPreview) return;

    hoverTimeoutRef.current = setTimeout(loadPreview, 800);

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [isHovering, showPreview, loadPreview]);

  // Auto-play/pause video on hover
  useEffect(() => {
    if (videoRef.current) {
      if (isHovering && previewUrl) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        // Stop HLS loading when not hovering
        if (hlsRef.current && !isHovering) {
          hlsRef.current.stopLoad();
        }
      }
    }
  }, [isHovering, previewUrl]);

  return (
    <GlassPanel
      hoverEffect
      className="group cursor-pointer overflow-hidden"
      onClick={() => navigate(`/anime/${anime.id}`)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative aspect-[3/4]">
        {/* Image */}
        <img
          src={getProxiedImageUrl(anime.poster)}
          alt={anime.name}
          loading="lazy"
          className={`w-full h-full object-cover transition-all duration-500 ${
            isHovering && previewUrl ? 'opacity-0' : 'opacity-100 group-hover:scale-110'
          }`}
        />
        
        {/* Video Preview - do not set src, HLS.js handles it via attachMedia */}
        {showPreview && (
          <video
            ref={videoRef}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isHovering && previewUrl ? 'opacity-100' : 'opacity-0'
            }`}
            muted
            loop
            playsInline
            crossOrigin="anonymous"
            onError={() => setPreviewError(true)}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        {/* Type Badge */}
        {anime.type && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-primary/80 text-primary-foreground text-xs font-bold">
            {anime.type}
          </div>
        )}

        {/* Rating */}
        {anime.rating && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-background/80 backdrop-blur text-xs font-bold">
            <Star className="w-3 h-3 fill-amber text-amber" />
            {anime.rating}
          </div>
        )}

        {/* Watchlist Button - shows on hover */}
        <button
          onClick={handleWatchlistClick}
          disabled={isWatchlistLoading || addToWatchlist.isPending || removeFromWatchlist.isPending}
          className={`absolute top-3 right-3 ${anime.rating ? 'top-12' : ''} w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 ${
            watchlistItem 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-background/80 backdrop-blur text-foreground hover:bg-primary hover:text-primary-foreground'
          }`}
          title={watchlistItem ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          {(isWatchlistLoading || addToWatchlist.isPending || removeFromWatchlist.isPending) ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : watchlistItem ? (
            <Check className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </button>

        {/* Play button on hover (show when preview not available or loading) */}
        {(!previewUrl || previewError || isLoadingPreview) && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {isLoadingPreview ? (
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-foreground/90 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform">
                <Play className="w-5 h-5 fill-background text-background ml-0.5" />
              </div>
            )}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h4 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {anime.name}
          </h4>
          <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
            <span>SUB {anime.episodes.sub}</span>
            {anime.episodes.dub > 0 && <span>• DUB {anime.episodes.dub}</span>}
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
