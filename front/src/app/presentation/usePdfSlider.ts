"use client";

import { useEffect, useState } from "react";
import * as pdfjsLib from 'pdfjs-dist';
import { SwiperClass } from "swiper/react";
import { getPDFFromStore } from '../utils/pdfStore';

// PDFファイルの取得（一覧、1件）
// 1. 特定のPDFファイルの取得: /api/pdf?filename=example.pdf
// 2. PDFファイル一覧の取得: /api/pdf?list=true

export const usePdfSlider = (swiperInstanceRef:React.MutableRefObject<SwiperClass | null>, pdfId: string) => {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const loadPdf = async () => {
      if (!pdfId) {
        console.error('PDF ID is not provided.');
        return;
      }

      try {
        const file = getPDFFromStore(pdfId);
        if (!file) {
          console.error('PDF file not found in the store.');
          return;
        }

        const fileUrl = URL.createObjectURL(file);
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
        URL.revokeObjectURL(fileUrl);
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    };

    loadPdf();
  }, [pdfId]);

  useEffect(() => {
    if (swiperInstanceRef.current) {
      swiperInstanceRef.current.slideTo(0, 0); // 初期スライドを設定
    }
  }, [images]);

  return [images];
};
