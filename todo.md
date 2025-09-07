# WebOS Tatakai App Development Todo

## Overview
Create a webOS application for LG TVs with the same design and functionality as the current Tatakai Next.js app, but optimized for TV viewing and remote control navigation.
#
We are Using the tailwind + shadcn/ui

## 📱 Current Tatakai-App Analysis

### **Core Structure**
- **Framework**: Next.js 15.5.2 with React 19.1.0
- **Styling**: Tailwind CSS 4 + Custom CSS variables
- **UI Components**: Radix UI + Custom components
- **Animations**: Framer Motion 12.23.12
- **Video**: HLS.js 1.6.11 for streaming
- **State**: React hooks (no external state management)

### **Key Features**
1. **Hero Section** - Rotating spotlight anime with autoplay
2. **Anime Carousels** - Horizontal scrollable sections
3. **Top 10 Rankings** - Tabbed interface (Today/Week/Month)
4. **Video Player** - Custom HLS player with controls
5. **Search** - Real-time anime search with suggestions
6. **Categories** - Latest, Trending, Popular, etc.
7. **Responsive Design** - Mobile-first approach

### **API Integration**
- Backend proxy API at `/api/anime/route.ts`
- External API: `https://aniwatch-api-taupe-eight.vercel.app/api/v2/hianime`
- Endpoints: home, search, anime info, episodes, streaming sources

### **Pages Structure**
```
/                   - Home page with all sections
/anime/[id]         - Anime details page
/watch/[id]         - Video player page
/search            - Search results
/trending          - Trending anime
/category/*        - Various category pages
/movies            - Movies section
/tv-series         - TV series section
/profile           - User profile
/settings          - App settings
```

### **Components Architecture**
```
components/
├── HeroSection.tsx     - Main banner with rotating anime
├── AnimeCarousel.tsx   - Horizontal scrollable anime grid
├── Top10Section.tsx    - Ranked anime with tabs
├── AnimeCard.tsx       - Individual anime card component
├── VideoPlayer.tsx     - Custom video player with HLS
├── Navigation.tsx      - Header navigation with search
├── Footer.tsx          - Footer component
└── ui/                 - Radix UI components (buttons, cards, etc.)
```

## 🎯 WebOS App Development Plan

### **Phase 1: Project Setup & Structure**

#### 1.1 WebOS Environment Setup
- [ ] Initialize webOS project structure
- [ ] Configure webOS CLI tools and SDK
- [ ] Set up development environment for LG TV testing
- [ ] Create `appinfo.json` with proper TV configurations

#### 1.2 Technology Stack Selection
- [ ] **Frontend Framework**: React 18+ (compatible with webOS)
- [ ] **Bundler**: Webpack or Vite (optimized for webOS)
- [ ] **Styling**: Tailwind CSS + CSS-in-JS for TV optimization
- [ ] **Animations**: Framer Motion (lightweight for TV performance)
- [ ] **Video Player**: Custom implementation using webOS media APIs
- [ ] **State Management**: React Context + useReducer for TV navigation state

#### 1.3 Project Structure
```
webos-app/
├── src/
│   ├── components/          # React components
│   │   ├── tv/             # TV-specific components
│   │   ├── ui/             # Shared UI components
│   │   └── ...
│   ├── pages/              # Application pages
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── services/           # API services
│   ├── context/            # React contexts
│   ├── assets/             # Images, fonts, etc.
│   └── styles/             # Global styles
├── webos_meta/             # webOS specific files
├── dist/                   # Build output
├── package.json
└── webpack.config.js       # Build configuration
```

### **Phase 2: TV-Optimized UI Components**

#### 2.1 Navigation System (TV Remote Friendly)
- [ ] **RemoteNavigationProvider** - Context for handling remote inputs
- [ ] **FocusManager** - Track and manage focus states across components
- [ ] **DirectionalNavigation** - Up/Down/Left/Right navigation logic
- [ ] **KeyHandler** - Map remote control buttons to actions
  - [ ] Directional pad (↑↓←→)
  - [ ] OK/Enter button
  - [ ] Back button
  - [ ] Home button
  - [ ] Number buttons (1-9, 0)
  - [ ] Color buttons (Red, Green, Yellow, Blue)

#### 2.2 Core TV Components
- [ ] **TVHeroSection** - Large fullscreen hero with focus indicators
  - [ ] Auto-rotating spotlight anime (every 8s)
  - [ ] Large, TV-readable text (min 24px)
  - [ ] High contrast focus indicators
  - [ ] Remote-accessible action buttons
  
- [ ] **TVAnimeCarousel** - TV-optimized horizontal scrolling
  - [ ] Focus-based navigation (not hover)
  - [ ] Smooth focus transitions
  - [ ] Preview on focus (not hover)
  - [ ] Jump navigation (page left/right)
  
- [ ] **TVTop10Section** - Ranked content with gamepad navigation
  - [ ] Tab navigation with left/right arrows
  - [ ] Vertical list navigation within tabs
  - [ ] Quick access number shortcuts (1-10)
  
- [ ] **TVAnimeCard** - Focus-optimized anime cards
  - [ ] Large focus border/glow effect
  - [ ] Readable text sizes for 10-foot viewing
  - [ ] Preview mode on focus
  - [ ] Quick action shortcuts

#### 2.3 TV Video Player
- [ ] **TVVideoPlayer** - Full TV-optimized video experience
  - [ ] webOS media API integration
  - [ ] Custom TV-friendly controls overlay
  - [ ] Remote control integration
  - [ ] Subtitle support optimized for TV
  - [ ] Audio track selection
  - [ ] Playback speed control
  - [ ] Resume playback functionality
  - [ ] Picture quality selection

#### 2.4 TV Layout Components
- [ ] **TVLayout** - Main app layout wrapper
- [ ] **TVSidebar** - Optional side navigation for quick access
- [ ] **TVStatusBar** - Clock, network status, battery (if applicable)
- [ ] **TVNotification** - Toast-style notifications for TV
- [ ] **TVModal** - Full-screen modal dialogs

### **Phase 3: TV-Optimized Pages**

#### 3.1 Home Page (`/`)
- [ ] Hero section with spotlight anime
- [ ] Multiple anime carousels:
  - [ ] Latest Episodes
  - [ ] Trending Now  
  - [ ] Most Popular
  - [ ] Currently Airing
  - [ ] Top Rated
  - [ ] Recently Completed
  - [ ] Upcoming Anime
- [ ] Top 10 rankings section
- [ ] Quick navigation shortcuts
- [ ] Continue watching section

#### 3.2 Anime Details Page (`/anime/[id]`)
- [ ] Large poster and details view
- [ ] Episode list with season selection
- [ ] Related anime recommendations
- [ ] Add to watchlist functionality
- [ ] Quick play button for latest episode

#### 3.3 Watch Page (`/watch/[id]`)
- [ ] Full-screen video player
- [ ] Episode navigation (prev/next)
- [ ] Quality selection
- [ ] Subtitle options
- [ ] Audio track selection
- [ ] Progress saving

#### 3.4 Search Page (`/search`)
- [ ] On-screen keyboard interface
- [ ] Voice search integration (if supported)
- [ ] Search suggestions
- [ ] Filter options
- [ ] Grid view of results

#### 3.5 Category Pages
- [ ] Grid layout for anime browsing
- [ ] Filter and sort options
- [ ] Infinite scroll/pagination
- [ ] Quick preview on focus

#### 3.6 Settings Page (`/settings`)
- [ ] Video quality preferences
- [ ] Subtitle settings
- [ ] Language preferences
- [ ] Parental controls
- [ ] Account management

### **Phase 4: Backend Integration**

#### 4.1 Static API Integration
- [ ] **APIService** - Main service for anime data
- [ ] **CacheManager** - Cache frequently accessed data
- [ ] **OfflineManager** - Handle offline scenarios
- [ ] Implement all current API endpoints:
  - [ ] Home page data (`/api/home`)
  - [ ] Search anime (`/api/search`)
  - [ ] Anime details (`/api/anime/[id]`)
  - [ ] Episode list (`/api/episodes/[id]`)
  - [ ] Streaming sources (`/api/sources/[episodeId]`)
  - [ ] Categories (`/api/category/*`)

#### 4.2 Data Management
- [ ] **LocalStorage** - User preferences and watch history
- [ ] **IndexedDB** - Offline anime data caching
- [ ] **SessionStorage** - Temporary app state
- [ ] **UserDataManager** - Manage user watch progress

### **Phase 5: TV-Specific Features**

#### 5.1 Remote Control Integration
- [ ] Complete remote button mapping
- [ ] Custom shortcuts for power users
- [ ] Gesture support (if available)
- [ ] Voice command integration

#### 5.2 TV Display Optimization
- [ ] **10-foot UI design** - All text readable from couch distance
- [ ] **High contrast mode** - Better visibility in various lighting
- [ ] **Large focus indicators** - Clear navigation feedback
- [ ] **TV-safe zones** - Content within TV display boundaries
- [ ] **4K/HDR support** - Utilize TV capabilities

#### 5.3 Performance Optimization
- [ ] **Lazy loading** - Load content as needed
- [ ] **Image optimization** - Compressed images for TV bandwidth
- [ ] **Memory management** - Handle limited TV memory
- [ ] **Background processing** - Preload next episodes

#### 5.4 Accessibility
- [ ] **Screen reader support** - For visually impaired users
- [ ] **High contrast themes**
- [ ] **Large text options**
- [ ] **Voice navigation** (if supported by webOS)

### **Phase 6: Testing & Optimization**

#### 6.1 webOS Testing
- [ ] LG TV simulator testing
- [ ] Real hardware testing on multiple TV models
- [ ] Performance profiling
- [ ] Memory usage optimization
- [ ] Network performance testing

#### 6.2 User Experience Testing
- [ ] Remote navigation flow testing
- [ ] Content discovery testing
- [ ] Video playback quality testing
- [ ] Multi-user testing scenarios

#### 6.3 Cross-Model Compatibility
- [ ] Test on various LG TV models (2020+)
- [ ] Different screen sizes (32", 43", 55", 65", 75", 85")
- [ ] Various webOS versions compatibility

### **Phase 7: Deployment & Distribution**

#### 7.1 App Store Preparation
- [ ] LG Content Store submission requirements
- [ ] App icons and screenshots for TV
- [ ] App description and metadata
- [ ] Content rating and compliance

#### 7.2 Production Build
- [ ] Optimized build for webOS
- [ ] Code splitting for faster loading
- [ ] Asset optimization
- [ ] Security hardening

## 🎨 Design Specifications for TV

### **Typography**
- **Minimum font size**: 24px (readable from 10 feet)
- **Headings**: 32px - 64px
- **Body text**: 24px - 28px
- **UI elements**: 20px - 24px

### **Spacing & Layout**
- **Focus padding**: Minimum 16px around focusable elements
- **Grid gaps**: 24px - 32px between items
- **Safe zones**: 5% margin from screen edges
- **Button size**: Minimum 48px height

### **Colors & Contrast**
- **Focus indicators**: High contrast borders (3px minimum)
- **Background**: Dark theme optimized for TV viewing
- **Text contrast**: WCAG AA compliance minimum
- **Accent colors**: Bright, TV-visible colors

### **Animation Guidelines**
- **Focus transitions**: 200-300ms smooth easing
- **Content loading**: Skeleton screens for better UX
- **Page transitions**: Slide animations (max 500ms)
- **Avoid**: Rapid flashing or seizure-inducing effects

## 🔧 Technical Implementation Details

### **Key Technologies**
```json
{
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.3.0",
  "framer-motion": "^10.0.0",
  "hls.js": "^1.4.0",
  "zustand": "^4.4.0",
  "react-query": "^3.39.0"
}
```

### **webOS Specific APIs**
- **webOSTVjs**: Core webOS TV functionality
- **Media API**: Video playback control
- **Remote Control API**: Handle remote inputs
- **Storage API**: Local data persistence
- **Network API**: Connection status monitoring

### **Build Configuration**
- **Target**: ES2020 for webOS compatibility
- **Bundle size**: < 5MB total app size
- **Code splitting**: Route-based splitting
- **Tree shaking**: Remove unused code
- **Compression**: Gzip/Brotli compression

## 📋 Development Checklist

### **Setup Phase**
- [ ] Install webOS CLI and SDK
- [ ] Set up development environment
- [ ] Create initial project structure
- [ ] Configure build system

### **Development Phase**
- [ ] Implement core navigation system
- [ ] Build TV-optimized components
- [ ] Integrate API services
- [ ] Implement video player
- [ ] Add remote control support

### **Testing Phase**
- [ ] Unit testing for components
- [ ] Integration testing for navigation
- [ ] Performance testing on TV hardware
- [ ] User acceptance testing

### **Deployment Phase**
- [ ] Build optimization
- [ ] Store submission preparation
- [ ] Documentation completion
- [ ] Release planning

## 🎯 Success Metrics

### **Performance Targets**
- [ ] App launch time < 3 seconds
- [ ] Video start time < 2 seconds
- [ ] Navigation response < 100ms
- [ ] Memory usage < 100MB

### **User Experience Goals**
- [ ] 5-button remote navigation (↑↓←→ + OK)
- [ ] No hover dependencies
- [ ] Clear focus indicators
- [ ] Intuitive navigation flow

### **Content Quality**
- [ ] All anime content from original app
- [ ] HD/4K video support
- [ ] Subtitle support
- [ ] Multiple audio tracks

---

## 📝 Notes

### **Current Tatakai App Strengths to Preserve**
1. **Clean, modern design** - Dark theme perfect for TV
2. **Smooth animations** - Enhance with TV-appropriate timing
3. **Comprehensive content** - All anime data and categories
4. **Video player** - Adapt HLS.js for webOS media APIs
5. **Search functionality** - Add TV-friendly input methods

### **TV-Specific Enhancements**
1. **10-foot UI** - Larger text and buttons
2. **Remote navigation** - Replace all mouse interactions
3. **Focus management** - Clear visual feedback
4. **Performance optimization** - Handle TV hardware limitations
5. **TV features** - Utilize TV-specific capabilities

### **Development Priority**
1. **Navigation system** (Critical)
2. **Core components** (High)
3. **Video player** (High)
4. **API integration** (Medium)
5. **Advanced features** (Low)

This todo provides a comprehensive roadmap for building a webOS version of the Tatakai anime streaming app optimized for LG TVs while maintaining the same design and functionality as the original Next.js application.
