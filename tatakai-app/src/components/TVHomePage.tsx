'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimeAPI, type HomePageData } from '@/lib/api';
import TVNavbar from '@/components/TVNavbar';
import TVHeroSection from '@/components/TVHeroSection';
import TVCarousel from '@/components/TVCarousel';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const TVHomePage: React.FC = () => {
  const router = useRouter();
  const [homeData, setHomeData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleAnimeClick = (anime: any) => {
    console.log('Clicked anime:', anime.title);
    router.push(`/tv/anime/${anime.id}`);
  };

  const convertAnimeData = (animes: any[]) => {
    return animes.map(anime => ({
      id: anime.id,
      title: anime.name,
      subtitle: anime.jname,
      image: anime.poster,
      year: anime.releaseDate ? new Date(anime.releaseDate).getFullYear() : undefined,
      rating: anime.rating,
      episode: anime.episodes?.sub || anime.episodes?.dub,
      duration: anime.duration || '24 min',
      status: anime.type || 'Unknown',
    }));
  };

  if (loading) {
    return (
      <div className="tv-loading">
        <div className="tv-loading__hero">
          <Skeleton className="h-screen w-full" />
        </div>
        <div className="tv-loading__content">
          {[1, 2, 3].map((i) => (
            <div key={i} className="tv-loading__section">
              <Skeleton className="h-8 w-48 mb-4" />
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map((j) => (
                  <Skeleton key={j} className="h-80 w-56" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tv-error">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!homeData?.data) {
    return (
      <div className="tv-error">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No anime data available</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      {/* TV Navbar */}
      <TVNavbar />
      
      {/* Main Content with offset for navbar */}
      <div className="tv-layout-with-navbar">
        <div className="tv-home">
          {/* Hero Section */}
          {homeData.data.spotlightAnimes && homeData.data.spotlightAnimes.length > 0 && (
            <TVHeroSection 
              spotlightAnimes={homeData.data.spotlightAnimes.map(anime => ({
                id: anime.id,
                name: anime.name,
                poster: anime.poster,
                description: anime.description,
                type: anime.type || 'Anime',
                episodes: anime.episodes
              }))}
            />
          )}
          
          {/* Content Sections */}
          <div className="tv-home__content">
            {/* Latest Episodes */}
            {homeData.data.latestEpisodeAnimes && homeData.data.latestEpisodeAnimes.length > 0 && (
              <TVCarousel
                title="Latest Episodes"
                animes={convertAnimeData(homeData.data.latestEpisodeAnimes)}
                onAnimeClick={handleAnimeClick}
              />
            )}
            
            {/* Trending Anime */}
            {homeData.data.trendingAnimes && homeData.data.trendingAnimes.length > 0 && (
              <TVCarousel
                title="Trending Now"
                animes={convertAnimeData(homeData.data.trendingAnimes)}
                onAnimeClick={handleAnimeClick}
              />
            )}
            
            {/* Most Popular */}
            {homeData.data.mostPopularAnimes && homeData.data.mostPopularAnimes.length > 0 && (
              <TVCarousel
                title="Most Popular"
                animes={convertAnimeData(homeData.data.mostPopularAnimes)}
                onAnimeClick={handleAnimeClick}
              />
            )}
            
            {/* Top Airing */}
            {homeData.data.topAiringAnimes && homeData.data.topAiringAnimes.length > 0 && (
              <TVCarousel
                title="Top Airing"
                animes={convertAnimeData(homeData.data.topAiringAnimes)}
                onAnimeClick={handleAnimeClick}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TVHomePage;
