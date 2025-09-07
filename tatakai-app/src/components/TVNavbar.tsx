'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useNavigation } from '@/contexts/NavigationContext';
import Image from 'next/image';
import { 
  Home, 
  Search, 
  Film, 
  Tv, 
  Clock, 
  TrendingUp, 
  User, 
  Settings,
  ChevronRight
} from 'lucide-react';

const TVNavbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const { registerElement, unregisterElement } = useNavigation();
  
  // Refs for navigation elements
  const logoRef = useRef<HTMLButtonElement>(null);

  const navigationItems = [
    { name: 'Home', href: '/tv', icon: Home, id: 'nav-home' },
    { name: 'Search', href: '/tv/search', icon: Search, id: 'nav-search' },
    { name: 'Movies', href: '/tv/movies', icon: Film, id: 'nav-movies' },
    { name: 'TV Series', href: '/tv/tv-series', icon: Tv, id: 'nav-tv-series' },
    { name: 'Recently Added', href: '/tv/recently', icon: Clock, id: 'nav-recent' },
    { name: 'Trending', href: '/trending', icon: TrendingUp, id: 'nav-trending' },
    { name: 'Profile', href: '/profile', icon: User, id: 'nav-profile' },
    { name: 'Settings', href: '/settings', icon: Settings, id: 'nav-settings' },
  ];

  // Create refs for all navigation items
  const itemRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Register navigation elements
  useEffect(() => {
    if (logoRef.current) {
      registerElement('nav-logo', logoRef.current);
    }

    navigationItems.forEach(item => {
      const element = itemRefs.current[item.id];
      if (element) {
        registerElement(item.id, element);
      }
    });

    // Don't auto-focus home button to prevent navigation conflicts
    // Let each page manage its own initial focus

    return () => {
      unregisterElement('nav-logo');
      navigationItems.forEach(item => {
        unregisterElement(item.id);
      });
    };
  }, [registerElement, unregisterElement]);

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const isActive = (href: string) => {
    if (href === '/tv') return pathname === '/tv' || pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className={`tv-navbar ${isExpanded ? 'tv-navbar--expanded' : 'tv-navbar--collapsed'}`}>
      {/* Logo */}
      <div className="tv-navbar__header">
        <button
          ref={logoRef}
          className="tv-navbar__logo"
          onClick={() => handleNavigation('/tv')}
        >
          <Image
            src="/logo.png"
            alt="Tatakai"
            width={isExpanded ? 120 : 40}
            height={40}
            className="tv-navbar__logo-image"
          />
          {isExpanded && (
            <span className="tv-navbar__logo-text">Tatakai</span>
          )}
        </button>
        
        <button
          className="tv-navbar__toggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <ChevronRight className={`tv-navbar__toggle-icon ${isExpanded ? 'rotated' : ''}`} />
        </button>
      </div>

      {/* Navigation Items */}
      <div className="tv-navbar__content">
        <ul className="tv-navbar__menu">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <li key={item.id} className="tv-navbar__item">
                <button
                  ref={(el) => { itemRefs.current[item.id] = el; }}
                  className={`tv-navbar__link ${active ? 'tv-navbar__link--active' : ''}`}
                  onClick={() => handleNavigation(item.href)}
                  data-nav-id={item.id}
                >
                  <Icon className="tv-navbar__icon" />
                  {isExpanded && (
                    <span className="tv-navbar__text">{item.name}</span>
                  )}
                  {active && <div className="tv-navbar__indicator" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer */}
      {isExpanded && (
        <div className="tv-navbar__footer">
          <div className="tv-navbar__version">
            <span>Tatakai TV v1.0</span>
          </div>
        </div>
      )}
    </nav>
  );
};

export default TVNavbar;
