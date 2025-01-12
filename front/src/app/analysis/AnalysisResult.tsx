import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Divider,
  Rating,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid
} from '@mui/material';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import PrintIcon from '@mui/icons-material/Print';
import CompareIcon from '@mui/icons-material/Compare';
import DescriptionIcon from '@mui/icons-material/Description';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import MessageIcon from '@mui/icons-material/Message';
import FolderIcon from '@mui/icons-material/Folder';

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

/** タブパネルコンポーネント */
const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`analysis-tabpanel-${index}`}
    aria-labelledby={`analysis-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

/** カテゴリのラベル定義 */
const CATEGORY_LABELS = {
  technical: '技術的な説明',
  background: '背景説明',
  methodology: '手法の説明',
  results: '結果・成果',
  conclusion: 'まとめ'
};

const AnalysisResult = ({
  geminiResponse,   // 単一のフィードバックを受け取る
  fontAnalysis,
  comparisonData,
  targetFileName,
  referenceFiles = []
}) => {
  const [activeTab, setActiveTab] = useState(0);

  /**
   * 基本分析タブで表示する項目。
   * ここでは１つ目の項目で単一のフィードバック（geminiResponse）を表示する。
   */
  const sections = [
    {
      title: '全体的なフィードバック',
      icon: DescriptionIcon,
      content: geminiResponse || '解析結果がありません。',
    },
    {
      title: '視覚的一貫性',
      icon: FormatSizeIcon,
      content: '視覚的一貫性に関する追加のコメントをここに表示できます。',
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
      content:
        'メインメッセージの把握状況や伝わりやすさなど、追加でフィードバックを記載することができます。',
    },
  ];

  /**
   * comparisonData が存在する場合のみ使用するデータ群。
   */
  const structuralData = comparisonData && Object.keys(comparisonData).length > 0
    ? [
        {
          aspect: '目次',
          current: comparisonData.current.has_toc ? 100 : 0,
          reference: comparisonData.structural_features.toc_ratio * 100,
        },
        {
          aspect: 'まとめ',
          current: comparisonData.current.has_summary ? 100 : 0,
          reference: comparisonData.structural_features.summary_ratio * 100,
        },
        {
          aspect: '問題提起',
          current: comparisonData.current.has_problem_statement ? 100 : 0,
          reference: comparisonData.structural_features.problem_statement_ratio * 100,
        },
        {
          aspect: '具体例',
          current: comparisonData.current.has_examples ? 100 : 0,
          reference: comparisonData.structural_features.examples_ratio * 100,
        },
      ]
    : [];

  const distributionData = comparisonData && Object.keys(comparisonData).length > 0
    ? Object.entries(comparisonData.current.content_distribution).map(([key, value]) => ({
        category: CATEGORY_LABELS[key] || key,
        current: value * 100,
        reference: comparisonData.reference_avg[key] * 100,
      }))
    : [];

  return (
    <Container maxWidth="lg">
      {/* タイトル */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          PDF分析レポート
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          このレポートは生成AIによって生成された分析結果です。
        </Alert>
      </Box>

      {/* タブ切り替え */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab icon={<AutoGraphIcon />} label="基本分析" />
          {/* comparisonData がある場合のみ「比較分析」タブを表示 */}
          {comparisonData && <Tab icon={<CompareIcon />} label="比較分析" />}
        </Tabs>
      </Box>

      {/* 基本分析タブ */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          {sections.map((section, index) => (
            <Grid item xs={12} key={index}>
              <Paper elevation={3} sx={{ p: 3 }}>
                {/* タイトルとレーティング */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {section.icon && (
                    <section.icon sx={{ mr: 1, color: 'primary.main' }} />
                  )}
                  <Typography variant="h6" component="h3">
                    {section.title}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* metricsがあればテーブルで表示 */}
                {section.metrics && (
                  <Table size="small">
                    <TableBody>
                      {section.metrics.map((metric, idx) => (
                        <TableRow key={idx}>
                          <TableCell
                            component="th"
                            scope="row"
                            sx={{ border: 'none', pl: 0 }}
                          >
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

                {/* 単一のテキストフィードバック表示 */}
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

      {/* 比較分析タブ（comparisonData があれば表示） */}
      {comparisonData && Object.keys(comparisonData).length > 0 ? (
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            {/* 構造分析比較 */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ textAlign: 'center' }}
                >
                  構造分析比較
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

            {/* 内容分布比較 */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ textAlign: 'center' }}
                >
                  内容分布比較
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

            {/* 比較分析のポイント */}
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  <CompareIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  比較分析のポイント
                </Typography>
                <Box component="ul" sx={{ mt: 2, pl: 2 }}>
                  {comparisonData && Object.keys(comparisonData).length > 0 && Object.entries(comparisonData.current.content_distribution).map(
                    ([category, value]) => {
                      const avgValue = comparisonData.reference_avg[category];
                      const diff = Math.abs(value - avgValue);
                      if (diff > 0.2) {
                        return (
                          <Typography component="li" key={category} sx={{ mb: 1 }}>
                            {`${CATEGORY_LABELS[category]}の割合が参照平均と${(
                              diff * 100
                            ).toFixed(1)}%
                            ${value > avgValue ? '多く' : '少なく'}なっています。
                            ${
                              value < avgValue
                                ? '増やすことを'
                                : '削減を'
                            }検討してください。`}
                          </Typography>
                        );
                      }
                      return null;
                    }
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      ):
      <Alert severity="info">
        さらに参考にしたいPDFをアップロード (最大5個) すると、
        近づけられるように様々な視点からアドバイスを得られます！
        比較用ファイルをアップロードして再分析ボタンを押してください。
      </Alert>
    }

      {/* レポート印刷ボタン */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => window.print()}
          startIcon={<PrintIcon />}
        >
          レポートを印刷
        </Button>
      </Box>
    </Container>
  );
};

export default AnalysisResult;
