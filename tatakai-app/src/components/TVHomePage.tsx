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
  description?: string;
  synopsis?: string;
}

interface Anime {
  id: string;
  title: string;
  image: string;
  description?: string;
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
    <div className="relative h-96 mb-8 rounded-lg overflow-hidden">
      <img
        src={anime.image || '/placeholder-anime.jpg'}
        alt={anime.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent">
        <div className="flex flex-col justify-center h-full p-8 max-w-2xl">
          <h1 className="text-4xl font-bold text-white mb-4">{anime.title}</h1>
          {anime.description && (
            <p className="text-lg text-gray-200 mb-6 line-clamp-3">
              {anime.description}
            </p>
          )}
          <div className="flex gap-4">
            <Focusable
              id="spotlight-watch"
              groupId="spotlight"
              onSelect={handleWatch}
              className="tv-button primary"
            >
              <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2">
                <Play className="w-5 h-5" /> Watch Now
              </button>
            </Focusable>
            <Focusable
              id="spotlight-details"
              groupId="spotlight"
              onSelect={handleSelect}
              className="tv-button secondary"
            >
              <button className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2">
                <Info className="w-5 h-5" /> More Info
              </button>
            </Focusable>
            <Focusable
              id="spotlight-search"
              groupId="spotlight"
              onSelect={handleSearch}
              className="tv-button secondary"
            >
              <button className="bg-blue-600/80 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2">
                <Search className="w-5 h-5" /> Search
              </button>
            </Focusable>
          </div>
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
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4 px-4 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <HorizontalList id={sectionId} className="px-4" spacing={16} wrapAround>
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

  const trendingAnime = convertAnimeData(homeData.data?.trendingAnimes || []);
  const popularAnime = convertAnimeData(homeData.data?.mostPopularAnimes || []);
  const recentAnime = convertAnimeData(homeData.data?.latestEpisodeAnimes || []);
  const topRatedAnime = convertAnimeData(homeData.data?.mostFavoriteAnimes || []);

  // Use the first trending anime for spotlight
  const spotlightAnime = trendingAnime[0];

  return (
    <TVNavigationProvider initialFocus="header-search">
      <div className="min-h-screen bg-black text-white">
        {/* Header Navigation */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Clapperboard className="w-8 h-8" /> Tatakai TV
            </h1>
            <div className="flex gap-4">
              <Focusable
                id="header-search"
                groupId="header-nav"
                onSelect={handleNavigateToSearch}
                className="tv-button secondary"
              >
                <button className="bg-blue-600/80 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2">
                  <Search className="w-5 h-5" />
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
              icon={<TrendingUp className="w-6 h-6 text-rose-500" />}
            />
          )}
          
          {popularAnime.length > 0 && (
            <AnimeSection
              title="Most Popular"
              anime={popularAnime}
              sectionId="popular"
              icon={<Star className="w-6 h-6 text-yellow-500" />}
            />
          )}
          
          {recentAnime.length > 0 && (
            <AnimeSection
              title="Recently Added"
              anime={recentAnime}
              sectionId="recent"
              icon={<Plus className="w-6 h-6 text-green-500" />}
            />
          )}
          
          {topRatedAnime.length > 0 && (
            <AnimeSection
              title="Top Rated"
              anime={topRatedAnime}
              sectionId="top-rated"
              icon={<Trophy className="w-6 h-6 text-amber-500" />}
            />
          )}
        </VerticalList>
      </div>
    </TVNavigationProvider>
  );
};

export default TVHomePage;
