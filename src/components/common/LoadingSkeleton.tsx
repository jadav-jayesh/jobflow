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
