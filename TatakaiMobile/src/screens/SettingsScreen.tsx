import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Sun,
  Moon,
  Wifi,
  Download,
  Bell,
  Shield,
  HelpCircle,
  Info,
  ChevronRight,
  Trash2,
  LogOut,
} from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../store/authStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  value?: string;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  onPress?: () => void;
  danger?: boolean;
}

function SettingItem({
  icon,
  label,
  description,
  value,
  hasSwitch,
  switchValue,
  onSwitchChange,
  onPress,
  danger,
}: SettingItemProps) {
  return (
    <TouchableOpacity
      style={[styles.settingItem, danger && styles.dangerItem]}
      onPress={onPress}
      disabled={hasSwitch}
      activeOpacity={hasSwitch ? 1 : 0.7}
    >
      <View style={styles.settingLeft}>
        {icon}
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingLabel, danger && styles.dangerText]}>{label}</Text>
          {description && <Text style={styles.settingDescription}>{description}</Text>}
        </View>
      </View>
      {hasSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#3f3f46', true: '#6366f1' }}
          thumbColor="#fff"
        />
      ) : value ? (
        <Text style={styles.settingValue}>{value}</Text>
      ) : (
        <ChevronRight color="#52525b" size={20} />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { signOut } = useAuthStore();

  const [darkMode, setDarkMode] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => {} },
      ]
    );
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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={darkMode ? <Moon color="#a78bfa" size={22} /> : <Sun color="#fbbf24" size={22} />}
              label="Dark Mode"
              description="Use dark theme throughout the app"
              hasSwitch
              switchValue={darkMode}
              onSwitchChange={setDarkMode}
            />
          </View>
        </View>

        {/* Playback */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Playback</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={<Download color="#60a5fa" size={22} />}
              label="Auto-Play Next Episode"
              description="Automatically play the next episode"
              hasSwitch
              switchValue={autoPlay}
              onSwitchChange={setAutoPlay}
            />
            <SettingItem
              icon={<Wifi color="#22c55e" size={22} />}
              label="Download on Wi-Fi Only"
              description="Only download episodes when connected to Wi-Fi"
              hasSwitch
              switchValue={wifiOnly}
              onSwitchChange={setWifiOnly}
            />
            <SettingItem
              icon={<Download color="#a78bfa" size={22} />}
              label="Video Quality"
              value="Auto (1080p)"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={<Bell color="#fbbf24" size={22} />}
              label="Push Notifications"
              description="Receive alerts for new episodes"
              hasSwitch
              switchValue={notifications}
              onSwitchChange={setNotifications}
            />
          </View>
        </View>

        {/* Storage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={<Download color="#71717a" size={22} />}
              label="Downloads"
              value="2.4 GB"
              onPress={() => navigation.navigate('Downloads')}
            />
            <SettingItem
              icon={<Trash2 color="#ef4444" size={22} />}
              label="Clear Cache"
              description="Free up space by clearing cached data"
              onPress={handleClearCache}
              danger
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={<Shield color="#71717a" size={22} />}
              label="Privacy Policy"
              onPress={() => {}}
            />
            <SettingItem
              icon={<Info color="#71717a" size={22} />}
              label="Terms of Service"
              onPress={() => {}}
            />
            <SettingItem
              icon={<HelpCircle color="#71717a" size={22} />}
              label="Help & Support"
              onPress={() => {}}
            />
            <SettingItem
              icon={<Info color="#71717a" size={22} />}
              label="App Version"
              value="1.0.0"
            />
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={<LogOut color="#ef4444" size={22} />}
              label="Sign Out"
              onPress={handleSignOut}
              danger
            />
          </View>
        </View>

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
  },
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#71717a',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  dangerItem: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  dangerText: {
    color: '#ef4444',
  },
  settingDescription: {
    color: '#71717a',
    fontSize: 12,
    marginTop: 2,
  },
  settingValue: {
    color: '#71717a',
    fontSize: 14,
  },
});
