'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  CircularProgress,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Fade,
  LinearProgress
} from '@mui/material';
import Link from 'next/link';

import { getPDFFromStore } from '../utils/pdfStore';
import DeleteIcon from '@mui/icons-material/Delete';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AnalysisIcon from '@mui/icons-material/Analytics';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionIcon from '@mui/icons-material/Description';

import AnalysisResult from './AnalysisResult';

interface FontAnalysis {
  mean_size: number;
  size_variation: number;
  std_size: number;
}

interface AnalysisData {
  font_analysis: FontAnalysis;
  gemini_response: string;
  compare_result?: {
    [key: string]: {
      similarity_score: number;
      comparison_notes: string;
    };
  };
}

interface ReferenceFile {
  file: File;
  id: string;
}

const AnalysisPage = () => {
  const searchParams = useSearchParams();
  const pdfId = searchParams.get('pdf_id');

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [referenceFiles, setReferenceFiles] = useState<ReferenceFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['ファイル確認', '比較用ファイル選択', '分析結果'];

  // ページ初回ロード時にPDFファイルを取得
  useEffect(() => {
    const file = getPDFFromStore(pdfId);
    setPdfFile(file);
    setLoading(false);

    if (file) {
      setActiveStep(1);
    }
  }, [pdfId]);

  /**
   * pdfFile が取得できた段階で自動分析を実行
   */
  useEffect(() => {
    if (pdfFile) {
      performAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfFile]);

  const handleReferenceUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && referenceFiles.length < 5) {
      const file = event.target.files[0];
      const fileId = Math.random().toString(36).substr(2, 9);
      setReferenceFiles((prev) => [...prev, { file, id: fileId }]);
    }
  };

  const handleRemoveReference = (id: string) => {
    setReferenceFiles((prev) => prev.filter((ref) => ref.id !== id));
  };

  const performAnalysis = async () => {
    if (!pdfFile) return;
    setAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', pdfFile, pdfFile.name);

    // 比較用ファイルがある場合は送信して再分析する
    referenceFiles.forEach((ref) => {
      formData.append('ref', ref.file);
    });

    try {
      const response = await fetch('/api/analyze-slide', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setAnalysisData(data);
      setActiveStep(2);
    } catch (error) {
      console.error('Analysis API error:', error);
      setError(
        error instanceof Error ? error.message : '分析中にエラーが発生しました。'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // ローディング表示
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // ファイルが無かった場合
  if (!pdfFile) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom color="error">
            <DescriptionIcon sx={{ fontSize: 60, mb: 2 }} />
            <br />
            PDFファイルが見つかりませんでした
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            ファイルが削除されたか、URLが無効である可能性があります。
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            href="/mypage"
            startIcon={<ArrowBackIcon />}
            size="large"
          >
            マイページへ戻る
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          プレゼンテーション分析
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Fade in={true}>
          <Box>
            {/* 分析対象ファイル */}
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <DescriptionIcon sx={{ mr: 1 }} />
                分析対象ファイル
              </Typography>
              <Box sx={{ pl: 4 }}>
                <Typography variant="body1" gutterBottom>
                  ファイル名: {pdfFile.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  サイズ: {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Box>
            </Paper>

            {/* 比較用ファイル */}
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <CompareArrowsIcon sx={{ mr: 1 }} />
                比較用ファイル
              </Typography>

              {referenceFiles.length < 5 && (
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadFileIcon />}
                  sx={{ mb: 2 }}
                  color="primary"
                >
                  比較用ファイルを追加
                  <input
                    type="file"
                    hidden
                    accept=".pdf"
                    onChange={handleReferenceUpload}
                  />
                </Button>
              )}

              {referenceFiles.length > 0 ? (
                <>
                  <List
                    sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                  >
                    {referenceFiles.map((ref, index) => (
                      <React.Fragment key={ref.id}>
                        {index > 0 && <Divider />}
                        <ListItem
                          secondaryAction={
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => handleRemoveReference(ref.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          }
                        >
                          <ListItemText
                            primary={ref.file.name}
                            secondary={`${(
                              ref.file.size / 1024 / 1024
                            ).toFixed(2)} MB`}
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {5 - referenceFiles.length}個のファイルを追加できます
                    </Typography>
                  </Box>

                  {/* 再分析ボタン */}
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={performAnalysis}
                      disabled={analyzing}
                      startIcon={
                        analyzing ? (
                          <CircularProgress size={20} />
                        ) : (
                          <AnalysisIcon />
                        )
                      }
                      size="large"
                    >
                      {analyzing ? '再分析中...' : '再分析'}
                    </Button>
                  </Box>
                </>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  比較用のPDFファイルをアップロードしてください（最大5ファイル）
                </Alert>
              )}
            </Paper>

            {/* ローディングバー */}
            {analyzing && (
              <Box sx={{ width: '100%', mb: 4 }}>
                <LinearProgress />
              </Box>
            )}

            {/* エラー表示 */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 4 }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}

            {/* 分析結果 */}
            {analysisData && (
              <Fade in={true}>
                <Box>
                  <AnalysisResult
                    geminiResponse={analysisData.gemini_response}
                    fontAnalysis={analysisData.font_analysis}
                    comparisonData={analysisData.compare_result}
                    referenceFiles={referenceFiles}
                  />
                </Box>
              </Fade>
            )}
          </Box>
        </Fade>
      </Box>
    </Container>
  );
};

export default AnalysisPage;
