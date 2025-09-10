import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// WebOS specific utilities
export const isWebOS = () => {
  return typeof window !== 'undefined' && 'webOSTV' in window;
};

export const isTV = () => {
  return isWebOS() || window.innerWidth >= 1280;
};

export const getTVSafeArea = () => {
  if (isWebOS()) {
    return {
      top: 60,
      bottom: 60,
      left: 80,
      right: 80,
    };
  }
  return {
    top: 40,
    bottom: 40,
    left: 60,
    right: 60,
  };
};

// Navigation utilities for TV
export const getDirectionalDistance = (
  rect1: DOMRect,
  rect2: DOMRect,
  direction: 'up' | 'down' | 'left' | 'right'
) => {
  const dx = rect2.left - rect1.left;
  const dy = rect2.top - rect1.top;
  
  switch (direction) {
    case 'up':
      return dy < 0 ? Math.sqrt(dx * dx + dy * dy) : Infinity;
    case 'down':
      return dy > 0 ? Math.sqrt(dx * dx + dy * dy) : Infinity;
    case 'left':
      return dx < 0 ? Math.sqrt(dx * dx + dy * dy) : Infinity;
    case 'right':
      return dx > 0 ? Math.sqrt(dx * dx + dy * dy) : Infinity;
    default:
      return Infinity;
  }
};

// Format time utilities
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// API utilities
export const buildApiUrl = (endpoint: string, params?: Record<string, string>) => {
  const baseUrl = '/api';
  const url = new URL(`${baseUrl}${endpoint}`, window.location.origin);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
  }
  
  return url.toString();
};

// Image utilities
export const getImageUrl = (url: string, fallback = '/logo.png') => {
  if (!url) return fallback;
  if (url.startsWith('http')) return url;
  return `${url}`;
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Local storage utilities with WebOS compatibility
export const storage = {
  get: (key: string, defaultValue?: any) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.warn('Failed to save to localStorage');
    }
  },
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch {
      console.warn('Failed to remove from localStorage');
    }
  },
};