import React, {useEffect} from "react";

export const playSound = (soundFile: string) => {
    if (typeof window !== 'undefined') {
        const audio = new Audio(soundFile);
        audio.volume = 1.0;
        audio.play().catch(error => {
            console.error('エラー文', error);
        });
    }
};

export const reactSounds: React.FC = () => {
    return null;
};