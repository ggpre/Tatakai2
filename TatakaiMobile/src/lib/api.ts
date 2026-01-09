import { ENV } from './env';

const API_URL = ENV.API_URL;

// Use Supabase edge function as proxy for CORS
function getProxyUrl(): string {
  return `${ENV.SUPABASE_URL}/functions/v1/rapid-service`;
}

type ApiEnvelope<T> = { success: true; data: T };
type ProxyEnvelope<T> = { status: number; data: T };
type AnyEnvelope<T> = ApiEnvelope<T> | ProxyEnvelope<T>;

function unwrapApiData<T>(payload: AnyEnvelope<T> | T): T {
  if (payload && typeof payload === 'object' && !('success' in payload) && !('status' in payload)) {
    return payload as T;
  }
  
  if ((payload as ApiEnvelope<T>).success === true) {
    return (payload as ApiEnvelope<T>).data;
  }

  if (typeof (payload as ProxyEnvelope<T>).status === 'number') {
    const { status, data } = payload as ProxyEnvelope<T>;
    if (status >= 200 && status < 300) return data;
  }

  return payload as T;
}

async function apiGet<T>(path: string, retries = 3): Promise<T> {
  const url = `${API_URL}${path}`;
  const apiOrigin = new URL(API_URL).origin;
  const rapidUrl = `${ENV.SUPABASE_URL}/functions/v1/rapid-service?url=${encodeURIComponent(url)}&type=api&referer=${encodeURIComponent(apiOrigin)}&apikey=${encodeURIComponent(ENV.SUPABASE_ANON_KEY)}`;
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(rapidUrl, {
        headers: {
          'Accept': 'application/json',
          'apikey': ENV.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${ENV.SUPABASE_ANON_KEY}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const json = await response.json();
      return unwrapApiData<T>(json);
    } catch (error) {
      lastError = error as Error;
      console.warn(`API request attempt ${attempt + 1} failed:`, error);
      
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 300));
      }
    }
  }
  
  throw lastError || new Error('Failed to fetch data');
}

// Proxy helper for video streaming
export function getProxiedVideoUrl(videoUrl: string, referer?: string): string {
  if (videoUrl.includes('/functions/v1/rapid-service')) return videoUrl;
  
  const params = new URLSearchParams({ url: videoUrl, type: 'video' });
  if (referer) {
    params.set('referer', referer);
  }
  params.set('apikey', ENV.SUPABASE_ANON_KEY);
  return `${ENV.SUPABASE_URL}/functions/v1/rapid-service?${params.toString()}`;
}

export function getProxiedImageUrl(imageUrl: string): string {
  if (!imageUrl) return imageUrl;

  const trimmed = imageUrl.trim();
  if (!trimmed.startsWith('http')) return trimmed;
  if (trimmed.includes('/functions/v1/rapid-service')) return trimmed;
  
  const params = new URLSearchParams({ url: trimmed, type: 'image' });
  params.set('apikey', ENV.SUPABASE_ANON_KEY);
  return `${ENV.SUPABASE_URL}/functions/v1/rapid-service?${params.toString()}`;
}

export function getProxiedSubtitleUrl(subtitleUrl: string): string {
  const params = new URLSearchParams({ url: subtitleUrl });
  params.set('apikey', ENV.SUPABASE_ANON_KEY);
  return `${ENV.SUPABASE_URL}/functions/v1/rapid-service?${params.toString()}`;
}

// Types
export interface Episode {
  sub: number;
  dub: number;
}

export interface SpotlightAnime {
  id: string;
  name: string;
  jname: string;
  poster: string;
  description: string;
  rank: number;
  otherInfo: string[];
  episodes: Episode;
}

export interface TrendingAnime {
  id: string;
  name: string;
  poster: string;
  rank: number;
}

export interface TopAnime {
  id: string;
  name: string;
  poster: string;
  rank: number;
  episodes: Episode;
}

export interface AnimeCard {
  id: string;
  name: string;
  jname?: string;
  poster: string;
  type?: string;
  duration?: string;
  rating?: string;
  episodes: Episode;
}

export interface HomeData {
  genres: string[];
  latestEpisodeAnimes: AnimeCard[];
  spotlightAnimes: SpotlightAnime[];
  top10Animes: {
    today: TopAnime[];
    week: TopAnime[];
    month: TopAnime[];
  };
  topAiringAnimes: AnimeCard[];
  topUpcomingAnimes: AnimeCard[];
  trendingAnimes: TrendingAnime[];
  mostPopularAnimes: AnimeCard[];
  mostFavoriteAnimes: AnimeCard[];
  latestCompletedAnimes: AnimeCard[];
}

export interface AnimeInfo {
  info: {
    id: string;
    name: string;
    poster: string;
    description: string;
    stats: {
      rating: string;
      quality: string;
      episodes: Episode;
      type: string;
      duration: string;
    };
    promotionalVideos: Array<{
      title?: string;
      source?: string;
      thumbnail?: string;
    }>;
    characterVoiceActor: Array<{
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
    [key: string]: unknown;
  };
}

export interface EpisodeData {
  number: number;
  title: string;
  episodeId: string;
  isFiller: boolean;
}

export interface EpisodeServer {
  serverId: number;
  serverName: string;
}

export interface StreamingSource {
  url: string;
  isM3U8: boolean;
  quality?: string;
  language?: string;
  langCode?: string;
  isDub?: boolean;
  providerName?: string;
  needsHeadless?: boolean;
  isEmbed?: boolean;
}

export interface Subtitle {
  lang: string;
  url: string;
  label?: string;
}

export interface StreamingData {
  headers: {
    Referer: string;
    'User-Agent': string;
  };
  sources: StreamingSource[];
  subtitles: Subtitle[];
  tracks?: Subtitle[];
  anilistID: number | null;
  malID: number | null;
  intro?: { start: number; end: number };
  outro?: { start: number; end: number };
}

export interface SearchResult {
  animes: AnimeCard[];
  mostPopularAnimes: AnimeCard[];
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  searchQuery: string;
}

// API functions
export async function fetchHome(): Promise<HomeData> {
  return apiGet<HomeData>('/home');
}

export async function fetchAnimeInfo(
  animeId: string
): Promise<{ anime: AnimeInfo; recommendedAnimes: AnimeCard[]; relatedAnimes: AnimeCard[] }> {
  return apiGet(`/anime/${animeId}`);
}

export async function fetchEpisodes(
  animeId: string
): Promise<{ totalEpisodes: number; episodes: EpisodeData[] }> {
  return apiGet(`/anime/${animeId}/episodes`);
}

export async function fetchEpisodeServers(
  episodeId: string
): Promise<{
  episodeId: string;
  episodeNo: number;
  sub: EpisodeServer[];
  dub: EpisodeServer[];
  raw: EpisodeServer[];
}> {
  return apiGet(`/episode/servers?animeEpisodeId=${episodeId}`);
}

export async function fetchStreamingSources(
  episodeId: string,
  server: string = 'hd-1',
  category: string = 'sub'
): Promise<StreamingData> {
  return apiGet(
    `/episode/sources?animeEpisodeId=${episodeId}&server=${server}&category=${category}`
  );
}

export async function searchAnime(
  query: string,
  page: number = 1
): Promise<SearchResult> {
  return apiGet(`/search?q=${encodeURIComponent(query)}&page=${page}`);
}

export async function fetchGenreAnimes(
  genre: string,
  page: number = 1
): Promise<{
  genreName: string;
  animes: AnimeCard[];
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
}> {
  return apiGet(`/genre/${genre}?page=${page}`);
}
