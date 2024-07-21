'use client';

import React, { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

export const PDFUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch('/api/pdf', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('File uploaded successfully:', data);
        router.push('/presentation'); // アップロード成功後のリダイレクト
      } else {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Error during upload:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1>PDF File Uploader</h1>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Uploading...' : 'Upload PDF'}
      </button>
    </div>
  );
};

export default PDFUploader;