import { MutableRefObject, useEffect, useRef } from "react";
import { SwiperClass } from "swiper/react";

export const useSlideNavigation = (swiperInstanceRef: MutableRefObject<SwiperClass | null>) => {
  

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!swiperInstanceRef.current) return;

      if (event.key === 'ArrowRight') {
        swiperInstanceRef.current.slideNext();
      } else if (event.key === 'ArrowLeft') {
        swiperInstanceRef.current.slidePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const nextSlide = () => {    
    swiperInstanceRef.current!.slideNext();
  };

  const prevSlide = () => {
    swiperInstanceRef.current!.slidePrev();
  };

  return { swiperInstanceRef, nextSlide, prevSlide }
}