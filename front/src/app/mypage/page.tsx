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
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import FileUpFormFirebase from '../components/Form/FileUpFormFirebase';
import { type StoredFileInfo } from '@/app/types/file-info.type'
import { saveFileInfoToLocalStorage, getAllFilesInfo, cleanupOldFiles, deleteFileInfo, deleteAllFilesInfo, deleteFromLocalStorage } from '@/app/utils/pdfStore'
import { Timestamp } from 'firebase/firestore';

interface UploadedFile {
  id: string;
  name: string;
  timestamp: Timestamp;
}

const MyPage = () => {    
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [user, setUser] = useState<User | null>(null); 

  // Firebase Authの監視
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setUser(user); 
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // クリーンアップ関数の実行
  useEffect(() => {
    const cleanup = async () => {
      cleanupOldFiles();  // localStorage内の古いファイルを削除
      const fileInfo: StoredFileInfo[] | undefined = await getAllFilesInfo();
      if (fileInfo) {
        const currentFiles: UploadedFile[] = fileInfo.map((data) => ({
          id: data.id,
          name: data.fileName,
          timestamp: data.createdAt 
        }));

        setUploadedFiles(currentFiles);
      }
    };
  
    cleanup();
    const interval = setInterval(cleanup, 5 * 60 * 1000); 
    return () => clearInterval(interval);
  }, []);
  
  const handleLocalUploadSuccess = (storedFileInfo: StoredFileInfo) => {
    saveFileInfoToLocalStorage(storedFileInfo)
    const uploadedFile: UploadedFile = {
      id: storedFileInfo.id,
      name: storedFileInfo.fileName,
      timestamp: storedFileInfo.createdAt 
    };
  
    setUploadedFiles((prev: UploadedFile[]) => [...prev, uploadedFile]);
  };

  const handleDelete = (fileId: string) => {
    deleteFileInfo(fileId)
    setUploadedFiles((prev: UploadedFile[]) => prev.filter(file => file.id !== fileId));
  };

  const handleAnalyze = (fileId: string) => {
    router.push(`/analysis?pdf_id=${fileId}`);
  };

  const handlePresent = (fileId: string) => {
    router.push(`/presentation?pdf_id=${fileId}`);
  };

  const handleLogout = async () => {
    deleteFromLocalStorage();
    const auth = getAuth();
    await auth.signOut();
    setUploadedFiles([]);
    router.push('/login');
  };

  const handleHomeClick = () => {
    router.push('/top');
  };

  if (!user) {
    return <>Loading...</>;
  }
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
        <FileUpFormFirebase onUploadSuccess={handleLocalUploadSuccess} />

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
              {uploadedFiles.map((file: UploadedFile) => (
                <React.Fragment key={file.id}>
                  <ListItem>
                    <FileIcon sx={{ mr: 2 }} />
                    <ListItemText
                      primary={file.name}
                      secondary={new Date(file.timestamp.seconds*1000).toString()}
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
