'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperClass } from 'swiper/types';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Mediapipe } from '../components/Detection/Mediapipe';
import { Effects } from '../components/Effects/Effects';
import { Sounds } from '../components/Sounds/Sounds';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.min.mjs';

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
  const swiperInstanceRef = useRef<SwiperClass | null>(null);
  const [images, setImages] = useState<string[]>([]);

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

  async function fetchFileList() {
    try {
      const response = await fetch('/api/pdf?list=true');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('PDF files:', data.files);
      // ここでdata.filesを使用して、UIにファイル一覧を表示するなどの処理を行います
    } catch (error) {
      console.error('Error fetching file list:', error);
    }
  }

  useEffect(() => {
    // PDFファイルのパス指定
    // 1. 特定のPDFファイルの取得: /api/pdf?filename=example.pdf
    // 2. PDFファイル一覧の取得: /api/pdf?list=true
    fetchFileList();
    const getFileUrl = '/api/pdf?filename=mid.pdf';

    const loadPdf = async () => {
      try {
        const response = await fetch(getFileUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const pdfBlob = await response.blob();
        const pdfUrl = URL.createObjectURL(pdfBlob);

        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const tempImages: string[] = [];

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport: viewport }).promise;
            const img = canvas.toDataURL();
            tempImages.push(img);
          }
        }
        setImages(tempImages);
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    };

    loadPdf();
  }, []);

  useEffect(() => {
    if (swiperInstanceRef.current) {
      swiperInstanceRef.current.slideTo(0, 0);  // 初期スライドを設定
    }
  }, [images]);

  const nextSlide = () => {
    swiperInstanceRef.current!.slideNext();
  };

  const prevSlide = () => {
    swiperInstanceRef.current!.slidePrev();
  };

  return (
    <div>
      <div className="static">
        <Swiper
          modules={[Navigation, Pagination]}
          breakpoints={slideSettings}
          slidesPerView="auto"
          centeredSlides
          loop
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
                className="h-full object-cover"
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
