import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Download,
  Trash2,
  Play,
  HardDrive,
  Wifi,
  WifiOff,
} from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getProxiedImageUrl } from '../lib/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface DownloadedEpisode {
  id: string;
  animeId: string;
  animeName: string;
  animePoster: string;
  episodeNumber: number;
  episodeTitle: string;
  fileSize: number; // in MB
  downloadedAt: string;
  quality: string;
}

// Mock data for demonstration
const MOCK_DOWNLOADS: DownloadedEpisode[] = [
  {
    id: '1',
    animeId: 'solo-leveling-18718',
    animeName: 'Solo Leveling',
    animePoster: 'https://cdn.myanimelist.net/images/anime/1908/144022.jpg',
    episodeNumber: 1,
    episodeTitle: 'I\'m Used to It',
    fileSize: 350,
    downloadedAt: '2024-01-15',
    quality: '1080p',
  },
  {
    id: '2',
    animeId: 'solo-leveling-18718',
    animeName: 'Solo Leveling',
    animePoster: 'https://cdn.myanimelist.net/images/anime/1908/144022.jpg',
    episodeNumber: 2,
    episodeTitle: 'If I Had One More Chance',
    fileSize: 380,
    downloadedAt: '2024-01-16',
    quality: '1080p',
  },
];

export default function DownloadsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [downloads, setDownloads] = useState<DownloadedEpisode[]>(MOCK_DOWNLOADS);
  const [isOffline, setIsOffline] = useState(false);

  const totalSize = downloads.reduce((acc, d) => acc + d.fileSize, 0);
  const availableSpace = 15000; // Mock 15GB available

  const deleteDownload = (id: string) => {
    Alert.alert(
      'Delete Download',
      'Are you sure you want to delete this episode?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDownloads(prev => prev.filter(d => d.id !== id));
          },
        },
      ]
    );
  };

  const deleteAllDownloads = () => {
    Alert.alert(
      'Delete All Downloads',
      'Are you sure you want to delete all downloaded episodes?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => setDownloads([]),
        },
      ]
    );
  };

  const formatSize = (mb: number) => {
    if (mb >= 1000) {
      return `${(mb / 1000).toFixed(1)} GB`;
    }
    return `${mb} MB`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Downloads</Text>
        {downloads.length > 0 && (
          <TouchableOpacity
            style={styles.deleteAllButton}
            onPress={deleteAllDownloads}
          >
            <Trash2 color="#ef4444" size={20} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Storage Info */}
        <View style={styles.storageCard}>
          <View style={styles.storageHeader}>
            <HardDrive color="#a78bfa" size={24} />
            <Text style={styles.storageTitle}>Storage Used</Text>
          </View>
          <View style={styles.storageBarContainer}>
            <View style={styles.storageBar}>
              <View 
                style={[
                  styles.storageBarFill, 
                  { width: `${(totalSize / availableSpace) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.storageText}>
              {formatSize(totalSize)} of {formatSize(availableSpace)} used
            </Text>
          </View>
        </View>

        {/* Offline Mode Indicator */}
        <View style={[styles.offlineCard, isOffline && styles.offlineCardActive]}>
          {isOffline ? (
            <WifiOff color="#f97316" size={20} />
          ) : (
            <Wifi color="#22c55e" size={20} />
          )}
          <Text style={styles.offlineText}>
            {isOffline ? 'You are offline. Only downloaded content is available.' : 'You are online'}
          </Text>
        </View>

        {/* Downloads List */}
        {downloads.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Download color="#52525b" size={64} />
            <Text style={styles.emptyTitle}>No Downloads</Text>
            <Text style={styles.emptyText}>
              Downloaded episodes will appear here for offline viewing
            </Text>
          </View>
        ) : (
          <View style={styles.downloadsList}>
            <Text style={styles.sectionTitle}>
              {downloads.length} Episode{downloads.length !== 1 ? 's' : ''} Downloaded
            </Text>
            {downloads.map((download) => (
              <View key={download.id} style={styles.downloadItem}>
                <TouchableOpacity
                  style={styles.downloadContent}
                  onPress={() => navigation.navigate('Watch', {
                    episodeId: `${download.animeId}?ep=${download.episodeNumber}`,
                    animeId: download.animeId,
                  })}
                >
                  <Image
                    source={{ uri: getProxiedImageUrl(download.animePoster) }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                  <View style={styles.downloadInfo}>
                    <Text style={styles.animeName} numberOfLines={1}>
                      {download.animeName}
                    </Text>
                    <Text style={styles.episodeTitle} numberOfLines={1}>
                      Ep {download.episodeNumber}: {download.episodeTitle}
                    </Text>
                    <View style={styles.downloadMeta}>
                      <Text style={styles.metaText}>{download.quality}</Text>
                      <View style={styles.metaDot} />
                      <Text style={styles.metaText}>{formatSize(download.fileSize)}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.playButton}>
                    <Play color="#000" size={18} fill="#000" />
                  </TouchableOpacity>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteDownload(download.id)}
                >
                  <Trash2 color="#ef4444" size={18} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  deleteAllButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  storageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  storageTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  storageBarContainer: {
    gap: 8,
  },
  storageBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  storageBarFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  storageText: {
    color: '#71717a',
    fontSize: 13,
  },
  offlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  offlineCardActive: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderColor: 'rgba(249, 115, 22, 0.2)',
  },
  offlineText: {
    color: '#a1a1aa',
    fontSize: 13,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
  },
  emptyText: {
    color: '#71717a',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 40,
  },
  downloadsList: {
    gap: 12,
  },
  sectionTitle: {
    color: '#71717a',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  downloadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  downloadContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  thumbnail: {
    width: 70,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
  },
  downloadInfo: {
    flex: 1,
    gap: 4,
  },
  animeName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  episodeTitle: {
    color: '#a1a1aa',
    fontSize: 13,
  },
  downloadMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    color: '#71717a',
    fontSize: 12,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#52525b',
    marginHorizontal: 8,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 48,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.05)',
  },
});
