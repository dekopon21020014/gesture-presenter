"use client"

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  Paper, 
  Box,
  Link
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import FileIcon from '@mui/icons-material/InsertDriveFile';

interface FileData {
    filenames: string[];
    fileIds: number[];
}

const MyPage = () => {    
    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:8080/logout', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (response.ok) {
                window.location.href = '/login';
                console.log('Logout successful');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }

    //const [files, setFiles] = useState(null);
    const [files, setFiles] = useState<FileData | null>(null);
    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/pdf', { 
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                const data = await response.json();
                console.log(data)
                setFiles(data);
            } catch (error) {
                console.error('Error fetching files:', error);
                setFiles({ filenames: [], fileIds: [] });
            }
        };

        fetchFiles();
    }, []);  

    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    My Page
                </Typography>
                <Typography variant="body1" paragraph>
                    This is a protected page that only authenticated users can access.
                </Typography>
                <Button 
                    variant="contained" 
                    color="secondary"
                    onClick={handleLogout}
                    startIcon={<LogoutIcon />}
                >
                    Logout
                </Button>
            </Box>

            <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Your Files
                </Typography>
                {files === null || files.filenames == null ? (
                    "you don't have uploaded any file yet"
                ) : files.filenames.length === 0 ? (
                    <Typography>No files found.</Typography>
                ) : (
                    <List>
                        {files.filenames.map((filename, index) => (
                            <ListItem key={files.fileIds[index]}>
                                <FileIcon sx={{ mr: 2 }} />
                                <ListItemText 
                                    primary={
                                        <Link href={`/presentation/${files.fileIds[index]}`}>
                                            {filename}
                                        </Link>
                                    } 
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Paper>
        </Container>
    );
};

export default MyPage;