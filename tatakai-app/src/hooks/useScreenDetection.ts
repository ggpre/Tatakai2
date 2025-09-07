'use client';

import { useState, useEffect } from 'react';

type DeviceType = 'mobile' | 'tablet' | 'laptop' | 'tv';

interface ScreenInfo {
  width: number;
  height: number;
  deviceType: DeviceType;
  effectiveDeviceType: DeviceType;
}

const getDeviceTypeFromDimensions = (width: number, height: number): DeviceType => {
  // Check user agent for TV devices
  if (typeof window !== 'undefined') {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('webos') || userAgent.includes('tizen') || userAgent.includes('smarttv')) {
      return 'tv';
    }
  }

  // TV threshold - 2560px and above
  if (width >= 2560) {
    return 'tv';
  }
  
  // Laptop threshold - 1024px to 2559px
  if (width >= 1024) {
    return 'laptop';
  }
  
  // Tablet threshold - 768px to 1023px
  if (width >= 768) {
    return 'tablet';
  }
  
  // Mobile - below 768px
  return 'mobile';
};

export const useScreenDetection = (): ScreenInfo => {
  const [screenInfo, setScreenInfo] = useState<ScreenInfo>({
    width: 0,
    height: 0,
    deviceType: 'laptop',
    effectiveDeviceType: 'laptop'
  });

  useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const deviceType = getDeviceTypeFromDimensions(width, height);
      
      // Check for user preference override
      let effectiveDeviceType = deviceType;
      const savedPreference = localStorage.getItem('device-preference');
      if (savedPreference && ['mobile', 'tablet', 'laptop', 'tv'].includes(savedPreference)) {
        effectiveDeviceType = savedPreference as DeviceType;
      }

      setScreenInfo({
        width,
        height,
        deviceType,
        effectiveDeviceType
      });

      // Set device type on document for CSS targeting
      document.documentElement.setAttribute('data-device-type', effectiveDeviceType);
    };

    // Initial call
    updateScreenInfo();

    // Listen for resize events
    window.addEventListener('resize', updateScreenInfo);

    return () => {
      window.removeEventListener('resize', updateScreenInfo);
    };
  }, []);

  return screenInfo;
};
