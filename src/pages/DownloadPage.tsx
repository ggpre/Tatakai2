import { Background } from '@/components/layout/Background';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Smartphone, Monitor, Clock, Sparkles, Zap, Shield, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function DownloadPage() {
  const navigate = useNavigate();

  const apps = [
    {
      platform: 'Android',
      icon: Smartphone,
      description: 'Download Tatakai for Android devices',
      version: 'Coming Soon',
      tagline: 'Anime on the go, anywhere you are',
      features: [
        { icon: Download, text: 'Offline downloads', highlight: true },
        { icon: Zap, text: 'Lightning-fast streaming' },
        { icon: Shield, text: 'Ad-free experience' },
        { icon: Sparkles, text: 'Picture-in-picture mode' }
      ],
      available: false,
      gradient: 'from-green-500 via-emerald-500 to-teal-600',
      glowColor: 'rgba(34, 197, 94, 0.4)',
      accentColor: 'text-green-400'
    },
    {
      platform: 'Windows',
      icon: Monitor,
      description: 'Download Tatakai for Windows PC',
      version: 'Coming Soon',
      tagline: 'Desktop power meets streaming excellence',
      features: [
        { icon: Rocket, text: 'Hardware acceleration', highlight: true },
        { icon: Zap, text: 'Keyboard shortcuts' },
        { icon: Shield, text: 'Enhanced privacy mode' },
        { icon: Sparkles, text: 'Multi-window support' }
      ],
      available: false,
      gradient: 'from-blue-500 via-cyan-500 to-indigo-600',
      glowColor: 'rgba(59, 130, 246, 0.4)',
      accentColor: 'text-blue-400'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Background />
      <Sidebar />

      <main className="relative z-10 pl-6 md:pl-32 pr-6 py-6 max-w-[1400px] mx-auto pb-24 md:pb-6">
        {/* Floating Background Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Header */}
        <div className="relative z-10">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </motion.button>

          {/* Hero Section */}
          <div className="text-center mb-16 relative">
            {/* Animated Download Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="inline-block mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-3xl blur-2xl opacity-50 animate-pulse" />
                <div className="relative p-6 bg-gradient-to-br from-primary to-secondary rounded-3xl shadow-2xl">
                  <Download className="w-16 h-16 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]"
            >
              Download Tatakai
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed"
            >
              Take your anime experience with you. Native apps for Android and Windows are{' '}
              <span className="relative inline-block">
                <span className="relative z-10 font-semibold text-foreground">coming soon!</span>
                <span className="absolute bottom-1 left-0 w-full h-2 bg-primary/20 -rotate-1" />
              </span>
            </motion.p>

            {/* Coming Soon Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 backdrop-blur-sm"
            >
              <Clock className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-amber-400 font-semibold">In Active Development</span>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </motion.div>
          </div>

          {/* Apps Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {apps.map((app, index) => (
              <motion.div
                key={app.platform}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.2 }}
              >
                <GlassPanel className="group hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
                  {/* Animated Glow Effect */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${app.glowColor}, transparent 70%)`
                    }}
                  />
                  
                  <div className="relative p-8">
                    {/* Platform Header with Icon */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-6">
                        <motion.div 
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                          className={`p-5 rounded-3xl bg-gradient-to-br ${app.gradient} shadow-2xl relative`}
                        >
                          <div className="absolute inset-0 rounded-3xl bg-white/20 blur-xl" />
                          <app.icon className="relative w-12 h-12 text-white" />
                        </motion.div>
                        <div>
                          <h2 className="font-display text-3xl font-bold mb-2">{app.platform}</h2>
                          <p className={`text-sm font-medium ${app.accentColor}`}>{app.tagline}</p>
                        </div>
                      </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 gap-3 mb-8">
                      {app.features.map((feature, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + idx * 0.1 }}
                          className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                            feature.highlight 
                              ? `bg-gradient-to-r ${app.gradient} bg-opacity-10 border border-white/10` 
                              : 'bg-muted/30 hover:bg-muted/50'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${feature.highlight ? 'bg-white/10' : 'bg-muted'}`}>
                            <feature.icon className={`w-5 h-5 ${feature.highlight ? 'text-white' : 'text-foreground'}`} />
                          </div>
                          <span className={`font-medium ${feature.highlight ? 'text-white' : ''}`}>
                            {feature.text}
                          </span>
                          {feature.highlight && (
                            <Sparkles className="w-4 h-4 text-yellow-400 ml-auto" />
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {/* Download Button */}
                    <Button
                      disabled={!app.available}
                      className={`w-full h-14 text-lg font-bold bg-gradient-to-r ${app.gradient} hover:shadow-2xl transition-all duration-300 relative overflow-hidden group/btn`}
                      size="lg"
                    >
                      <span className="absolute inset-0 bg-white/0 group-hover/btn:bg-white/10 transition-colors duration-300" />
                      <Clock className="w-6 h-6 mr-3 relative z-10" />
                      <span className="relative z-10">Coming Soon to {app.platform}</span>
                    </Button>
                  </div>
                </GlassPanel>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <GlassPanel className="p-10 text-center relative overflow-hidden">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-1/4 w-32 h-32 bg-primary rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-secondary rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              </div>

              <div className="relative z-10">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="inline-block mb-4"
                >
                  <Rocket className="w-12 h-12 text-primary" />
                </motion.div>
                
                <h3 className="font-display text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Stay in the Loop
                </h3>
                <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
                  Be the first to experience the future of anime streaming. Our native apps are being crafted with love and attention to detail.
                </p>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 backdrop-blur-sm border border-primary/20"
                  >
                    <span className="font-semibold text-primary flex items-center gap-2">
                      <Rocket className="w-4 h-4" />
                      In Development
                    </span>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-secondary/20 to-secondary/10 backdrop-blur-sm border border-secondary/20"
                  >
                    <span className="font-semibold text-secondary flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Mobile First
                    </span>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-accent/20 to-accent/10 backdrop-blur-sm border border-accent/20"
                  >
                    <span className="font-semibold flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Secure & Private
                    </span>
                  </motion.div>
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
