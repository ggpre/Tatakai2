import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimeAPI, type SearchResult, type Anime } from '../services/api';
import { useRemoteNavigation, REMOTE_KEYS } from '../context/RemoteNavigationContext';
import TVAnimeCarousel from '../components/tv/TVAnimeCarousel';

interface SearchPageProps {
  initialQuery?: string;
  onAnimeSelect?: (anime: Anime) => void;
  onClose?: () => void;
}

const SearchPage: React.FC<SearchPageProps> = ({
  initialQuery = '',
  onAnimeSelect,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState('');

  const { registerElement } = useRemoteNavigation();

  // Virtual keyboard layout for TV
  const keyboardLayout = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
    ['SPACE', 'CLEAR', 'SEARCH']
  ];

  const popularSearches = [
    'Naruto', 'One Piece', 'Attack on Titan', 'Demon Slayer',
    'My Hero Academia', 'Dragon Ball', 'Death Note', 'Hunter x Hunter',
    'Fullmetal Alchemist', 'Tokyo Ghoul', 'Jujutsu Kaisen', 'Chainsaw Man'
  ];

  const handleSearch = useCallback(async (query: string, page: number = 1) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      console.log('TV Search:', query, 'Page:', page);
      const result = await AnimeAPI.searchAnime(query, page);
      
      if (result.success) {
        setSearchResults(result);
        setCurrentPage(page);
      } else {
        console.error('Search failed');
        setSearchResults(null);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleKeyPress = (key: string) => {
    switch (key) {
      case 'SPACE':
        setSearchQuery(prev => prev + ' ');
        break;
      case 'CLEAR':
        setSearchQuery('');
        setSearchResults(null);
        break;
      case 'SEARCH':
        handleSearch(searchQuery);
        setShowKeyboard(false);
        break;
      default:
        setSearchQuery(prev => prev + key);
        break;
    }
  };

  // Handle remote control navigation
  useEffect(() => {
    const handleRemoteKey = (event: KeyboardEvent) => {
      switch (event.keyCode) {
        case REMOTE_KEYS.BACK:
          event.preventDefault();
          onClose?.();
          break;
        case REMOTE_KEYS.OK:
          if (showKeyboard && selectedLetter) {
            handleKeyPress(selectedLetter);
          }
          break;
        case REMOTE_KEYS.RED:
          setShowKeyboard(!showKeyboard);
          break;
        case REMOTE_KEYS.GREEN:
          handleSearch(searchQuery);
          break;
        case REMOTE_KEYS.YELLOW:
          setSearchQuery('');
          setSearchResults(null);
          break;
      }
    };

    window.addEventListener('keydown', handleRemoteKey);
    return () => window.removeEventListener('keydown', handleRemoteKey);
  }, [showKeyboard, selectedLetter, searchQuery, onClose]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-tv-lg">Searching anime...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-tv-md">
      <div className="max-w-7xl mx-auto space-y-tv-lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-tv-md">
            <Search className="w-8 h-8 text-primary" />
            <h1 className="text-tv-2xl font-bold">Search Anime</h1>
          </div>
          <Button
            variant="outline"
            size="lg"
            onClick={onClose}
            className="w-16 h-16"
          >
            <X className="w-6 h-6" />
          </Button>
        </motion.div>

        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-tv-md"
        >
          <div className="flex items-center space-x-tv-sm">
            <Input
              type="text"
              placeholder="Search for anime..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="flex-1 h-16 text-tv-lg px-6"
            />
            <Button
              size="lg"
              onClick={() => handleSearch(searchQuery)}
              className="h-16 px-8"
            >
              <Search className="w-6 h-6 mr-2" />
              Search
            </Button>
          </div>

          {/* Virtual Keyboard Toggle */}
          <div className="flex items-center justify-center">
            <Button
              variant={showKeyboard ? 'default' : 'outline'}
              onClick={() => setShowKeyboard(!showKeyboard)}
              className="h-12"
            >
              {showKeyboard ? 'Hide Keyboard' : 'Show Virtual Keyboard'}
            </Button>
          </div>
        </motion.div>

        {/* Virtual Keyboard */}
        {showKeyboard && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card rounded-lg p-tv-md border"
          >
            <h3 className="text-tv-lg font-semibold mb-tv-sm">Virtual Keyboard</h3>
            <div className="space-y-tv-xs">
              {keyboardLayout.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center space-x-tv-xs">
                  {row.map((key) => {
                    const isSpecial = ['SPACE', 'CLEAR', 'SEARCH'].includes(key);
                    const buttonWidth = key === 'SPACE' ? 'w-32' : isSpecial ? 'w-24' : 'w-12';
                    
                    return (
                      <Button
                        key={key}
                        variant={selectedLetter === key ? 'default' : 'outline'}
                        size="sm"
                        className={`${buttonWidth} h-12 text-tv-sm font-medium`}
                        onClick={() => handleKeyPress(key)}
                        onFocus={() => setSelectedLetter(key)}
                      >
                        {key === 'SPACE' ? 'Space' : key}
                      </Button>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Popular Searches */}
        {!searchResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-tv-md"
          >
            <h2 className="text-tv-xl font-semibold">Popular Searches</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-tv-sm">
              {popularSearches.map((search) => (
                <Button
                  key={search}
                  variant="outline"
                  className="h-16 justify-start text-left"
                  onClick={() => {
                    setSearchQuery(search);
                    handleSearch(search);
                  }}
                >
                  <Search className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{search}</span>
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Search Results */}
        {searchResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-tv-lg"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-tv-xl font-semibold">
                Search Results for "{searchQuery}"
              </h2>
              <div className="flex items-center space-x-tv-sm">
                <Badge variant="secondary" className="text-tv-sm">
                  {searchResults.data.animes.length} results
                </Badge>
                <Badge variant="outline" className="text-tv-sm">
                  Page {currentPage}
                </Badge>
              </div>
            </div>

            {searchResults.data.animes.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-tv-md">
                {searchResults.data.animes.map((anime: Anime, index: number) => {
                  return (
                    <Card
                      key={anime.id}
                      className="group cursor-pointer transition-all duration-200 hover:scale-105 focus-within:scale-105 focus-within:ring-2 focus-within:ring-primary"
                      onClick={() => onAnimeSelect?.(anime)}
                    >
                      <CardContent className="p-0">
                        <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg">
                          <img
                            src={anime.poster}
                            alt={anime.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="text-xs">
                              {anime.type || 'TV'}
                            </Badge>
                            <Badge variant="outline" className="text-xs ml-1">
                              {anime.rating || 'N/A'}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-tv-sm space-y-1">
                          <h3 className="font-semibold text-tv-sm line-clamp-2">
                            {anime.name}
                          </h3>
                          <p className="text-tv-xs text-muted-foreground">
                            Episodes: {anime.episodes?.sub || anime.episodes?.dub || 'N/A'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-tv-xl">
                <Search className="w-16 h-16 mx-auto text-muted-foreground mb-tv-md" />
                <h3 className="text-tv-lg font-semibold mb-tv-sm">No results found</h3>
                <p className="text-muted-foreground">
                  Try searching with different keywords or check your spelling
                </p>
              </div>
            )}

            {/* Pagination */}
            {searchResults.data.hasNextPage && (
              <div className="flex justify-center pt-tv-lg">
                <Button
                  size="lg"
                  onClick={() => handleSearch(searchQuery, currentPage + 1)}
                  className="h-16 px-8"
                >
                  Load More Results
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* TV Remote Hints */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-tv-md left-tv-md right-tv-md"
        >
          <div className="bg-card/90 backdrop-blur-sm rounded-lg p-tv-sm border">
            <div className="flex justify-center space-x-tv-lg text-tv-sm text-muted-foreground">
              <span>🔴 Toggle Keyboard</span>
              <span>🟢 Search</span>
              <span>🟡 Clear</span>
              <span>BACK Exit</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SearchPage;
