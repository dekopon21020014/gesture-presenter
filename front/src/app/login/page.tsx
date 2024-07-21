'use client';
import { LogInForm } from '@/app/components/Form/LogInForm';
import { useLogInForm } from './use-log-in-form';
import { Box, Typography, Button } from '@mui/material';

export default function Home() {
  const { isLoading, logIn } = useLogInForm();

  return (
    <main style={{ paddingTop: '80px', textAlign: 'center' }}>
      <Typography 
        variant="h4" 
        component="h4" 
        style={{ 
          marginBottom: '20px', 
          position: 'relative', 
          display: 'inline-block',
          fontFamily: 'Roboto, sans-serif', // フォントファミリーを設定
          fontWeight: '500' // フォントの太さを設定
        }}
      >
        LOGIN
        <Box 
          style={{ 
            position: 'absolute', 
            left: '0', 
            bottom: '-5px', 
            width: '100%', 
            height: '5px', 
            backgroundColor: 'red', // マーカー風の色
            zIndex: '-2'
          }}
        />
      </Typography>
      <LogInForm onSubmit={logIn} isLoading={isLoading} />
      <Box display="flex" flexDirection="column" alignItems="center" marginTop="50px" marginBottom="50px">
        <Box width="200px">
          <Button 
            variant="contained" 
            href="/signup" 
            style={{ 
              padding: '8px 10px', 
              fontSize: '16px', 
              backgroundColor: '#6F8BCC', // 薄めの青
              color: 'white', // ボタン内の文字色を白に
              borderColor: 'transparent', // 縁を透明に
              borderWidth: '2px', 
              width: '100%' 
            }}
          >
            signup
          </Button>
        </Box>
        <Box width="200px" marginTop="20px">
          <Button 
            variant="contained" 
            href="/mypage" 
            style={{ 
              padding: '8px 10px', 
              fontSize: '16px', 
              backgroundColor: '#FF6F6F', // 薄めの赤
              color: 'white', // ボタン内の文字色を白に
              borderColor: 'transparent', // 縁を透明に
              borderWidth: '2px', 
              width: '100%' 
            }}
          >
            mypage
          </Button>
        </Box>

        <Box width="200px" marginTop="70px">
          <Button 
            variant="contained" 
            href="/top"
            style={{ 
              padding: '8px 10px', 
              fontSize: '16px', 
              backgroundColor: '#9CCC65', 
              color: 'white',
              borderColor: 'transparent',
              borderWidth: '2px', 
              width: '100%' 
            }}
          >
            HOME
          </Button>
        </Box>
      </Box>
    </main>
  );
}
