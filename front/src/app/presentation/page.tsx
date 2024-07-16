'use client';
import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperClass } from 'swiper/types';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import styles from './swiper.module.css';
import { Mediapipe } from '../components/Detection/Mediapipe';
import { Effects } from '../components/Effects/Effects';


const images = [
  '/basicSlider/test1.jpeg',
  '/basicSlider/test2.jpeg',
  '/basicSlider/test3.jpeg',
  '/basicSlider/test4.jpeg',
];

const slideSettings = {
  0: {
    slidesPerView: 1.4,
    spaceBetween: 10,
  },
  1024: {
    slidesPerView: 2,
    spaceBetween: 10,
  },
};

const BasicSlider: React.FC = () => {
  const swiperInstanceRef = useRef<SwiperClass | null>(null);

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

    return(() => {
      window.removeEventListener('keydown', handleKeyDown);
    });
  }, []);

  const nextSlide = () => {
    swiperInstanceRef.current!.slideNext();
  }

  const prevSlide = () => {
    swiperInstanceRef.current!.slidePrev();
  }

  return (
    <div>
      <Swiper
        modules={[Navigation, Pagination]}
        breakpoints={slideSettings}
        slidesPerView="auto"
        centeredSlides
        loop
        speed={1000}
        pagination={{ clickable: true }}
        className={styles.slideWrapper}
        onSwiper={(swiper) => { swiperInstanceRef.current = swiper; }}
      >
        {images.map((src, index) => (
          <SwiperSlide key={index}>
            <Image
              src={src}
              width={1920}
              height={1038}
              alt={`Slider Image ${index + 1}`}
              sizes="(min-width: 1024px) 100vw, 60vw"
              loading="eager"
              className={styles.slideImage}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <Mediapipe nextSlide={nextSlide} prevSlide={prevSlide} />
      <Effects/>
    </div>
  );
};

export default BasicSlider;

