import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Monitor, Volume2, Globe, Shield, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRemoteNavigation, REMOTE_KEYS } from '../context/RemoteNavigationContext';

interface SettingsPageProps {
  onClose?: () => void;
}

interface AppSettings {
  video: {
    quality: string;
    autoplay: boolean;
    subtitles: boolean;
    playbackSpeed: string;
  };
  audio: {
    volume: number;
    language: string;
    surround: boolean;
  };
  display: {
    theme: string;
    fontSize: string;
    contrast: string;
    motionReduction: boolean;
  };
  network: {
    autoUpdate: boolean;
    dataUsage: string;
    caching: boolean;
  };
  parental: {
    enabled: boolean;
    rating: string;
    pin: string;
  };
  about: {
    version: string;
    build: string;
    lastUpdate: string;
  };
}

const defaultSettings: AppSettings = {
  video: {
    quality: 'auto',
    autoplay: true,
    subtitles: true,
    playbackSpeed: '1.0'
  },
  audio: {
    volume: 80,
    language: 'japanese',
    surround: false
  },
  display: {
    theme: 'dark',
    fontSize: 'medium',
    contrast: 'normal',
    motionReduction: false
  },
  network: {
    autoUpdate: true,
    dataUsage: 'normal',
    caching: true
  },
  parental: {
    enabled: false,
    rating: 'PG-13',
    pin: ''
  },
  about: {
    version: '1.0.0',
    build: 'WebOS-2024.1',
    lastUpdate: new Date().toLocaleDateString()
  }
};

const SettingsPage: React.FC<SettingsPageProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState('video');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const { registerElement } = useRemoteNavigation();

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('tatakai-tv-settings');
      if (savedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    try {
      localStorage.setItem('tatakai-tv-settings', JSON.stringify(settings));
      setHasUnsavedChanges(false);
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  // Reset settings to defaults
  const resetSettings = () => {
    setSettings(defaultSettings);
    setHasUnsavedChanges(true);
  };

  const updateSetting = (category: keyof AppSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Handle remote control navigation
  useEffect(() => {
    const handleRemoteKey = (event: KeyboardEvent) => {
      switch (event.keyCode) {
        case REMOTE_KEYS.BACK:
          event.preventDefault();
          if (hasUnsavedChanges) {
            // Could show confirmation dialog here
          }
          onClose?.();
          break;
        case REMOTE_KEYS.RED:
          saveSettings();
          break;
        case REMOTE_KEYS.GREEN:
          resetSettings();
          break;
      }
    };

    window.addEventListener('keydown', handleRemoteKey);
    return () => window.removeEventListener('keydown', handleRemoteKey);
  }, [hasUnsavedChanges, onClose]);

  const tabData = [
    { id: 'video', label: 'Video', icon: Monitor },
    { id: 'audio', label: 'Audio', icon: Volume2 },
    { id: 'display', label: 'Display', icon: Settings },
    { id: 'network', label: 'Network', icon: Globe },
    { id: 'parental', label: 'Parental', icon: Shield },
    { id: 'about', label: 'About', icon: Info }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-tv-md">
      <div className="max-w-6xl mx-auto space-y-tv-lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-tv-md">
            <Settings className="w-8 h-8 text-primary" />
            <h1 className="text-tv-2xl font-bold">Settings</h1>
            {hasUnsavedChanges && (
              <Badge variant="secondary" className="text-tv-sm">Unsaved Changes</Badge>
            )}
          </div>
          <div className="flex items-center space-x-tv-sm">
            <Button
              variant="outline"
              size="lg"
              onClick={saveSettings}
              disabled={!hasUnsavedChanges}
              className="h-12"
            >
              Save Changes
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onClose}
              className="h-12"
            >
              Close
            </Button>
          </div>
        </motion.div>

        {/* Settings Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 h-16">
              {tabData.map(({ id, label, icon: Icon }) => (
                <TabsTrigger key={id} value={id} className="h-12 text-tv-sm">
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Video Settings */}
            <TabsContent value="video" className="mt-tv-lg">
              <Card>
                <CardHeader>
                  <CardTitle className="text-tv-lg">Video Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-tv-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-tv-md">
                    <div className="space-y-tv-sm">
                      <label className="text-tv-sm font-medium">Video Quality</label>
                      <div className="flex space-x-tv-xs">
                        {['auto', '1080p', '720p', '480p'].map((quality) => (
                          <Button
                            key={quality}
                            variant={settings.video.quality === quality ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateSetting('video', 'quality', quality)}
                            className="h-10"
                          >
                            {quality}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-tv-sm">
                      <label className="text-tv-sm font-medium">Playback Speed</label>
                      <div className="flex space-x-tv-xs">
                        {['0.5', '1.0', '1.25', '1.5', '2.0'].map((speed) => (
                          <Button
                            key={speed}
                            variant={settings.video.playbackSpeed === speed ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateSetting('video', 'playbackSpeed', speed)}
                            className="h-10"
                          >
                            {speed}x
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-tv-sm">
                      <label className="text-tv-sm font-medium">Auto-play Next Episode</label>
                      <Button
                        variant={settings.video.autoplay ? 'default' : 'outline'}
                        onClick={() => updateSetting('video', 'autoplay', !settings.video.autoplay)}
                        className="h-10"
                      >
                        {settings.video.autoplay ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>

                    <div className="space-y-tv-sm">
                      <label className="text-tv-sm font-medium">Subtitles</label>
                      <Button
                        variant={settings.video.subtitles ? 'default' : 'outline'}
                        onClick={() => updateSetting('video', 'subtitles', !settings.video.subtitles)}
                        className="h-10"
                      >
                        {settings.video.subtitles ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audio Settings */}
            <TabsContent value="audio" className="mt-tv-lg">
              <Card>
                <CardHeader>
                  <CardTitle className="text-tv-lg">Audio Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-tv-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-tv-md">
                    <div className="space-y-tv-sm">
                      <label className="text-tv-sm font-medium">Audio Language</label>
                      <div className="flex space-x-tv-xs">
                        {['japanese', 'english', 'both'].map((lang) => (
                          <Button
                            key={lang}
                            variant={settings.audio.language === lang ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateSetting('audio', 'language', lang)}
                            className="h-10"
                          >
                            {lang.charAt(0).toUpperCase() + lang.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-tv-sm">
                      <label className="text-tv-sm font-medium">Surround Sound</label>
                      <Button
                        variant={settings.audio.surround ? 'default' : 'outline'}
                        onClick={() => updateSetting('audio', 'surround', !settings.audio.surround)}
                        className="h-10"
                      >
                        {settings.audio.surround ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Display Settings */}
            <TabsContent value="display" className="mt-tv-lg">
              <Card>
                <CardHeader>
                  <CardTitle className="text-tv-lg">Display Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-tv-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-tv-md">
                    <div className="space-y-tv-sm">
                      <label className="text-tv-sm font-medium">Theme</label>
                      <div className="flex space-x-tv-xs">
                        {['dark', 'light'].map((theme) => (
                          <Button
                            key={theme}
                            variant={settings.display.theme === theme ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateSetting('display', 'theme', theme)}
                            className="h-10"
                          >
                            {theme.charAt(0).toUpperCase() + theme.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-tv-sm">
                      <label className="text-tv-sm font-medium">Font Size</label>
                      <div className="flex space-x-tv-xs">
                        {['small', 'medium', 'large'].map((size) => (
                          <Button
                            key={size}
                            variant={settings.display.fontSize === size ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateSetting('display', 'fontSize', size)}
                            className="h-10"
                          >
                            {size.charAt(0).toUpperCase() + size.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-tv-sm">
                      <label className="text-tv-sm font-medium">Reduce Motion</label>
                      <Button
                        variant={settings.display.motionReduction ? 'default' : 'outline'}
                        onClick={() => updateSetting('display', 'motionReduction', !settings.display.motionReduction)}
                        className="h-10"
                      >
                        {settings.display.motionReduction ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Network Settings */}
            <TabsContent value="network" className="mt-tv-lg">
              <Card>
                <CardHeader>
                  <CardTitle className="text-tv-lg">Network Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-tv-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-tv-md">
                    <div className="space-y-tv-sm">
                      <label className="text-tv-sm font-medium">Auto Update</label>
                      <Button
                        variant={settings.network.autoUpdate ? 'default' : 'outline'}
                        onClick={() => updateSetting('network', 'autoUpdate', !settings.network.autoUpdate)}
                        className="h-10"
                      >
                        {settings.network.autoUpdate ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>

                    <div className="space-y-tv-sm">
                      <label className="text-tv-sm font-medium">Data Usage</label>
                      <div className="flex space-x-tv-xs">
                        {['low', 'normal', 'high'].map((usage) => (
                          <Button
                            key={usage}
                            variant={settings.network.dataUsage === usage ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateSetting('network', 'dataUsage', usage)}
                            className="h-10"
                          >
                            {usage.charAt(0).toUpperCase() + usage.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-tv-sm">
                      <label className="text-tv-sm font-medium">Video Caching</label>
                      <Button
                        variant={settings.network.caching ? 'default' : 'outline'}
                        onClick={() => updateSetting('network', 'caching', !settings.network.caching)}
                        className="h-10"
                      >
                        {settings.network.caching ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Parental Controls */}
            <TabsContent value="parental" className="mt-tv-lg">
              <Card>
                <CardHeader>
                  <CardTitle className="text-tv-lg">Parental Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-tv-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-tv-md">
                    <div className="space-y-tv-sm">
                      <label className="text-tv-sm font-medium">Parental Controls</label>
                      <Button
                        variant={settings.parental.enabled ? 'default' : 'outline'}
                        onClick={() => updateSetting('parental', 'enabled', !settings.parental.enabled)}
                        className="h-10"
                      >
                        {settings.parental.enabled ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>

                    <div className="space-y-tv-sm">
                      <label className="text-tv-sm font-medium">Content Rating</label>
                      <div className="flex space-x-tv-xs">
                        {['G', 'PG', 'PG-13', 'R'].map((rating) => (
                          <Button
                            key={rating}
                            variant={settings.parental.rating === rating ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateSetting('parental', 'rating', rating)}
                            className="h-10"
                            disabled={!settings.parental.enabled}
                          >
                            {rating}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-tv-md border-t">
                    <p className="text-tv-sm text-muted-foreground">
                      <Shield className="w-4 h-4 inline mr-1" />
                      Parental controls help restrict access to age-inappropriate content.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* About */}
            <TabsContent value="about" className="mt-tv-lg">
              <Card>
                <CardHeader>
                  <CardTitle className="text-tv-lg">About Tatakai TV</CardTitle>
                </CardHeader>
                <CardContent className="space-y-tv-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-tv-md">
                    <div className="space-y-tv-sm">
                      <label className="text-tv-sm font-medium">Version</label>
                      <div className="flex items-center space-x-tv-sm">
                        <Badge variant="secondary" className="text-tv-sm">
                          {settings.about.version}
                        </Badge>
                        <Badge variant="outline" className="text-tv-sm">
                          {settings.about.build}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-tv-sm">
                      <label className="text-tv-sm font-medium">Last Updated</label>
                      <Badge variant="outline" className="text-tv-sm">
                        {settings.about.lastUpdate}
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-tv-md border-t space-y-tv-sm">
                    <h4 className="font-semibold">System Information</h4>
                    <div className="grid grid-cols-2 gap-tv-sm text-tv-sm">
                      <div>Platform: WebOS TV</div>
                      <div>Framework: React + TypeScript</div>
                      <div>Video Player: HLS.js</div>
                      <div>UI Framework: Tailwind CSS</div>
                    </div>
                  </div>

                  <div className="pt-tv-md border-t">
                    <div className="flex space-x-tv-sm">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.reload()}
                        className="h-10"
                      >
                        Refresh App
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetSettings}
                        className="h-10"
                      >
                        Reset All Settings
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* TV Remote Hints */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-tv-md left-tv-md right-tv-md"
        >
          <div className="bg-card/90 backdrop-blur-sm rounded-lg p-tv-sm border">
            <div className="flex justify-center space-x-tv-lg text-tv-sm text-muted-foreground">
              <span>🔴 Save Settings</span>
              <span>🟢 Reset All</span>
              <span>BACK Exit</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
