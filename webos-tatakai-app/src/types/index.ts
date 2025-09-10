// Core Anime Data Types
export interface Anime {
  id: string;
  name: string;
  poster: string;
  type?: string;
  episodes?: {
    sub: number;
    dub: number;
  };
  jname?: string;
  description?: string;
  rank?: number;
  otherInfo?: string[];
  duration?: string;
  rating?: string;
}

export interface AnimeDetails extends Anime {
  info: {
    id: string;
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
    promotionalVideos?: Array<{
      title?: string;
      source?: string;
      thumbnail?: string;
    }>;
    characterVoiceActor?: Array<{
      character: {
        id: string;
        poster: string;
        name: string;
        cast: string;
      };
      voiceActor: {
        id: string;
        poster: string;
        name: string;
        cast: string;
      };
    }>;
  };
  moreInfo: {
    aired: string;
    genres: string[];
    status: string;
    studios: string;
    duration: string;
  };
  mostPopularAnimes?: Anime[];
  recommendedAnimes?: Anime[];
  relatedAnimes?: Anime[];
  seasons?: Array<{
    id: string;
    name: string;
    title: string;
    poster: string;
    isCurrent: boolean;
  }>;
}

export interface Episode {
  number: number;
  title: string;
  episodeId: string;
  isFiller: boolean;
}

export interface EpisodeSource {
  url: string;
  isM3U8: boolean;
  quality?: string;
}

export interface EpisodeData {
  headers: Record<string, string>;
  sources: EpisodeSource[];
  subtitles: Array<{
    lang: string;
    url: string;
  }>;
  anilistID?: number | null;
  malID?: number | null;
}

export interface Server {
  serverId: number;
  serverName: string;
}

export interface EpisodeServers {
  episodeId: string;
  episodeNo: number;
  sub: Server[];
  dub: Server[];
  raw: Server[];
}

// Home Page Data Types
export interface HomePageData {
  genres: string[];
  latestEpisodeAnimes: Anime[];
  spotlightAnimes: Anime[];
  top10Animes: {
    today: Anime[];
    week: Anime[];
    month: Anime[];
  };
  topAiringAnimes: Anime[];
  topUpcomingAnimes: Anime[];
  trendingAnimes: Anime[];
  mostPopularAnimes: Anime[];
  mostFavoriteAnimes: Anime[];
  latestCompletedAnimes: Anime[];
}

// Search Types
export interface SearchResult {
  animes: Anime[];
  mostPopularAnimes: Anime[];
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  searchQuery: string;
  searchFilters: Record<string, string[]>;
}

export interface SearchSuggestion {
  id: string;
  name: string;
  poster: string;
  jname: string;
  moreInfo: string[];
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data: T;
  status?: number;
}

// Navigation Types
export interface FocusableElement {
  id: string;
  element: HTMLElement;
  parent?: string;
  children?: string[];
  onFocus?: () => void;
  onBlur?: () => void;
  onEnter?: () => void;
  autoScroll?: boolean;
}

export interface NavigationState {
  currentFocus: string | null;
  elements: Map<string, FocusableElement>;
  history: string[];
}

// WebOS Specific Types
export interface WebOSTV {
  platformBack?: {
    getMenuKey: () => void;
  };
}

declare global {
  interface Window {
    webOSTV?: WebOSTV;
  }
}

// Component Props Types
export interface TVNavigationItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  isActive?: boolean;
}

export interface TVCarouselProps {
  title: string;
  items: Anime[];
  onItemSelect: (anime: Anime) => void;
  className?: string;
}

export interface TVCardProps {
  anime: Anime;
  onSelect: () => void;
  className?: string;
  focusId?: string;
}

export interface TVHeroProps {
  anime: Anime;
  onPlay: () => void;
  onInfo: () => void;
  className?: string;
}

// Video Player Types
export interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  showControls: boolean;
}

// App State Types
export interface AppState {
  currentPage: string;
  isNavbarCollapsed: boolean;
  currentAnime: Anime | null;
  currentEpisode: Episode | null;
  searchQuery: string;
  searchResults: SearchResult | null;
  homeData: HomePageData | null;
  loading: boolean;
  error: string | null;
}

// Error Types
export interface AppError {
  message: string;
  code?: string;
  details?: any;
}