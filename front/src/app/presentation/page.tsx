'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Box, CircularProgress } from '@mui/material';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.min.mjs';
import { Mediapipe } from '../components/Detection/Mediapipe';
import { Effects } from '../components/Effects/Effects';
import { Sounds } from '../components/Sounds/Sounds';
import { getUrlAndName } from "@/app/firebase/form/fileInfo"

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

const PresentationPage = () => {
  const searchParams = useSearchParams();
  const pdfId = searchParams.get('pdf_id');
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const swiperInstanceRef = useRef<SwiperClass | null>(null);

  // PDFからページ画像を生成
  useEffect(() => {
    const loadPdf = async () => {
      if (!pdfId) {
        console.error('PDF ID is not provided.');
        setLoading(false);
        return;
      }

      const [fileUrl, _] = await getUrlAndName(pdfId);
      if (!fileUrl) {
        console.error('PDF file not found in the store.');
        setLoading(false);
        return;
      }

      try {
        const loadingTask = pdfjsLib.getDocument(fileUrl);
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
      } finally {
        setLoading(false);
      }    
    };
    loadPdf();
  }, [pdfId]);

  // キーボードナビゲーション
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

  // スライド移動のハンドラー
  const nextSlide = () => {
    if (swiperInstanceRef.current) {
      swiperInstanceRef.current.slideNext();
    }
  };

  const prevSlide = () => {
    if (swiperInstanceRef.current) {
      swiperInstanceRef.current.slidePrev();
    }
  };

  // ローディング表示
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // PDFが見つからない場合
  if (images.length === 0) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          PDFファイルが見つかりませんでした。
        </Box>
      </Container>
    );
  }

  return (
    <div className="relative h-screen w-screen">
      <div className="h-full">
        <Swiper
          modules={[Navigation, Pagination]}
          breakpoints={slideSettings}
          slidesPerView="auto"
          centeredSlides
          loop={false}
          speed={1000}
          pagination={{ clickable: true }}
          initialSlide={0}
          className="h-full"
          onSwiper={(swiper) => { swiperInstanceRef.current = swiper; }}
        >
          {images.map((src, index) => (
            <SwiperSlide key={index}>
              <img
                src={src}
                alt={`Slide ${index + 1}`}
                className="h-full w-full object-contain"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ジェスチャー検出とエフェクト */}
      <div className="absolute top-0 right-0 z-10">
        <Mediapipe nextSlide={nextSlide} prevSlide={prevSlide} />
      </div>
      <Effects />
      <Sounds />
    </div>
  );
};

export default PresentationPage;
