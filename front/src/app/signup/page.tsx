'use client';
import { SignUpForm } from '@/app/components/Form/SignUpForm';
import { useSignUpForm } from './use-sign-up-form';
import { Box, Typography, Button } from '@mui/material';

export default function Home() {
  const { isLoading, signUp } = useSignUpForm();

  return (
    <main style={{ paddingTop: '80px', textAlign: 'center' }}>
      <Typography 
        variant="h4" 
        component="h4" 
        style={{ 
          marginBottom: '20px', 
          position: 'relative', 
          display: 'inline-block'
        }}
      >
        SIGNUP
        <Box 
          style={{ 
            position: 'absolute', 
            left: '0', 
            bottom: '-5px', 
            width: '100%', 
            height: '5px', 
            backgroundColor: 'red',
            zIndex: '-2'
          }}
        />
      </Typography>
      <SignUpForm onSubmit={signUp} isLoading={isLoading} />
      <Box display="flex" flexDirection="column" alignItems="center" marginTop="50px" marginBottom="50px">
        <Box width="200px">
          <Button 
            variant="contained" 
            href="/login" 
            style={{ 
              padding: '8px 10px', 
              fontSize: '16px', 
              backgroundColor: '#FF6F6F',
              color: 'white', 
              borderColor: 'transparent', 
              borderWidth: '2px', 
              width: '100%' 
            }}
          >
            login
          </Button>
        </Box>
        <Box width="200px" marginTop="20px">
          <Button 
            variant="contained" 
            href="/mypage" 
            style={{ 
              padding: '8px 10px', 
              fontSize: '16px', 
              backgroundColor: '#6F8BCC',
              color: 'white',
              borderColor: 'transparent',
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
