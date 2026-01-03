import { LayoutGrid, Search, User, LogIn, Users, Heart, TrendingUp, Settings } from "lucide-react";
import { NavIcon } from "@/components/ui/NavIcon";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isBanned } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-6 left-6 right-6 h-16 bg-card/90 backdrop-blur-2xl border border-border/30 rounded-2xl flex items-center justify-around px-2 z-50 shadow-2xl">
      <NavIcon 
        icon={LayoutGrid} 
        active={isActive("/")} 
        onClick={() => navigate("/")}
      />
      <NavIcon 
        icon={Search} 
        active={isActive("/search")} 
        onClick={() => navigate("/search")}
      />
      
      {/* Favorites/Trending Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="focus:outline-none">
            <NavIcon 
              icon={Heart} 
              active={isActive("/favorites") || isActive("/trending")} 
              onClick={(e) => e.preventDefault()}
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" side="top" className="mb-2">
          <DropdownMenuItem onClick={() => navigate("/favorites")}>
            <Heart className="w-4 h-4 mr-2" />
            Favorites
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/trending")}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Trending
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <NavIcon 
        icon={Users} 
        active={isActive("/community")} 
        onClick={() => navigate("/community")}
      />
      
      {/* Profile/Settings Dropdown */}
      {user && !isBanned ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none">
              <NavIcon 
                icon={User} 
                active={location.pathname.startsWith('/@') || isActive("/profile") || isActive("/settings")} 
                onClick={(e) => e.preventDefault()}
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="mb-2">
            <DropdownMenuItem onClick={() => navigate(profile?.username ? `/@${profile.username}` : '/profile')}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <NavIcon 
          icon={LogIn} 
          active={isActive("/auth")} 
          onClick={() => navigate("/auth")}
        />
      )}
    </div>
  );
}
