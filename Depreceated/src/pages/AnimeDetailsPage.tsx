import React, { useEffect, useState } from 'react';
import { AnimeAPI, type AnimeDetails, type EpisodesData } from '@/services/api';
import { useRemoteNavigation, useFocusable } from '@/context/RemoteNavigationContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDuration, formatEpisodeCount, getImageUrl, truncateText } from '@/utils';

interface AnimeDetailsPageProps {
  animeId: string;
  onWatchEpisode: (episodeId: string) => void;
  onBack: () => void;
}

// Separate component for episode items to avoid hook violations
interface EpisodeItemProps {
  episode: {
    number: number;
    title?: string;
    episodeId: string;
  };
  onWatchEpisode: (episodeId: string) => void;
}

const EpisodeItem: React.FC<EpisodeItemProps> = ({ episode, onWatchEpisode }) => {
  const episodeRef = useFocusable(`episode-${episode.number}`);
  
  return (
    <Card
      key={episode.number}
      ref={episodeRef.elementRef as React.RefObject<HTMLDivElement>}
      className={`cursor-pointer transition-all ${
        episodeRef.isFocused ? 'ring-4 ring-primary scale-105' : ''
      }`}
      onClick={() => onWatchEpisode(episode.episodeId)}
    >
      <CardContent className="p-tv-lg">
        <div className="space-y-tv-sm">
          <div className="text-tv-lg font-semibold">
            Episode {episode.number}
          </div>
          <div className="text-tv-sm text-muted-foreground">
            {episode.title || `Episode ${episode.number}`}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Separate component for related anime items
interface RelatedAnimeItemProps {
  anime: {
    id: string;
    name: string;
    poster: string;
  };
}

const RelatedAnimeItem: React.FC<RelatedAnimeItemProps> = ({ anime }) => {
  const relatedRef = useFocusable(`related-${anime.id}`);
  
  return (
    <Card
      key={anime.id}
      ref={relatedRef.elementRef as React.RefObject<HTMLDivElement>}
      className={`cursor-pointer transition-all ${
        relatedRef.isFocused ? 'ring-4 ring-primary scale-105' : ''
      }`}
    >
      <CardContent className="p-0">
        <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg">
          <img
            src={getImageUrl(anime.poster)}
            alt={anime.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-tv-sm">
          <h4 className="font-semibold text-tv-sm line-clamp-2">
            {anime.name}
          </h4>
        </div>
      </CardContent>
    </Card>
  );
};

const AnimeDetailsPage: React.FC<AnimeDetailsPageProps> = ({
  animeId,
  onWatchEpisode,
  onBack,
}) => {
  const [animeDetails, setAnimeDetails] = useState<AnimeDetails | null>(null);
  const [episodes, setEpisodes] = useState<EpisodesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string>('');

  const { setCurrentPage } = useRemoteNavigation();

  useEffect(() => {
    setCurrentPage('anime-details');
  }, [setCurrentPage]);

  useEffect(() => {
    const fetchAnimeData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [detailsResponse, episodesResponse] = await Promise.all([
          AnimeAPI.getAnimeDetails(animeId),
          AnimeAPI.getAnimeEpisodes(animeId),
        ]);

        if (detailsResponse.success) {
          setAnimeDetails(detailsResponse);
        }

        if (episodesResponse.success) {
          setEpisodes(episodesResponse);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load anime details');
      } finally {
        setLoading(false);
      }
    };

    if (animeId) {
      fetchAnimeData();
    }
  }, [animeId]);

  const backButtonRef = useFocusable('back-button');
  const watchButtonRef = useFocusable('watch-button', !loading && episodes?.data?.episodes && episodes.data.episodes.length > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-tv-lg">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <h2 className="text-tv-2xl font-semibold text-foreground">
            Loading Anime Details...
          </h2>
        </div>
      </div>
    );
  }

  if (error || !animeDetails?.data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-tv-lg max-w-2xl mx-auto px-tv-xl">
          <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
            <span className="text-destructive text-2xl">⚠</span>
          </div>
          <h2 className="text-tv-2xl font-semibold text-foreground">
            Error Loading Details
          </h2>
          <p className="text-tv-lg text-muted-foreground">{error}</p>
          <Button
            ref={backButtonRef.elementRef as React.RefObject<HTMLButtonElement>}
            onClick={onBack}
            className="focus:ring-4 focus:ring-primary/50"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const { anime } = animeDetails.data;
  const { info, moreInfo } = anime;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative h-[70vh] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${getImageUrl(info.poster)})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-end">
          <div className="container mx-auto px-tv-xl pb-tv-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-tv-xl items-end">
              {/* Poster */}
              <div className="lg:col-span-1">
                <img
                  src={getImageUrl(info.poster)}
                  alt={info.name}
                  className="w-full max-w-sm mx-auto lg:mx-0 rounded-lg shadow-2xl"
                />
              </div>

              {/* Details */}
              <div className="lg:col-span-3 space-y-tv-lg">
                <div className="space-y-tv-md">
                  <h1 className="text-tv-4xl font-bold leading-tight">
                    {info.name}
                  </h1>
                  
                  {/* Stats */}
                  <div className="flex flex-wrap gap-tv-md">
                    <Badge variant="secondary" className="text-tv-base">
                      {info.stats.rating}
                    </Badge>
                    <Badge variant="outline" className="text-tv-base">
                      {info.stats.type}
                    </Badge>
                    <Badge variant="outline" className="text-tv-base">
                      {formatDuration(info.stats.duration)}
                    </Badge>
                    <Badge variant="outline" className="text-tv-base">
                      {formatEpisodeCount(info.stats.episodes)}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-tv-lg text-muted-foreground leading-relaxed max-w-4xl">
                    {truncateText(info.description, 300)}
                  </p>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-tv-sm">
                    {moreInfo.genres.map((genre, index) => (
                      <Badge key={index} variant="secondary" className="text-tv-sm">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-tv-lg">
                  <Button
                    ref={backButtonRef.elementRef as React.RefObject<HTMLButtonElement>}
                    onClick={onBack}
                    variant="outline"
                    className="focus:ring-4 focus:ring-primary/50 text-tv-lg px-tv-xl py-tv-lg h-auto"
                  >
                    ← Back
                  </Button>
                  
                  {episodes?.data?.episodes && episodes.data.episodes.length > 0 && (
                    <Button
                      ref={watchButtonRef.elementRef as React.RefObject<HTMLButtonElement>}
                      onClick={() => episodes && onWatchEpisode(episodes.data.episodes[0].episodeId)}
                      className="focus:ring-4 focus:ring-primary/50 text-tv-lg px-tv-xl py-tv-lg h-auto"
                    >
                      ▶ Watch Episode 1
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Information */}
      <div className="container mx-auto px-tv-xl py-tv-2xl">
        <Tabs defaultValue="episodes" className="space-y-tv-xl">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="episodes">Episodes</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="characters">Characters</TabsTrigger>
            <TabsTrigger value="related">Related</TabsTrigger>
          </TabsList>

          {/* Episodes Tab */}
          <TabsContent value="episodes" className="space-y-tv-lg">
            {episodes?.data.episodes ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-tv-lg">
                {episodes.data.episodes.map((episode, index) => (
                  <EpisodeItem
                    key={episode.number}
                    episode={episode}
                    onWatchEpisode={onWatchEpisode}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                No episodes available
              </div>
            )}
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-tv-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-tv-xl">
              <Card>
                <CardContent className="p-tv-xl space-y-tv-lg">
                  <h3 className="text-tv-xl font-semibold">Information</h3>
                  <div className="space-y-tv-md">
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <span className="ml-tv-md">{moreInfo.status}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Aired:</span>
                      <span className="ml-tv-md">{moreInfo.aired}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Studios:</span>
                      <span className="ml-tv-md">{moreInfo.studios}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="ml-tv-md">{formatDuration(moreInfo.duration)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-tv-xl space-y-tv-lg">
                  <h3 className="text-tv-xl font-semibold">Statistics</h3>
                  <div className="space-y-tv-md">
                    <div>
                      <span className="text-muted-foreground">Rating:</span>
                      <span className="ml-tv-md">{info.stats.rating}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Quality:</span>
                      <span className="ml-tv-md">{info.stats.quality}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Episodes:</span>
                      <span className="ml-tv-md">{formatEpisodeCount(info.stats.episodes)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Characters Tab */}
          <TabsContent value="characters" className="space-y-tv-lg">
            {info.characterVoiceActor?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-tv-lg">
                {info.characterVoiceActor.slice(0, 12).map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-tv-lg">
                      <div className="flex gap-tv-md">
                        <img
                          src={getImageUrl(item.character.poster)}
                          alt={item.character.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-tv-base font-semibold truncate">
                            {item.character.name}
                          </div>
                          <div className="text-tv-sm text-muted-foreground truncate">
                            {item.character.cast}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                No character information available
              </div>
            )}
          </TabsContent>

          {/* Related Tab */}
          <TabsContent value="related" className="space-y-tv-lg">
            {animeDetails.data.relatedAnimes?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-tv-lg">
                {animeDetails.data.relatedAnimes.map((anime, index) => (
                  <RelatedAnimeItem
                    key={anime.id}
                    anime={anime}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                No related anime found
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnimeDetailsPage;
