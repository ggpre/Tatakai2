import { useEffect, useCallback } from 'react';
import { useScreenDetection } from './useScreenDetection';

interface RemoteControlOptions {
  onBack?: () => void;
  onMenu?: () => void;
  onHome?: () => void;
  onInfo?: () => void;
  isEnabled?: boolean;
}

export const useRemoteControl = ({
  onBack,
  onMenu,
  onHome,
  onInfo,
  isEnabled = true,
}: RemoteControlOptions = {}) => {
  const { effectiveDeviceType } = useScreenDetection();
  const isRemoteEnabled = effectiveDeviceType === 'tv' && isEnabled;

  const handleRemoteKey = useCallback((event: KeyboardEvent) => {
    if (!isRemoteEnabled) return;

    const { key, code } = event;

    // Handle TV remote specific keys
    switch (key) {
      case 'Backspace':
      case 'Back':
        event.preventDefault();
        onBack?.();
        break;

      case 'Menu':
      case 'ContextMenu':
        event.preventDefault();
        onMenu?.();
        break;

      case 'Home':
        event.preventDefault();
        onHome?.();
        break;

      case 'Info':
      case 'MediaInfo':
        event.preventDefault();
        onInfo?.();
        break;

      // Handle numeric keys for quick navigation
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
      case '0':
        // You can implement quick navigation to specific sections
        // For now, we'll just prevent default behavior
        event.preventDefault();
        break;

      // Handle color buttons (Red, Green, Yellow, Blue)
      case 'Red':
      case 'Green':
      case 'Yellow':
      case 'Blue':
        event.preventDefault();
        // Implement color button functionality if needed
        break;

      default:
        // Handle other remote-specific codes
        if (code === 'BrowserBack' || code === 'GoBack') {
          event.preventDefault();
          onBack?.();
        }
        break;
    }
  }, [isRemoteEnabled, onBack, onMenu, onHome, onInfo]);

  useEffect(() => {
    if (!isRemoteEnabled) return;

    document.addEventListener('keydown', handleRemoteKey, { capture: true });

    return () => {
      document.removeEventListener('keydown', handleRemoteKey, { capture: true });
    };
  }, [isRemoteEnabled, handleRemoteKey]);

  return {
    isRemoteEnabled,
    effectiveDeviceType,
  };
};
