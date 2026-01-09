import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  MessageSquare,
  Heart,
  Reply,
  TrendingUp,
  Clock,
  Send,
} from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Discussion {
  id: string;
  author: string;
  authorAvatar: string;
  title: string;
  content: string;
  anime?: string;
  likes: number;
  replies: number;
  createdAt: string;
}

const MOCK_DISCUSSIONS: Discussion[] = [
  {
    id: '1',
    author: 'AnimeFan2024',
    authorAvatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=fan1',
    title: 'Solo Leveling Episode 5 Discussion',
    content: 'That fight scene was absolutely incredible! The animation quality...',
    anime: 'Solo Leveling',
    likes: 234,
    replies: 45,
    createdAt: '2h ago',
  },
  {
    id: '2',
    author: 'MangaReader',
    authorAvatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=reader',
    title: 'Best anime of 2024 so far?',
    content: 'What are your top picks for best anime this season?',
    likes: 156,
    replies: 78,
    createdAt: '4h ago',
  },
  {
    id: '3',
    author: 'NightOwl',
    authorAvatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=owl',
    title: 'Underrated anime recommendations',
    content: 'Looking for some hidden gems. Any suggestions?',
    likes: 89,
    replies: 32,
    createdAt: '6h ago',
  },
];

type TabType = 'trending' | 'recent';

export default function CommunityScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<TabType>('trending');
  const [newPost, setNewPost] = useState('');

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
        <Text style={styles.headerTitle}>Community</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'trending' && styles.tabActive]}
          onPress={() => setActiveTab('trending')}
        >
          <TrendingUp 
            color={activeTab === 'trending' ? '#fff' : '#71717a'} 
            size={18} 
          />
          <Text style={[styles.tabText, activeTab === 'trending' && styles.tabTextActive]}>
            Trending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recent' && styles.tabActive]}
          onPress={() => setActiveTab('recent')}
        >
          <Clock 
            color={activeTab === 'recent' ? '#fff' : '#71717a'} 
            size={18} 
          />
          <Text style={[styles.tabText, activeTab === 'recent' && styles.tabTextActive]}>
            Recent
          </Text>
        </TouchableOpacity>
      </View>

      {/* New Post Input */}
      <View style={styles.newPostContainer}>
        <TextInput
          style={styles.newPostInput}
          placeholder="Start a discussion..."
          placeholderTextColor="#52525b"
          value={newPost}
          onChangeText={setNewPost}
          multiline
        />
        <TouchableOpacity 
          style={[styles.postButton, !newPost.trim() && styles.postButtonDisabled]}
          disabled={!newPost.trim()}
        >
          <Send color={newPost.trim() ? '#fff' : '#52525b'} size={18} />
        </TouchableOpacity>
      </View>

      {/* Discussions List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {MOCK_DISCUSSIONS.map((discussion) => (
          <TouchableOpacity
            key={discussion.id}
            style={styles.discussionCard}
            activeOpacity={0.8}
          >
            {/* Author Info */}
            <View style={styles.authorRow}>
              <Image
                source={{ uri: discussion.authorAvatar }}
                style={styles.authorAvatar}
              />
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{discussion.author}</Text>
                <Text style={styles.timestamp}>{discussion.createdAt}</Text>
              </View>
              {discussion.anime && (
                <View style={styles.animeBadge}>
                  <Text style={styles.animeBadgeText}>{discussion.anime}</Text>
                </View>
              )}
            </View>

            {/* Content */}
            <Text style={styles.discussionTitle}>{discussion.title}</Text>
            <Text style={styles.discussionContent} numberOfLines={2}>
              {discussion.content}
            </Text>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionButton}>
                <Heart color="#71717a" size={18} />
                <Text style={styles.actionText}>{discussion.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <MessageSquare color="#71717a" size={18} />
                <Text style={styles.actionText}>{discussion.replies}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Reply color="#71717a" size={18} />
                <Text style={styles.actionText}>Reply</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  },
  placeholder: {
    width: 44,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
  newPostContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  newPostInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  postButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  discussionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
  },
  authorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  authorName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  timestamp: {
    color: '#71717a',
    fontSize: 12,
    marginTop: 2,
  },
  animeBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  animeBadgeText: {
    color: '#a78bfa',
    fontSize: 11,
    fontWeight: '500',
  },
  discussionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  discussionContent: {
    color: '#a1a1aa',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    color: '#71717a',
    fontSize: 13,
  },
});
