'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Box,
  Typography,
  Container,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  AppBar,
  Toolbar
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import FileIcon from '@mui/icons-material/InsertDriveFile';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PresentationIcon from '@mui/icons-material/Slideshow';
import DeleteIcon from '@mui/icons-material/Delete';

import FileUpFormLocal from '../components/Form/FileUpFormLocal';
import { cleanupOldFiles } from '../utils/pdfStore';

interface UploadedFile {
  id: string;
  name: string;
  timestamp: number;
}

const MyPage = () => {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // クリーンアップ関数の実行
  useEffect(() => {
    const cleanup = () => {
      cleanupOldFiles();
      // UIの更新
      if (window.pdfStore) {
        const currentFiles = Object.entries(window.pdfStore).map(([id, data]) => ({
          id,
          name: (data as any).name,
          timestamp: (data as any).timestamp
        }));
        setUploadedFiles(currentFiles);
      }
    };

    cleanup();
    const interval = setInterval(cleanup, 5 * 60 * 1000); // 5分ごとにチェック
    return () => clearInterval(interval);
  }, []);

  /** ローカルアップロード成功時の処理 */
  const handleLocalUploadSuccess = (file: File) => {
    const fileId = Math.random().toString(36).substr(2, 9);

    if (window.pdfStore) {
      window.pdfStore[fileId] = {
        file,
        name: file.name,
        timestamp: Date.now()
      };
    }

    setUploadedFiles((prev) => [
      ...prev,
      {
        id: fileId,
        name: file.name,
        timestamp: Date.now()
      }
    ]);
  };

  const handleDelete = (fileId: string) => {
    if (window.pdfStore && window.pdfStore[fileId]) {
      delete window.pdfStore[fileId];
      setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
    }
  };

  const handleAnalyze = (fileId: string) => {
    router.push(`/analysis?pdf_id=${fileId}`);
  };

  const handlePresent = (fileId: string) => {
    router.push(`/presentation?pdf_id=${fileId}`);
  };

  /** ログアウト */
  const handleLogout = async () => {
    if (window.pdfStore) {
      window.pdfStore = {};
    }
    setUploadedFiles([]);
    router.push('/login');
  };

  /** ホーム画面へ */
  const handleHomeClick = () => {
    router.push('/top');
  };

  return (
    <>
      {/* ====== ヘッダー部分 ====== */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            マイページ
          </Typography>
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            aria-label="Logout"
          >
            ログアウト
          </Button>
        </Toolbar>
      </AppBar>

      {/* ====== メインコンテンツ ====== */}
      <Container maxWidth="md">
        <Box component="main" sx={{ my: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          >
            マイページ
          </Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'center' }}>
            PDFファイルをアップロードして分析または発表を開始できます。
            <br />
            ※アップロードされたファイルは30分後に自動的に削除されます。
          </Typography>
        </Box>

        {/* ファイルアップロードフォーム */}
        <FileUpFormLocal onUploadSuccess={handleLocalUploadSuccess} />

        {/* アップロード済みファイル一覧 */}
        <Paper elevation={3} sx={{ p: 3, mt: 4 }} component="section">
          <Typography variant="h5" component="h2" gutterBottom>
            アップロード済みファイル
          </Typography>
          {uploadedFiles.length === 0 ? (
            <Typography color="text.secondary">
              ファイルがアップロードされていません。
            </Typography>
          ) : (
            <List>
              {uploadedFiles.map((file) => (
                <React.Fragment key={file.id}>
                  <ListItem>
                    <FileIcon sx={{ mr: 2 }} />
                    <ListItemText
                      primary={file.name}
                      secondary={new Date(file.timestamp).toLocaleString()}
                    />

                    {/* secondaryAction ではなく、普通にBoxでまとめて配置 */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<AnalyticsIcon />}
                        onClick={() => handleAnalyze(file.id)}
                      >
                        分析
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<PresentationIcon />}
                        onClick={() => handlePresent(file.id)}
                      >
                        発表
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(file.id)}
                      >
                        削除
                      </Button>
                    </Box>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>

        {/* ホームへ戻るボタン */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            mt: 4,
            mb: 4
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleHomeClick}
            startIcon={<HomeIcon />}
            aria-label="Home"
            sx={{ minWidth: 200, height: 60 }}
          >
            ホーム
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default MyPage;
