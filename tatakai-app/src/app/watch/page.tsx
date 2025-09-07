'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, Settings, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useScreenDetection } from '@/hooks';

const WatchPage = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const router = useRouter();
  const { effectiveDeviceType } = useScreenDetection();

  useEffect(() => {
    // Auto-hide controls after 3 seconds on TV
    if (effectiveDeviceType === 'tv' && showControls && isPlaying) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showControls, isPlaying, effectiveDeviceType]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    setShowControls(true);
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  return (
    <div 
      className={`watch-page ${effectiveDeviceType === 'tv' ? 'hero-section' : 'min-h-screen'} bg-black text-white relative overflow-hidden`}
      onMouseMove={handleMouseMove}
    >
      {/* Video Player Area */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20">
        {/* Placeholder for video */}
        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
              <Play className="w-16 h-16 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Video Player</h2>
            <p className="text-gray-400">Your anime episode would play here</p>
          </div>
        </div>
      </div>

      {/* Controls Overlay */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none"
      >
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-6 pointer-events-auto">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => router.back()}
              data-keyboard-nav
              tabIndex={0}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-6 h-6 mr-2" />
              Back
            </Button>
            
            <div className="text-right">
              <h1 className="text-xl font-bold">Anime Episode Title</h1>
              <p className="text-gray-300">Episode 1 - The Beginning</p>
            </div>
          </div>
        </div>

        {/* Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <Button
            variant="ghost"
            size="lg"
            onClick={handlePlayPause}
            data-keyboard-nav
            tabIndex={0}
            className={`w-24 h-24 rounded-full bg-white/20 hover:bg-white/30 ${effectiveDeviceType === 'tv' ? 'scale-150' : ''}`}
          >
            {isPlaying ? (
              <Pause className="w-12 h-12 text-white" />
            ) : (
              <Play className="w-12 h-12 text-white ml-1" />
            )}
          </Button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-auto">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full h-2 bg-white/20 rounded-full">
              <div className="w-1/3 h-full bg-primary rounded-full"></div>
            </div>
            <div className="flex justify-between text-sm text-gray-300 mt-1">
              <span>12:34</span>
              <span>24:00</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="ghost"
              size="lg"
              data-keyboard-nav
              tabIndex={-1}
              className="text-white hover:bg-white/20"
            >
              <Volume2 className="w-6 h-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              onClick={handlePlayPause}
              data-keyboard-nav
              tabIndex={-1}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              data-keyboard-nav
              tabIndex={-1}
              className="text-white hover:bg-white/20"
            >
              <Settings className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WatchPage;
