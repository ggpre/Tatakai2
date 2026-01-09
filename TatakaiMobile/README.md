# Tatakai Mobile App

A full-featured mobile anime streaming application built with React Native and Expo. This mobile app provides feature parity with the Tatakai web version, including streaming, downloads, offline playback, and more.

## Features

### Core Features
- 🎬 **Video Streaming** - Real-time anime playback with HiAnime API
- 📥 **Downloads** - Download episodes for offline viewing
- 📚 **Library** - Manage your watchlist with status tracking
- 🔍 **Search** - Find anime with filters and voice search
- 👤 **User Accounts** - Sync progress across devices

### Screens
- **Home** - Featured content, trending, continue watching
- **Trending (Top 10)** - Global anime rankings
- **Search** - Discover anime with filters
- **Library** - Personal watchlist management
- **Profile** - Account settings and stats
- **Watch** - Full-screen video player with controls
- **Anime Details** - Episode list, info, related content
- **Downloads** - Manage offline content
- **Settings** - App configuration
- **Community** - Discussions and comments

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation (Bottom Tabs + Native Stack)
- **State Management**: Zustand
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Backend**: Supabase (shared with web version)
- **API**: HiAnime API v2

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Navigate to mobile app directory
cd TatakaiMobile

# Install dependencies
npm install

# Start the development server
npm start
```

### Running on Devices

```bash
# iOS (requires Mac)
npm run ios

# Android
npm run android

# Web (for testing)
npm run web
```

## Project Structure

```
TatakaiMobile/
├── App.tsx                 # Main app entry point
├── src/
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   ├── lib/                # API, Supabase, utilities
│   │   ├── api.ts          # API client (shared logic with web)
│   │   ├── supabase.ts     # Supabase client
│   │   └── env.ts          # Environment configuration
│   ├── navigation/         # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── screens/            # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── TrendingScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   ├── LibraryScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── AnimeScreen.tsx
│   │   ├── WatchScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── DownloadsScreen.tsx
│   │   ├── CommunityScreen.tsx
│   │   └── NotFoundScreen.tsx
│   └── store/              # Zustand state stores
│       └── authStore.ts
├── assets/                 # Images, fonts, icons
├── app.json               # Expo configuration
├── tailwind.config.js     # Tailwind/NativeWind config
└── babel.config.js        # Babel configuration
```

## API Configuration

The app uses the same Supabase instance and HiAnime API as the web version:

```typescript
SUPABASE_URL=https://xkbzamfyupjafugqeaby.supabase.co
SUPABASE_ANON_KEY=sb_publishable_hiKONZyoLpTAkFpQL5DWIQ_1_OWjmj3
API_URL=https://aniwatch-api-taupe-eight.vercel.app/api/v2/hianime
```

## Design System

- **Colors**: 
  - Background: #050505
  - Primary: #6366f1 (Indigo)
  - Secondary: #a78bfa (Purple)
- **Typography**: System fonts (Plus Jakarta Sans on web)
- **Components**: Glass-morphism panels, rounded corners
- **Animations**: Smooth transitions, fade-in effects

## Building for Production

```bash
# Build for Android
npm run build:android

# Build for iOS
npm run build:ios
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test on both iOS and Android
4. Submit a pull request

## License

MIT License - See LICENSE file for details
