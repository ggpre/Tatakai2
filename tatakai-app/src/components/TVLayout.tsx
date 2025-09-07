'use client';

import React from 'react';
import { useScreenDetection } from '@/hooks/useScreenDetection';
import { NavigationProvider } from '@/contexts/NavigationContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import TVNavbar from '@/components/TVNavbar';

interface TVLayoutProps {
  children: React.ReactNode;
}

const TVLayout: React.FC<TVLayoutProps> = ({ children }) => {
  const { effectiveDeviceType } = useScreenDetection();

  // TV layout with TVNavbar instead of desktop navigation
  if (effectiveDeviceType === 'tv') {
    return (
      <NavigationProvider>
        <div className="tv-layout min-h-screen bg-background text-foreground" data-device-type="tv">
          <TVNavbar />
          <main className="tv-main-content">
            {children}
          </main>
        </div>
      </NavigationProvider>
    );
  }

  // Regular layout for non-TV devices
  return (
    <div data-device-type={effectiveDeviceType} className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="main-content pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default TVLayout;
