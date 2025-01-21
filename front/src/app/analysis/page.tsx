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
import FileUpFormFirebase from '@/app/components/Form/FileUpFormFirebase';
import {
  getAllFilesInfoFromFirebase,
  getFileFromStorage,
  addAdvice,
  // getTranscription, // コメントアウト
} from '@/app/firebase/form/fileInfo';

import { StoredFileInfo } from "@/app/types/file-info.type"
import { Timestamp } from "firebase/firestore";

interface FontAnalysis {
  mean_size: number;
  size_variation: number;
  std_size: number;
}

interface ComparisonResult {
  similarity_score: number;
  comparison_notes: string;
}

interface AnalysisData {
  font_analysis: FontAnalysis;
  gemini_response: string;
  compare_result?: {
    [key: string]: ComparisonResult;
  };
  comparison_feedback?: string;
  referenceFiles: File[];
}

interface ReferenceFile {
  fileId: string;
  file: File;
}

type MainFileInfo = {
  id: string;
  fileName: string;
  filePath: string;
  fileUrl: string;
  fileSize: number;
  advice: string;
  analyzed: boolean;
  createdAt: Timestamp;
  file?: File;
};

interface ExtractedText {
  [page: number]: string;
}

interface TranscriptionMap {
  [page: string]: string | null;
}

const AnalysisPage = () => {
  const searchParams = useSearchParams();
  const pdfId = searchParams.get('pdf_id');

  const [allFilesInfo, setAllFilesInfo] = useState<StoredFileInfo[] | undefined>(undefined);
  const [mainFileInfo, setMainFileInfo] = useState<MainFileInfo | undefined>(undefined);
  const [referenceFiles, setReferenceFiles] = useState<ReferenceFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const [extractedText, setExtractedText] = useState<ExtractedText | null>(null);
  const [textLoading, setTextLoading] = useState<boolean>(false);
  const [textError, setTextError] = useState<string | null>(null);

  const [transcriptions, setTranscriptions] = useState<TranscriptionMap>({});
  const [presentationAnalysisResult, setPresentationAnalysisResult] = useState<any>(null);

  const steps = ['ファイル確認', '比較用ファイル選択', '分析結果', 'テキスト抽出'];

  useEffect(() => {
    const fetchAndSetPdfFile = async () => {
      if (pdfId) {
        const allFiles = await getAllFilesInfoFromFirebase();
        if (allFiles && allFiles.length > 0) {
          setAllFilesInfo(allFiles);
          const mainFile = allFiles.find((fileInfo) => fileInfo.id === pdfId);
          if (mainFile) {
            setMainFileInfo({ ...mainFile });
          }
        }
      }
    };
    fetchAndSetPdfFile();
  }, [pdfId]);

  useEffect(() => {
    if (mainFileInfo && !mainFileInfo.analyzed && !analyzing) {
      performAnalysis(false);
      setAnalyzing(true);
      setActiveStep(1);
    } else if (mainFileInfo && mainFileInfo.analyzed) {
      try {
        const advice = JSON.parse(mainFileInfo.advice);
        const data: AnalysisData = {
          font_analysis: advice.font_analysis,
          gemini_response: advice.gemini_response,
          referenceFiles: [],
        };
        if (advice.compare_result) {
          data.compare_result = advice.compare_result;
        }
        if (advice.comparison_feedback) {
          data.comparison_feedback = advice.comparison_feedback;
        }
        setAnalysisData(data);
        setActiveStep(2);
      } catch (error) {
        setError("分析結果の読み込みに失敗しました。");
      }
    }
  }, [mainFileInfo]);

  useEffect(() => {
    const fetchTextAndTranscription = async () => {
      if (analysisData && !extractedText && !textLoading && mainFileInfo) {
        await performGetText();
        await createDummyTranscriptions(); // getTranscriptionをコメントアウトし、ダミーを使用
      }
    };
    fetchTextAndTranscription();
  }, [analysisData]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleFileUploadSuccess = (storedFileInfo: StoredFileInfo) => {
    setAllFilesInfo((prev) => [...(prev ?? []), storedFileInfo]);
  };

  const handleAddReference = async (fileId: string) => {
    if (fileId && referenceFiles.length < 5) {
      const file = await getFileFromStorage(fileId);
      if (file) {
        setReferenceFiles((prev) => [...prev, { fileId, file }]);
      }
    }
  };

  const handleRemoveReference = (fileId: string) => {
    setReferenceFiles((prev) => prev.filter((ref) => ref.fileId !== fileId));
  };

  const performAnalysis = async (compare: boolean) => {
    if (!mainFileInfo) return;
    const file = await getFileFromStorage(mainFileInfo.id);
    if (!file) return;
    setMainFileInfo({ ...mainFileInfo, file });

    const formData = new FormData();
    formData.append('file', file, mainFileInfo.fileName);
    if (compare) {
      referenceFiles.forEach((ref) => {
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
      if (!compare) {
        await addAdvice(mainFileInfo.id, JSON.stringify(data));
      }
      setAnalysisData(data);
      setActiveStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const performGetText = async () => {
    if (!mainFileInfo) return;
    const file = await getFileFromStorage(mainFileInfo.id);
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
      const data: ExtractedText = await response.json();
      setExtractedText(data);
      setActiveStep(3);
    } catch (err: any) {
      setTextError(err.message);
    } finally {
      setTextLoading(false);
    }
  };

  // getTranscriptionをコメントアウトし、ダミー文字起こしを作成
  const createDummyTranscriptions = async () => {
    if (!extractedText) return;
    const pages = Object.keys(extractedText);
    const tempMap: TranscriptionMap = {};
    for (const pageNum of pages) {
      // const transcriptionText = await getTranscription(mainFileInfo.id, pageNum);
      // tempMap[pageNum] = transcriptionText;
      tempMap[pageNum] = `Dummy transcription for page ${pageNum}`;
    }
    setTranscriptions(tempMap);
  };

  // analyze-presentation: extractedText + ダミーtranscriptionsをまとめて送信
  const performAnalyzePresentation = async () => {
    if (!extractedText) return;
    try {
      const presentationsdata: any = {};
      Object.entries(extractedText).forEach(([page, text]) => {
        presentationsdata[page] = {
          slide: text,
          transcription: transcriptions[page] || `Dummy transcription for page ${page}`
        };
      });

      const response = await fetch('/api/analyze-presentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(presentationsdata),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      const result = await response.json();
      setPresentationAnalysisResult(result);
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!mainFileInfo) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom color="error">
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
        <Typography variant="h4" align="center" gutterBottom>
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
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
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

            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <CompareArrowsIcon sx={{ mr: 1 }} />
                比較用ファイル
              </Typography>

              {referenceFiles.length < 5 && (
                <>
                  <Box sx={{ mb: 2 }}>
                    <FileUpFormFirebase onUploadSuccess={handleFileUploadSuccess} />

                    <List>
                      {allFilesInfo
                        ?.filter((fileInfo) =>
                          fileInfo.id !== mainFileInfo.id &&
                          !referenceFiles.some((refFile) => refFile.fileId === fileInfo.id)
                        )
                        .map((fileInfo) => (
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
                    {referenceFiles.map((ref, index) => (
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
                            secondary={`サイズ: ${(ref.file.size / 1024 / 1024).toFixed(2)} MB`}
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
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => performAnalysis(true)}
                      disabled={analyzing}
                      startIcon={
                        analyzing ? <CircularProgress size={20} /> : <AnalysisIcon />
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

            {analyzing && (
              <Box sx={{ width: '100%', mb: 4 }}>
                <LinearProgress />
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {analysisData && (
              <Fade in={true}>
                <Box>
                  <AnalysisResult
                    geminiResponse={analysisData.gemini_response}
                    fontAnalysis={analysisData.font_analysis}
                    comparisonData={analysisData.compare_result}
                    comparison_feedback={analysisData.comparison_feedback}
                    referenceFiles={referenceFiles}
                    extractedText={extractedText}
                    transcriptions={transcriptions}
                    presentationAnalysisResult={presentationAnalysisResult}
                  />
                </Box>
              </Fade>
            )}

            {textLoading && (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px" sx={{ mt: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {textError && (
              <Alert severity="error" sx={{ mb: 4 }} onClose={() => setTextError(null)}>
                {textError}
              </Alert>
            )}

            {extractedText && (
              <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  analyze-presentation
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  抽出したページテキスト + ダミー文字起こしを
                  <code>/api/analyze-presentation</code>に送信します。
                </Typography>
                <Button variant="contained" onClick={performAnalyzePresentation}>
                  プレゼンテーション解析を実行
                </Button>
              </Paper>
            )}
          </Box>
        </Fade>
      </Box>
    </Container>
  );
};

export default AnalysisPage;
