import React, { useEffect } from "react";

export const playClapSound = () => playSound('/SoundsRoom/whoo.mp3');
export const playGoodSound = () => playSound('/SoundsRoom/dodon.mp3');
export const playBadSound = () => playSound('/SoundsRoom/usodaro.mp3');


const playSound = (soundFile: string) => {
    if (typeof window !== 'undefined') {
        const audio = new Audio(soundFile);
        audio.volume = 1.0;
        audio.play().catch(error => {
            console.error('エラー文', error);
        });
    }
};

export const Sounds: React.FC = () => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === '1') {
                playSound('/SoundsRoom/whoo.mp3');
            } else if (event.key === '3') {
                playSound('/SoundsRoom/dodon.mp3');
            } else if (event.key === '5') {
                playSound('/SoundsRoom/usodaro.mp3');
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return null;
};