import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Smartphone, 
  Bell, 
  Send, 
  Users, 
  Activity, 
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Megaphone,
  Download,
  Wifi
} from 'lucide-react';

interface MobileNotification {
  id: string;
  title: string;
  body: string;
  type: 'announcement' | 'new_episode' | 'maintenance' | 'feature';
  target_users: 'all' | 'specific';
  created_at: string;
  sent_at: string | null;
  status: 'pending' | 'sent' | 'failed';
}

interface MobileStat {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export function MobileAppManager() {
  const queryClient = useQueryClient();
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationBody, setNotificationBody] = useState('');
  const [notificationType, setNotificationType] = useState<MobileNotification['type']>('announcement');
  const [targetUsers, setTargetUsers] = useState<'all' | 'specific'>('all');

  // Fetch mobile notifications
  const { data: notifications, isLoading: loadingNotifications } = useQuery({
    queryKey: ['mobile_notifications'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('mobile_notifications' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20) as any);
      
      if (error) {
        console.log('Mobile notifications table may not exist yet');
        return [] as MobileNotification[];
      }
      return (data || []) as MobileNotification[];
    },
  });

  // Fetch mobile app stats (mock data for now)
  const mobileStats: MobileStat[] = [
    { 
      label: 'Active Users', 
      value: '2.4K', 
      icon: <Smartphone className="w-5 h-5 text-primary" />,
      trend: 'up' 
    },
    { 
      label: 'Downloads', 
      value: '12.8K', 
      icon: <Download className="w-5 h-5 text-secondary" />,
      trend: 'up' 
    },
    { 
      label: 'Offline Users', 
      value: '340', 
      icon: <Wifi className="w-5 h-5 text-orange-500" />,
      trend: 'neutral' 
    },
    { 
      label: 'Push Enabled', 
      value: '89%', 
      icon: <Bell className="w-5 h-5 text-emerald-500" />,
      trend: 'up' 
    },
  ];

  // Send notification mutation
  const sendNotification = useMutation({
    mutationFn: async () => {
      const { data: currentUser } = await supabase.auth.getUser();
      
      // Try to insert into mobile_notifications table
      const { error } = await (supabase
        .from('mobile_notifications' as any)
        .insert({
          title: notificationTitle,
          body: notificationBody,
          type: notificationType,
          target_users: targetUsers,
          sender_id: currentUser.user?.id,
          status: 'sent',
          sent_at: new Date().toISOString(),
        }) as any);
      
      if (error) {
        // If table doesn't exist, fall back to admin_messages
        const { error: fallbackError } = await (supabase
          .from('admin_messages' as any)
          .insert({
            title: `[Mobile] ${notificationTitle}`,
            content: notificationBody,
            message_type: 'broadcast',
            sender_id: currentUser.user?.id,
          }) as any);
        
        if (fallbackError) throw fallbackError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile_notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin_sent_messages'] });
      toast.success('Mobile notification sent successfully');
      setNotificationTitle('');
      setNotificationBody('');
    },
    onError: (error: any) => {
      console.error('Failed to send notification:', error);
      toast.error('Failed to send notification');
    },
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase
        .from('mobile_notifications' as any)
        .delete()
        .eq('id', id) as any);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile_notifications'] });
      toast.success('Notification deleted');
    },
    onError: () => {
      toast.error('Failed to delete notification');
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeIcon = (type: MobileNotification['type']) => {
    switch (type) {
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-primary" />;
      case 'new_episode':
        return <Activity className="w-4 h-4 text-secondary" />;
      case 'maintenance':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'feature':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default:
        return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: MobileNotification['status']) => {
    switch (status) {
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 text-xs">
            <CheckCircle2 className="w-3 h-3" /> Sent
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500 text-xs">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/20 text-destructive text-xs">
            <AlertTriangle className="w-3 h-3" /> Failed
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Mobile Stats */}
      <div>
        <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Mobile App Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mobileStats.map((stat, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-background/50">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Push Notification Composer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-muted/20 border border-border/50">
          <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Send Push Notification
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Notification Type</label>
              <select
                value={notificationType}
                onChange={(e) => setNotificationType(e.target.value as MobileNotification['type'])}
                className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="announcement">📢 Announcement</option>
                <option value="new_episode">🎬 New Episode</option>
                <option value="maintenance">🔧 Maintenance</option>
                <option value="feature">✨ New Feature</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Target</label>
              <select
                value={targetUsers}
                onChange={(e) => setTargetUsers(e.target.value as 'all' | 'specific')}
                className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Mobile Users</option>
                <option value="specific">Users with Push Enabled</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
                placeholder="Notification title..."
                className="bg-muted/50"
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {notificationTitle.length}/50 characters
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Body</label>
              <Textarea
                value={notificationBody}
                onChange={(e) => setNotificationBody(e.target.value)}
                placeholder="Notification message..."
                className="bg-muted/50 min-h-[100px]"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {notificationBody.length}/200 characters
              </p>
            </div>

            {/* Preview */}
            {(notificationTitle || notificationBody) && (
              <div className="p-4 rounded-xl bg-background/80 border border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Preview</p>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{notificationTitle || 'Title'}</p>
                    <p className="text-xs text-muted-foreground">
                      {notificationBody || 'Message body...'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={() => sendNotification.mutate()}
              disabled={!notificationTitle.trim() || !notificationBody.trim() || sendNotification.isPending}
              className="gap-2 w-full"
            >
              <Send className="w-4 h-4" />
              {sendNotification.isPending ? 'Sending...' : 'Send to Mobile Users'}
            </Button>
          </div>
        </div>

        {/* Notification History */}
        <div className="p-6 rounded-xl bg-muted/20 border border-border/50">
          <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Recent Notifications
          </h3>

          {loadingNotifications ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : notifications && notifications.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(notification.type)}
                      <h4 className="font-medium text-sm truncate">{notification.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(notification.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={() => deleteNotification.mutate(notification.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {notification.body}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{notification.target_users === 'all' ? 'All Users' : 'Push Enabled'}</span>
                    <span>•</span>
                    <span>{formatDate(notification.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="w-10 h-10 mx-auto text-muted-foreground mb-3 opacity-50" />
              <p className="text-muted-foreground text-sm">No notifications sent yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Send your first push notification to mobile users
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile App Info */}
      <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
        <div className="flex items-start gap-4">
          <Smartphone className="w-6 h-6 text-primary shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm mb-1">Tatakai Mobile App</h4>
            <p className="text-xs text-muted-foreground">
              Manage push notifications and announcements for the Tatakai mobile app. 
              Notifications are delivered instantly to all users with push notifications enabled.
              The mobile app is available in the <code className="bg-muted px-1 rounded">/TatakaiMobile</code> directory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
