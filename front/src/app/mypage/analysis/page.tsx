'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Typography, Paper, Box, CircularProgress } from '@mui/material';
import { fetchPDF } from '../../utils/pdfStore';

const AnalysisPage = () => {
  const searchParams = useSearchParams();
  const pdfId = searchParams.get('pdf_id');
  const [pdfFile, setPdfFile] = useState<File | null | undefined>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchAndSetPdfFile = async () => {
      if (pdfId) {
        try {
          const file = await fetchPDF(pdfId);
          setPdfFile(file);
        } catch (error) {
          console.error("Error in fetching the PDF:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAndSetPdfFile();
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
        
        {/* ここにPDF分析用のコンポーネントを追加 */}
      </Paper>
    </Container>
  );
};

export default AnalysisPage;

