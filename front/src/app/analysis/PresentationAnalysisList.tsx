import React, { useState } from 'react';
import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningIcon from '@mui/icons-material/Warning';

type FeedbackData = {
  feedback_text: string;
  score: number | string; // サーバー返却が文字列の場合もある
};

interface PresentationAnalysisProps {
  result: Record<string, FeedbackData>;
}

const PresentationAnalysisList: React.FC<PresentationAnalysisProps> = ({ result }) => {
  // pages_received とかは使わず、 result の中身のみで構成
  // scoreが文字列の場合は数値に変換
  const sortedData = Object.entries(result)
    .map(([page, data]) => ({
      page,
      feedbackText: data.feedback_text,
      score: typeof data.score === 'string' ? Number(data.score) : data.score
    }))
    .sort((a, b) => a.score - b.score); // score昇順

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        スコアが低い順に並んだ結果
      </Typography>
      <List>
        {sortedData.map((item) => {
          const isLowScore = item.score <= 2;
          return (
            <Accordion key={item.page}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <ListItem disablePadding>
                  {/* "scoreが2以下なら展開前に注意っぽい感じ" */}
                  {isLowScore && (
                    <ListItemIcon>
                      <WarningIcon color="error" />
                    </ListItemIcon>
                  )}
                  <ListItemText
                    primary={`ページ: ${item.page}`}
                    secondary={
                      isLowScore ? '注意が必要なスコアです' : undefined
                    }
                  />
                </ListItem>
              </AccordionSummary>
              <AccordionDetails>
                {/* 詳細表示部分 */}
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {item.feedbackText}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip label={`Score: ${item.score}`} color={isLowScore ? 'error' : 'primary'} />
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </List>
    </Box>
  );
};

export default PresentationAnalysisList;
