'use client';

import React, { useState, ChangeEvent, useRef } from 'react';
import { 
  Button, 
  Box,
  Typography,
  Alert
} from '@mui/material';

interface FileUpFormLocalProps {
  onUploadSuccess: (file: File) => void;
}

const FileUpFormLocal: React.FC<FileUpFormLocalProps> = ({ onUploadSuccess }) => {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** ファイル選択時に自動でアップロードする */
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    const selectedFile = e.target.files[0];

    // PDFかどうか
    if (selectedFile.type !== 'application/pdf') {
      setError('PDFファイルのみアップロード可能です。');
      // ファイルをリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // サイズ上限チェック (20MB)
    if (selectedFile.size > 20 * 1024 * 1024) {
      setError('ファイルサイズは20MB以下にしてください。');
      // ファイルをリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // 問題ないのでエラーをクリア
    setError(null);

    try {
      // 即アップロード完了として親コンポーネントへ通知
      onUploadSuccess(selectedFile);
      
      // 再度アップロードできるよう input をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error during upload:', err);
      setError('アップロード中にエラーが発生しました。');
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 2 
      }}
    >
      {error && (
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      )}
      
      {/* 隠しファイル入力 */}
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
        id="pdf-upload-input"
      />

      {/* ラベル＋ボタンによりファイル選択トリガー */}
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

      <Typography variant="caption" color="textSecondary">
        PDFファイル（20MB以下）を選択してください
      </Typography>
    </Box>
  );
};

export default FileUpFormLocal;
