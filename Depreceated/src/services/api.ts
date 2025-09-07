// API types based on the backend documentation
export interface Anime {
  id: string;
  name: string;
  poster: string;
  duration?: string;
  type?: string;
  rating?: string;
  episodes?: {
    sub?: number;
    dub?: number;
  };
  jname?: string;
  rank?: number;
  description?: string;
  otherInfo?: string[];
}

export interface SpotlightAnime extends Anime {
  jname: string;
  description: string;
  rank: number;
  otherInfo: string[];
}

export interface Top10Anime extends Anime {
  rank: number;
}

export interface HomePageData {
  success: boolean;
  data: {
    genres: string[];
    latestEpisodeAnimes: Anime[];
    spotlightAnimes: SpotlightAnime[];
    top10Animes: {
      today: Top10Anime[];
      week: Top10Anime[];
      month: Top10Anime[];
    };
    topAiringAnimes: Anime[];
    topUpcomingAnimes: Anime[];
    trendingAnimes: Anime[];
    mostPopularAnimes: Anime[];
    mostFavoriteAnimes: Anime[];
    latestCompletedAnimes: Anime[];
  };
}

export interface SearchResult {
  success: boolean;
  data: {
    animes: Anime[];
    mostPopularAnimes: Anime[];
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    searchQuery: string;
    searchFilters: Record<string, string[]>;
  };
}

export interface AnimeDetails {
  success: boolean;
  data: {
    anime: {
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
      };
    };
    mostPopularAnimes: Anime[];
    recommendedAnimes: Anime[];
    relatedAnimes: Anime[];
    seasons: Array<{
      id: string;
      name: string;
      title: string;
      poster: string;
      isCurrent: boolean;
    }>;
  };
}

export interface Episode {
  number: number;
  title: string;
  episodeId: string;
  isFiller: boolean;
}

export interface EpisodesData {
  success: boolean;
  data: {
    totalEpisodes: number;
    episodes: Episode[];
  };
}

export interface StreamingSource {
  url: string;
  isM3U8: boolean;
  quality?: string;
}

export interface StreamingData {
  success: boolean;
  data: {
    headers: Record<string, string>;
    sources: StreamingSource[];
    subtitles: Array<{
      lang: string;
      url: string;
    }>;
    anilistID: number | null;
    malID: number | null;
  };
}

const BASE_URL = "https://tatakai-eight.vercel.app/api/anime";

class AnimeAPIService {
  private retryCount = 3;
  private retryDelay = 1000;

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchWithTimeout(url: string, timeout = 15000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'WebOS-Tatakai/1.0.0',
        },
        method: 'GET',
        cache: 'no-cache',
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle AbortError specifically
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out or was cancelled');
      }
      
      throw error;
    }
  }

  private async fetchWithRetry(url: string, maxRetries = this.retryCount): Promise<Response> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`API Request attempt ${attempt}/${maxRetries}: ${url}`);
        const response = await this.fetchWithTimeout(url);
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(`API Request attempt ${attempt} failed:`, lastError.message);
        
        // Don't retry on certain errors
        if (lastError.message.includes('404') || lastError.message.includes('400')) {
          throw lastError;
        }
        
        // Wait before retrying (except on last attempt)
        if (attempt < maxRetries) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    throw lastError!;
  }

  private parseApiResponse(data: any): { success: boolean; data: any; message?: string } {
    // Handle both response formats:
    // 1. Tatakai app proxy format: { success: boolean, data: {...} }
    // 2. Direct HiAnime API format: { status: 200, data: {...} }
    
    if (data.success !== undefined) {
      // Tatakai app proxy format
      return {
        success: data.success,
        data: data.data,
        message: data.message || data.details
      };
    } else if (data.status !== undefined) {
      // Direct HiAnime API format
      return {
        success: data.status === 200,
        data: data.data,
        message: data.status !== 200 ? `API error: ${data.status}` : undefined
      };
    } else {
      // Unknown format
      return {
        success: false,
        data: null,
        message: 'Invalid API response format'
      };
    }
  }

  async getHomePage(): Promise<HomePageData> {
    try {
      console.log("Fetching home page data from:", `${BASE_URL}?endpoint=/home`);
      const response = await this.fetchWithRetry(`${BASE_URL}?endpoint=/home`);
      const rawData = await response.json();
      console.log("Home page data received successfully");
      
      const parsed = this.parseApiResponse(rawData);
      
      if (!parsed.success) {
        throw new Error(parsed.message || 'API returned unsuccessful response');
      }
      
      if (!parsed.data) {
        throw new Error('No data received from API');
      }
      
      // Return in expected format
      return {
        success: true,
        data: parsed.data
      };
      
    } catch (error) {
      console.error("Error fetching home page:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch home page data: ${errorMessage}`);
    }
  }

  async searchAnime(query: string, page = 1): Promise<SearchResult> {
    try {
      const url = `${BASE_URL}?endpoint=/anime/search?q=${encodeURIComponent(query)}&page=${page}`;
      console.log("Searching anime:", url);
      const response = await this.fetchWithRetry(url);
      const rawData = await response.json();
      
      const parsed = this.parseApiResponse(rawData);
      
      if (!parsed.success) {
        throw new Error(parsed.message || 'Search request failed');
      }
      
      return {
        success: true,
        data: parsed.data
      };
    } catch (error) {
      console.error("Error searching anime:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to search anime: ${errorMessage}`);
    }
  }

  async getAnimeDetails(animeId: string): Promise<AnimeDetails> {
    try {
      const response = await this.fetchWithRetry(`${BASE_URL}?endpoint=/anime/${animeId}`);
      const rawData = await response.json();
      
      const parsed = this.parseApiResponse(rawData);
      
      if (!parsed.success) {
        throw new Error(parsed.message || 'Failed to get anime details');
      }
      
      return {
        success: true,
        data: parsed.data
      };
    } catch (error) {
      console.error("Error fetching anime details:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch anime details: ${errorMessage}`);
    }
  }

  async getAnimeEpisodes(animeId: string): Promise<EpisodesData> {
    try {
      const response = await this.fetchWithRetry(`${BASE_URL}?endpoint=/anime/${animeId}/episodes`);
      const rawData = await response.json();
      
      const parsed = this.parseApiResponse(rawData);
      
      if (!parsed.success) {
        throw new Error(parsed.message || 'Failed to get episodes');
      }
      
      return {
        success: true,
        data: parsed.data
      };
    } catch (error) {
      console.error("Error fetching anime episodes:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch episodes: ${errorMessage}`);
    }
  }

  async getStreamingSources(episodeId: string, server = "hd-1", category = "sub"): Promise<StreamingData> {
    try {
      const url = `${BASE_URL}?endpoint=/episode/sources&animeEpisodeId=${encodeURIComponent(episodeId)}&server=${encodeURIComponent(server)}&category=${category}`;
      const response = await this.fetchWithRetry(url);
      const rawData = await response.json();
      
      const parsed = this.parseApiResponse(rawData);
      
      if (!parsed.success) {
        throw new Error(parsed.message || 'Failed to get streaming sources');
      }
      
      return {
        success: true,
        data: parsed.data
      };
    } catch (error) {
      console.error("Error fetching streaming sources:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch streaming sources: ${errorMessage}`);
    }
  }

  async getCategoryAnimes(category: string, page = 1): Promise<SearchResult> {
    try {
      const response = await this.fetchWithRetry(`${BASE_URL}?endpoint=/category/${category}?page=${page}`);
      const rawData = await response.json();
      
      const parsed = this.parseApiResponse(rawData);
      
      if (!parsed.success) {
        throw new Error(parsed.message || 'Failed to get category animes');
      }
      
      return {
        success: true,
        data: parsed.data
      };
    } catch (error) {
      console.error("Error fetching category animes:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch category animes: ${errorMessage}`);
    }
  }

  async getGenreAnimes(genre: string, page = 1): Promise<SearchResult> {
    try {
      const response = await this.fetchWithRetry(`${BASE_URL}?endpoint=/genre/${genre}?page=${page}`);
      const rawData = await response.json();
      
      const parsed = this.parseApiResponse(rawData);
      
      if (!parsed.success) {
        throw new Error(parsed.message || 'Failed to get genre animes');
      }
      
      return {
        success: true,
        data: parsed.data
      };
    } catch (error) {
      console.error("Error fetching genre animes:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch genre animes: ${errorMessage}`);
    }
  }

  async getSearchSuggestions(query: string): Promise<{ success: boolean; data: { suggestions: Anime[] } }> {
    try {
      const response = await this.fetchWithRetry(`${BASE_URL}?endpoint=/anime/search/suggestion?q=${encodeURIComponent(query)}`);
      const rawData = await response.json();
      
      const parsed = this.parseApiResponse(rawData);
      
      if (!parsed.success) {
        throw new Error(parsed.message || 'Failed to get search suggestions');
      }
      
      return {
        success: true,
        data: parsed.data
      };
    } catch (error) {
      console.error("Error fetching search suggestions:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch suggestions: ${errorMessage}`);
    }
  }
}

export const AnimeAPI = new AnimeAPIService();
export default AnimeAPI;
