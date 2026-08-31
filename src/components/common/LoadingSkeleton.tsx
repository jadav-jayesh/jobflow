import React from 'react';
import { Box, Skeleton, Grid, Paper } from '@mui/material';

export const TableLoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Skeleton variant="rectangular" height={48} sx={{ mb: 1, borderRadius: 1 }} />
      {Array.from({ length: rows }).map((_, idx) => (
        <Skeleton
          key={idx}
          variant="rectangular"
          height={56}
          sx={{ mb: 1, borderRadius: 1, opacity: 0.6 }}
        />
      ))}
    </Box>
  );
};

export const CardLoadingSkeleton: React.FC<{ cards?: number }> = ({ cards = 2 }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      {Array.from({ length: cards }).map((_, idx) => (
        <Paper
          key={idx}
          elevation={0}
          sx={{
            p: 2.25,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Skeleton variant="text" width="45%" height={28} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 2 }} />
          </Box>

          {/* 2-column grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <Box>
              <Skeleton variant="text" width="30%" height={16} />
              <Skeleton variant="text" width="70%" height={22} />
            </Box>
            <Box>
              <Skeleton variant="text" width="30%" height={16} />
              <Skeleton variant="text" width="60%" height={22} />
            </Box>
            <Box>
              <Skeleton variant="text" width="30%" height={16} />
              <Skeleton variant="text" width="50%" height={22} />
            </Box>
            <Box>
              <Skeleton variant="text" width="30%" height={16} />
              <Skeleton variant="text" width="55%" height={22} />
            </Box>
          </Box>

          {/* Action bar */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pt: 1.5,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Skeleton variant="rounded" width={110} height={32} sx={{ borderRadius: 2 }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="circular" width={32} height={32} />
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export const DashboardLoadingSkeleton: React.FC = () => {
  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
            <Paper sx={{ p: 2.5, borderRadius: 2 }}>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={48} />
              <Skeleton variant="text" width="80%" height={20} />
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 2, height: 350 }}>
            <Skeleton variant="rectangular" height="100%" sx={{ borderRadius: 1 }} />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2, height: 350 }}>
            <Skeleton variant="rectangular" height="100%" sx={{ borderRadius: 1 }} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
