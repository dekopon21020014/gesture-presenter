import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  IconButton,
  Stack,
  Chip,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

interface ConfirmationDialogProps {
  showConfirmDialog: boolean;
  fileNames: string[];
  handleConfirm: (removeTexts: string[] | null) => void;
}

export const ConfirmationDialog = ({ 
  showConfirmDialog,
  fileNames, 
  handleConfirm,
}: ConfirmationDialogProps) => {
  const router = useRouter();
  const [currentText, setCurrentText] = useState('');
  const [removeTexts, setRemoveTexts] = useState<string[]>([]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentText.trim()) {
      handleAddRemoveText();
      setCurrentText('');
    }
  };

  const handleAddRemoveText = () => {
    setRemoveTexts((prev) => [...prev, currentText.trim()]);
  };

  const handleRemoveText = (index: number) => {
    setRemoveTexts(removeTexts.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    setCurrentText('');
    setRemoveTexts([]);
  
    // 単体ファイルの場合は/mypageに遷移。複数ファイルの場合はnullを返す。
    if (fileNames.length > 1) {
      handleConfirm(null)
    } else {
      router.push('/mypage');
    }
  };
  
  const handleAccept = () => { 
    handleConfirm(removeTexts);
  };

  // カーソルが外れた地点で追加
  const handleBlur = () => {
    if (currentText.trim()) {
      setRemoveTexts((prev) => [...prev, currentText.trim()]);
      setCurrentText('');
    }
  };
  
  return (
    <Dialog
      open={showConfirmDialog}
      onClose={() => {}}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ pb: 1 }}>確認</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 1 }}>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {`${fileNames.join(', ')} を分析しますが、よろしいですか？`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            生成AIに読み込ませない文字列を以下に入力してください
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 2 }}>
          <TextField
            fullWidth
            size="medium"
            label="取り除きたい文字列"
            value={currentText}
            onChange={(e) => setCurrentText(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleBlur}
          />
          <IconButton
            onClick={handleAddRemoveText}
            color="primary"
            sx={{ mt: 1 }}
            disabled={!currentText.trim()}
          >
            <AddIcon />
          </IconButton>
        </Box>

        {removeTexts.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                flexWrap: 'wrap',
                gap: 1,
                bgcolor: 'background.default',
                borderRadius: 1,
              }}
            >
              {removeTexts.map((text, index) => (
                <Chip
                  key={index}
                  label={text}
                  onDelete={() => handleRemoveText(index)}
                  deleteIcon={<CloseIcon />}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleCancel} 
          color="inherit"
        >
          キャンセル
        </Button>
        <Button onClick={handleAccept} variant="contained">
          分析開始
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmationDialog;