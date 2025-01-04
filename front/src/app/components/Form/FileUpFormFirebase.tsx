'use client';

import React, { useState, ChangeEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Button, 
  Box,
  Typography,
  Alert
} from '@mui/material';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface PDFUploaderProps {
  onUploadSuccess: (fileUrl: string, fileName: string) => void;
  userId: string; // Firebase認証のユーザーID
}

export const PDFUploader: React.FC<PDFUploaderProps> = ({ onUploadSuccess, userId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validate file type
      if (selectedFile.type !== 'application/pdf') {
        setError('PDFファイルのみアップロード可能です。');
        return;
      }

      // Validate file size (20MB limit)
      if (selectedFile.size > 20 * 1024 * 1024) {
        setError('ファイルサイズは20MB以下にしてください。');
        return;
      }

      setError(null);
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const storage = getStorage();
      const fileId = Math.random().toString(36).substr(2, 9);
      const timestamp = Date.now();
      const filePath = `presentations/${userId}/${fileId}_${timestamp}_${file.name}`;
      const storageRef = ref(storage, filePath);

      // Upload the file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Call the success callback with the download URL
      onUploadSuccess(downloadURL, file.name);

      // Reset the form
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFile(null);

    } catch (error) {
      console.error('Error during upload:', error);
      setError('アップロード中にエラーが発生しました。');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      {error && (
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      )}
      
      <input 
        type="file" 
        accept=".pdf" 
        onChange={handleFileChange} 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        id="pdf-upload-input" 
      />
      
      <label htmlFor="pdf-upload-input">
        <Button 
          variant="outlined" 
          component="span" 
          sx={{ 
            padding: '10px 20px', 
            borderColor: '#1976d2', 
            color: '#1976d2' 
          }}
        >
          PDFを選択
        </Button>
      </label>
      
      {file && (
        <Typography variant="body1" sx={{ mt: 2 }}>
          選択されたファイル: {file.name}
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
        {uploading ? 'アップロード中...' : 'アップロード'}
      </Button>
      
      <Typography variant="caption" color="textSecondary">
        PDFファイル（20MB以下）を選択してください
      </Typography>
    </Box>
  );
};

export default PDFUploader;