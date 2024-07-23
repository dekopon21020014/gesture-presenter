"use client";

import { useEffect, useState } from "react";
import * as pdfjsLib from 'pdfjs-dist';
import { SwiperClass } from "swiper/react";

// PDFファイルの取得（一覧、1件）
// 1. 特定のPDFファイルの取得: /api/pdf?filename=example.pdf
// 2. PDFファイル一覧の取得: /api/pdf?list=true

export const usePdfSlider = (swiperInstanceRef:React.MutableRefObject<SwiperClass | null>, pdfid: string) => {
  const [images, setImages] = useState<string[]>([]);

  async function fetchPdfFile(id:string) {
    try {
      const response = await fetch(`http://localhost:8080/api/pdf/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const pdfBlob = await response.blob();
      return URL.createObjectURL(pdfBlob);
    } catch (error) {
      console.error('Error fetching file list:', error);
    }
  }

  useEffect(() => {
    const loadPdf = async () => {
      try {
        const pdfUrl = await fetchPdfFile(pdfid);
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

  return [ images ]
}
