'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimeAPI, type HomePageData } from '@/lib/api';
import { TVNavigationProvider } from './tv/ReactTVProvider';
import { Focusable } from './tv/Focusable';
import HorizontalList from './tv/HorizontalListNew';
import VerticalList from './tv/VerticalListNew';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Info, 
  Search, 
  Clapperboard, 
  TrendingUp, 
  Star, 
  Plus, 
  Trophy 
} from 'lucide-react';

interface ApiAnime {
  id?: string;
  animeId?: string;
  malId?: string;
  title?: string;
  name?: string;
  image?: string;
  poster?: string;
  img?: string;
  type?: string;
  status?: string;
  totalEpisodes?: number;
  releasedDate?: string;
  otherName?: string;
  subOrDub?: string;
  description?: string;
  synopsis?: string;
}

interface Anime {
  id: string;
  title: string;
  image: string;
  description: string;
}

const AnimeCard: React.FC<{ anime: Anime; id: string; groupId: string }> = ({ anime, id, groupId }) => {
  const router = useRouter();

  const handleSelect = () => {
    router.push(`/tv/anime/${anime.id}`);
  };

  return (
    <Focusable
      id={id}
      groupId={groupId}
      onSelect={handleSelect}
      className="tv-anime-card"
      focusClassName="tv-focused"
    >
      <div className="relative group">
        <img
          src={anime.image || '/placeholder-anime.jpg'}
          alt={anime.title}
          className="w-64 h-96 object-cover rounded-lg transition-transform duration-200"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
          <h3 className="text-white font-semibold text-sm line-clamp-2">
            {anime.title}
          </h3>
        </div>
      </div>
    </Focusable>
  );
};

const SpotlightSection: React.FC<{ anime: Anime }> = ({ anime }) => {
  const router = useRouter();

  const handleSelect = () => {
    router.push(`/tv/anime/${anime.id}`);
  };

  const handleWatch = () => {
    router.push(`/tv/watch/${anime.id}?ep=1`);
  };

  const handleSearch = () => {
    router.push('/tv/search');
  };

  return (
    <div className="relative h-[85vh] mb-16 rounded-lg overflow-hidden tv-spotlight-section" data-section="spotlight">
      <img
        src={anime.image || '/placeholder-anime.jpg'}
        alt={anime.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent">
        <div className="flex flex-col justify-center h-full p-16 max-w-5xl">
          <h1 className="text-7xl font-bold text-white mb-8 drop-shadow-lg leading-tight">{anime.title}</h1>
          {anime.description && (
            <p className="text-2xl text-gray-200 mb-10 line-clamp-4 drop-shadow leading-relaxed max-w-4xl">
              {anime.description}
            </p>
          )}
          <HorizontalList id="spotlight-buttons" spacing={20}>
            <Focusable
              id="spotlight-watch"
              groupId="spotlight-buttons"
              onSelect={handleWatch}
              className="tv-button primary"
            >
              <button className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-lg font-bold transition-colors flex items-center gap-3 text-lg">
                <Play className="w-6 h-6" /> Watch Now
              </button>
            </Focusable>
            <Focusable
              id="spotlight-details"
              groupId="spotlight-buttons"
              onSelect={handleSelect}
              className="tv-button secondary"
            >
              <button className="bg-white/20 hover:bg-white/30 text-white px-10 py-4 rounded-lg font-bold transition-colors backdrop-blur-sm text-lg flex items-center gap-3">
                <Info className="w-6 h-6" /> More Info
              </button>
            </Focusable>
          
          </HorizontalList>
        </div>
      </div>
    </div>
  );
};

const AnimeSection: React.FC<{
  title: string;
  anime: Anime[];
  sectionId: string;
  icon?: React.ReactNode;
}> = ({ title, anime, sectionId, icon }) => {
  return (
    <div className="mb-12 py-6" data-section={sectionId}>
      <h2 className="text-3xl font-bold text-white mb-8 px-8 flex items-center gap-3">
        {icon}
        {title}
      </h2>
      <HorizontalList id={sectionId} className="px-8" spacing={20} wrapAround>
        {anime.map((item, index) => (
          <AnimeCard
            key={item.id}
            anime={item}
            id={`${sectionId}-${index}`}
            groupId={sectionId}
          />
        ))}
      </HorizontalList>
    </div>
  );
};

const TVHomePage: React.FC = () => {
  const router = useRouter();
  const [homeData, setHomeData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleNavigateToSearch = () => {
    router.push('/tv/search');
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await AnimeAPI.getHomePage();

        if (data && data.success) {
          setHomeData(data);
        } else {
          setError('Failed to load anime data');
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
        setError('Unable to connect to anime service');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const convertAnimeData = (animes: ApiAnime[]): Anime[] => {
    return animes.map((anime) => ({
      id: anime.id || anime.animeId || anime.malId || 'unknown',
      title: anime.title || anime.name || 'Unknown Title',
      image: anime.image || anime.poster || anime.img || '/placeholder-anime.jpg',
      description: anime.description || anime.synopsis || 'No description available',
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="space-y-8">
          <Skeleton className="h-96 w-full rounded-lg" />
          <Skeleton className="h-8 w-64" />
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-96 w-64 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !homeData) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <Alert variant="destructive">
          <AlertDescription>
            {error || 'Failed to load content'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Extract data with proper fallbacks
  const trendingData = homeData.data?.trendingAnimes || [];
  const popularData = homeData.data?.mostPopularAnimes || [];
  const recentData = homeData.data?.latestEpisodeAnimes || [];
  const topData = homeData.data?.top10Animes?.today || [];
  const spotlightData = homeData.data?.spotlightAnimes || [];

  const trendingAnime = convertAnimeData(trendingData);
  const popularAnime = convertAnimeData(popularData);
  const recentAnime = convertAnimeData(recentData);
  const topRatedAnime = convertAnimeData(topData);

  // Use the first spotlight anime, fallback to trending
  const spotlightAnime = spotlightData.length > 0 ? convertAnimeData(spotlightData)[0] : trendingAnime[0];

  return (
    <TVNavigationProvider initialFocus="header-search">
      <div className="min-h-screen bg-black text-white tv-page-container">
        {/* Header Navigation */}
        <div className="px-8 py-6 pb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Clapperboard className="w-12 h-12" />
              Tatakai TV
            </h1>
            <div className="flex gap-4">
              <Focusable
                id="header-search"
                groupId="header-nav"
                onSelect={handleNavigateToSearch}
                className="tv-button primary"
              >
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold transition-colors flex items-center gap-3 text-xl">
                  <Search className="w-6 h-6" />
                  Search Anime
                </button>
              </Focusable>
            </div>
          </div>
        </div>

        {/* Spotlight Section */}
        {spotlightAnime && <SpotlightSection anime={spotlightAnime} />}

        {/* Content Sections */}
        <VerticalList id="main-sections" spacing={32}>
          {trendingAnime.length > 1 && (
            <AnimeSection
              title="Trending Now"
              anime={trendingAnime.slice(1)} // Skip first item used in spotlight
              sectionId="trending"
              icon={<TrendingUp className="w-8 h-8 text-rose-500" />}
            />
          )}
          
          {popularAnime.length > 0 && (
            <AnimeSection
              title="Most Popular"
              anime={popularAnime}
              sectionId="popular"
              icon={<Star className="w-8 h-8 text-yellow-500" />}
            />
          )}
          
          {recentAnime.length > 0 && (
            <AnimeSection
              title="Recently Added"
              anime={recentAnime}
              sectionId="recent"
              icon={<Plus className="w-8 h-8 text-green-500" />}
            />
          )}
          
          {topRatedAnime.length > 0 && (
            <AnimeSection
              title="Top Rated"
              anime={topRatedAnime}
              sectionId="top-rated"
              icon={<Trophy className="w-8 h-8 text-amber-500" />}
            />
          )}
        </VerticalList>
      </div>
    </TVNavigationProvider>
  );
};

export default TVHomePage;
