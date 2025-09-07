'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface NavigationContextType {
  focusedElement: string | null;
  setFocusedElement: (id: string | null) => void;
  navigationItems: Map<string, HTMLElement>;
  registerElement: (id: string, element: HTMLElement) => void;
  unregisterElement: (id: string) => void;
  navigate: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [focusedElement, setFocusedElement] = useState<string | null>(null);
  const [navigationItems] = useState(new Map<string, HTMLElement>());

  const updateFocusedElement = useCallback((id: string | null) => {
    setFocusedElement(prevFocusedElement => {
      // Remove focus from current element
      if (prevFocusedElement) {
        const currentElement = navigationItems.get(prevFocusedElement);
        if (currentElement) {
          currentElement.classList.remove('keyboard-focused');
          currentElement.blur();
        }
      }

      // Add focus to new element
      if (id) {
        const newElement = navigationItems.get(id);
        if (newElement) {
          newElement.classList.add('keyboard-focused');
          newElement.focus();
        }
      }

      return id;
    });
  }, [navigationItems]);

  const registerElement = useCallback((id: string, element: HTMLElement) => {
    navigationItems.set(id, element);
    
    // Auto-focus first element if nothing is focused
    if (!focusedElement) {
      setFocusedElement(id);
    }
  }, [focusedElement, navigationItems, setFocusedElement]);

  const unregisterElement = useCallback((id: string) => {
    const element = navigationItems.get(id);
    if (element) {
      element.classList.remove('keyboard-focused');
    }
    navigationItems.delete(id);
  }, [navigationItems]);

  const findNearestElement = useCallback((currentElement: HTMLElement, direction: 'up' | 'down' | 'left' | 'right') => {
    const currentRect = currentElement.getBoundingClientRect();
    const elements = Array.from(navigationItems.entries());
    
    let bestElement: [string, HTMLElement] | null = null;
    let bestDistance = Infinity;

    for (const [id, element] of elements) {
      if (element === currentElement) continue;
      
      const rect = element.getBoundingClientRect();
      let isValidDirection = false;
      let distance = 0;

      switch (direction) {
        case 'right':
          if (rect.left > currentRect.right) {
            distance = Math.sqrt(
              Math.pow(rect.left - currentRect.right, 2) +
              Math.pow(rect.top - currentRect.top, 2)
            );
            isValidDirection = true;
          }
          break;
        case 'left':
          if (rect.right < currentRect.left) {
            distance = Math.sqrt(
              Math.pow(currentRect.left - rect.right, 2) +
              Math.pow(rect.top - currentRect.top, 2)
            );
            isValidDirection = true;
          }
          break;
        case 'down':
          if (rect.top > currentRect.bottom) {
            distance = Math.sqrt(
              Math.pow(rect.left - currentRect.left, 2) +
              Math.pow(rect.top - currentRect.bottom, 2)
            );
            isValidDirection = true;
          }
          break;
        case 'up':
          if (rect.bottom < currentRect.top) {
            distance = Math.sqrt(
              Math.pow(rect.left - currentRect.left, 2) +
              Math.pow(currentRect.top - rect.bottom, 2)
            );
            isValidDirection = true;
          }
          break;
      }

      if (isValidDirection && distance < bestDistance) {
        bestDistance = distance;
        bestElement = [id, element];
      }
    }

    return bestElement;
  }, [navigationItems]);

  const navigate = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    setFocusedElement(currentFocusedElement => {
      if (!currentFocusedElement || navigationItems.size === 0) return currentFocusedElement;

      const currentElement = navigationItems.get(currentFocusedElement);
      if (!currentElement) return currentFocusedElement;

      // Special handling for hero section navigation
      const currentRect = currentElement.getBoundingClientRect();
      if (direction === 'up' && currentRect.top > window.innerHeight * 0.7) {
        // If we're in the content area and going up, try to focus hero section
        const heroElements = Array.from(navigationItems.entries()).filter(([id]) => 
          id.includes('hero') || id.includes('spotlight')
        );
        
        if (heroElements.length > 0) {
          const heroElement = heroElements[0];
          // Remove focus from current
          currentElement.classList.remove('keyboard-focused');
          currentElement.blur();
          // Add focus to hero
          heroElement[1].classList.add('keyboard-focused');
          heroElement[1].focus();
          heroElement[1].classList.add('tv-focused');
          heroElement[1].scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
          });
          return heroElement[0];
        }
      }

      // Use the existing findNearestElement function
      const nearestElement = findNearestElement(currentElement, direction);
      if (nearestElement) {
        // Remove focus from current
        currentElement.classList.remove('keyboard-focused');
        currentElement.blur();
        // Add focus to new
        nearestElement[1].classList.add('keyboard-focused');
        nearestElement[1].focus();
        
        // Add TV focus class for visual feedback
        document.querySelectorAll('.tv-focused').forEach(el => el.classList.remove('tv-focused'));
        nearestElement[1].classList.add('tv-focused');
        
        // Scroll element into view for TV
        nearestElement[1].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
        
        return nearestElement[0];
      }
      
      return currentFocusedElement;
    });
  }, [navigationItems, findNearestElement]);

  // Global keyboard handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          navigate('up');
          break;
        case 'ArrowDown':
          event.preventDefault();
          navigate('down');
          break;
        case 'ArrowLeft':
          event.preventDefault();
          navigate('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          navigate('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const value = {
    focusedElement,
    setFocusedElement: updateFocusedElement,
    navigationItems,
    registerElement,
    unregisterElement,
    navigate
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
