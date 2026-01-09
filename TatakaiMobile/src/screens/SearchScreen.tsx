import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search as SearchIcon, X, Filter, Mic } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { searchAnime, SearchResult, AnimeCard, getProxiedImageUrl } from '../lib/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const POPULAR_SEARCHES = [
  'Demon Slayer',
  'One Piece',
  'Jujutsu Kaisen',
  'Attack on Titan',
  'Naruto',
  'My Hero Academia',
  'Bleach',
  'Dragon Ball',
];

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
  'Horror', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports',
];

export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setHasSearched(true);
    Keyboard.dismiss();
    
    try {
      const data = await searchAnime(searchQuery.trim());
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSearch = () => {
    setQuery('');
    setResults(null);
    setHasSearched(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <Text style={styles.subtitle}>Find your next favorite anime</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <SearchIcon color="#71717a" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search anime..."
            placeholderTextColor="#52525b"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => performSearch(query)}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X color="#71717a" size={20} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter color="#fff" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : hasSearched && results ? (
          <>
            <Text style={styles.resultCount}>
              {results.animes?.length || 0} results for "{results.searchQuery}"
            </Text>
            <View style={styles.resultsGrid}>
              {results.animes?.map((anime) => (
                <TouchableOpacity
                  key={anime.id}
                  style={styles.resultCard}
                  onPress={() => navigation.navigate('Anime', { animeId: anime.id })}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: getProxiedImageUrl(anime.poster) }}
                    style={styles.resultImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.resultTitle} numberOfLines={2}>
                    {anime.name}
                  </Text>
                  <Text style={styles.resultMeta}>
                    {anime.type} • {anime.episodes?.sub || 0} Eps
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Popular Searches */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Popular Searches</Text>
              <View style={styles.tagsContainer}>
                {POPULAR_SEARCHES.map((term) => (
                  <TouchableOpacity
                    key={term}
                    style={styles.searchTag}
                    onPress={() => {
                      setQuery(term);
                      performSearch(term);
                    }}
                  >
                    <Text style={styles.searchTagText}>{term}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Browse by Genre */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Browse by Genre</Text>
              <View style={styles.genreGrid}>
                {GENRES.map((genre) => (
                  <TouchableOpacity
                    key={genre}
                    style={styles.genreCard}
                    onPress={() => {
                      setQuery(genre);
                      performSearch(genre);
                    }}
                  >
                    <Text style={styles.genreText}>{genre}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#71717a',
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  filterButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    paddingTop: 60,
    alignItems: 'center',
  },
  loadingText: {
    color: '#71717a',
    marginTop: 16,
  },
  resultCount: {
    color: '#71717a',
    fontSize: 14,
    marginBottom: 16,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  resultCard: {
    width: '31%',
  },
  resultImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
  },
  resultTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    lineHeight: 16,
  },
  resultMeta: {
    color: '#71717a',
    fontSize: 10,
    marginTop: 4,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  searchTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  searchTagText: {
    color: '#d4d4d8',
    fontSize: 13,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  genreCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  genreText: {
    color: '#a78bfa',
    fontSize: 13,
    fontWeight: '500',
  },
});
