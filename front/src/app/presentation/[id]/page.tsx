'use client';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
import { Mediapipe } from '../../components/Detection/Mediapipe';
import { Effects } from '../../components/Effects/Effects';
import { Sounds } from '../../components/Sounds/Sounds';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.min.mjs';
import { usePdfSlider } from '../usePdfSlider';
import { useSlideNavigation } from '../useSlideNavigation';
import { useParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const slideSettings = {
  0: {
    slidesPerView: 1,
    spaceBetween: 10,
  },
  1024: {
    slidesPerView: 1,
    spaceBetween: 10,
  },
};

const BasicSlider: React.FC = () => {
  const params = useParams();
  const pdfid = params.id as string;
  const swiperInstanceRef = useRef<SwiperClass | null>(null);
  
  const { prevSlide, nextSlide } = useSlideNavigation(swiperInstanceRef);
  const [ images ] = usePdfSlider(swiperInstanceRef, pdfid);
  useEffect(() => {
    if (swiperInstanceRef.current && images.length > 0) {
      swiperInstanceRef.current.slideTo(0,0);
    }
  }, [images])
  return (
    <div>
      <div className="static">
        <Swiper
          modules={[Navigation, Pagination]}
          breakpoints={slideSettings}
          slidesPerView="auto"
          centeredSlides
          loop={false}
          speed={1000}
          pagination={{ clickable: true }}
          initialSlide={0}  // 初期表示で1ページ目を指定
          className="h-dvh"
          onSwiper={(swiper) => { swiperInstanceRef.current = swiper; }}
        >
          {images.map((src, index) => (
            <SwiperSlide key={index}>
              <img
                src={src}
                alt={`Slider Image ${index + 1}`}
                className="h-full object-cover w-full"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="absolute top-0 right-0 z-10" >
        <Mediapipe nextSlide={nextSlide} prevSlide={prevSlide} />
      </div>
      <Effects/>
      <Sounds/>
    </div>
  );
};

export default BasicSlider;
