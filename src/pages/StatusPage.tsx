import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Background } from '@/components/layout/Background';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, CheckCircle, XCircle, AlertTriangle, 
  RefreshCw, Server, Database, Wifi, Film, Globe, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down' | 'checking';
  latency?: number;
  icon: React.ReactNode;
  description: string;
}

export default function StatusPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'API Server', status: 'checking', icon: <Server className="w-5 h-5" />, description: 'Main API endpoint' },
    { name: 'Video Streaming', status: 'checking', icon: <Film className="w-5 h-5" />, description: 'Video delivery network' },
    { name: 'Database', status: 'checking', icon: <Database className="w-5 h-5" />, description: 'User data storage' },
    { name: 'CDN', status: 'checking', icon: <Globe className="w-5 h-5" />, description: 'Content delivery' },
    { name: 'Authentication', status: 'checking', icon: <Wifi className="w-5 h-5" />, description: 'Login services' },
  ]);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkServices = async () => {
    setIsRefreshing(true);
    
    // Simulate checking each service
    const updatedServices = [...services];
    
    for (let i = 0; i < updatedServices.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Simulate realistic status checks
      const random = Math.random();
      let status: ServiceStatus['status'] = 'operational';
      let latency = Math.floor(Math.random() * 100) + 20;
      
      if (random < 0.05) status = 'down';
      else if (random < 0.15) {
        status = 'degraded';
        latency = Math.floor(Math.random() * 500) + 200;
      }
      
      updatedServices[i] = { ...updatedServices[i], status, latency };
      setServices([...updatedServices]);
    }
    
    setLastChecked(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    checkServices();
  }, []);

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'down':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin" />;
    }
  };

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational':
        return 'bg-green-500/20 border-green-500/50';
      case 'degraded':
        return 'bg-amber-500/20 border-amber-500/50';
      case 'down':
        return 'bg-red-500/20 border-red-500/50';
      default:
        return 'bg-muted/50 border-border/50';
    }
  };

  const overallStatus = services.some(s => s.status === 'down') 
    ? 'Major Outage' 
    : services.some(s => s.status === 'degraded')
    ? 'Partial Outage'
    : services.some(s => s.status === 'checking')
    ? 'Checking...'
    : 'All Systems Operational';

  const overallColor = services.some(s => s.status === 'down')
    ? 'from-red-500 to-red-700'
    : services.some(s => s.status === 'degraded')
    ? 'from-amber-500 to-amber-700'
    : 'from-green-500 to-green-700';

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Background />
      <Sidebar />

      <main className="relative z-10 pl-6 md:pl-32 pr-6 py-6 max-w-[1400px] mx-auto pb-24 md:pb-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>

        {/* Overall Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassPanel className={`p-8 mb-8 bg-gradient-to-r ${overallColor} border-0`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {services.some(s => s.status === 'checking') ? (
                  <RefreshCw className="w-10 h-10 animate-spin" />
                ) : services.some(s => s.status === 'down') ? (
                  <XCircle className="w-10 h-10" />
                ) : services.some(s => s.status === 'degraded') ? (
                  <AlertTriangle className="w-10 h-10" />
                ) : (
                  <CheckCircle className="w-10 h-10" />
                )}
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold">{overallStatus}</h1>
                  <p className="text-white/80">System Status Dashboard</p>
                </div>
              </div>
              <Button
                onClick={checkServices}
                disabled={isRefreshing}
                variant="secondary"
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </GlassPanel>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {services.map((service, index) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <GlassPanel className={`p-6 border ${getStatusColor(service.status)}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-muted/50">
                      {service.icon}
                    </div>
                    <div>
                      <h3 className="font-medium">{service.name}</h3>
                      <p className="text-xs text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                  {getStatusIcon(service.status)}
                </div>
                {service.latency && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Response time</span>
                    <span className={service.latency > 200 ? 'text-amber-500' : 'text-green-500'}>
                      {service.latency}ms
                    </span>
                  </div>
                )}
              </GlassPanel>
            </motion.div>
          ))}
        </div>

        {/* Last Checked */}
        <GlassPanel className="p-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            Last checked: {lastChecked.toLocaleTimeString()}
          </div>
        </GlassPanel>

        {/* Incident History */}
        <div className="mt-8">
          <h2 className="font-display text-xl font-semibold mb-4">Recent Incidents</h2>
          <GlassPanel className="p-6">
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p>No incidents reported in the last 30 days</p>
            </div>
          </GlassPanel>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
