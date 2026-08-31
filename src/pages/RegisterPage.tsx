import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
  Container,
  MenuItem,
} from '@mui/material';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { registerSchema, RegisterFormData } from '../utils/validation';
import { useAuth } from '../context/AuthContext';
import { ConfigAlert } from '../components/common/ConfigAlert';
import { COMMON_TIMEZONES } from '../constants/defaults';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    const { error } = await signUp(data.email, data.password, data.full_name, data.timezone);
    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage('Account created successfully! Redirecting to your dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
      <Box sx={{ width: '100%' }}>
        <ConfigAlert />

        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            textAlign: 'center',
          }}
        >
          {/* Logo Brand */}
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              mx: 'auto',
              mb: 2,
            }}
          >
            <WorkOutlineOutlinedIcon sx={{ fontSize: 28 }} />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5 }}>
            Create your account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start managing your applications effortlessly.
          </Typography>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2.5, textAlign: 'left', borderRadius: 2 }}>
              {errorMessage}
            </Alert>
          )}

          {successMessage && (
            <Alert severity="success" sx={{ mb: 2.5, textAlign: 'left', borderRadius: 2 }}>
              {successMessage}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Controller
                name="full_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Full Name"
                    fullWidth
                    error={!!errors.full_name}
                    helperText={errors.full_name?.message}
                    placeholder="e.g. Jayesh Patel"
                    autoFocus
                  />
                )}
              />

              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email Address"
                    type="email"
                    fullWidth
                    autoComplete="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />

              <Controller
                name="timezone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Your Timezone"
                    fullWidth
                    helperText="Used for automated reminder calculations"
                  >
                    {COMMON_TIMEZONES.map((tz) => (
                      <MenuItem key={tz} value={tz}>
                        {tz}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Password (min. 6 characters)"
                    type="password"
                    fullWidth
                    autoComplete="new-password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                  />
                )}
              />

              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Confirm Password"
                    type="password"
                    fullWidth
                    autoComplete="new-password"
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                  />
                )}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ mt: 1, py: 1.25, fontWeight: 700 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
              </Button>
            </Box>
          </form>

          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" sx={{ fontWeight: 600 }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
