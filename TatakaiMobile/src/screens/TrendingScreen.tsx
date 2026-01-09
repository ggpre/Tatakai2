import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Flame, TrendingUp } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { fetchHome, HomeData, TopAnime, getProxiedImageUrl } from '../lib/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TimeFrame = 'today' | 'week' | 'month';

export default function TrendingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('today');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await fetchHome();
      setHomeData(data);
    } catch (error) {
      console.error('Error loading trending data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const top10 = homeData?.top10Animes?.[timeFrame] || [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Flame color="#f97316" size={28} fill="#f97316" />
          <Text style={styles.title}>Top 10</Text>
        </View>
        <Text style={styles.subtitle}>Most watched anime rankings</Text>
      </View>

      {/* Time Frame Tabs */}
      <View style={styles.tabsContainer}>
        {(['today', 'week', 'month'] as TimeFrame[]).map((frame) => (
          <TouchableOpacity
            key={frame}
            style={[styles.tab, timeFrame === frame && styles.tabActive]}
            onPress={() => setTimeFrame(frame)}
          >
            <Text style={[styles.tabText, timeFrame === frame && styles.tabTextActive]}>
              {frame.charAt(0).toUpperCase() + frame.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Rankings List */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {top10.map((anime, index) => (
          <TouchableOpacity
            key={anime.id}
            style={styles.rankItem}
            onPress={() => navigation.navigate('Anime', { animeId: anime.id })}
            activeOpacity={0.8}
          >
            {/* Rank Number */}
            <View style={[styles.rankNumber, index < 3 && styles.topThreeRank]}>
              <Text style={[styles.rankText, index < 3 && styles.topThreeText]}>
                {String(index + 1).padStart(2, '0')}
              </Text>
            </View>

            {/* Poster */}
            <Image
              source={{ uri: getProxiedImageUrl(anime.poster) }}
              style={styles.poster}
              resizeMode="cover"
            />

            {/* Info */}
            <View style={styles.infoContainer}>
              <Text style={styles.animeName} numberOfLines={2}>
                {anime.name}
              </Text>
              <View style={styles.stats}>
                <TrendingUp color="#22c55e" size={14} />
                <Text style={styles.statsText}>
                  {anime.episodes?.sub || 0} Episodes
                </Text>
              </View>
            </View>

            {/* Rank Change Indicator */}
            <View style={styles.changeIndicator}>
              <Text style={styles.changeText}>
                {index < 3 ? '🔥' : '—'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#050505',
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#71717a',
    fontSize: 14,
    marginLeft: 38,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: '#6366f1',
  },
  tabText: {
    color: '#71717a',
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#a78bfa',
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 12,
  },
  rankNumber: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topThreeRank: {
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    borderWidth: 1,
    borderColor: '#f97316',
  },
  rankText: {
    color: '#71717a',
    fontSize: 16,
    fontWeight: '700',
  },
  topThreeText: {
    color: '#f97316',
  },
  poster: {
    width: 60,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
  },
  infoContainer: {
    flex: 1,
    gap: 6,
  },
  animeName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statsText: {
    color: '#71717a',
    fontSize: 12,
  },
  changeIndicator: {
    width: 32,
    alignItems: 'center',
  },
  changeText: {
    fontSize: 16,
  },
});
