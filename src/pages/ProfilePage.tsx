import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Background } from '@/components/layout/Background';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getProxiedImageUrl } from '@/lib/api';
import { 
  User, Settings, List, History, LogOut, Edit2, Save, X, 
  Play, Trash2, Clock, CheckCircle, Eye, Pause, XCircle, ArrowLeft, Camera, Loader2
} from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  watching: { label: 'Watching', icon: <Play className="w-4 h-4" />, color: 'text-primary' },
  completed: { label: 'Completed', icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-500' },
  plan_to_watch: { label: 'Plan to Watch', icon: <Eye className="w-4 h-4" />, color: 'text-amber' },
  on_hold: { label: 'On Hold', icon: <Pause className="w-4 h-4" />, color: 'text-orange' },
  dropped: { label: 'Dropped', icon: <XCircle className="w-4 h-4" />, color: 'text-destructive' },
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile, isAdmin } = useAuth();
  const { data: watchlist, isLoading: loadingWatchlist } = useWatchlist();
  const { data: history, isLoading: loadingHistory } = useWatchHistory();
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when profile loads or changes (even when not editing)
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Add cache-busting query param
      const avatarUrl = `${publicUrl}?t=${Date.now()}`;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      toast.success('Avatar updated!');
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      console.log('Saving profile:', { displayName, username, bio, userId: user.id });
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim() || null,
          username: username.trim() || null,
          bio: bio.trim() || null,
        })
        .eq('user_id', user.id)
        .select()
        .single();
      
      console.log('Update result:', { data, error });
      
      if (error) throw error;
      
      await refreshProfile();
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Profile update error:', error);
      if (error.message?.includes('unique') || error.code === '23505') {
        toast.error('Username is already taken');
      } else {
        toast.error(`Failed to update profile: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast.success('Signed out');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Background />
      <Sidebar />

      <main className="relative z-10 pl-6 md:pl-32 pr-6 py-6 max-w-[1400px] mx-auto pb-24 md:pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          {isAdmin && (
            <Button
              variant="outline"
              onClick={() => navigate('/admin')}
              className="border-primary/50 text-primary"
            >
              Admin Dashboard
            </Button>
          )}
        </div>

        {/* Profile Header */}
        <GlassPanel className="p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Avatar with upload */}
            <div className="relative group">
              <Avatar className="w-24 h-24 md:w-32 md:h-32">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-4xl font-bold">
                  {profile?.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              {/* Upload overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : (
                  <Camera className="w-8 h-8 text-white" />
                )}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            
            {/* Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="bg-muted/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="@username"
                        className="bg-muted/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="bg-muted/50 resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
                      <Save className="w-4 h-4" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="font-display text-2xl md:text-3xl font-bold">
                      {profile?.display_name || 'User'}
                    </h1>
                    {profile?.username && (
                      <span className="text-muted-foreground">@{profile.username}</span>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-4">{user.email}</p>
                  {profile?.bio && (
                    <p className="text-foreground/80 mb-4">{profile.bio}</p>
                  )}
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2">
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </Button>
                    <Button variant="destructive" onClick={handleSignOut} className="gap-2">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </GlassPanel>

        {/* Tabs */}
        <Tabs defaultValue="watchlist" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="watchlist" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <List className="w-4 h-4" />
              Watchlist
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Watchlist Tab */}
          <TabsContent value="watchlist">
            <GlassPanel className="p-6">
              <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
                <List className="w-5 h-5 text-primary" />
                My Watchlist
                <span className="text-sm font-normal text-muted-foreground">
                  ({watchlist?.length || 0} anime)
                </span>
              </h2>
              
              {loadingWatchlist ? (
                <div className="text-center py-12 text-muted-foreground">Loading...</div>
              ) : watchlist && watchlist.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {watchlist.map((item) => {
                    const statusInfo = STATUS_LABELS[item.status || 'plan_to_watch'];
                    return (
                      <div
                        key={item.id}
                        className="group cursor-pointer"
                        onClick={() => navigate(`/anime/${item.anime_id}`)}
                      >
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-2">
                          <img
                            src={getProxiedImageUrl(item.anime_poster || '/placeholder.svg')}
                            alt={item.anime_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg bg-background/80 backdrop-blur-sm flex items-center gap-1 text-xs ${statusInfo?.color}`}>
                            {statusInfo?.icon}
                            {statusInfo?.label}
                          </div>
                        </div>
                        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                          {item.anime_name}
                        </h3>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <List className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Your watchlist is empty</p>
                  <Button onClick={() => navigate('/')} className="mt-4">
                    Browse Anime
                  </Button>
                </div>
              )}
            </GlassPanel>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <GlassPanel className="p-6">
              <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Watch History
              </h2>
              
              {loadingHistory ? (
                <div className="text-center py-12 text-muted-foreground">Loading...</div>
              ) : history && history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/watch/${encodeURIComponent(item.episode_id)}`)}
                    >
                      <img
                        src={getProxiedImageUrl(item.anime_poster || '/placeholder.svg')}
                        alt={item.anime_name}
                        className="w-20 h-28 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium mb-1 line-clamp-1">{item.anime_name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Episode {item.episode_number}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatDate(item.watched_at)}
                        </div>
                        {item.duration_seconds && (
                          <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{
                                width: `${Math.min(100, ((item.progress_seconds || 0) / item.duration_seconds) * 100)}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                      {item.completed && (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No watch history yet</p>
                  <Button onClick={() => navigate('/')} className="mt-4">
                    Start Watching
                  </Button>
                </div>
              )}
            </GlassPanel>
          </TabsContent>
        </Tabs>
      </main>

      <MobileNav />
    </div>
  );
}
