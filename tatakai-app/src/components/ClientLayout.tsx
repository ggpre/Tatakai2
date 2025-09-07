'use client';

import React from 'react';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { useScreenDetection } from '@/hooks';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const { effectiveDeviceType } = useScreenDetection();
  const isTV = effectiveDeviceType === 'tv';

  return (
    <NavigationProvider>
      {/* Main Content */}
      <div className={isTV ? 'tv-layout' : 'default-layout'}>
        {children}
      </div>
    </NavigationProvider>
  );
};
