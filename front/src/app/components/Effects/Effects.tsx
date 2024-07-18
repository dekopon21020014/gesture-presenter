import React, { useEffect } from 'react';
import {playSound} from '../Sounds/Sounds';
import {Clap} from './clap';
import {Good} from './good';

export const Effects: React.FC = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '1') {
        playSound('/SoundsRoom/whoo.mp3');
        for (let i = 0; i < 10; i++) {
          const delay = Math.random() * 2000; // 0-1 sec
          setTimeout(Clap, delay);
        }
      } else if (event.key === '2') {
        Good();
      } else if (event.key === '3') {
        playSound('/SoundsRoom/dodon.mp3');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null; // JSXを返さないためにnullを返す
};

