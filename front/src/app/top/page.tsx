'use client';
import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, Typography, Box, Grid, Paper } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import './font.css';

const Top = () => {
    const [showService, setShowService] = useState(false);
    const [showHeader, setShowHeader] = useState(false);
    const [showContent, setShowContent] = useState(false); // 追加
    const [showButton, setShowButton] = useState(false); 

    const handleScroll = () => {
        const scrollPosition = window.scrollY + window.innerHeight;
        const serviceElement = document.getElementById('service-section');
        const headerElement = document.getElementById('header-section');
        const contentElement = document.getElementById('content-section'); // 追加
        const buttonElement = document.getElementById('button-section');

        if (headerElement && scrollPosition > headerElement.offsetTop) {
            setShowHeader(true);
        }

        if (serviceElement && scrollPosition > serviceElement.offsetTop) {
            setShowService(true);
        }

        if (contentElement && scrollPosition > contentElement.offsetTop) { // 追加
            setShowContent(true);
        }

        if (buttonElement && scrollPosition > buttonElement.offsetTop) { // 追加
            setShowButton(true);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <Box sx={{ backgroundColor: '#f7f7f7', margin: 0 }}>
            <AppBar position="static" sx={{ backgroundColor: 'white', color: 'black' }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Link href="/" passHref>
                        <Box sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <Image
                                src="/toppage/presen_icon.png"
                                alt="Logo"
                                width={150}
                                height={50}
                                style={{ objectFit: 'contain' }}
                            />
                        </Box>
                    </Link>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Link href="/login" passHref>
                            <Button
                                color="inherit"
                                sx={{
                                    marginRight: 2,
                                    width: '180px',
                                    height: '50px',
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                ログイン
                            </Button>
                        </Link>
                        <Link href="/signup" passHref>
                            <Button
                                color="inherit"
                                sx={{
                                    width: '180px',
                                    height: '50px',
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                新規登録
                            </Button>
                        </Link>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Header Section */}
            <Box
                id="header-section"
                sx={{
                    position: 'relative',
                    height: '100vh',
                    overflow: 'hidden',
                    backgroundImage: 'url("/toppage/presen_sample1.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: showHeader ? 'translate(-50%, -50%)' : 'translate(-50%, 50%)',
                        opacity: showHeader ? 1 : 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        padding: '20px',
                        borderRadius: '5px',
                        maxWidth: '80%',
                        textAlign: 'center',
                        color: 'white',
                        zIndex: 1,
                        transition: 'transform 2.5s ease, opacity 1.5s ease'
                    }}
                >
                    <Typography variant="h3" component="h3" sx={{ color: 'white', letterSpacing: 3 }}>
                        上質なプレゼンをあなたの手に
                    </Typography>
                </Box>
            </Box>

            {/* Service Section */}
            <Box
                id="service-section"
                sx={{
                    backgroundColor: 'white',
                    padding: '4vh 0 14vh 0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    color: 'black',
                    transform: showService ? 'translateX(0)' : 'translateX(100px)',
                    opacity: showService ? 1 : 0,
                    transition: 'transform 2.5s ease, opacity 1s ease'
                }}
            >
                <Typography variant="h2" component="h2" sx={{ marginTop: '10vh', marginBottom: '2vh', fontFamily: "Bebas Neue" }}>
                    SERVICE
                </Typography>
                <Typography variant="h6" sx={{ maxWidth: '800px', lineHeight: 1.7 }}>
                    私たちはジェスチャーに応じたスライド操作を行うプレゼン支援ツールを提供します。<br />
                    カメラのあなたがとったジェスチャーを認識し、<br />
                    スライド操作、動作に応じたエフェクト・効果音の出現など、<br />
                    あなたの発表を更に動的なものへと進化させることができます。
                </Typography>
            </Box>

            {/* Content Section */}
            <Box
                id="content-section" // 追加
                sx={{
                    backgroundColor: '#FFFAF0',
                    padding: '5vh 5vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: 3,
                    flexDirection: 'column',
                    transform: showContent ? 'translateX(0)' : 'translateX(-100px)', // 追加
                    opacity: showContent ? 1 : 0, // 追加
                    transition: 'transform 2.5s ease, opacity 1s ease' // 追加
                }}
            >

                <Typography variant="h2" component="h2" sx={{ fontFamily: "Bebas Neue" }}>
                    EFFECT
                </Typography>
                <Typography variant="h6" component="h6" sx={{ marginBottom: '1vh' }}>
                    私たちのサービスではこのような効果が期待できます
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: 3,
                    }}
                >
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Paper
                            key={index}
                            sx={{
                                padding: 5,
                                width: '25%',
                                textAlign: 'center',
                                backgroundColor: '#FFF5EE',
                            }}
                        >
                            <Image
                                src={index === 0 ? '/toppage/smooth.jpg' : index === 1 ? '/toppage/relax.jpg' : '/toppage/power.jpg'}
                                alt={`Content ${index + 1}`}
                                width={300}
                                height={150}
                                style={{ objectFit: 'contain', marginBottom: '1rem' }}
                            />
                            <Typography variant="h5" sx={{ marginTop: '1vh', marginBottom: '3vh', fontWeight: 900}}>
                            {index === 0 && "プレゼンの円滑化"}
                            {index === 1 && "緊張の緩和"}
                            {index === 2 && "説得力の増加"}
                            </Typography>
                            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                            {index === 0 && "キーボードやボタン押下などの操作をせずとも、ジェスチャー1つでページ送り・戻りを行うことができます。これによりプレゼンテーションの進行をよりスムーズにすることができます。"}
                            {index === 1 && "エフェクトや効果音の出現は話し手・聞き手の両者に頬のほころびを誘い、発表に”緊張と緩和”をもたらします。またジェスチャーで体を動かすことによる緊張の緩和も期待できます。"}
                            {index === 2 && "スライド操作に伴うジェスチャーによって、あなたの発表はより動的になり、聞き手の興味関心を引くことが可能になります。これにより発表の説得力増加を期待できることでしょう。"}
                            </Typography>
                        </Paper>
                    ))}
                </Box>
            </Box>
            <Box
                sx={{
                    backgroundColor: 'white',
                    padding: '20vh 0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    color: 'black',
                }}
            >
                <Paper
                    id="button-section" // 追加
                    sx={{
                        padding: '3vh 6vw',
                        border: '4px solid black',
                        display: 'inline-block',
                        margin: '0 auto',
                        textAlign: 'center',
                        backgroundColor: '#FFF5EE',
                        flexDirection: 'column',
                        transform: showContent ? 'translateY(0)' : 'translateY(100px)', // 追加
                        opacity: showContent ? 1 : 0, // 追加
                        transition: 'transform 2.5s ease, opacity 1s ease' // 追加
                    }}
                >
                    <Typography variant="h5" component="p" gutterBottom sx={{ marginBottom: 3 }}>
                        ご利用はこちらから
                    </Typography>
                    <Grid container spacing={5} justifyContent="center">
                        <Grid item>
                            <Link href="/login" passHref>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{
                                        width: '200px',
                                        height: '60px',
                                        fontSize: '1.5rem'
                                    }}
                                >
                                    ログイン
                                </Button>
                            </Link>
                        </Grid>
                        <Grid item>
                            <Link href="/signup" passHref>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    sx={{
                                        width: '200px',
                                        height: '60px',
                                        fontSize: '1.5rem'
                                    }}
                                >
                                    新規登録
                                </Button>
                            </Link>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>

            {/* Footer */}
            <Box
                component="footer"
                sx={{
                    backgroundColor: 'white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '14vh',
                    color: 'black',
                    padding: 3
                }}
            >
                <Button
                    variant="contained"
                    color="inherit"
                    onClick={scrollToTop}
                    sx={{
                        width: '200px',
                        height: '50px',
                        fontSize: '1rem',
                        backgroundColor: 'black',
                        color: 'white',
                        '&:hover': {
                            backgroundColor: '#f0f4c3',
                        }
                    }}
                >
                    ページ上部に戻る
                </Button>
            </Box>
        </Box>
    );
}

export default Top;
