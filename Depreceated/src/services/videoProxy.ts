// Video proxy service for WebOS app using the existing Tatakai app proxy
// This uses the deployed Tatakai app proxy to handle video streaming

export class VideoProxyService {
  private static baseUrl = 'https://tatakai-eight.vercel.app'; // Existing Tatakai app proxy

  static getProxiedUrl(url: string): string {
    // If it's already a proxy URL, return as is
    if (url.startsWith('/api/video-proxy') || url.includes('tatakai-eight.vercel.app')) {
      return url;
    }
    
    // If it's an external URL, proxy it through the Tatakai app
    if (url.startsWith('http')) {
      return `${this.baseUrl}/api/video-proxy?url=${encodeURIComponent(url)}`;
    }
    
    return url;
  }

  static async fetchVideoData(url: string): Promise<Response> {
    const proxiedUrl = this.getProxiedUrl(url);
    
    return fetch(proxiedUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36 WebAppManager',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://aniwatch.to/',
        'Origin': 'https://aniwatch.to',
      },
    });
  }
}

export default VideoProxyService;
