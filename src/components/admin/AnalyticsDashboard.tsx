import { useState, useEffect } from 'react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Users, Eye, Play, Clock, 
  BarChart3, PieChart, Activity, Calendar, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface DailyStats {
  date: string;
  users: number;
  comments: number;
  ratings: number;
}

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  // Fetch total users count
  const { data: totalUsers } = useQuery({
    queryKey: ['analytics_total_users'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch total comments count
  const { data: totalComments } = useQuery({
    queryKey: ['analytics_total_comments'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch total ratings count
  const { data: totalRatings } = useQuery({
    queryKey: ['analytics_total_ratings'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('ratings')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch total watchlist items
  const { data: totalWatchlist } = useQuery({
    queryKey: ['analytics_total_watchlist'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('watchlist')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch new users in time range
  const { data: newUsersInRange } = useQuery({
    queryKey: ['analytics_new_users', timeRange],
    queryFn: async () => {
      const days = timeRange === 'day' ? 1 : timeRange === 'week' ? 7 : 30;
      const startDate = subDays(new Date(), days).toISOString();
      
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate);
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch daily stats for chart
  const { data: dailyStats } = useQuery({
    queryKey: ['analytics_daily_stats', timeRange],
    queryFn: async () => {
      const days = timeRange === 'day' ? 1 : timeRange === 'week' ? 7 : 30;
      const stats: DailyStats[] = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayStart = startOfDay(date).toISOString();
        const dayEnd = endOfDay(date).toISOString();
        
        const [usersResult, commentsResult, ratingsResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', dayStart)
            .lte('created_at', dayEnd),
          supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', dayStart)
            .lte('created_at', dayEnd),
          supabase
            .from('ratings')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', dayStart)
            .lte('created_at', dayEnd),
        ]);

        stats.push({
          date: format(date, timeRange === 'day' ? 'HH:mm' : 'MMM dd'),
          users: usersResult.count || 0,
          comments: commentsResult.count || 0,
          ratings: ratingsResult.count || 0,
        });
      }
      
      return stats;
    },
  });

  // Fetch top rated anime
  const { data: topAnime } = useQuery({
    queryKey: ['analytics_top_anime'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ratings')
        .select('anime_id, rating')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      // Aggregate by anime_id
      const animeStats = new Map<string, { totalRating: number; count: number }>();
      data?.forEach(r => {
        const existing = animeStats.get(r.anime_id) || { totalRating: 0, count: 0 };
        animeStats.set(r.anime_id, {
          totalRating: existing.totalRating + r.rating,
          count: existing.count + 1,
        });
      });
      
      return Array.from(animeStats.entries())
        .map(([anime_id, stats]) => ({
          name: anime_id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          avgRating: (stats.totalRating / stats.count).toFixed(1),
          totalRatings: stats.count,
        }))
        .sort((a, b) => parseFloat(b.avgRating) - parseFloat(a.avgRating))
        .slice(0, 5);
    },
  });

  // Fetch watchlist status distribution
  const { data: watchlistStats } = useQuery({
    queryKey: ['analytics_watchlist_stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('watchlist')
        .select('status');
      
      if (error) throw error;
      
      const statusCount = new Map<string, number>();
      data?.forEach(w => {
        const status = w.status || 'plan_to_watch';
        statusCount.set(status, (statusCount.get(status) || 0) + 1);
      });
      
      const colors = {
        'plan_to_watch': 'hsl(var(--primary))',
        'watching': 'hsl(var(--secondary))',
        'completed': 'hsl(var(--accent))',
        'dropped': 'hsl(var(--destructive))',
      };
      
      return Array.from(statusCount.entries()).map(([name, value]) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value,
        color: colors[name as keyof typeof colors] || 'hsl(var(--muted-foreground))',
      }));
    },
  });

  // Fetch recent activity (comments per hour today)
  const { data: hourlyActivity } = useQuery({
    queryKey: ['analytics_hourly_activity'],
    queryFn: async () => {
      const today = startOfDay(new Date()).toISOString();
      const { data, error } = await supabase
        .from('comments')
        .select('created_at')
        .gte('created_at', today);
      
      if (error) throw error;
      
      const hourCounts = new Array(24).fill(0);
      data?.forEach(c => {
        const hour = new Date(c.created_at).getHours();
        hourCounts[hour]++;
      });
      
      return hourCounts.map((activity, i) => ({
        hour: `${i.toString().padStart(2, '0')}:00`,
        activity,
      }));
    },
  });

  const statCards = [
    {
      title: 'Total Users',
      value: totalUsers?.toLocaleString() || '0',
      change: newUsersInRange ? `+${newUsersInRange} new` : '+0 new',
      isPositive: true,
      icon: <Users className="w-5 h-5" />,
      color: 'from-blue-500 to-blue-700',
    },
    {
      title: 'Total Comments',
      value: totalComments?.toLocaleString() || '0',
      change: 'All time',
      isPositive: true,
      icon: <Activity className="w-5 h-5" />,
      color: 'from-green-500 to-green-700',
    },
    {
      title: 'Total Ratings',
      value: totalRatings?.toLocaleString() || '0',
      change: 'All time',
      isPositive: true,
      icon: <Eye className="w-5 h-5" />,
      color: 'from-purple-500 to-purple-700',
    },
    {
      title: 'Watchlist Items',
      value: totalWatchlist?.toLocaleString() || '0',
      change: 'All time',
      isPositive: true,
      icon: <Clock className="w-5 h-5" />,
      color: 'from-orange-500 to-orange-700',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Analytics Overview
        </h2>
        <div className="flex gap-2 bg-muted/50 p-1 rounded-xl">
          {(['day', 'week', 'month'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === range 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassPanel className={`p-5 bg-gradient-to-br ${stat.color} border-0`}>
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-xl bg-white/20">
                  {stat.icon}
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  stat.isPositive ? 'text-green-200' : 'text-red-200'
                }`}>
                  {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-white/70">{stat.title}</p>
              </div>
            </GlassPanel>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <GlassPanel className="p-6">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Daily Activity
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyStats || []}>
                <defs>
                  <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="commentsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="hsl(var(--primary))"
                  fill="url(#usersGradient)"
                  strokeWidth={2}
                  name="New Users"
                />
                <Area
                  type="monotone"
                  dataKey="comments"
                  stroke="hsl(var(--secondary))"
                  fill="url(#commentsGradient)"
                  strokeWidth={2}
                  name="Comments"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        {/* Watchlist Stats */}
        <GlassPanel className="p-6">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-primary" />
            Watchlist Distribution
          </h3>
          <div className="h-64 flex items-center">
            {watchlistStats && watchlistStats.length > 0 ? (
              <>
                <ResponsiveContainer width="60%" height="100%">
                  <RePieChart>
                    <Pie
                      data={watchlistStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {watchlistStats.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {watchlistStats.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm text-muted-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full text-center text-muted-foreground">No watchlist data yet</div>
            )}
          </div>
        </GlassPanel>
      </div>

      {/* Top Anime */}
      <GlassPanel className="p-6">
        <h3 className="font-medium mb-4 flex items-center gap-2">
          <Play className="w-4 h-4 text-primary" />
          Top Rated Anime
        </h3>
        {topAnime && topAnime.length > 0 ? (
          <div className="space-y-4">
            {topAnime.map((anime, index) => (
              <motion.div
                key={anime.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center font-bold text-primary">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium truncate">{anime.name}</p>
                  <div className="w-full h-2 bg-muted rounded-full mt-1 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(parseFloat(anime.avgRating) / 10) * 100}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{anime.avgRating}/10</p>
                  <p className="text-xs text-muted-foreground">{anime.totalRatings} ratings</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">No ratings data yet</div>
        )}
      </GlassPanel>

      {/* Hourly Activity */}
      <GlassPanel className="p-6">
        <h3 className="font-medium mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Today's Hourly Activity
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyActivity || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="hour" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={10}
                interval={2}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Bar 
                dataKey="activity" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
                name="Comments"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassPanel>
    </div>
  );
}