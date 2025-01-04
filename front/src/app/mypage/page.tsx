'use client';

import React, { useState, useCallback, useEffect } from 'react';
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
  IconButton,
  Divider
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
            name: data.name,
            timestamp: data.timestamp
          }));
          setUploadedFiles(currentFiles);
        }
      };

      cleanup();
      const interval = setInterval(cleanup, 5 * 60 * 1000); // 5分ごとにチェック
      return () => clearInterval(interval);
    }, []);

    const handleLocalUploadSuccess = (file: File) => {
      const fileId = Math.random().toString(36).substr(2, 9);
      
      if (window.pdfStore) {
        window.pdfStore[fileId] = {
          file,
          name: file.name,
          timestamp: Date.now()
        };
      }

      setUploadedFiles(prev => [...prev, {
        id: fileId,
        name: file.name,
        timestamp: Date.now()
      }]);
    };

    const handleDelete = (fileId: string) => {
      if (window.pdfStore && window.pdfStore[fileId]) {
        delete window.pdfStore[fileId];
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
      }
    };

    const handleAnalyze = (fileId: string) => {
      router.push(`/analysis?pdf_id=${fileId}`);
    };

    const handlePresent = (fileId: string) => {
      router.push(`/presentation?pdf_id=${fileId}`);
    };

    const handleLogout = async () => {
      if (window.pdfStore) {
        window.pdfStore = {};
      }
      setUploadedFiles([]);
      router.push('/login');
    };

    const handleHomeClick = () => {
      router.push('/top');
    };

    return (
        <Container maxWidth="md">
          <Box component="main" sx={{ my: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ 
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              マイページ
            </Typography>
            <Typography variant="body1" paragraph sx={{ textAlign: 'center' }}>
              PDFファイルをアップロードして分析または発表を開始できます。
              <br />
              ※アップロードされたファイルは30分後に自動的に削除されます。
            </Typography>
          </Box>

          <FileUpFormLocal onUploadSuccess={handleLocalUploadSuccess} />
          
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
                    <ListItem
                      secondaryAction={
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton 
                            onClick={() => handleAnalyze(file.id)}
                            aria-label="analyze"
                            color="primary"
                          >
                            <AnalyticsIcon />
                          </IconButton>
                          <IconButton 
                            onClick={() => handlePresent(file.id)}
                            aria-label="present"
                            color="secondary"
                          >
                            <PresentationIcon />
                          </IconButton>
                          <IconButton 
                            onClick={() => handleDelete(file.id)}
                            aria-label="delete"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <FileIcon sx={{ mr: 2 }} />
                      <ListItemText
                        primary={file.name}
                        secondary={new Date(file.timestamp).toLocaleString()}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4, mb: 4 }}>
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
            <Button
              variant="contained"
              color="secondary"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              aria-label="Logout"
              sx={{ minWidth: 200, height: 60 }}
            >
              ログアウト
            </Button>
          </Box>
        </Container>
    );
};

export default MyPage;