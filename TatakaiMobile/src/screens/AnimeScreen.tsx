import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Play,
  Plus,
  Share2,
  Star,
  Clock,
  Calendar,
  Download,
  Heart,
  Check,
} from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  fetchAnimeInfo,
  fetchEpisodes,
  AnimeInfo,
  EpisodeData,
  AnimeCard,
  getProxiedImageUrl,
} from '../lib/api';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type AnimeRouteProp = RouteProp<RootStackParamList, 'Anime'>;

export default function AnimeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AnimeRouteProp>();
  const { animeId } = route.params;
  const { user } = useAuthStore();

  const [animeData, setAnimeData] = useState<{
    anime: AnimeInfo;
    recommendedAnimes: AnimeCard[];
    relatedAnimes: AnimeCard[];
  } | null>(null);
  const [episodes, setEpisodes] = useState<EpisodeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'episodes' | 'related'>('episodes');

  useEffect(() => {
    loadAnimeData();
    if (user) {
      checkWatchlist();
    }
  }, [animeId]);

  const loadAnimeData = async () => {
    try {
      const [infoData, episodesData] = await Promise.all([
        fetchAnimeInfo(animeId),
        fetchEpisodes(animeId),
      ]);
      setAnimeData(infoData);
      setEpisodes(episodesData.episodes || []);
    } catch (error) {
      console.error('Error loading anime:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkWatchlist = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('watchlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('anime_id', animeId)
        .single();
      setIsInWatchlist(!!data);
    } catch {
      setIsInWatchlist(false);
    }
  };

  const toggleWatchlist = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to add anime to your watchlist.');
      return;
    }

    try {
      if (isInWatchlist) {
        await supabase
          .from('watchlist')
          .delete()
          .eq('user_id', user.id)
          .eq('anime_id', animeId);
        setIsInWatchlist(false);
      } else {
        await supabase.from('watchlist').insert({
          user_id: user.id,
          anime_id: animeId,
          anime_name: animeData?.anime.info.name || '',
          anime_poster: animeData?.anime.info.poster || '',
          status: 'watching',
        });
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!animeData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load anime</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadAnimeData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { anime, recommendedAnimes, relatedAnimes } = animeData;
  const { info, moreInfo } = anime;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: getProxiedImageUrl(info.poster) }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
          
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>

          {/* Poster */}
          <View style={styles.posterContainer}>
            <Image
              source={{ uri: getProxiedImageUrl(info.poster) }}
              style={styles.poster}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>{info.name}</Text>
          
          {/* Meta Info */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Star color="#fbbf24" size={14} fill="#fbbf24" />
              <Text style={styles.metaText}>{info.stats?.rating || 'N/A'}</Text>
            </View>
            <View style={styles.metaDot} />
            <View style={styles.metaItem}>
              <Clock color="#71717a" size={14} />
              <Text style={styles.metaText}>{info.stats?.duration || 'N/A'}</Text>
            </View>
            <View style={styles.metaDot} />
            <View style={styles.metaItem}>
              <Calendar color="#71717a" size={14} />
              <Text style={styles.metaText}>{moreInfo?.aired?.split(' to')[0] || 'N/A'}</Text>
            </View>
          </View>

          {/* Tags */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tagsContainer}
          >
            <View style={[styles.tag, styles.typeTag]}>
              <Text style={styles.tagText}>{info.stats?.type || 'TV'}</Text>
            </View>
            <View style={[styles.tag, styles.statusTag]}>
              <Text style={styles.tagText}>{moreInfo?.status || 'Ongoing'}</Text>
            </View>
            {moreInfo?.genres?.slice(0, 3).map((genre: string) => (
              <View key={genre} style={styles.tag}>
                <Text style={styles.tagText}>{genre}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => {
                if (episodes.length > 0) {
                  navigation.navigate('Watch', {
                    episodeId: episodes[0].episodeId,
                    animeId,
                  });
                }
              }}
            >
              <Play color="#000" size={20} fill="#000" />
              <Text style={styles.playButtonText}>Play</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, isInWatchlist && styles.actionButtonActive]}
              onPress={toggleWatchlist}
            >
              {isInWatchlist ? (
                <Check color="#6366f1" size={20} />
              ) : (
                <Plus color="#fff" size={20} />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Download color="#fff" size={20} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Share2 color="#fff" size={20} />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text style={styles.description} numberOfLines={5}>
            {info.description}
          </Text>

          {/* Studios */}
          {moreInfo?.studios && (
            <Text style={styles.studios}>Studio: {moreInfo.studios}</Text>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'episodes' && styles.tabActive]}
            onPress={() => setSelectedTab('episodes')}
          >
            <Text style={[styles.tabText, selectedTab === 'episodes' && styles.tabTextActive]}>
              Episodes ({episodes.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'related' && styles.tabActive]}
            onPress={() => setSelectedTab('related')}
          >
            <Text style={[styles.tabText, selectedTab === 'related' && styles.tabTextActive]}>
              Related
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {selectedTab === 'episodes' ? (
          <View style={styles.episodesContainer}>
            {episodes.map((episode) => (
              <TouchableOpacity
                key={episode.episodeId}
                style={styles.episodeItem}
                onPress={() =>
                  navigation.navigate('Watch', {
                    episodeId: episode.episodeId,
                    animeId,
                  })
                }
              >
                <View style={styles.episodeNumber}>
                  <Text style={styles.episodeNumberText}>{episode.number}</Text>
                </View>
                <View style={styles.episodeInfo}>
                  <Text style={styles.episodeTitle} numberOfLines={1}>
                    {episode.title || `Episode ${episode.number}`}
                  </Text>
                  {episode.isFiller && (
                    <View style={styles.fillerBadge}>
                      <Text style={styles.fillerText}>Filler</Text>
                    </View>
                  )}
                </View>
                <Play color="#6366f1" size={18} />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.relatedContainer}
            contentContainerStyle={styles.relatedContent}
          >
            {[...relatedAnimes, ...recommendedAnimes].slice(0, 10).map((related) => (
              <TouchableOpacity
                key={related.id}
                style={styles.relatedCard}
                onPress={() => navigation.push('Anime', { animeId: related.id })}
              >
                <Image
                  source={{ uri: getProxiedImageUrl(related.poster) }}
                  style={styles.relatedImage}
                  resizeMode="cover"
                />
                <Text style={styles.relatedTitle} numberOfLines={2}>
                  {related.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#050505',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#050505',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroContainer: {
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 5, 5, 0.7)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterContainer: {
    position: 'absolute',
    bottom: -60,
    left: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  poster: {
    width: 130,
    height: 190,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
  },
  infoSection: {
    paddingTop: 70,
    paddingHorizontal: 20,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: '#a1a1aa',
    fontSize: 13,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#52525b',
    marginHorizontal: 10,
  },
  tagsContainer: {
    marginBottom: 20,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  typeTag: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  statusTag: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  tagText: {
    color: '#d4d4d8',
    fontSize: 12,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  playButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  playButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionButtonActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  description: {
    color: '#a1a1aa',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  studios: {
    color: '#71717a',
    fontSize: 13,
    marginBottom: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 10,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  tabText: {
    color: '#71717a',
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  episodesContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  episodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 14,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  episodeNumber: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  episodeNumberText: {
    color: '#a78bfa',
    fontSize: 14,
    fontWeight: '600',
  },
  episodeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  episodeTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  fillerBadge: {
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  fillerText: {
    color: '#f97316',
    fontSize: 10,
    fontWeight: '600',
  },
  relatedContainer: {
    marginBottom: 20,
  },
  relatedContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  relatedCard: {
    width: 120,
    marginRight: 12,
  },
  relatedImage: {
    width: 120,
    height: 170,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
  },
  relatedTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    lineHeight: 16,
  },
});
