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
} from '@mui/material';
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
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        Log Follow-up #{sequenceNumber}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers sx={{ pt: 2 }}>
          {/* Target Application Header Summary */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              backgroundColor: 'action.hover',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Grid container spacing={1}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Company
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {companyName}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Role
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {jobRole}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Follow-up Sequence
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  #{sequenceNumber} of {maxFollowups}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Due Date
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {followup?.due_date ? formatDate(followup.due_date) : 'Today'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Grid container spacing={2.5}>
            {/* Method */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="method"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Outreach Method *"
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

            {/* Result */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="result"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Result *"
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

            {/* Notes */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value || ''}
                    label="Notes / Response Summary"
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="e.g. Sent InMail message, recruiter replied asking for resume in PDF..."
                    error={!!errors.notes}
                    helperText={errors.notes?.message}
                  />
                )}
              />
            </Grid>
          </Grid>

          {/* Real-time automated workflow feedback */}
          <Box sx={{ mt: 2.5 }}>
            {willCreateNext && (
              <Alert severity="info" variant="outlined" sx={{ py: 0.5, borderRadius: 1.5 }}>
                <Typography variant="body2">
                  <strong>Automatic Workflow:</strong> Since you received <em>No Response</em>,
                  JobFlow will automatically schedule <strong>Follow-up #{sequenceNumber + 1}</strong>.
                </Typography>
              </Alert>
            )}

            {isMaxReached && (
              <Alert severity="warning" variant="outlined" sx={{ py: 0.5, borderRadius: 1.5 }}>
                <Typography variant="body2">
                  <strong>Maximum Follow-ups Reached:</strong> Follow-up #{sequenceNumber} is the
                  configured limit. No further automatic follow-ups will be created.
                </Typography>
              </Alert>
            )}

            {selectedResult === 'Response Received' && (
              <Alert severity="success" variant="outlined" sx={{ py: 0.5, borderRadius: 1.5 }}>
                <Typography variant="body2">
                  <strong>Response Received:</strong> Automatic follow-ups will stop. You can update
                  the application status in the details view.
                </Typography>
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={loading} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : undefined}
          >
            {loading ? 'Saving...' : 'Record Result'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
