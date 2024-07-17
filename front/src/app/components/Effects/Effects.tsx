import React, { useEffect } from 'react';
import gsap from 'gsap';
import {playSound} from '../Sounds/Sounds';

export const Effects: React.FC = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '1') {
        playSound('/SoundsRoom/whoo.mp3');
        for (let i = 0; i < 10; i++) {
          const delay = Math.random() * 2000; // 0-1 sec
          setTimeout(createImage, delay);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const createImage = async () => {
    const img = document.createElement('img');
    img.src = '/EffectsRoom/clap.png';
    img.style.position = 'fixed';
    img.style.whiteSpace = 'nowrap';
    img.style.left = `${document.documentElement.clientWidth}px`;
    img.style.zIndex = '9999'; // 最前面に表示するためのz-index
    const random = Math.round(Math.random() * document.documentElement.clientHeight);
    img.style.top = `${random}px`;
    img.style.height = '150px';
    document.body.appendChild(img);

    await gsap.to(img, {
      duration: 5, // 端から端まで5秒
      x: -1 * (document.documentElement.clientWidth + img.clientWidth),
      ease: 'linear' // 一定のスピードに設定
    });

    img.parentNode?.removeChild(img);
  };
  return null; // JSXを返さないためにnullを返す
};

