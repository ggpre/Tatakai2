import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Play, Star, Clock } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { fetchHome, HomeData, AnimeCard, getProxiedImageUrl } from '../lib/api';
import { useAuthStore } from '../store/authStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentSpotlight, setCurrentSpotlight] = useState(0);
  const { profile } = useAuthStore();

  const loadHomeData = async () => {
    try {
      const data = await fetchHome();
      setHomeData(data);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  useEffect(() => {
    if (homeData?.spotlightAnimes && homeData.spotlightAnimes.length > 0) {
      const interval = setInterval(() => {
        setCurrentSpotlight((prev) =>
          prev >= homeData.spotlightAnimes.length - 1 ? 0 : prev + 1
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [homeData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadHomeData();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const spotlight = homeData?.spotlightAnimes?.[currentSpotlight];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#6366f1"
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>TATAKAI</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Main')}
        >
          <Image
            source={{
              uri: profile?.avatarUrl || `https://api.dicebear.com/9.x/avataaars/png?seed=${profile?.username || 'user'}`,
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      {/* Hero/Spotlight Section */}
      {spotlight && (
        <TouchableOpacity
          style={styles.spotlightContainer}
          onPress={() => navigation.navigate('Anime', { animeId: spotlight.id })}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: getProxiedImageUrl(spotlight.poster) }}
            style={styles.spotlightImage}
            resizeMode="cover"
          />
          <View style={styles.spotlightOverlay}>
            <View style={styles.spotlightContent}>
              <View style={styles.spotlightBadge}>
                <Star color="#fbbf24" size={12} fill="#fbbf24" />
                <Text style={styles.badgeText}>#{spotlight.rank} Spotlight</Text>
              </View>
              <Text style={styles.spotlightTitle} numberOfLines={2}>
                {spotlight.name}
              </Text>
              <Text style={styles.spotlightDescription} numberOfLines={3}>
                {spotlight.description}
              </Text>
              <View style={styles.spotlightMeta}>
                {spotlight.otherInfo?.slice(0, 3).map((info, index) => (
                  <View key={index} style={styles.metaTag}>
                    <Text style={styles.metaText}>{info}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.spotlightActions}>
                <TouchableOpacity style={styles.playButton}>
                  <Play color="#000" size={18} fill="#000" />
                  <Text style={styles.playButtonText}>Play Now</Text>
                </TouchableOpacity>
                <View style={styles.episodeInfo}>
                  <Clock color="#a1a1aa" size={14} />
                  <Text style={styles.episodeText}>
                    {spotlight.episodes?.sub || 0} Episodes
                  </Text>
                </View>
              </View>
            </View>
          </View>
          {/* Spotlight Indicators */}
          <View style={styles.spotlightIndicators}>
            {homeData?.spotlightAnimes?.slice(0, 5).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentSpotlight && styles.indicatorActive,
                ]}
              />
            ))}
          </View>
        </TouchableOpacity>
      )}

      {/* Continue Watching Section */}
      <Section
        title="Continue Watching"
        data={homeData?.latestEpisodeAnimes?.slice(0, 10)}
        onItemPress={(id) => navigation.navigate('Anime', { animeId: id })}
        showProgress
      />

      {/* Trending Section */}
      <Section
        title="Trending Now"
        data={homeData?.trendingAnimes?.map((a) => ({
          ...a,
          episodes: { sub: 0, dub: 0 },
        }))}
        onItemPress={(id) => navigation.navigate('Anime', { animeId: id })}
        showRank
      />

      {/* Top Airing */}
      <Section
        title="Top Airing"
        data={homeData?.topAiringAnimes}
        onItemPress={(id) => navigation.navigate('Anime', { animeId: id })}
      />

      {/* Most Popular */}
      <Section
        title="Most Popular"
        data={homeData?.mostPopularAnimes}
        onItemPress={(id) => navigation.navigate('Anime', { animeId: id })}
      />

      {/* Latest Completed */}
      <Section
        title="Completed Series"
        data={homeData?.latestCompletedAnimes}
        onItemPress={(id) => navigation.navigate('Anime', { animeId: id })}
      />

      {/* Genres */}
      {homeData?.genres && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Genre</Text>
          <View style={styles.genreGrid}>
            {homeData.genres.slice(0, 12).map((genre) => (
              <TouchableOpacity key={genre} style={styles.genreChip}>
                <Text style={styles.genreText}>{genre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Bottom Spacing */}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

interface SectionProps {
  title: string;
  data?: AnimeCard[];
  onItemPress: (id: string) => void;
  showRank?: boolean;
  showProgress?: boolean;
}

function Section({ title, data, onItemPress, showRank, showProgress }: SectionProps) {
  if (!data || data.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScroll}
      >
        {data.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={styles.animeCard}
            onPress={() => onItemPress(item.id)}
            activeOpacity={0.8}
          >
            <View style={styles.cardImageContainer}>
              <Image
                source={{ uri: getProxiedImageUrl(item.poster) }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              {showRank && (
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
              )}
              {showProgress && (
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${Math.random() * 100}%` }]} />
                </View>
              )}
            </View>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.cardSubtitle}>
              {item.episodes?.sub || 0} Episodes
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  contentContainer: {
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#050505',
  },
  loadingText: {
    color: '#a1a1aa',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  appName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  spotlightContainer: {
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
    height: 400,
    marginBottom: 24,
  },
  spotlightImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  spotlightOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  spotlightContent: {
    gap: 12,
  },
  spotlightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '600',
  },
  spotlightTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  spotlightDescription: {
    color: '#a1a1aa',
    fontSize: 13,
    lineHeight: 20,
  },
  spotlightMeta: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metaText: {
    color: '#d4d4d8',
    fontSize: 11,
  },
  spotlightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  playButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  episodeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  episodeText: {
    color: '#a1a1aa',
    fontSize: 13,
  },
  spotlightIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  indicatorActive: {
    width: 24,
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  horizontalScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  animeCard: {
    width: 140,
    marginRight: 12,
  },
  cardImageContainer: {
    width: 140,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  rankBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rankText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 10,
    lineHeight: 18,
  },
  cardSubtitle: {
    color: '#71717a',
    fontSize: 11,
    marginTop: 4,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  genreChip: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  genreText: {
    color: '#a78bfa',
    fontSize: 13,
    fontWeight: '500',
  },
});
