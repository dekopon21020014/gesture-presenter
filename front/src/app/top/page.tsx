'use client';
import React from 'react';
import { Box, Button, Typography, Grid } from '@mui/material';

const Top = () => {
    return (
        <main>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    textAlign: 'center',
                    padding: 3
                }}
            >
                <Typography variant="h2" component="h1" gutterBottom>
                    ようこそ！
                </Typography>
                <Grid container spacing={2} justifyContent="center" sx={{ marginTop: 3 }}>
                    <Grid item>
                        <Button 
                            variant="contained" 
                            color="primary"
                            sx={{
                                width: '200px',  // ボタンの幅
                                height: '60px',  // ボタンの高さ
                                fontSize: '1.25rem'  // フォントサイズ
                            }}
                        >
                            新規登録
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button 
                            variant="contained" 
                            color="secondary"
                            sx={{
                                width: '200px',  // ボタンの幅
                                height: '60px',  // ボタンの高さ
                                fontSize: '1.25rem'  // フォントサイズ
                            }}
                        >
                            ログイン
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </main>
    );
}

export default Top;
