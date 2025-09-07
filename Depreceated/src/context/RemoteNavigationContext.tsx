import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { getNextFocusableElement, focusElement } from '@/utils';

// WebOS remote control key codes
export const REMOTE_KEYS = {
  // Directional navigation
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
  
  // Action keys
  ENTER: 13,
  OK: 13,
  BACK: 461,
  HOME: 457,
  
  // Number keys
  NUM_0: 48,
  NUM_1: 49,
  NUM_2: 50,
  NUM_3: 51,
  NUM_4: 52,
  NUM_5: 53,
  NUM_6: 54,
  NUM_7: 55,
  NUM_8: 56,
  NUM_9: 57,
  
  // Color keys
  RED: 403,
  GREEN: 404,
  YELLOW: 405,
  BLUE: 406,
  
  // Media keys
  PLAY: 415,
  PAUSE: 19,
  STOP: 413,
  FAST_FORWARD: 417,
  REWIND: 412,
  
  // Volume keys
  VOLUME_UP: 447,
  VOLUME_DOWN: 448,
  MUTE: 449,
  
  // Menu keys
  MENU: 457,
  INFO: 457,
};

interface FocusState {
  currentFocusId: string | null;
  focusHistory: string[];
  isNavigating: boolean;
  currentPage: string;
}

type FocusAction =
  | { type: 'SET_FOCUS'; id: string }
  | { type: 'CLEAR_FOCUS' }
  | { type: 'NAVIGATE_START' }
  | { type: 'NAVIGATE_END' }
  | { type: 'SET_PAGE'; page: string }
  | { type: 'GO_BACK' };

const initialState: FocusState = {
  currentFocusId: null,
  focusHistory: [],
  isNavigating: false,
  currentPage: 'home',
};

function focusReducer(state: FocusState, action: FocusAction): FocusState {
  switch (action.type) {
    case 'SET_FOCUS':
      return {
        ...state,
        currentFocusId: action.id,
        focusHistory: state.currentFocusId 
          ? [...state.focusHistory.slice(-9), state.currentFocusId]
          : state.focusHistory,
      };
    
    case 'CLEAR_FOCUS':
      return {
        ...state,
        currentFocusId: null,
      };
    
    case 'NAVIGATE_START':
      return {
        ...state,
        isNavigating: true,
      };
    
    case 'NAVIGATE_END':
      return {
        ...state,
        isNavigating: false,
      };
    
    case 'SET_PAGE':
      return {
        ...state,
        currentPage: action.page,
        currentFocusId: null,
        focusHistory: [],
      };
    
    case 'GO_BACK':
      const previousFocus = state.focusHistory[state.focusHistory.length - 1];
      return {
        ...state,
        currentFocusId: previousFocus || null,
        focusHistory: state.focusHistory.slice(0, -1),
      };
    
    default:
      return state;
  }
}

interface RemoteNavigationContextType {
  state: FocusState;
  currentFocusId: string | null;
  setFocus: (id: string) => void;
  clearFocus: () => void;
  setCurrentPage: (page: string) => void;
  goBack: () => void;
  registerElement: (id: string, element: HTMLElement) => void;
  unregisterElement: (id: string) => void;
  registerFocusable: (id: string, element: HTMLElement) => void;
  unregisterFocusable: (id: string) => void;
}

const RemoteNavigationContext = createContext<RemoteNavigationContextType | null>(null);

interface RemoteNavigationProviderProps {
  children: React.ReactNode;
}

export const RemoteNavigationProvider: React.FC<RemoteNavigationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(focusReducer, initialState);
  const focusableElements = useRef<Map<string, HTMLElement>>(new Map());
  const keyHandlers = useRef<Map<number, () => void>>(new Map());

  const setFocus = (id: string) => {
    const element = focusableElements.current.get(id);
    if (element) {
      dispatch({ type: 'SET_FOCUS', id });
      focusElement(element);
    }
  };

  const clearFocus = () => {
    dispatch({ type: 'CLEAR_FOCUS' });
  };

  const setCurrentPage = (page: string) => {
    dispatch({ type: 'SET_PAGE', page });
  };

  const goBack = () => {
    dispatch({ type: 'GO_BACK' });
  };

  const registerFocusable = (id: string, element: HTMLElement) => {
    focusableElements.current.set(id, element);
    element.setAttribute('data-focusable', 'true');
    element.setAttribute('data-focus-id', id);
  };

  const unregisterFocusable = (id: string) => {
    const element = focusableElements.current.get(id);
    if (element) {
      element.removeAttribute('data-focusable');
      element.removeAttribute('data-focus-id');
    }
    focusableElements.current.delete(id);
  };

  const handleDirectionalNavigation = (direction: 'up' | 'down' | 'left' | 'right') => {
    const currentElement = state.currentFocusId 
      ? focusableElements.current.get(state.currentFocusId)
      : document.activeElement as HTMLElement;
    
    if (!currentElement) {
      // Focus first available element
      const firstElement = focusableElements.current.values().next().value;
      if (firstElement) {
        const firstId = firstElement.getAttribute('data-focus-id');
        if (firstId) setFocus(firstId);
      }
      return;
    }

    const nextElement = getNextFocusableElement(currentElement, direction);
    if (nextElement) {
      const nextId = nextElement.getAttribute('data-focus-id');
      if (nextId) {
        setFocus(nextId);
      }
    }
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    const { keyCode } = event;
    
    // Prevent default browser behavior for TV navigation
    if ([REMOTE_KEYS.UP, REMOTE_KEYS.DOWN, REMOTE_KEYS.LEFT, REMOTE_KEYS.RIGHT, REMOTE_KEYS.ENTER].includes(keyCode)) {
      event.preventDefault();
      event.stopPropagation();
    }

    dispatch({ type: 'NAVIGATE_START' });

    switch (keyCode) {
      case REMOTE_KEYS.UP:
        handleDirectionalNavigation('up');
        break;
      case REMOTE_KEYS.DOWN:
        handleDirectionalNavigation('down');
        break;
      case REMOTE_KEYS.LEFT:
        handleDirectionalNavigation('left');
        break;
      case REMOTE_KEYS.RIGHT:
        handleDirectionalNavigation('right');
        break;
      case REMOTE_KEYS.ENTER:
      case REMOTE_KEYS.OK:
        if (state.currentFocusId) {
          const element = focusableElements.current.get(state.currentFocusId);
          if (element) {
            element.click();
          }
        }
        break;
      case REMOTE_KEYS.BACK:
        goBack();
        break;
      case REMOTE_KEYS.HOME:
        setCurrentPage('home');
        break;
      default:
        // Check for custom key handlers
        const handler = keyHandlers.current.get(keyCode);
        if (handler) {
          handler();
        }
        break;
    }

    setTimeout(() => {
      dispatch({ type: 'NAVIGATE_END' });
    }, 100);
  };

  // Register global key handler
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress, true);
    return () => {
      document.removeEventListener('keydown', handleKeyPress, true);
    };
  }, [state.currentFocusId]);

  // Auto-focus first element when page changes
  useEffect(() => {
    if (focusableElements.current.size > 0 && !state.currentFocusId) {
      const firstElement = focusableElements.current.values().next().value;
      if (firstElement) {
        const firstId = firstElement.getAttribute('data-focus-id');
        if (firstId) {
          setTimeout(() => setFocus(firstId), 100);
        }
      }
    }
  }, [state.currentPage, focusableElements.current.size]);

  const contextValue: RemoteNavigationContextType = {
    state,
    currentFocusId: state.currentFocusId,
    setFocus,
    clearFocus,
    setCurrentPage,
    goBack,
    registerElement: registerFocusable,
    unregisterElement: unregisterFocusable,
    registerFocusable,
    unregisterFocusable,
  };

  return (
    <RemoteNavigationContext.Provider value={contextValue}>
      {children}
    </RemoteNavigationContext.Provider>
  );
};

export const useRemoteNavigation = () => {
  const context = useContext(RemoteNavigationContext);
  if (!context) {
    throw new Error('useRemoteNavigation must be used within a RemoteNavigationProvider');
  }
  return context;
};

// Hook for registering focusable elements
export const useFocusable = (id: string, enabled = true) => {
  const { registerFocusable, unregisterFocusable, setFocus, state } = useRemoteNavigation();
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (enabled && elementRef.current) {
      registerFocusable(id, elementRef.current);
      return () => unregisterFocusable(id);
    }
  }, [id, enabled, registerFocusable, unregisterFocusable]);

  const isFocused = state.currentFocusId === id;

  return {
    elementRef,
    isFocused,
    focus: () => setFocus(id),
  };
};
