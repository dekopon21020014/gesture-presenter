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

import DeleteIcon from '@mui/icons-material/Delete';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AnalysisIcon from '@mui/icons-material/Analytics';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionIcon from '@mui/icons-material/Description';

import AnalysisResult from './AnalysisResult';
import { fetchPDF } from '@/app/utils/pdfStore';
import { type StoredFileInfo } from "@/app/types/file-info.type"
import { saveFileInfoToLocalStorage, getAllFilesInfo, updateAdvice } from '@/app/utils/pdfStore'
import { Timestamp } from "firebase/firestore";
import FileUpFormFirebase from '@/app/components/Form/FileUpFormFirebase';

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
  comparison_feedback?: string;
  referenceFiles: [];
}

interface ReferenceFile {
  fileId: string;
  file: File;
}

type mainFileInfo = {
  id: string;
  fileName: string;
  filePath: string,
  fileUrl: string;
  fileSize: number
  advice: string;
  analyzed: boolean;
  createdAt: Timestamp;
  file?: File;
}

const AnalysisPage = () => {
  const searchParams = useSearchParams();
  const pdfId = searchParams.get('pdf_id');

  const [allFilesInfo, setAllFilesInfo] = useState<StoredFileInfo[] | undefined>(undefined);
  const [mainFileInfo, setMainFileInfo] = useState<mainFileInfo | undefined>(undefined);
  const [referenceFiles, setReferenceFiles] = useState<ReferenceFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  // テキスト抽出用の状態
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [textLoading, setTextLoading] = useState<boolean>(false);
  const [textError, setTextError] = useState<string | null>(null);

  const steps = ['ファイル確認', '比較用ファイル選択', '分析結果', 'テキスト抽出'];

  // pdfIdが更新されたらallFilesInfoとmainFileInfoを更新
  useEffect(() => {
    const fetchAndSetPdfFile = async () => {
      if (pdfId) {
        const allFilesInfo = await getAllFilesInfo();
        if (allFilesInfo && allFilesInfo.length > 0) {
          setAllFilesInfo(allFilesInfo);
          const mainFileInfo = allFilesInfo.find(fileInfo => fileInfo.id === pdfId);
          if (mainFileInfo) {
            setMainFileInfo({ ...mainFileInfo });
          }
        }
      }
    };
    fetchAndSetPdfFile();
  }, [pdfId]);

  // mainFileInfoが更新され、まだファイルが分析されていなければ自動で分析処理
  useEffect(() => {
    if (mainFileInfo && !mainFileInfo.analyzed && !analyzing) {
      performAnalysis(false);
      setAnalyzing(true);
      setActiveStep(1);
    } else if (mainFileInfo && mainFileInfo.analyzed) {
      try {
        const advice = JSON.parse(mainFileInfo.advice); // JSON.parseで文字列をオブジェクトに変換

        const analysisData: AnalysisData = {
          font_analysis: advice.font_analysis,
          gemini_response: advice.gemini_response,
          referenceFiles: []
        };

        setAnalysisData(analysisData);
        setActiveStep(2);
      } catch (error) {
        console.error("Error parsing advice:", error);
        setError("分析結果の読み込みに失敗しました。");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainFileInfo]);

  // analysisDataが設定されたら自動でテキスト抽出を実行
  useEffect(() => {
    const fetchText = async () => {
      if (mainFileInfo) {
        await performGetText();
      }
    };
    fetchText();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainFileInfo]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleFileUploadSuccess = (storedFileInfo: StoredFileInfo) => {
    saveFileInfoToLocalStorage(storedFileInfo)
    setAllFilesInfo((prev: StoredFileInfo[] | undefined) => [...(prev ?? []), storedFileInfo]);
  };
  
  const handleAddReference = async (fileId: string) => {
    if (fileId && referenceFiles.length < 5) {
      const file = await fetchPDF(fileId)
      if (file) {
        setReferenceFiles((prev: ReferenceFile[]) => [...prev, { fileId, file }]);
      }
    }
  };

  const handleRemoveReference = (fileId: string) => {
    setReferenceFiles((prev: ReferenceFile[]) => prev.filter((ref) => ref.fileId !== fileId));
  };

  const performAnalysis = async (compare: boolean) => {
    if (!mainFileInfo) return;

    const file = await fetchPDF(mainFileInfo.id)
    if (!file) return;
    setMainFileInfo({ ...mainFileInfo, file });
    console.log("MainFileInfo", mainFileInfo)

    const formData = new FormData();
    formData.append('file', file, mainFileInfo.fileName);

    // 比較用ファイルがある場合は他のファイルも送信する
    if (compare) {
      referenceFiles.forEach((ref: ReferenceFile) => {
        formData.append('ref', ref.file);
      });
    }

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

      if (!compare) {  // ファイル単独の分析時は分析結果を保存する
        updateAdvice(mainFileInfo.id, JSON.stringify(data))
      }

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

  // テキスト抽出関数の追加
  const performGetText = async () => {
    if (!mainFileInfo) return;

    const file = await fetchPDF(mainFileInfo.id);
    if (!file) return;

    setTextLoading(true);
    setTextError(null);
    setExtractedText(null);

    const formData = new FormData();
    formData.append('file', file, mainFileInfo.fileName);

    try {
      const response = await fetch('/api/get-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setExtractedText(data.extracted_text);
      setActiveStep(3); // テキスト抽出ステップへ移行
    } catch (error) {
      console.error('Get Text API error:', error);
      setTextError(
        error instanceof Error ? error.message : 'テキスト抽出中にエラーが発生しました。'
      );
    } finally {
      setTextLoading(false);
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
  if (!mainFileInfo) {
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
                  ファイル名: {mainFileInfo.fileName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  サイズ: {(mainFileInfo.fileSize / 1024 / 1024).toFixed(2)} MB
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
                <>
                  <Box sx={{ mb: 2 }}>
                    <FileUpFormFirebase onUploadSuccess={handleFileUploadSuccess} />
                    <List>
                      {allFilesInfo
                        ?.filter((fileInfo: StoredFileInfo) => 
                          fileInfo.id !== mainFileInfo.id &&
                          !referenceFiles.some((refFile: ReferenceFile) => refFile.fileId === fileInfo.id)
                        )
                        .map((fileInfo: StoredFileInfo) => (
                        <ListItem key={fileInfo.id}>
                          <ListItemText 
                            primary={fileInfo.fileName} 
                            secondary={`サイズ: ${(fileInfo.fileSize / 1024 / 1024).toFixed(2)} MB`} 
                          />
                          <Button
                            onClick={() => handleAddReference(fileInfo.id)}
                            variant="outlined"
                            size="small"
                          >
                            比較ファイルに追加
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </>
              )}

              {referenceFiles.length > 0 ? (
                <>
                  <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                    {referenceFiles.map((ref: ReferenceFile, index: number) => (
                      <React.Fragment key={ref.fileId}>
                        {index > 0 && <Divider />}
                        <ListItem
                          secondaryAction={
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => handleRemoveReference(ref.fileId)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          }
                        >
                          <ListItemText
                            primary={ref.file.name}
                            secondary={`サイズ: ${(
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
                      onClick={() => performAnalysis(true)}
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
                  比較用のPDFファイルを選択してください（最大5ファイル）
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
              <Fade in={true}>
                <Box>
                  <AnalysisResult
                    geminiResponse={analysisData ? analysisData.gemini_response : null}
                    fontAnalysis={analysisData ?analysisData.font_analysis: null}
                    comparisonData={analysisData ?analysisData.compare_result: null}
                    comparison_feedback={analysisData ?analysisData.comparison_feedback: null}
                    referenceFiles={referenceFiles}
                    extractedText={extractedText ? extractedText : null}
                  />
                </Box>
              </Fade>

            {/* テキスト抽出のローディング・エラー表示 */}
            {textLoading && (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100px"
                sx={{ mt: 4 }}
              >
                <CircularProgress />
              </Box>
            )}

            {textError && (
              <Alert
                severity="error"
                sx={{ mb: 4 }}
                onClose={() => setTextError(null)}
              >
                {textError}
              </Alert>
            )}
          </Box>
        </Fade>
      </Box>
    </Container>
  );
};

export default AnalysisPage;
