'use client';

import React, { useState, ChangeEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Button, 
  Box,
  Typography
} from '@mui/material';

interface PDFUploaderProps {
  onUploadSuccess: () => void;
}

export const PDFUploader: React.FC<PDFUploaderProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const response = await fetch('http://localhost:8080/api/pdf', {
        credentials: 'include', // cookieを送信するために必要
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        console.log('File uploaded successfully:', data);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setFile(null); // ファイルステートをリセット
        onUploadSuccess(); // ファイルアップロード成功後にリストを更新
        router.push('/mypage'); // アップロード成功後のリダイレクト
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
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <input type="file" accept=".pdf" onChange={handleFileChange} ref={fileInputRef} style={{ display: 'none' }} id="pdf-upload-input" />
      <label htmlFor="pdf-upload-input">
        <Button variant="outlined" component="span" sx={{ padding: '10px 20px', borderColor: '#1976d2', color: '#1976d2' }}>
          Choose PDF
        </Button>
      </label>
      {file && (
        <Typography variant="body1" sx={{ mt: 2 }}>
          Selected file: {file.name}
        </Typography>
      )}
      <Button 
        onClick={handleUpload} 
        disabled={!file || uploading} 
        variant="contained" 
        sx={{ 
          padding: '10px 20px', 
          backgroundColor: uploading ? '#ccc' : '#1976d2', 
          color: '#fff', 
          borderRadius: 1, 
          '&:hover': { backgroundColor: '#1565c0' }, 
          '&:disabled': { backgroundColor: '#ccc', color: '#fff' }
        }}
      >
        {uploading ? 'Uploading...' : 'Upload PDF'}
      </Button>
    </Box>
  );
};

export default PDFUploader;
