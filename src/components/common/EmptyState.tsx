import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  actionIcon,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  icon,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 6,
        textAlign: 'center',
        borderRadius: 3,
        border: '1px dashed',
        borderColor: 'divider',
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        my: 2,
      }}
    >
      {icon && <Box sx={{ mb: 2, color: 'text.secondary', opacity: 0.8 }}>{icon}</Box>}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 460, mb: actionText || secondaryActionText ? 3 : 0 }}
      >
        {description}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        {actionText && onAction && (
          <Button
            variant="contained"
            color="primary"
            startIcon={actionIcon}
            onClick={onAction}
            sx={{ px: 3, py: 1 }}
          >
            {actionText}
          </Button>
        )}
        {secondaryActionText && onSecondaryAction && (
          <Button
            variant="outlined"
            color="inherit"
            onClick={onSecondaryAction}
            sx={{ px: 3, py: 1 }}
          >
            {secondaryActionText}
          </Button>
        )}
      </Box>
    </Paper>
  );
};
