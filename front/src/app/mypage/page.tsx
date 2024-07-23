'use client';

import React, { useState, ChangeEvent, useRef, useCallback, useEffect } from 'react';
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
  Link
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import FileIcon from '@mui/icons-material/InsertDriveFile';
import PDFUploader from '../components/Form/FileUpForm';
import Graph from '../components/Graph/Graph';

interface FileData {
    filenames: string[];
    fileIds: number[];
}

const MyPage = () => {    
    const router = useRouter();

    const handleLogout = async (redirectUrl: string) => {
        try {
            const response = await fetch('http://localhost:8080/logout', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (response.ok) {
                window.location.href = redirectUrl;
                console.log('Logout successful');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const handleLogoutClick = () => handleLogout('/login');
    const handleHomeClick = () => handleLogout('/top');

    const [files, setFiles] = useState<FileData | null>(null);

    const fetchFiles = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:8080/api/pdf', { 
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            setFiles(data);
        } catch (error) {
            console.error('Error fetching files:', error);
            setFiles({ filenames: [], fileIds: [] });
        }
    }, []);

    useEffect(() => {
        const storedFacialIds = localStorage.getItem('facialIds');
        if (storedFacialIds) {
          const parsedFacialIds = JSON.parse(storedFacialIds);
          console.log(parsedFacialIds);
          // parsedFacialIdsを使用して何かする
          localStorage.removeItem('facialIds'); // 使用後は削除
        }
      }, []);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    return (
        <Container maxWidth="md">
          <Box component="main" sx={{ my: 4, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              My Page
            </Typography>
            <Typography variant="body1" paragraph>
              ここは認証されたユーザーのみがアクセスできるページです。
              <br />
              以下より使用したいPDFファイルをアップロードしてください。
            </Typography>
          </Box>

          <PDFUploader onUploadSuccess={fetchFiles} />
          
          <Paper elevation={3} sx={{ p: 3, mt: 4 }} component="section">
            <Typography variant="h5" component="h2" gutterBottom>
              Your Files
            </Typography>
            {files === null || files.filenames == null ? (
                <Typography aria-live="polite">You don't have uploaded any file yet.</Typography>
            ) : files.filenames.length === 0 ? (
                <Typography>No files found.</Typography>
            ) : (
                <List>
                    {files.filenames.map((filename, index) => (
                        <ListItem key={files.fileIds[index]}>
                            <FileIcon sx={{ mr: 2 }} />
                            <ListItemText
                                primary={
                                    <Link href={`/presentation/${files.fileIds[index]}`} underline="hover">
                                        {filename}
                                    </Link>
                                }
                            />
                        </ListItem>
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
                Home
            </Button>
            <Button
                variant="contained"
                color="secondary"
                onClick={handleLogoutClick}
                startIcon={<LogoutIcon />}
                aria-label="Logout"
                sx={{ minWidth: 200, height: 60 }}
            >
                Logout
            </Button>
          </Box>
          <Graph/>
        </Container>
      );
};

export default MyPage;
