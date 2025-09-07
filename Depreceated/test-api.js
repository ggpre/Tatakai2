// Simple test script for WebOS API service
const BASE_URL = "https://tatakai-eight.vercel.app/api/anime";

function parseApiResponse(data) {
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

async function testAPI() {
  console.log("Testing WebOS API service...");
  
  try {
    console.log("Fetching home page data...");
    const response = await fetch(`${BASE_URL}?endpoint=/home`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'WebOS-Tatakai-Test/1.0.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    
    const rawData = await response.json();
    const parsed = parseApiResponse(rawData);
    
    if (!parsed.success) {
      throw new Error(parsed.message || 'API returned unsuccessful response');
    }
    
    console.log("✅ API test successful!");
    console.log("Response format detected:", rawData.success !== undefined ? 'Tatakai Proxy' : 'Direct HiAnime');
    console.log("Data structure:", {
      success: parsed.success,
      hasData: !!parsed.data,
      spotlightCount: parsed.data?.spotlightAnimes?.length || 0,
      latestCount: parsed.data?.latestEpisodeAnimes?.length || 0,
      trendingCount: parsed.data?.trendingAnimes?.length || 0,
    });
    
  } catch (error) {
    console.error("❌ API test failed:", error.message);
  }
}

// Run the test
testAPI();
