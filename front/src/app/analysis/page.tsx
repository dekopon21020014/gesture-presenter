'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Typography, Paper, Box, CircularProgress } from '@mui/material';
import { getPDFFromStore } from '../utils/pdfStore';
import { Button } from '@mui/material';
import Link from 'next/link';

// Import the AnalysisResult component we created earlier
import AnalysisResult from './AnalysisResult';

interface FontAnalysis {
  mean_size: number;
  size_variation: number;
  std_size: number;
}

interface AnalysisData {
  font_analysis: FontAnalysis;
  gemini_response: string;
}

const AnalysisPage = () => {
  const searchParams = useSearchParams();
  const pdfId = searchParams.get('pdf_id');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async (file: File) => {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file, file.name);
    
      try {
        const response = await fetch('/api/analyze-slide', {
          method: 'POST',
          body: formData,
        });
    
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error:', errorText);
          throw new Error(`Error: ${response.status} - ${errorText}`);
        }
    
        const data = await response.json();
        console.log('Backend response:', data);
        
        // Validate the response data structure
        if (!data.gemini_response) {
          throw new Error('Invalid response format: missing gemini_response');
        }
        
        setAnalysisData(data);
      } catch (error) {
        console.error('Analysis API error:', error);
        setError(error instanceof Error ? error.message : '分析中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };

    const file = getPDFFromStore(pdfId);
    console.log('Fetched file:', file);
    setPdfFile(file);

    if (file) {
      fetchAnalysis(file);
    } else {
      setLoading(false);
    }
  }, [pdfId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!pdfFile) {
    return (
      <Container>
        <Typography variant="h6" color="error" align="center" sx={{ mt: 4 }}>
          PDFファイルが見つかりませんでした。
          <br />
          ファイルが削除されたか、URLが無効である可能性があります。
        </Typography>
        <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            href="/mypage"
          >
            マイページへ戻る
          </Button>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography variant="h4" component="h1" align="center" sx={{ my: 4 }}>
          PDF分析
        </Typography>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            ファイル情報:
          </Typography>
          <Typography>
            ファイル名: {pdfFile.name}
            <br />
            サイズ: {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
          </Typography>
        </Paper>
        <Paper elevation={3} sx={{ p: 3, bgcolor: 'error.light' }}>
          <Typography color="error.dark">
            エラーが発生しました: {error}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" align="center" sx={{ my: 4 }}>
        PDF分析
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          ファイル情報:
        </Typography>
        <Typography>
          ファイル名: {pdfFile.name}
          <br />
          サイズ: {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
        </Typography>
      </Paper>

      {analysisData && (
        <AnalysisResult 
          geminiResponse={analysisData.gemini_response}
          fontAnalysis={analysisData.font_analysis}
        />
      )}
    </Container>
  );
};

export default AnalysisPage;