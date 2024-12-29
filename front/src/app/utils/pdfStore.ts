interface PDFStore {
    [key: string]: {
      file: File;
      name: string;
      timestamp: number;
    };
  }
  
  declare global {
    interface Window {
      pdfStore?: PDFStore;
    }
  }
  
  // 一時的なPDFストアの初期化
  if (typeof window !== 'undefined') {
    window.pdfStore = window.pdfStore || {};
  }
  
  export const getPDFFromStore = (id: string | null): File | null => {
    if (!id || typeof window === 'undefined' || !window.pdfStore) return null;
    return window.pdfStore[id]?.file || null;
  };
  
  export const cleanupOldFiles = () => {
    if (!window.pdfStore) return;
    
    const now = Date.now();
    const thirtyMinutes = 30 * 60 * 1000;
    
    Object.entries(window.pdfStore).forEach(([id, data]) => {
      if (now - data.timestamp > thirtyMinutes) {
        delete window.pdfStore![id];
      }
    });
  };