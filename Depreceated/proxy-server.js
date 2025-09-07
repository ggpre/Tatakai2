const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

// Enable CORS for all origins (for development)
app.use(cors());

// Video proxy endpoint
app.get('/api/video-proxy', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Video URL is required' });
  }

  try {
    console.log('Proxying video request for WebOS:', url);

    // Forward the request to the actual video URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36 WebAppManager',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://aniwatch.to/',
        'Origin': 'https://aniwatch.to',
        'Range': req.headers.range || '',
      },
    });

    if (!response.ok) {
      console.error(`Video proxy error! status: ${response.status}`);
      return res.status(response.status).json({
        error: `Failed to fetch video: ${response.status}`
      });
    }

    // Get the content type from the response
    const contentType = response.headers.get('content-type') || 'application/vnd.apple.mpegurl';
    
    // Set response headers
    res.set({
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
    });

    // Handle M3U8 manifests - rewrite URLs to use our proxy
    if (contentType.includes('application/vnd.apple.mpegurl') || contentType.includes('text/plain')) {
      const text = await response.text();
      const baseUrl = new URL(url);
      const basePath = baseUrl.pathname.substring(0, baseUrl.pathname.lastIndexOf('/') + 1);
      
      // Rewrite relative URLs in the manifest to use our proxy
      const rewrittenText = text.replace(
        /^(?!#|https?:\/\/)(.+)$/gm,
        (match, filename) => {
          const trimmed = filename.trim();
          if (!trimmed || trimmed.startsWith('#')) return match;
          
          // Skip URI attributes in EXT-X-I-FRAME-STREAM-INF
          if (match.includes('URI=')) {
            return match.replace(/URI="([^"]+)"/g, (uriMatch, uri) => {
              const fullUrl = `${baseUrl.protocol}//${baseUrl.host}${basePath}${uri}`;
              return `URI="http://localhost:${PORT}/api/video-proxy?url=${encodeURIComponent(fullUrl)}"`;
            });
          }
          
          let fullUrl;
          if (trimmed.startsWith('http')) {
            fullUrl = trimmed;
          } else {
            fullUrl = `${baseUrl.protocol}//${baseUrl.host}${basePath}${trimmed}`;
          }
          return `http://localhost:${PORT}/api/video-proxy?url=${encodeURIComponent(fullUrl)}`;
        }
      );
      
      console.log('Rewritten M3U8 manifest for WebOS');
      res.send(rewrittenText);
    } else {
      // Pipe the response directly for video segments
      response.body.pipe(res);
    }
  } catch (error) {
    console.error('Video proxy error:', error);
    res.status(500).json({
      error: 'Failed to proxy video request'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'WebOS Video Proxy Server Running', port: PORT });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎥 WebOS Video Proxy Server running on http://localhost:${PORT}`);
  console.log(`📺 Ready to serve video content for LG TV WebOS app`);
  console.log(`🔗 Proxy endpoint: http://localhost:${PORT}/api/video-proxy?url=<VIDEO_URL>`);
});
