'use client';

import React, { useState, ChangeEvent, useRef, DragEvent } from 'react';
import { 
  Box,
  Typography,
  Alert
} from '@mui/material';
import { uploadFile } from '@/app/firebase/form/uploadFile'
import { addFileInfo } from '@/app/firebase/form/fileInfo'
import { type StoredFileInfo } from '@/app/types/file-info.type'

interface PDFUploaderProps {
  onUploadSuccess: (storedFileInfo: StoredFileInfo) => void;
}

export const PDFUploader: React.FC<PDFUploaderProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (selectedFile: File): boolean => {
    if (selectedFile.type !== 'application/pdf') {
      setError('PDFファイルのみアップロード可能です。');
      return false;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setError('ファイルサイズは20MB以下にしてください。');
      return false;
    }

    setError(null);
    return true;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        handleUpload(selectedFile);
      }
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        handleUpload(droppedFile);
      }
    }
  };

  const handleClick = () => {
    if (!uploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async (selectedFile: File = file!) => {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);

    try {
      const [filePath, downloadURL] = await uploadFile(selectedFile);
      const fileData = {
        fileName: selectedFile.name,
        filePath: filePath,
        fileSize: selectedFile.size,
        downloadURL: downloadURL,
      };
      const storedFileInfo = await addFileInfo(fileData);

      if (storedFileInfo instanceof Error) {
        console.error('Error adding file info:', storedFileInfo.message);
        return;
      }

      onUploadSuccess(storedFileInfo);

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
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 2,
        width: '100%' 
      }}
    >
      {error && (
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      )}
      
      <Box
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        sx={{
          width: '100%',
          minHeight: '200px',
          border: '2px dashed',
          borderColor: isDragging ? '#1976d2' : '#ccc',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 3,
          backgroundColor: isDragging ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            borderColor: '#1976d2',
            backgroundColor: 'rgba(25, 118, 210, 0.04)'
          }
        }}
      >
        <input 
          type="file" 
          accept=".pdf" 
          onChange={handleFileChange} 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
        />
        
        <Typography 
          variant="body1" 
          color="textSecondary" 
          align="center"
          sx={{ mb: 2 }}
        >
          {uploading ? 'アップロード中...' : 'クリックまたはドラッグ＆ドロップでPDFファイルを選択'}
        </Typography>
        
        {file && (
          <Typography variant="body1" sx={{ mt: 2 }}>
            選択されたファイル: {file.name}
          </Typography>
        )}
      </Box>
      
      <Typography variant="caption" color="textSecondary">
        PDFファイル（20MB以下）を選択してください
      </Typography>
    </Box>
  );
};

export default PDFUploader;