import React from 'react';
import { Alert, AlertTitle, Box, Typography } from '@mui/material';
import { isSupabaseConfigured } from '../../lib/supabase';

export const ConfigAlert: React.FC = () => {
  if (isSupabaseConfigured) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Alert severity="warning" variant="outlined" sx={{ borderRadius: 2 }}>
        <AlertTitle sx={{ fontWeight: 600 }}>Supabase Configuration Required</AlertTitle>
        <Typography variant="body2">
          Your <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> environment
          variables are missing or using placeholder values. Please copy <code>.env.example</code> to{' '}
          <code>.env</code> and run the SQL migration in Supabase to enable real-time authentication
          and data persistence.
        </Typography>
      </Alert>
    </Box>
  );
};
