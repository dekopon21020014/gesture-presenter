import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Divider,
  Rating,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Button
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import PrintIcon from '@mui/icons-material/Print';

const AnalysisResult = ({ geminiResponse, fontAnalysis }) => {
  // Parse the response into sections
  const parseAnalysisSection = (text, sectionNumber) => {
    if (!text) return null;
    
    const sections = text.split(/\d+\.\s+/);
    if (sections.length <= sectionNumber) return null;
    
    const sectionText = sections[sectionNumber];
    const lines = sectionText.split('\n').filter(line => line.trim());
    
    return lines.join(' ');
  };

  const sections = [
    {
      title: "内容の一貫性",
      content: parseAnalysisSection(geminiResponse, 1),
    },
    {
      title: "視覚的一貫性",
      content: parseAnalysisSection(geminiResponse, 2),
      metrics: [
        {
          label: "平均フォントサイズ",
          value: `${fontAnalysis?.mean_size?.toFixed(1)}pt`
        },
        {
          label: "フォントサイズのばらつき",
          value: `${fontAnalysis?.std_size?.toFixed(1)}`
        },
        {
          label: "フォントサイズの種類",
          value: `${fontAnalysis?.size_variation}種類`
        }
      ]
    },
    {
      title: "メインメッセージ",
      content: parseAnalysisSection(geminiResponse, 3),
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          PDF分析レポート
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          このレポートは自動生成された分析結果です。
        </Alert>
      </Box>

      <Grid container spacing={3}>
        {sections.map((section, index) => (
          <Grid item xs={12} key={index}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AutoGraphIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h3">
                  {section.title}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {section.metrics ? (
                <Table size="small">
                  <TableBody>
                    {section.metrics.map((metric, idx) => (
                      <TableRow key={idx}>
                        <TableCell component="th" scope="row" sx={{ border: 'none', pl: 0 }}>
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
              ) : null}
              
              {section.content && (
                <Typography sx={{ mt: 2 }}>
                  {section.content}
                </Typography>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

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