import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useSmartTV } from "@/hooks/useSmartTV";
import { useTheme } from "@/hooks/useTheme";
import { useMaintenanceMode } from "@/hooks/useAdminMessages";
import Index from "./pages/Index";
import AnimePage from "./pages/AnimePage";
import WatchPage from "./pages/WatchPage";
import SearchPage from "./pages/SearchPage";
import GenrePage from "./pages/GenrePage";
import TrendingPage from "./pages/TrendingPage";
import FavoritesPage from "./pages/FavoritesPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import SettingsPage from "./pages/SettingsPage";
import StatusPage from "./pages/StatusPage";
import NotFound from "./pages/NotFound";
import MaintenancePage from "./pages/MaintenancePage";
import ServiceUnavailablePage from "./pages/ServiceUnavailablePage";
import BannedPage from "./pages/BannedPage";
import ErrorPage from "./pages/ErrorPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected route wrapper that checks for banned users and maintenance mode
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isBanned, isAdmin, isLoading } = useAuth();
  const { isMaintenanceMode } = useMaintenanceMode();
  const location = useLocation();

  // Banned users can only access /banned and /auth
  const bannedAllowedPaths = ['/banned', '/auth'];
  const isBannedAllowedPath = bannedAllowedPaths.some(path => location.pathname.startsWith(path));

  // Allow access to certain pages regardless of status
  const publicPaths = ['/banned', '/maintenance', '/auth', '/error'];
  const isPublicPath = publicPaths.some(path => location.pathname.startsWith(path));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect banned users to banned page (only allow /banned and /auth)
  if (isBanned && !isBannedAllowedPath) {
    return <Navigate to="/banned" replace />;
  }

  // Redirect to maintenance page if active (admins can still access)
  if (isMaintenanceMode && !isAdmin && !isPublicPath) {
    return <Navigate to="/maintenance" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  // Initialize theme and smart TV detection
  useTheme();
  const { isSmartTV, platform } = useSmartTV();

  useEffect(() => {
    if (isSmartTV) {
      console.log(`Smart TV detected: ${platform}`);
    }
  }, [isSmartTV, platform]);

  return (
    <>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/banned" element={<BannedPage />} />
          <Route path="/503" element={<ServiceUnavailablePage />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/anime/:animeId" element={<ProtectedRoute><AnimePage /></ProtectedRoute>} />
          <Route path="/watch/:episodeId" element={<ProtectedRoute><WatchPage /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
          <Route path="/genre/:genre" element={<ProtectedRoute><GenrePage /></ProtectedRoute>} />
          <Route path="/trending" element={<ProtectedRoute><TrendingPage /></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/status" element={<ProtectedRoute><StatusPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
