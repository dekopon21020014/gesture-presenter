import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Divider,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tabs,
  Tab,
  Grid
} from '@mui/material';

import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import PrintIcon from '@mui/icons-material/Print';
import CompareIcon from '@mui/icons-material/Compare';
import DescriptionIcon from '@mui/icons-material/Description';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import MessageIcon from '@mui/icons-material/Message';
import PresentationAnalysisList from './PresentationAnalysisList';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

import { Button } from 'ginga-ui/core';
import ThemeClient from 'ginga-ui/ai';

interface FontAnalysis {
  mean_size: number;
  size_variation: number;
  std_size: number;
}

interface ComparisonResult {
  similarity_score: number;
  comparison_notes: string;
}

interface ComparisonData {
  [key: string]: ComparisonResult;
}

interface ReferenceFile {
  fileId: string;
  file: File;
}

interface ExtractedText {
  [page: number]: string;
}

interface TranscriptionMap {
  [page: string]: string | null;
}

interface AnalysisResultProps {
  geminiResponse: string | null;
  fontAnalysis: FontAnalysis | null;
  comparisonData?: ComparisonData | null;
  comparison_feedback?: string | null;
  referenceFiles: ReferenceFile[] | null;

  /** 追加: analyze-presentation の結果を受け取る */
  presentationAnalysisResult?: any;

  extractedText?: ExtractedText | null;
  transcriptions?: TranscriptionMap;
}

const TabPanel = ({
  children,
  value,
  index,
  ...other
}: {
  children: React.ReactNode;
  value: number;
  index: number;
}) => (
  <div role="tabpanel" hidden={value !== index} {...other}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const convertCSSVariablesToString = (variables: Record<string, string>) => {
  return (
    ':root { ' +
    Object.entries(variables)
      .map(([key, value]) => `${key}: ${value};`)
      .join(' ') +
    ' }'
  );
};

const CATEGORY_LABELS: Record<string, string> = {
  technical: '技術的な説明',
  background: '背景説明',
  methodology: '手法の説明',
  results: '結果・成果',
  conclusion: 'まとめ',
};

const AnalysisResult: React.FC<AnalysisResultProps> = ({
  geminiResponse,
  fontAnalysis,
  comparisonData,
  comparison_feedback,
  referenceFiles = [],
  presentationAnalysisResult,  // analyze-presentationの返却結果
  extractedText,
  transcriptions,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [themeCSS, setThemeCSS] = useState('');

  const themeClient = new ThemeClient({
    clientType: 'openai',
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const generateTheme = async () => {
    try {
      const response = await themeClient.generateTheme('PDF分析レポートのテーマ');
      const { CSSCode } = response;
      setThemeCSS(convertCSSVariablesToString(CSSCode));
    } catch (err) {
      console.error('テーマ生成エラー:', err);
    }
  };

  useEffect(() => {
    generateTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // === 基本分析セクション ===
  const feedbackSections = [
    {
      title: '全体的なフィードバック',
      icon: DescriptionIcon,
      content: geminiResponse || '解析結果がありません。',
    },
    {
      title: '視覚的一貫性',
      icon: FormatSizeIcon,
      content: '視覚的一貫性に関する追加コメントがあれば表示',
      metrics: [
        {
          label: '平均フォントサイズ',
          value: fontAnalysis?.mean_size
            ? `${fontAnalysis.mean_size.toFixed(1)}pt`
            : 'N/A',
        },
        {
          label: 'フォントサイズのばらつき',
          value: fontAnalysis?.std_size
            ? fontAnalysis.std_size.toFixed(1)
            : 'N/A',
        },
        {
          label: 'フォントサイズの種類',
          value: fontAnalysis?.size_variation
            ? `${fontAnalysis.size_variation}種類`
            : 'N/A',
        },
      ],
    },
    {
      title: 'メインメッセージ',
      icon: MessageIcon,
      content: 'メインメッセージの把握状況や伝わりやすさ等について',
    },
  ];

  // ダミーデータを使った比較分析用のテーブル
  let structuralData: Array<{ aspect: string; current: number; reference: number }> = [];
  let distributionData: Array<{ category: string; current: number; reference: number }> = [];

  if (comparisonData && Object.keys(comparisonData).length > 0) {
    structuralData = [
      { aspect: '目次', current: 80, reference: 70 },
      { aspect: 'まとめ', current: 60, reference: 50 },
      { aspect: '問題提起', current: 90, reference: 80 },
      { aspect: '具体例', current: 70, reference: 75 },
    ];
    distributionData = [
      { category: CATEGORY_LABELS.technical, current: 40, reference: 30 },
      { category: CATEGORY_LABELS.background, current: 50, reference: 45 },
      { category: CATEGORY_LABELS.methodology, current: 60, reference: 55 },
      { category: CATEGORY_LABELS.results, current: 70, reference: 65 },
      { category: CATEGORY_LABELS.conclusion, current: 85, reference: 80 },
    ];
  }

  return (
    <Container maxWidth="lg">
      {themeCSS && <style>{themeCSS}</style>}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          PDF分析レポート
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          このレポートは生成AIによって生成された分析結果です。
        </Alert>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(e, nv) => setActiveTab(nv)}
          variant="fullWidth"
        >
          <Tab icon={<AutoGraphIcon />} label="基本分析" />
          {comparisonData && Object.keys(comparisonData).length > 0 && (
            <Tab icon={<CompareIcon />} label="比較分析" />
          )}
          <Tab icon={<DescriptionIcon />} label="解析結果" />
        </Tabs>
      </Box>

      {/* 基本分析 */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          {feedbackSections.map((section, idx) => (
            <Grid item xs={12} key={idx}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {section.icon && (
                    <section.icon sx={{ mr: 1, color: 'primary.main' }} />
                  )}
                  <Typography variant="h6">{section.title}</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />

                {section.metrics && (
                  <Table size="small">
                    <TableBody>
                      {section.metrics.map((metric, i) => (
                        <TableRow key={i}>
                          <TableCell sx={{ border: 'none', pl: 0 }}>
                            {metric.label}
                          </TableCell>
                          <TableCell align="right" sx={{ border: 'none' }}>
                            <Chip
                              label={metric.value}
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {section.content && (
                  <Typography sx={{ mt: 2, whiteSpace: 'pre-line' }}>
                    {section.content}
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* 比較分析 */}
      {comparisonData && Object.keys(comparisonData).length > 0 && (
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" align="center" gutterBottom>
                  構造分析比較（ダミー）
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={structuralData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="aspect" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="あなたのスライド"
                      dataKey="current"
                      stroke="#2196f3"
                      fill="#2196f3"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="参照平均"
                      dataKey="reference"
                      stroke="#4caf50"
                      fill="#4caf50"
                      fillOpacity={0.6}
                    />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" align="center" gutterBottom>
                  内容分布比較（ダミー）
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={distributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="category"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis domain={[0, 100]} unit="%" />
                    <Tooltip />
                    <Legend />
                    <Bar
                      name="あなたのスライド"
                      dataKey="current"
                      fill="#2196f3"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      name="参照平均"
                      dataKey="reference"
                      fill="#4caf50"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  <CompareIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  比較分析のポイント
                </Typography>
                <Box sx={{ mt: 2, pl: 2 }}>
                  {comparison_feedback && (
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {comparison_feedback}
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      )}

      {/* 解析結果タブ: analyze-presentation の結果や文字起こしを表示 */}
      <TabPanel
        value={activeTab}
        index={comparisonData && Object.keys(comparisonData).length > 0 ? 2 : 1}
      >
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            analyze-presentation の結果
          </Typography>
          {presentationAnalysisResult ? (
            <>
              <Alert severity="success" sx={{ mb: 3 }}>
                <strong>analyze-presentation</strong> のAPIレスポンスがこちらです
              </Alert>
              <Box sx={{ mb: 2 }}>
                <PresentationAnalysisList result={presentationAnalysisResult.result} />
              </Box>
            </>
          ) : (
            <Alert severity="info" sx={{ mb: 3 }}>
              まだ <strong>/api/analyze-presentation</strong> への解析を実行していません。
            </Alert>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            文字起こし（getTranscription の結果）
          </Typography>
          {transcriptions && Object.keys(transcriptions).length > 0 ? (
            <Box>
              {Object.entries(transcriptions).map(([page, text]) => (
                <Box key={page} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">
                    ページ {page} の文字起こし:
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    {text || '[文字起こしが存在しません]'}
                  </Paper>
                </Box>
              ))}
            </Box>
          ) : (
            <Alert severity="info">文字起こしがありません。</Alert>
          )}
        </Paper>
      </TabPanel>

      {/* レポート印刷ボタン */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button onClick={() => window.print()} startIcon={<PrintIcon />}>
          レポートを印刷
        </Button>
      </Box>
    </Container>
  );
};

export default AnalysisResult;
