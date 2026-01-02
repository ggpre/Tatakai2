import { useState, useEffect } from 'react';

interface SmartTVInfo {
  isSmartTV: boolean;
  platform: 'webos' | 'tizen' | 'android_tv' | 'fire_tv' | 'roku' | 'xbox' | 'playstation' | 'generic' | 'desktop';
  supportsRemote: boolean;
}

export function useSmartTV(): SmartTVInfo {
  const [tvInfo, setTvInfo] = useState<SmartTVInfo>({
    isSmartTV: false,
    platform: 'desktop',
    supportsRemote: false,
  });

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform?.toLowerCase() || '';
    
    let detected: SmartTVInfo = {
      isSmartTV: false,
      platform: 'desktop',
      supportsRemote: false,
    };

    // LG WebOS
    if (userAgent.includes('webos') || userAgent.includes('web0s') || userAgent.includes('netcast')) {
      detected = { isSmartTV: true, platform: 'webos', supportsRemote: true };
    }
    // Samsung Tizen
    else if (userAgent.includes('tizen') || userAgent.includes('samsung')) {
      detected = { isSmartTV: true, platform: 'tizen', supportsRemote: true };
    }
    // Android TV
    else if ((userAgent.includes('android') && userAgent.includes('tv')) || 
             userAgent.includes('android tv') || 
             userAgent.includes('googletv') ||
             userAgent.includes('aft')) { // Amazon Fire TV
      if (userAgent.includes('aft')) {
        detected = { isSmartTV: true, platform: 'fire_tv', supportsRemote: true };
      } else {
        detected = { isSmartTV: true, platform: 'android_tv', supportsRemote: true };
      }
    }
    // Roku
    else if (userAgent.includes('roku')) {
      detected = { isSmartTV: true, platform: 'roku', supportsRemote: true };
    }
    // Xbox
    else if (userAgent.includes('xbox') || platform.includes('xbox')) {
      detected = { isSmartTV: true, platform: 'xbox', supportsRemote: true };
    }
    // PlayStation
    else if (userAgent.includes('playstation') || userAgent.includes('ps4') || userAgent.includes('ps5')) {
      detected = { isSmartTV: true, platform: 'playstation', supportsRemote: true };
    }
    // Generic Smart TV indicators
    else if (
      userAgent.includes('smart-tv') ||
      userAgent.includes('smarttv') ||
      userAgent.includes('googletv') ||
      userAgent.includes('hbbtv') ||
      userAgent.includes('crkey') || // Chromecast
      userAgent.includes('opera tv') ||
      userAgent.includes('netrange') ||
      userAgent.includes('viera') || // Panasonic
      userAgent.includes('nettv') || // Philips
      userAgent.includes('tv browser') ||
      // Check for TV-like screen without touch
      (window.innerWidth >= 1280 && !('ontouchstart' in window) && 
       (userAgent.includes('tv') || userAgent.includes('large screen')))
    ) {
      detected = { isSmartTV: true, platform: 'generic', supportsRemote: true };
    }

    setTvInfo(detected);

    // Add body class for CSS targeting
    if (detected.isSmartTV) {
      document.body.classList.add('smart-tv-mode', `platform-${detected.platform}`);
    }

    return () => {
      document.body.classList.remove('smart-tv-mode', `platform-${detected.platform}`);
    };
  }, []);

  return tvInfo;
}
