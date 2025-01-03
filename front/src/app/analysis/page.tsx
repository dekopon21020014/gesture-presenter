'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Typography, Paper, Box, CircularProgress } from '@mui/material';
import { getPDFFromStore } from '../utils/pdfStore';
import { Button } from '@mui/material'
import {Link} from 'next'

const AnalysisPage = () => {
  const searchParams = useSearchParams();
  const pdfId = searchParams.get('pdf_id');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async (file: File) => {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/analyze-slide', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Backend response:', data);
        setAnalysisResult(data.analysis_result || 'No result available');
      } catch (error) {
        console.error('Analysis API error:', error);
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

  return (
    <Container>
      <Typography variant="h4" component="h1" align="center" sx={{ my: 4 }}>
        PDF分析
      </Typography>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          ファイル情報:
        </Typography>
        <Typography>
          ファイル名: {pdfFile.name}
          <br />
          サイズ: {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
        </Typography>
      </Paper>

      {analysisResult && (
        <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            分析結果:
          </Typography>
          <Typography>
            {analysisResult}
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default AnalysisPage;
