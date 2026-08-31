import React from 'react';
import { Paper, Box, Typography } from '@mui/material';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = '#2563eb',
  onClick,
}) => {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
        '&:hover': onClick
          ? {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            }
          : {},
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.825rem' }}>
          {title}
        </Typography>
        <Box
          sx={{
            p: 0.75,
            borderRadius: 2,
            backgroundColor: `${color}15`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>

      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        {value}
      </Typography>

      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
};
