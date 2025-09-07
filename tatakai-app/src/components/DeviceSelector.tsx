'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone, Tablet, Tv } from 'lucide-react';

type DeviceType = 'mobile' | 'tablet' | 'laptop' | 'tv';

const DeviceSelector: React.FC = () => {
  const [currentDevice, setCurrentDevice] = useState<DeviceType>('laptop');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const savedPreference = localStorage.getItem('device-preference');
    if (savedPreference) {
      setCurrentDevice(savedPreference as DeviceType);
    }
    
    // Show in development mode
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
    }
  }, []);

  const setDeviceType = (device: DeviceType) => {
    localStorage.setItem('device-preference', device);
    setCurrentDevice(device);
    window.location.reload();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background border rounded-lg p-4 shadow-lg">
      <div className="text-sm font-medium mb-2">Dev: Device Type</div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={currentDevice === 'mobile' ? 'default' : 'outline'}
          onClick={() => setDeviceType('mobile')}
        >
          <Smartphone className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant={currentDevice === 'tablet' ? 'default' : 'outline'}
          onClick={() => setDeviceType('tablet')}
        >
          <Tablet className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant={currentDevice === 'laptop' ? 'default' : 'outline'}
          onClick={() => setDeviceType('laptop')}
        >
          <Monitor className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant={currentDevice === 'tv' ? 'default' : 'outline'}
          onClick={() => setDeviceType('tv')}
        >
          <Tv className="w-4 h-4" />
        </Button>
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        Current: {currentDevice}
      </div>
    </div>
  );
};

export default DeviceSelector;
