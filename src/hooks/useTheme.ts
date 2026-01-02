import { useState, useEffect, useCallback } from 'react';

export type Theme = 
  | 'midnight' 
  | 'cherry-blossom' 
  | 'neon-tokyo' 
  | 'aurora-borealis' 
  | 'volcanic' 
  | 'deep-ocean' 
  | 'golden-hour' 
  | 'cyberpunk'
  | 'zen-garden'
  | 'northern-lights'
  | 'light-minimal'
  | 'light-sakura'
  | 'brutalism'
  | 'brutalism-dark'
  | 'glacier'
  | 'harvest'
  | 'lavender'
  | 'obsidian'
  | 'orchid'
  | 'solar'
  | 'tide'
  | 'verdant';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  glass: string;
  glowPrimary: string;
  glowSecondary: string;
  surface: string;
  surfaceHover: string;
  sidebarBackground: string;
  sidebarBorder: string;
  isLight?: boolean;
  isBrutalism?: boolean;
}

export const THEME_COLORS: Record<Theme, ThemeColors> = {
  'midnight': {
    primary: '239 84% 67%',
    secondary: '270 60% 50%',
    accent: '280 70% 55%',
    background: '240 10% 4%',
    foreground: '0 0% 98%',
    card: '240 8% 7%',
    cardForeground: '0 0% 98%',
    muted: '240 6% 12%',
    mutedForeground: '240 5% 65%',
    border: '240 6% 18%',
    glass: '240 10% 8%',
    glowPrimary: '239 84% 67%',
    glowSecondary: '270 60% 50%',
    surface: '240 8% 5%',
    surfaceHover: '240 8% 10%',
    sidebarBackground: '240 10% 3%',
    sidebarBorder: '240 6% 15%',
  },
  'cherry-blossom': {
    primary: '340 82% 65%',
    secondary: '320 70% 55%',
    accent: '350 90% 70%',
    background: '340 15% 5%',
    foreground: '340 5% 95%',
    card: '340 12% 8%',
    cardForeground: '340 5% 95%',
    muted: '340 10% 15%',
    mutedForeground: '340 10% 60%',
    border: '340 10% 20%',
    glass: '340 12% 10%',
    glowPrimary: '340 82% 65%',
    glowSecondary: '320 70% 55%',
    surface: '340 12% 6%',
    surfaceHover: '340 12% 12%',
    sidebarBackground: '340 15% 4%',
    sidebarBorder: '340 10% 15%',
  },
  'neon-tokyo': {
    primary: '280 100% 60%',
    secondary: '180 100% 50%',
    accent: '320 100% 55%',
    background: '260 20% 3%',
    foreground: '0 0% 100%',
    card: '260 18% 6%',
    cardForeground: '0 0% 100%',
    muted: '260 15% 12%',
    mutedForeground: '260 10% 60%',
    border: '260 20% 18%',
    glass: '260 18% 8%',
    glowPrimary: '280 100% 60%',
    glowSecondary: '180 100% 50%',
    surface: '260 18% 4%',
    surfaceHover: '260 18% 10%',
    sidebarBackground: '260 20% 2%',
    sidebarBorder: '260 15% 15%',
  },
  'aurora-borealis': {
    primary: '160 80% 50%',
    secondary: '200 85% 55%',
    accent: '280 70% 60%',
    background: '200 25% 4%',
    foreground: '160 10% 95%',
    card: '200 20% 7%',
    cardForeground: '160 10% 95%',
    muted: '200 15% 13%',
    mutedForeground: '200 10% 60%',
    border: '200 15% 18%',
    glass: '200 18% 9%',
    glowPrimary: '160 80% 50%',
    glowSecondary: '200 85% 55%',
    surface: '200 20% 5%',
    surfaceHover: '200 20% 11%',
    sidebarBackground: '200 25% 3%',
    sidebarBorder: '200 15% 14%',
  },
  'volcanic': {
    primary: '15 95% 55%',
    secondary: '30 90% 50%',
    accent: '0 85% 60%',
    background: '15 15% 4%',
    foreground: '30 10% 95%',
    card: '15 12% 7%',
    cardForeground: '30 10% 95%',
    muted: '15 10% 13%',
    mutedForeground: '15 8% 55%',
    border: '15 12% 18%',
    glass: '15 12% 9%',
    glowPrimary: '15 95% 55%',
    glowSecondary: '30 90% 50%',
    surface: '15 12% 5%',
    surfaceHover: '15 12% 11%',
    sidebarBackground: '15 15% 3%',
    sidebarBorder: '15 10% 14%',
  },
  'deep-ocean': {
    primary: '200 90% 55%',
    secondary: '220 85% 50%',
    accent: '175 85% 45%',
    background: '210 35% 3%',
    foreground: '200 5% 96%',
    card: '210 30% 6%',
    cardForeground: '200 5% 96%',
    muted: '210 20% 12%',
    mutedForeground: '210 15% 55%',
    border: '210 20% 16%',
    glass: '210 25% 8%',
    glowPrimary: '200 90% 55%',
    glowSecondary: '220 85% 50%',
    surface: '210 30% 4%',
    surfaceHover: '210 30% 10%',
    sidebarBackground: '210 35% 2%',
    sidebarBorder: '210 18% 12%',
  },
  'golden-hour': {
    primary: '40 95% 55%',
    secondary: '25 90% 50%',
    accent: '50 100% 50%',
    background: '30 20% 4%',
    foreground: '40 10% 95%',
    card: '30 15% 7%',
    cardForeground: '40 10% 95%',
    muted: '30 12% 14%',
    mutedForeground: '30 10% 55%',
    border: '30 12% 18%',
    glass: '30 15% 9%',
    glowPrimary: '40 95% 55%',
    glowSecondary: '25 90% 50%',
    surface: '30 15% 5%',
    surfaceHover: '30 15% 11%',
    sidebarBackground: '30 20% 3%',
    sidebarBorder: '30 10% 14%',
  },
  'cyberpunk': {
    primary: '55 100% 50%',
    secondary: '180 100% 40%',
    accent: '320 100% 55%',
    background: '240 15% 3%',
    foreground: '55 100% 95%',
    card: '240 12% 6%',
    cardForeground: '55 100% 95%',
    muted: '240 10% 12%',
    mutedForeground: '240 8% 55%',
    border: '240 12% 18%',
    glass: '240 12% 8%',
    glowPrimary: '55 100% 50%',
    glowSecondary: '180 100% 40%',
    surface: '240 12% 4%',
    surfaceHover: '240 12% 10%',
    sidebarBackground: '240 15% 2%',
    sidebarBorder: '240 10% 14%',
  },
  'zen-garden': {
    primary: '145 40% 50%',
    secondary: '35 60% 45%',
    accent: '160 45% 40%',
    background: '90 10% 5%',
    foreground: '90 5% 92%',
    card: '90 8% 8%',
    cardForeground: '90 5% 92%',
    muted: '90 6% 14%',
    mutedForeground: '90 5% 55%',
    border: '90 8% 18%',
    glass: '90 8% 10%',
    glowPrimary: '145 40% 50%',
    glowSecondary: '35 60% 45%',
    surface: '90 8% 6%',
    surfaceHover: '90 8% 12%',
    sidebarBackground: '90 10% 4%',
    sidebarBorder: '90 6% 14%',
  },
  'northern-lights': {
    primary: '170 80% 55%',
    secondary: '280 75% 60%',
    accent: '200 90% 55%',
    background: '220 30% 4%',
    foreground: '170 10% 96%',
    card: '220 25% 7%',
    cardForeground: '170 10% 96%',
    muted: '220 18% 13%',
    mutedForeground: '220 12% 55%',
    border: '220 18% 18%',
    glass: '220 22% 9%',
    glowPrimary: '170 80% 55%',
    glowSecondary: '280 75% 60%',
    surface: '220 25% 5%',
    surfaceHover: '220 25% 11%',
    sidebarBackground: '220 30% 3%',
    sidebarBorder: '220 15% 14%',
  },
  // Light Themes
  'light-minimal': {
    primary: '220 90% 50%',
    secondary: '260 80% 55%',
    accent: '200 95% 45%',
    background: '0 0% 98%',
    foreground: '220 15% 10%',
    card: '0 0% 100%',
    cardForeground: '220 15% 10%',
    muted: '220 10% 92%',
    mutedForeground: '220 10% 40%',
    border: '220 10% 88%',
    glass: '0 0% 100%',
    glowPrimary: '220 90% 50%',
    glowSecondary: '260 80% 55%',
    surface: '220 10% 96%',
    surfaceHover: '220 10% 93%',
    sidebarBackground: '220 15% 97%',
    sidebarBorder: '220 10% 90%',
    isLight: true,
  },
  'light-sakura': {
    primary: '340 75% 55%',
    secondary: '320 65% 50%',
    accent: '350 85% 60%',
    background: '340 30% 97%',
    foreground: '340 30% 15%',
    card: '340 25% 100%',
    cardForeground: '340 30% 15%',
    muted: '340 15% 92%',
    mutedForeground: '340 15% 45%',
    border: '340 15% 88%',
    glass: '340 20% 98%',
    glowPrimary: '340 75% 55%',
    glowSecondary: '320 65% 50%',
    surface: '340 20% 95%',
    surfaceHover: '340 20% 92%',
    sidebarBackground: '340 25% 96%',
    sidebarBorder: '340 15% 90%',
    isLight: true,
  },
  'brutalism': {
    primary: '0 0% 0%',
    secondary: '45 100% 50%',
    accent: '0 100% 50%',
    background: '60 5% 96%',
    foreground: '0 0% 0%',
    card: '0 0% 100%',
    cardForeground: '0 0% 0%',
    muted: '60 5% 90%',
    mutedForeground: '0 0% 30%',
    border: '0 0% 0%',
    glass: '0 0% 100%',
    glowPrimary: '45 100% 50%',
    glowSecondary: '0 100% 50%',
    surface: '60 5% 94%',
    surfaceHover: '60 5% 88%',
    sidebarBackground: '0 0% 100%',
    sidebarBorder: '0 0% 0%',
    isLight: true,
    isBrutalism: true,
  },
  'brutalism-dark': {
    primary: '55 100% 55%',
    secondary: '45 100% 50%',
    accent: '0 100% 55%',
    background: '0 0% 8%',
    foreground: '0 0% 98%',
    card: '0 0% 12%',
    cardForeground: '0 0% 98%',
    muted: '0 0% 18%',
    mutedForeground: '0 0% 65%',
    border: '55 100% 55%',
    glass: '0 0% 12%',
    glowPrimary: '55 100% 55%',
    glowSecondary: '0 100% 55%',
    surface: '0 0% 10%',
    surfaceHover: '0 0% 18%',
    sidebarBackground: '0 0% 5%',
    sidebarBorder: '55 100% 55%',
    isBrutalism: true,
  },
  // New themes
  'glacier': {
    primary: '200 80% 60%',
    secondary: '210 70% 50%',
    accent: '185 75% 55%',
    background: '210 30% 5%',
    foreground: '200 10% 96%',
    card: '210 25% 8%',
    cardForeground: '200 10% 96%',
    muted: '210 20% 14%',
    mutedForeground: '210 15% 55%',
    border: '210 20% 18%',
    glass: '210 22% 10%',
    glowPrimary: '200 80% 60%',
    glowSecondary: '210 70% 50%',
    surface: '210 25% 6%',
    surfaceHover: '210 25% 12%',
    sidebarBackground: '210 30% 4%',
    sidebarBorder: '210 18% 14%',
  },
  'harvest': {
    primary: '35 85% 55%',
    secondary: '20 80% 50%',
    accent: '45 90% 50%',
    background: '30 20% 5%',
    foreground: '35 10% 95%',
    card: '30 15% 8%',
    cardForeground: '35 10% 95%',
    muted: '30 12% 14%',
    mutedForeground: '30 10% 55%',
    border: '30 12% 20%',
    glass: '30 15% 10%',
    glowPrimary: '35 85% 55%',
    glowSecondary: '20 80% 50%',
    surface: '30 15% 6%',
    surfaceHover: '30 15% 12%',
    sidebarBackground: '30 20% 4%',
    sidebarBorder: '30 10% 16%',
  },
  'lavender': {
    primary: '270 70% 65%',
    secondary: '280 60% 55%',
    accent: '260 75% 60%',
    background: '270 20% 5%',
    foreground: '270 10% 95%',
    card: '270 15% 8%',
    cardForeground: '270 10% 95%',
    muted: '270 12% 14%',
    mutedForeground: '270 10% 55%',
    border: '270 12% 20%',
    glass: '270 15% 10%',
    glowPrimary: '270 70% 65%',
    glowSecondary: '280 60% 55%',
    surface: '270 15% 6%',
    surfaceHover: '270 15% 12%',
    sidebarBackground: '270 20% 4%',
    sidebarBorder: '270 10% 16%',
  },
  'obsidian': {
    primary: '0 0% 70%',
    secondary: '0 0% 50%',
    accent: '0 0% 80%',
    background: '0 0% 3%',
    foreground: '0 0% 95%',
    card: '0 0% 6%',
    cardForeground: '0 0% 95%',
    muted: '0 0% 12%',
    mutedForeground: '0 0% 55%',
    border: '0 0% 18%',
    glass: '0 0% 8%',
    glowPrimary: '0 0% 70%',
    glowSecondary: '0 0% 50%',
    surface: '0 0% 4%',
    surfaceHover: '0 0% 10%',
    sidebarBackground: '0 0% 2%',
    sidebarBorder: '0 0% 14%',
  },
  'orchid': {
    primary: '300 70% 60%',
    secondary: '320 65% 55%',
    accent: '280 75% 65%',
    background: '300 20% 4%',
    foreground: '300 10% 96%',
    card: '300 15% 7%',
    cardForeground: '300 10% 96%',
    muted: '300 12% 13%',
    mutedForeground: '300 10% 55%',
    border: '300 12% 18%',
    glass: '300 15% 9%',
    glowPrimary: '300 70% 60%',
    glowSecondary: '320 65% 55%',
    surface: '300 15% 5%',
    surfaceHover: '300 15% 11%',
    sidebarBackground: '300 20% 3%',
    sidebarBorder: '300 10% 14%',
  },
  'solar': {
    primary: '45 100% 55%',
    secondary: '30 95% 50%',
    accent: '60 100% 50%',
    background: '40 25% 4%',
    foreground: '45 10% 95%',
    card: '40 20% 7%',
    cardForeground: '45 10% 95%',
    muted: '40 15% 13%',
    mutedForeground: '40 10% 55%',
    border: '40 15% 18%',
    glass: '40 18% 9%',
    glowPrimary: '45 100% 55%',
    glowSecondary: '30 95% 50%',
    surface: '40 20% 5%',
    surfaceHover: '40 20% 11%',
    sidebarBackground: '40 25% 3%',
    sidebarBorder: '40 13% 14%',
  },
  'tide': {
    primary: '180 70% 50%',
    secondary: '195 65% 45%',
    accent: '165 75% 55%',
    background: '190 30% 4%',
    foreground: '180 10% 95%',
    card: '190 25% 7%',
    cardForeground: '180 10% 95%',
    muted: '190 18% 13%',
    mutedForeground: '190 12% 55%',
    border: '190 18% 18%',
    glass: '190 22% 9%',
    glowPrimary: '180 70% 50%',
    glowSecondary: '195 65% 45%',
    surface: '190 25% 5%',
    surfaceHover: '190 25% 11%',
    sidebarBackground: '190 30% 3%',
    sidebarBorder: '190 15% 14%',
  },
  'verdant': {
    primary: '140 70% 45%',
    secondary: '120 60% 40%',
    accent: '160 75% 50%',
    background: '140 25% 4%',
    foreground: '140 10% 95%',
    card: '140 20% 7%',
    cardForeground: '140 10% 95%',
    muted: '140 15% 13%',
    mutedForeground: '140 10% 55%',
    border: '140 15% 18%',
    glass: '140 18% 9%',
    glowPrimary: '140 70% 45%',
    glowSecondary: '120 60% 40%',
    surface: '140 20% 5%',
    surfaceHover: '140 20% 11%',
    sidebarBackground: '140 25% 3%',
    sidebarBorder: '140 13% 14%',
  },
};

export const THEME_INFO: Record<Theme, { name: string; gradient: string; description: string; icon: string; category: 'dark' | 'light' }> = {
  'midnight': {
    name: 'Midnight',
    gradient: 'from-indigo-600 via-purple-600 to-violet-700',
    description: 'Classic dark with indigo & violet accents',
    icon: '🌙',
    category: 'dark',
  },
  'cherry-blossom': {
    name: 'Cherry Blossom',
    gradient: 'from-pink-500 via-rose-500 to-fuchsia-600',
    description: 'Soft pink tones inspired by sakura',
    icon: '🌸',
    category: 'dark',
  },
  'neon-tokyo': {
    name: 'Neon Tokyo',
    gradient: 'from-purple-500 via-fuchsia-500 to-cyan-400',
    description: 'Electric neon cyberpunk vibes',
    icon: '🗼',
    category: 'dark',
  },
  'aurora-borealis': {
    name: 'Aurora Borealis',
    gradient: 'from-emerald-500 via-teal-500 to-violet-500',
    description: 'Northern lights dancing colors',
    icon: '✨',
    category: 'dark',
  },
  'volcanic': {
    name: 'Volcanic',
    gradient: 'from-orange-600 via-red-600 to-amber-500',
    description: 'Fiery lava with warm ember glow',
    icon: '🌋',
    category: 'dark',
  },
  'deep-ocean': {
    name: 'Deep Ocean',
    gradient: 'from-cyan-500 via-blue-600 to-indigo-700',
    description: 'Mysterious underwater depths',
    icon: '🌊',
    category: 'dark',
  },
  'golden-hour': {
    name: 'Golden Hour',
    gradient: 'from-yellow-500 via-amber-500 to-orange-600',
    description: 'Warm sunset golden tones',
    icon: '🌅',
    category: 'dark',
  },
  'cyberpunk': {
    name: 'Cyberpunk',
    gradient: 'from-yellow-400 via-lime-500 to-cyan-500',
    description: 'Futuristic neon yellow & cyan',
    icon: '🤖',
    category: 'dark',
  },
  'zen-garden': {
    name: 'Zen Garden',
    gradient: 'from-green-600 via-emerald-600 to-teal-600',
    description: 'Calm forest tranquility',
    icon: '🌿',
    category: 'dark',
  },
  'northern-lights': {
    name: 'Northern Lights',
    gradient: 'from-teal-400 via-purple-500 to-blue-500',
    description: 'Magical aurora shimmer',
    icon: '🔮',
    category: 'dark',
  },
  'light-minimal': {
    name: 'Light Minimal',
    gradient: 'from-blue-400 via-indigo-400 to-purple-400',
    description: 'Clean, bright, modern design',
    icon: '☀️',
    category: 'light',
  },
  'light-sakura': {
    name: 'Light Sakura',
    gradient: 'from-pink-300 via-rose-300 to-pink-400',
    description: 'Soft pink cherry blossom theme',
    icon: '🌷',
    category: 'light',
  },
  'brutalism': {
    name: 'Brutalist Light',
    gradient: 'from-gray-100 via-yellow-400 to-red-500',
    description: 'Raw, bold, unpolished design',
    icon: '🔲',
    category: 'light',
  },
  'brutalism-dark': {
    name: 'Brutalist Dark',
    gradient: 'from-gray-900 via-yellow-400 to-red-500',
    description: 'Dark brutalist aesthetic',
    icon: '⬛',
    category: 'dark',
  },
  'glacier': {
    name: 'Glacier',
    gradient: 'from-sky-400 via-cyan-500 to-blue-600',
    description: 'Icy cool tones of frozen landscapes',
    icon: '🧊',
    category: 'dark',
  },
  'harvest': {
    name: 'Harvest',
    gradient: 'from-amber-500 via-orange-500 to-yellow-600',
    description: 'Warm autumn harvest colors',
    icon: '🍂',
    category: 'dark',
  },
  'lavender': {
    name: 'Lavender',
    gradient: 'from-purple-400 via-violet-500 to-indigo-500',
    description: 'Soft purple floral tones',
    icon: '💜',
    category: 'dark',
  },
  'obsidian': {
    name: 'Obsidian',
    gradient: 'from-gray-600 via-gray-700 to-gray-800',
    description: 'Pure dark monochrome elegance',
    icon: '🖤',
    category: 'dark',
  },
  'orchid': {
    name: 'Orchid',
    gradient: 'from-fuchsia-500 via-pink-500 to-purple-600',
    description: 'Vibrant magenta florals',
    icon: '🌺',
    category: 'dark',
  },
  'solar': {
    name: 'Solar',
    gradient: 'from-yellow-400 via-amber-500 to-orange-500',
    description: 'Bright solar energy',
    icon: '☀️',
    category: 'dark',
  },
  'tide': {
    name: 'Tide',
    gradient: 'from-teal-400 via-cyan-500 to-emerald-500',
    description: 'Ocean tides and coastal vibes',
    icon: '🌊',
    category: 'dark',
  },
  'verdant': {
    name: 'Verdant',
    gradient: 'from-green-500 via-emerald-500 to-teal-600',
    description: 'Lush green forest depths',
    icon: '🌲',
    category: 'dark',
  },
};

const THEME_KEY = 'anime-theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_KEY) as Theme | null;
      return stored && THEME_COLORS[stored] ? stored : 'midnight';
    }
    return 'midnight';
  });

  const applyTheme = useCallback((themeName: Theme) => {
    const colors = THEME_COLORS[themeName];
    if (!colors) return;
    
    const root = document.documentElement;
    
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--foreground', colors.foreground);
    root.style.setProperty('--card', colors.card);
    root.style.setProperty('--card-foreground', colors.cardForeground);
    root.style.setProperty('--muted', colors.muted);
    root.style.setProperty('--muted-foreground', colors.mutedForeground);
    root.style.setProperty('--border', colors.border);
    root.style.setProperty('--input', colors.border);
    root.style.setProperty('--ring', colors.primary);
    root.style.setProperty('--glass', colors.glass);
    root.style.setProperty('--glow-primary', colors.glowPrimary);
    root.style.setProperty('--glow-secondary', colors.glowSecondary);
    root.style.setProperty('--surface', colors.surface);
    root.style.setProperty('--surface-hover', colors.surfaceHover);
    root.style.setProperty('--sidebar-background', colors.sidebarBackground);
    root.style.setProperty('--sidebar-foreground', colors.foreground);
    root.style.setProperty('--sidebar-primary', colors.primary);
    root.style.setProperty('--sidebar-primary-foreground', colors.foreground);
    root.style.setProperty('--sidebar-accent', colors.muted);
    root.style.setProperty('--sidebar-accent-foreground', colors.foreground);
    root.style.setProperty('--sidebar-border', colors.sidebarBorder);
    root.style.setProperty('--sidebar-ring', colors.primary);
    root.style.setProperty('--popover', colors.card);
    root.style.setProperty('--popover-foreground', colors.cardForeground);

    // Add light theme class for special styling
    if (colors.isLight) {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    } else {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    }
    
    // Add brutalism class for special styling
    if ((colors as any).isBrutalism) {
      document.body.classList.add('brutalism-theme');
    } else {
      document.body.classList.remove('brutalism-theme');
    }
    
    // Set data-theme attribute for theme-specific CSS
    document.body.setAttribute('data-theme', themeName);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  }, []);

  const isLightTheme = THEME_COLORS[theme]?.isLight ?? false;

  return { 
    theme, 
    setTheme, 
    themes: Object.keys(THEME_COLORS) as Theme[],
    themeInfo: THEME_INFO,
    isLightTheme,
  };
}
