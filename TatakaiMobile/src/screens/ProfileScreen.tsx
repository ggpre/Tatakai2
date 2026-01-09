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
  User,
  Settings,
  LogOut,
  Download,
  Bell,
  Heart,
  Clock,
  Film,
  ChevronRight,
  Shield,
} from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface UserStats {
  watchedCount: number;
  hoursWatched: number;
  listCount: number;
}

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, profile, isAdmin, signOut } = useAuthStore();
  const [stats, setStats] = useState<UserStats>({ watchedCount: 0, hoursWatched: 0, listCount: 0 });

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;
    
    try {
      // Get watch history count
      const { count: watchedCount } = await supabase
        .from('watch_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      // Get watchlist count
      const { count: listCount } = await supabase
        .from('watchlist')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      setStats({
        watchedCount: watchedCount || 0,
        hoursWatched: Math.floor((watchedCount || 0) * 0.4), // Rough estimate
        listCount: listCount || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            navigation.navigate('Auth');
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.authContainer}>
        <User color="#71717a" size={80} />
        <Text style={styles.authTitle}>Welcome to Tatakai</Text>
        <Text style={styles.authSubtitle}>
          Sign in to sync your watchlist, track progress, and more
        </Text>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => navigation.navigate('Auth')}
        >
          <Text style={styles.authButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const menuItems = [
    {
      icon: <Download color="#a78bfa" size={22} />,
      label: 'Downloads',
      onPress: () => navigation.navigate('Downloads'),
    },
    {
      icon: <Bell color="#fbbf24" size={22} />,
      label: 'Notifications',
      onPress: () => {},
    },
    {
      icon: <Clock color="#60a5fa" size={22} />,
      label: 'Watch History',
      onPress: () => {},
    },
    {
      icon: <Heart color="#f472b6" size={22} />,
      label: 'Favorites',
      onPress: () => {},
    },
    {
      icon: <Settings color="#71717a" size={22} />,
      label: 'Settings',
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: profile?.avatarUrl || `https://api.dicebear.com/9.x/avataaars/png?seed=${profile?.username || 'user'}`,
            }}
            style={styles.avatar}
          />
          {isAdmin && (
            <View style={styles.adminBadge}>
              <Shield color="#fff" size={12} />
            </View>
          )}
        </View>
        <Text style={styles.displayName}>
          {profile?.displayName || profile?.username || 'User'}
        </Text>
        <Text style={styles.username}>@{profile?.username || 'user'}</Text>
        {profile?.bio && (
          <Text style={styles.bio}>{profile.bio}</Text>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Film color="#6366f1" size={24} />
          <Text style={styles.statValue}>{stats.watchedCount}</Text>
          <Text style={styles.statLabel}>Episodes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Clock color="#22c55e" size={24} />
          <Text style={styles.statValue}>{stats.hoursWatched}h</Text>
          <Text style={styles.statLabel}>Watched</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Heart color="#f472b6" size={24} />
          <Text style={styles.statValue}>{stats.listCount}</Text>
          <Text style={styles.statLabel}>My List</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              {item.icon}
              <Text style={styles.menuItemLabel}>{item.label}</Text>
            </View>
            <ChevronRight color="#52525b" size={20} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Admin Section */}
      {isAdmin && (
        <View style={styles.adminSection}>
          <Text style={styles.sectionTitle}>Admin</Text>
          <TouchableOpacity
            style={[styles.menuItem, styles.adminMenuItem]}
            onPress={() => {}}
          >
            <View style={styles.menuItemLeft}>
              <Shield color="#f97316" size={22} />
              <Text style={styles.menuItemLabel}>Admin Dashboard</Text>
            </View>
            <ChevronRight color="#52525b" size={20} />
          </TouchableOpacity>
        </View>
      )}

      {/* Sign Out */}
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
      >
        <LogOut color="#ef4444" size={20} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* Version */}
      <Text style={styles.version}>Tatakai Mobile v1.0.0</Text>

      {/* Bottom Spacing */}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  contentContainer: {
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#050505',
    paddingHorizontal: 40,
  },
  authTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
    textAlign: 'center',
  },
  authSubtitle: {
    color: '#71717a',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  authButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 32,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(99, 102, 241, 0.5)',
  },
  adminBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#f97316',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#050505',
  },
  displayName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
  },
  username: {
    color: '#71717a',
    fontSize: 14,
    marginTop: 4,
  },
  bio: {
    color: '#a1a1aa',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 28,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: '#71717a',
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  menuContainer: {
    gap: 4,
    marginBottom: 28,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuItemLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  adminSection: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#71717a',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 1,
  },
  adminMenuItem: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.2)',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginBottom: 20,
  },
  signOutText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '600',
  },
  version: {
    color: '#52525b',
    fontSize: 12,
    textAlign: 'center',
  },
});
