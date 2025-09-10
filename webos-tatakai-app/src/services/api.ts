import { 
  APIResponse, 
  HomePageData, 
  AnimeDetails, 
  SearchResult, 
  SearchSuggestion,
  Episode,
  EpisodeServers,
  EpisodeData
} from '@/types';

// Base API configuration
const API_CONFIG = {
  baseUrl: '/api/anime',
  videoProxyUrl: '/api/video-proxy',
  timeout: 30000,
  retryAttempts: 3,
};

// Generic API request function with retry logic
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {},
  attempt = 1
): Promise<APIResponse<T>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    const url = `${API_CONFIG.baseUrl}?endpoint=${encodeURIComponent(endpoint)}`;
    console.log(`API Request (attempt ${attempt}):`, url);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    
    return data;
  } catch (error) {
    console.error(`API request failed (attempt ${attempt}):`, error);
    
    if (attempt < API_CONFIG.retryAttempts) {
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      return apiRequest<T>(endpoint, options, attempt + 1);
    }
    
    throw error;
  }
}

// Video proxy function
export async function getVideoUrl(originalUrl: string): Promise<string> {
  try {
    const proxyUrl = `${API_CONFIG.videoProxyUrl}?url=${encodeURIComponent(originalUrl)}`;
    return proxyUrl;
  } catch (error) {
    console.error('Video proxy error:', error);
    return originalUrl; // Fallback to original URL
  }
}

// API Service class
export class AnimeAPIService {
  // Get home page data
  static async getHomeData(): Promise<HomePageData> {
    try {
      const response = await apiRequest<HomePageData>('/home');
      if (!response.success) {
        throw new Error('Failed to fetch home data');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch home data:', error);
      throw error;
    }
  }

  // Get anime details
  static async getAnimeDetails(animeId: string): Promise<AnimeDetails> {
    try {
      const response = await apiRequest<AnimeDetails>(`/anime/${animeId}`);
      if (!response.success) {
        throw new Error('Failed to fetch anime details');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch anime details:', error);
      throw error;
    }
  }

  // Search anime
  static async searchAnime(
    query: string, 
    page = 1,
    filters: Record<string, string> = {}
  ): Promise<SearchResult> {
    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        ...filters,
      });
      
      const response = await apiRequest<SearchResult>(`/search?${params}`);
      if (!response.success) {
        throw new Error('Failed to search anime');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to search anime:', error);
      throw error;
    }
  }

  // Get search suggestions
  static async getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
    try {
      if (!query || query.length < 2) return [];
      
      const response = await apiRequest<{ suggestions: SearchSuggestion[] }>(
        `/search/suggestion?q=${encodeURIComponent(query)}`
      );
      
      if (!response.success) {
        throw new Error('Failed to fetch search suggestions');
      }
      return response.data.suggestions;
    } catch (error) {
      console.error('Failed to fetch search suggestions:', error);
      return [];
    }
  }

  // Get anime episodes
  static async getAnimeEpisodes(animeId: string): Promise<Episode[]> {
    try {
      const response = await apiRequest<{ totalEpisodes: number; episodes: Episode[] }>(
        `/anime/${animeId}/episodes`
      );
      
      if (!response.success) {
        throw new Error('Failed to fetch episodes');
      }
      return response.data.episodes;
    } catch (error) {
      console.error('Failed to fetch episodes:', error);
      throw error;
    }
  }

  // Get episode servers
  static async getEpisodeServers(episodeId: string): Promise<EpisodeServers> {
    try {
      const response = await apiRequest<EpisodeServers>(
        `/episode/servers?animeEpisodeId=${encodeURIComponent(episodeId)}`
      );
      
      if (!response.success) {
        throw new Error('Failed to fetch episode servers');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch episode servers:', error);
      throw error;
    }
  }

  // Get episode sources
  static async getEpisodeSources(
    episodeId: string, 
    server = 'hd-1', 
    category: 'sub' | 'dub' | 'raw' = 'sub'
  ): Promise<EpisodeData> {
    try {
      const params = new URLSearchParams({
        animeEpisodeId: episodeId,
        server,
        category,
      });
      
      const response = await apiRequest<EpisodeData>(`/episode/sources?${params}`);
      
      if (!response.success) {
        throw new Error('Failed to fetch episode sources');
      }
      
      // Process video URLs through proxy
      const processedSources = await Promise.all(
        response.data.sources.map(async (source) => ({
          ...source,
          url: await getVideoUrl(source.url),
        }))
      );
      
      return {
        ...response.data,
        sources: processedSources,
      };
    } catch (error) {
      console.error('Failed to fetch episode sources:', error);
      throw error;
    }
  }

  // Get category anime (trending, popular, etc.)
  static async getCategoryAnime(
    category: string, 
    page = 1
  ): Promise<{ animes: any[]; currentPage: number; totalPages: number; hasNextPage: boolean }> {
    try {
      const response = await apiRequest<any>(`/category/${category}?page=${page}`);
      
      if (!response.success) {
        throw new Error('Failed to fetch category anime');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch category anime:', error);
      throw error;
    }
  }

  // Get genre anime
  static async getGenreAnime(
    genre: string, 
    page = 1
  ): Promise<{ animes: any[]; currentPage: number; totalPages: number; hasNextPage: boolean }> {
    try {
      const response = await apiRequest<any>(`/genre/${genre}?page=${page}`);
      
      if (!response.success) {
        throw new Error('Failed to fetch genre anime');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch genre anime:', error);
      throw error;
    }
  }

  // Get A-Z list
  static async getAZList(
    sort: string, 
    page = 1
  ): Promise<{ animes: any[]; currentPage: number; totalPages: number; hasNextPage: boolean }> {
    try {
      const response = await apiRequest<any>(`/azlist/${sort}?page=${page}`);
      
      if (!response.success) {
        throw new Error('Failed to fetch A-Z list');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch A-Z list:', error);
      throw error;
    }
  }

  // Get anime schedule
  static async getSchedule(date: string): Promise<{ scheduledAnimes: any[] }> {
    try {
      const response = await apiRequest<any>(`/schedule?date=${date}`);
      
      if (!response.success) {
        throw new Error('Failed to fetch schedule');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
      throw error;
    }
  }
}

// Export individual functions for convenience
export const {
  getHomeData,
  getAnimeDetails,
  searchAnime,
  getSearchSuggestions,
  getAnimeEpisodes,
  getEpisodeServers,
  getEpisodeSources,
  getCategoryAnime,
  getGenreAnime,
  getAZList,
  getSchedule,
} = AnimeAPIService;