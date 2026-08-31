import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  MenuItem,
  Alert,
  CircularProgress,
  RadioGroup,
  Radio,
  FormControl,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '../components/common/PageHeader';
import { ConfigAlert } from '../components/common/ConfigAlert';
import { settingsSchema, SettingsFormData } from '../utils/validation';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../context/AuthContext';
import { useUIStore, ThemeMode } from '../store/uiStore';
import { COMMON_TIMEZONES } from '../constants/defaults';
import { seedDemoDataForUser } from '../utils/demoData';

export const SettingsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const {
    settings,
    updateSettings,
    isUpdatingSettings,
    updateProfile,
    isUpdatingProfile,
  } = useSettings();

  const { themeMode, setThemeMode } = useUIStore();

  // Test Email State
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Profile Form State
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [timezone, setTimezone] = useState(
    profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  );
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Demo Seeding State
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  // Settings React Hook Form
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    values: {
      first_followup_days: settings.first_followup_days,
      second_followup_days: settings.second_followup_days,
      third_followup_days: settings.third_followup_days,
      max_followups: settings.max_followups,
      reminder_enabled: settings.reminder_enabled,
      reminder_time: settings.reminder_time?.slice(0, 5) || '09:00',
      reminder_email: settings.reminder_email || user?.email || '',
    },
  });

  const reminderEnabled = watch('reminder_enabled');
  const currentReminderEmail = watch('reminder_email');

  const onSettingsSubmit = async (data: SettingsFormData) => {
    try {
      await updateSettings(data);
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  };

  const onProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        full_name: fullName,
        timezone: timezone,
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const handleSendTestEmail = async () => {
    setTestEmailLoading(true);
    setTestEmailResult(null);

    const targetEmail = currentReminderEmail || user?.email;
    if (!targetEmail) {
      setTestEmailResult({
        success: false,
        message: 'Please provide a valid reminder email address first.',
      });
      setTestEmailLoading(false);
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: targetEmail,
          userName: fullName || user?.email?.split('@')[0] || 'User',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTestEmailResult({
          success: true,
          message: data.message || `Test reminder email sent successfully to ${targetEmail}!`,
        });
      } else {
        setTestEmailResult({
          success: false,
          message:
            data.error ||
            'Failed to send test email. Ensure SMTP configuration environment variables are set in Netlify.',
        });
      }
    } catch (err: any) {
      setTestEmailResult({
        success: false,
        message:
          'Netlify Function unavailable in offline local mode. (Will execute in Netlify environment with SMTP credentials configured).',
      });
    } finally {
      setTestEmailLoading(false);
    }
  };

  const handleSeedDemoData = async () => {
    if (!user) return;
    try {
      setSeeding(true);
      await seedDemoDataForUser(user.id);
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 4000);
    } catch (err) {
      console.error('Error seeding demo data:', err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <ConfigAlert />

      <PageHeader
        title="Settings &amp; Preferences"
        subtitle="Configure follow-up calculation schedules, email reminders, timezone, and appearance."
      />

      {/* 1. Follow-up Schedule Form */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          Follow-up Automation Schedule
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Define the automatic number of days between outreach stages.
        </Typography>

        <form onSubmit={handleSubmit(onSettingsSubmit)}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Controller
                name="first_followup_days"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Follow-up"
                    type="number"
                    fullWidth
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    error={!!errors.first_followup_days}
                    helperText={errors.first_followup_days?.message || 'Days after application'}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Controller
                name="second_followup_days"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Second Follow-up"
                    type="number"
                    fullWidth
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    error={!!errors.second_followup_days}
                    helperText={errors.second_followup_days?.message || 'Days after 1st follow-up'}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Controller
                name="third_followup_days"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Third Follow-up"
                    type="number"
                    fullWidth
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    error={!!errors.third_followup_days}
                    helperText={errors.third_followup_days?.message || 'Days after 2nd follow-up'}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Controller
                name="max_followups"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Max Follow-ups"
                    type="number"
                    fullWidth
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    error={!!errors.max_followups}
                    helperText={errors.max_followups?.message || 'Limit per application'}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            {/* 2. Email Reminder Section */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Email Reminders
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Receive personal reminder digests when follow-ups are due. (JobFlow sends reminders to
                you, never to recruiters).
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="reminder_enabled"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} color="primary" />}
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Enable Automatic Follow-up Email Reminders
                      </Typography>
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="reminder_email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value || ''}
                    label="Reminder Recipient Email"
                    fullWidth
                    disabled={!reminderEnabled}
                    error={!!errors.reminder_email}
                    helperText={errors.reminder_email?.message || 'Where to deliver follow-up alerts'}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="reminder_time"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Daily Reminder Time"
                    type="time"
                    fullWidth
                    disabled={!reminderEnabled}
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={!!errors.reminder_time}
                    helperText={errors.reminder_time?.message || 'Scheduled delivery time'}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={isUpdatingSettings ? <CircularProgress size={16} /> : <SaveIcon />}
                  disabled={isUpdatingSettings}
                >
                  {isUpdatingSettings ? 'Saving...' : 'Save Settings'}
                </Button>

                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={testEmailLoading ? <CircularProgress size={16} /> : <SendIcon />}
                  onClick={handleSendTestEmail}
                  disabled={testEmailLoading}
                >
                  {testEmailLoading ? 'Sending...' : 'Send Test Email'}
                </Button>
              </Box>

              {testEmailResult && (
                <Alert
                  severity={testEmailResult.success ? 'success' : 'info'}
                  variant="outlined"
                  sx={{ mt: 2, borderRadius: 2 }}
                >
                  {testEmailResult.message}
                </Alert>
              )}
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* 3. User Profile & Timezone */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          Profile &amp; Timezone
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Timezone settings ensure dates and scheduled reminder times remain accurate.
        </Typography>

        <form onSubmit={onProfileSave}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                fullWidth
                placeholder="Jayesh Patel"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                fullWidth
                helperText="Used for daily follow-up calculations and email timing"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <MenuItem key={tz} value={tz}>
                    {tz}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isUpdatingProfile}
                  startIcon={isUpdatingProfile ? <CircularProgress size={16} /> : <SaveIcon />}
                >
                  {isUpdatingProfile ? 'Saving...' : 'Update Profile'}
                </Button>
                {profileSuccess && (
                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                    ✓ Profile updated
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* 4. Appearance / Dark Mode */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          Appearance &amp; Theme
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Choose your interface appearance preference.
        </Typography>

        <FormControl component="fieldset">
          <RadioGroup
            row
            value={themeMode}
            onChange={(e) => setThemeMode(e.target.value as ThemeMode)}
          >
            <FormControlLabel value="light" control={<Radio />} label="Light" />
            <FormControlLabel value="dark" control={<Radio />} label="Dark" />
            <FormControlLabel value="system" control={<Radio />} label="System Default" />
          </RadioGroup>
        </FormControl>
      </Paper>

      {/* 5. Developer & Demo Data Tools */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          Developer &amp; Testing Utilities
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Quickly populate realistic sample applications (TCS, Infosys, Razorpay, etc.) with pre-calculated follow-up states to test all application workflows.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={seeding ? <CircularProgress size={16} /> : <AutoAwesomeIcon />}
            onClick={handleSeedDemoData}
            disabled={seeding || !user}
          >
            {seeding ? 'Generating...' : 'Seed Sample Applications'}
          </Button>
          {seedSuccess && (
            <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
              ✓ Seed data populated successfully!
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};
