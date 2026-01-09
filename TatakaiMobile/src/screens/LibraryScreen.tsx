import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Library as LibraryIcon, Clock, CheckCircle, List, Trash2 } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { getProxiedImageUrl } from '../lib/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TabType = 'watching' | 'completed' | 'planToWatch';

interface WatchlistItem {
  id: string;
  anime_id: string;
  anime_name: string;
  anime_poster: string | null;
  status: string | null;
  created_at: string;
}

export default function LibraryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('watching');
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWatchlist();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadWatchlist = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      setWatchlist(data || []);
    } catch (error) {
      console.error('Error loading watchlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWatchlist = async (id: string) => {
    Alert.alert(
      'Remove from Library',
      'Are you sure you want to remove this anime from your library?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.from('watchlist').delete().eq('id', id);
              setWatchlist((prev) => prev.filter((item) => item.id !== id));
            } catch (error) {
              console.error('Error removing from watchlist:', error);
            }
          },
        },
      ]
    );
  };

  const filteredList = watchlist.filter((item) => {
    if (activeTab === 'watching') return item.status === 'watching' || !item.status;
    if (activeTab === 'completed') return item.status === 'completed';
    if (activeTab === 'planToWatch') return item.status === 'plan_to_watch';
    return true;
  });

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <LibraryIcon color="#71717a" size={64} />
        <Text style={styles.emptyTitle}>Sign in to view your library</Text>
        <Text style={styles.emptySubtitle}>
          Your watchlist and watch history will appear here
        </Text>
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => navigation.navigate('Auth')}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'watching', label: 'Watching', icon: <Clock color="#fbbf24" size={18} /> },
    { key: 'completed', label: 'Completed', icon: <CheckCircle color="#22c55e" size={18} /> },
    { key: 'planToWatch', label: 'Plan to Watch', icon: <List color="#6366f1" size={18} /> },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Library</Text>
        <Text style={styles.subtitle}>{watchlist.length} anime in your collection</Text>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            {tab.icon}
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredList.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No anime in this category</Text>
          </View>
        ) : (
          filteredList.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.libraryItem}
              onPress={() => navigation.navigate('Anime', { animeId: item.anime_id })}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: getProxiedImageUrl(item.anime_poster || '') }}
                style={styles.poster}
                resizeMode="cover"
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={2}>
                  {item.anime_name}
                </Text>
                <Text style={styles.itemMeta}>
                  Added {new Date(item.created_at).toLocaleDateString()}
                </Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '45%' }]} />
                  </View>
                  <Text style={styles.progressText}>Episode 12 of 24</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => removeFromWatchlist(item.id)}
              >
                <Trash2 color="#ef4444" size={18} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#050505',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#050505',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#71717a',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  signInButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  tabsContainer: {
    maxHeight: 60,
    marginBottom: 16,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: 'rgba(99, 102, 241, 0.4)',
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  emptyState: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#71717a',
    fontSize: 14,
  },
  libraryItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 12,
  },
  poster: {
    width: 80,
    height: 110,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  itemTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  itemMeta: {
    color: '#71717a',
    fontSize: 12,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 2,
  },
  progressText: {
    color: '#71717a',
    fontSize: 11,
    marginTop: 4,
  },
  deleteButton: {
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
});
