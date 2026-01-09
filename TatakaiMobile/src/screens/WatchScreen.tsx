import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import {
  ArrowLeft,
  Settings,
  SkipForward,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  FastForward,
  Rewind,
} from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  fetchEpisodeServers,
  fetchStreamingSources,
  StreamingData,
  getProxiedVideoUrl,
} from '../lib/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type WatchRouteProp = RouteProp<RootStackParamList, 'Watch'>;

export default function WatchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<WatchRouteProp>();
  const { episodeId, animeId } = route.params;
  const videoRef = useRef<Video>(null);

  const [streamingData, setStreamingData] = useState<StreamingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffering, setBuffering] = useState(false);

  useEffect(() => {
    StatusBar.setHidden(true);
    loadStreamingSources();
    
    return () => {
      StatusBar.setHidden(false);
    };
  }, [episodeId]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showControls) {
      timeout = setTimeout(() => setShowControls(false), 4000);
    }
    return () => clearTimeout(timeout);
  }, [showControls]);

  const loadStreamingSources = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First get available servers
      const servers = await fetchEpisodeServers(episodeId);
      
      // Try to get sources from the first available server
      const serverToUse = servers.sub?.[0]?.serverName || 'hd-1';
      const sources = await fetchStreamingSources(episodeId, serverToUse, 'sub');
      
      setStreamingData(sources);
    } catch (err) {
      console.error('Error loading sources:', err);
      setError('Failed to load video sources');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      setBuffering(true);
      return;
    }
    
    setBuffering(status.isBuffering);
    setIsPlaying(status.isPlaying);
    setProgress(status.positionMillis || 0);
    setDuration(status.durationMillis || 0);
  };

  const togglePlayPause = async () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  };

  const seek = async (direction: 'forward' | 'backward') => {
    if (!videoRef.current) return;
    const seekAmount = 10000; // 10 seconds
    const newPosition = direction === 'forward' 
      ? progress + seekAmount 
      : progress - seekAmount;
    await videoRef.current.setPositionAsync(Math.max(0, Math.min(newPosition, duration)));
  };

  const skipIntro = async () => {
    if (!videoRef.current || !streamingData?.intro) return;
    await videoRef.current.setPositionAsync(streamingData.intro.end * 1000);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const videoSource = streamingData?.sources?.find(s => s.isM3U8 || s.url);
  const videoUrl = videoSource 
    ? getProxiedVideoUrl(videoSource.url, streamingData?.headers?.Referer)
    : null;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading video...</Text>
      </View>
    );
  }

  if (error || !videoUrl) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'No video sources available'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadStreamingSources}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.backLink}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backLinkText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.videoWrapper}
        activeOpacity={1}
        onPress={() => setShowControls(!showControls)}
      >
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={true}
          isMuted={isMuted}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          useNativeControls={false}
        />

        {/* Buffering Indicator */}
        {buffering && (
          <View style={styles.bufferingOverlay}>
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
        )}

        {/* Controls Overlay */}
        {showControls && (
          <View style={styles.controlsOverlay}>
            {/* Top Bar */}
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <ArrowLeft color="#fff" size={24} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingsButton}>
                <Settings color="#fff" size={22} />
              </TouchableOpacity>
            </View>

            {/* Center Controls */}
            <View style={styles.centerControls}>
              <TouchableOpacity
                style={styles.seekButton}
                onPress={() => seek('backward')}
              >
                <Rewind color="#fff" size={28} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.playPauseButton}
                onPress={togglePlayPause}
              >
                {isPlaying ? (
                  <Pause color="#000" size={32} fill="#000" />
                ) : (
                  <Play color="#000" size={32} fill="#000" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.seekButton}
                onPress={() => seek('forward')}
              >
                <FastForward color="#fff" size={28} />
              </TouchableOpacity>
            </View>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <Text style={styles.timeText}>{formatTime(progress)}</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${duration > 0 ? (progress / duration) * 100 : 0}%` },
                    ]}
                  />
                </View>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>

              {/* Bottom Buttons */}
              <View style={styles.bottomButtons}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? (
                    <VolumeX color="#fff" size={22} />
                  ) : (
                    <Volume2 color="#fff" size={22} />
                  )}
                </TouchableOpacity>

                {streamingData?.intro && 
                 progress >= streamingData.intro.start * 1000 && 
                 progress <= streamingData.intro.end * 1000 && (
                  <TouchableOpacity
                    style={styles.skipIntroButton}
                    onPress={skipIntro}
                  >
                    <SkipForward color="#000" size={16} />
                    <Text style={styles.skipIntroText}>Skip Intro</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#71717a',
    marginTop: 16,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 40,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  retryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  backLink: {
    padding: 12,
  },
  backLinkText: {
    color: '#71717a',
    fontSize: 14,
  },
  videoWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  bufferingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 48,
  },
  seekButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    width: 45,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 2,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipIntroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  skipIntroText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '600',
  },
});
