import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Box,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { followupLogSchema, FollowupLogFormData } from '../../utils/validation';
import { Followup } from '../../types/followup';
import { ApplicationStatus } from '../../types/application';
import { FOLLOWUP_METHODS, FOLLOWUP_RESULTS } from '../../constants/followups';
import { formatDate } from '../../utils/dateUtils';
import { useSettings } from '../../hooks/useSettings';

interface FollowupActionDialogProps {
  open: boolean;
  onClose: () => void;
  followup: Followup | null;
  companyName: string;
  jobRole: string;
  applicationStatus: ApplicationStatus;
  onSubmit: (dto: FollowupLogFormData) => Promise<void>;
  loading?: boolean;
}

export const FollowupActionDialog: React.FC<FollowupActionDialogProps> = ({
  open,
  onClose,
  followup,
  companyName,
  jobRole,
  applicationStatus,
  onSubmit,
  loading = false,
}) => {
  const { settings } = useSettings();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FollowupLogFormData>({
    resolver: zodResolver(followupLogSchema),
    defaultValues: {
      method: 'LinkedIn',
      result: 'No Response',
      notes: '',
    },
  });

  const selectedResult = watch('result');
  const sequenceNumber = followup?.sequence_number || 1;
  const maxFollowups = settings.max_followups || 3;
  const willCreateNext = selectedResult === 'No Response' && sequenceNumber < maxFollowups;
  const isMaxReached = selectedResult === 'No Response' && sequenceNumber >= maxFollowups;

  const handleFormSubmit = async (data: FollowupLogFormData) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            maxHeight: { xs: 'calc(100% - 32px)', sm: 'calc(100% - 64px)' },
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        },
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(handleFormSubmit)}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* 1. Fixed Header (Non-scrollable) */}
        <DialogTitle
          sx={{
            m: 0,
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            flexShrink: 0,
          }}
        >
          <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
            Log Follow-up #{sequenceNumber}
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
            disabled={loading}
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        {/* 2. Scrollable Content */}
        <DialogContent sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
          {/* Target Application Overview */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'action.hover',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {companyName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {jobRole}
            </Typography>
            {followup?.due_date && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Due Date: <strong>{formatDate(followup.due_date)}</strong>
              </Typography>
            )}
          </Paper>

          <Grid container spacing={2.5}>
            {/* Outreach Method */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="method"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Outreach Channel *"
                    fullWidth
                    error={!!errors.method}
                    helperText={errors.method?.message}
                  >
                    {FOLLOWUP_METHODS.map((method) => (
                      <MenuItem key={method.value} value={method.value}>
                        {method.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            {/* Outreach Result */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="result"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Outreach Result *"
                    fullWidth
                    error={!!errors.result}
                    helperText={errors.result?.message}
                  >
                    {FOLLOWUP_RESULTS.map((res) => (
                      <MenuItem key={res.value} value={res.value}>
                        {res.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            {/* Smart Next-Step Prediction Notice */}
            <Grid size={{ xs: 12 }}>
              {willCreateNext && (
                <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
                  <strong>Auto Follow-up #{sequenceNumber + 1}:</strong> CareerPulse will automatically schedule your next follow-up date based on your configuration.
                </Alert>
              )}
              {isMaxReached && (
                <Alert severity="warning" variant="outlined" sx={{ borderRadius: 2 }}>
                  <strong>Maximum Follow-ups Reached ({maxFollowups}):</strong> No further follow-ups will be automatically scheduled for this application.
                </Alert>
              )}
              {selectedResult === 'Response Received' && (
                <Alert severity="success" variant="outlined" sx={{ borderRadius: 2 }}>
                  <strong>Response Logged:</strong> Automatic follow-ups will stop. You can update the application status to <em>HR Contact</em> or <em>Interview</em>.
                </Alert>
              )}
            </Grid>

            {/* Notes */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Outreach Notes (Optional)"
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="e.g. Sent message to recruiter via InMail, requested call update..."
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        {/* 3. Fixed Footer Buttons (Non-scrollable) */}
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            flexShrink: 0,
          }}
        >
          <Button onClick={onClose} disabled={loading} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : undefined}
            sx={{ fontWeight: 600, px: 2.5 }}
          >
            Record Follow-up
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
