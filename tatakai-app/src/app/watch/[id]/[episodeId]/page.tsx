'use client';

import { useScreenDetection } from '@/hooks/useScreenDetection';
import TVVideoPlayer from '@/components/TVVideoPlayer';

export default function WatchPage() {
  const { deviceType } = useScreenDetection();

  // If it's a TV device, use the TV video player
  if (deviceType === 'tv') {
    return <TVVideoPlayer />;
  }

  // For other devices, show a message or redirect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Video Player</h1>
        <p>Desktop video player - to be implemented</p>
      </div>
    </div>
  );
}
