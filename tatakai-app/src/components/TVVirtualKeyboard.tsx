'use client';

import React, { useEffect, useRef } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { Delete, Space } from 'lucide-react';

interface TVVirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onSpace: () => void;
  isVisible: boolean;
}

const TVVirtualKeyboard: React.FC<TVVirtualKeyboardProps> = ({ 
  onKeyPress, 
  onDelete, 
  onSpace,
  isVisible 
}) => {
  const { registerElement, unregisterElement } = useNavigation();
  
  const keys = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  const numberKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  useEffect(() => {
    if (isVisible) {
      // Register all keyboard buttons
      keys.forEach((row, rowIndex) => {
        row.forEach((key, keyIndex) => {
          const keyId = `keyboard-${key}-${rowIndex}-${keyIndex}`;
          setTimeout(() => {
            const element = document.querySelector(`[data-key-id="${keyId}"]`) as HTMLElement;
            if (element) {
              registerElement(keyId, element);
            }
          }, 100);
        });
      });

      // Register number keys
      numberKeys.forEach((key, index) => {
        const keyId = `keyboard-num-${key}-${index}`;
        setTimeout(() => {
          const element = document.querySelector(`[data-key-id="${keyId}"]`) as HTMLElement;
          if (element) {
            registerElement(keyId, element);
          }
        }, 100);
      });

      // Register special keys
      setTimeout(() => {
        const spaceElement = document.querySelector('[data-key-id="keyboard-space"]') as HTMLElement;
        const deleteElement = document.querySelector('[data-key-id="keyboard-delete"]') as HTMLElement;
        
        if (spaceElement) registerElement('keyboard-space', spaceElement);
        if (deleteElement) registerElement('keyboard-delete', deleteElement);
      }, 100);
    }

    return () => {
      if (isVisible) {
        keys.forEach((row, rowIndex) => {
          row.forEach((key, keyIndex) => {
            const keyId = `keyboard-${key}-${rowIndex}-${keyIndex}`;
            unregisterElement(keyId);
          });
        });

        numberKeys.forEach((key, index) => {
          const keyId = `keyboard-num-${key}-${index}`;
          unregisterElement(keyId);
        });

        unregisterElement('keyboard-space');
        unregisterElement('keyboard-delete');
      }
    };
  }, [isVisible, registerElement, unregisterElement]);

  if (!isVisible) return null;

  return (
    <div className="tv-virtual-keyboard">
      <div className="tv-keyboard-section">
        <h3 className="tv-keyboard-title">Numbers</h3>
        <div className="tv-keyboard-row">
          {numberKeys.map((key, index) => (
            <button
              key={`num-${key}`}
              data-key-id={`keyboard-num-${key}-${index}`}
              className="tv-keyboard-key"
              onClick={() => onKeyPress(key)}
              tabIndex={0}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <div className="tv-keyboard-section">
        <h3 className="tv-keyboard-title">Letters</h3>
        {keys.map((row, rowIndex) => (
          <div key={rowIndex} className="tv-keyboard-row">
            {row.map((key, keyIndex) => (
              <button
                key={key}
                data-key-id={`keyboard-${key}-${rowIndex}-${keyIndex}`}
                className="tv-keyboard-key"
                onClick={() => onKeyPress(key)}
                tabIndex={0}
              >
                {key.toUpperCase()}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="tv-keyboard-section">
        <h3 className="tv-keyboard-title">Actions</h3>
        <div className="tv-keyboard-row">
          <button
            data-key-id="keyboard-space"
            className="tv-keyboard-key tv-keyboard-key--wide"
            onClick={onSpace}
            tabIndex={0}
          >
            <Space className="w-4 h-4 mr-2" />
            SPACE
          </button>
          <button
            data-key-id="keyboard-delete"
            className="tv-keyboard-key tv-keyboard-key--action"
            onClick={onDelete}
            tabIndex={0}
          >
            <Delete className="w-4 h-4 mr-2" />
            DELETE
          </button>
        </div>
      </div>
    </div>
  );
};

export default TVVirtualKeyboard;
