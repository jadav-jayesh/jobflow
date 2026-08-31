import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applicationSchema, ApplicationFormData } from '../../utils/validation';
import { Application } from '../../types/application';
import { APPLICATION_STATUSES } from '../../constants/statuses';
import { APPLICATION_SOURCES } from '../../constants/sources';
import { WORK_MODES } from '../../constants/workModes';
import { getTodayISODate } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';

interface ApplicationFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ApplicationFormData) => Promise<void>;
  initialData?: Application | null;
  loading?: boolean;
}

export const ApplicationFormDialog: React.FC<ApplicationFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}) => {
  const { profile } = useAuth();
  const isEdit = Boolean(initialData);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      company_name: '',
      job_role: '',
      applied_date: getTodayISODate(profile?.timezone),
      status: 'Applied',
      job_url: '',
      location: '',
      work_mode: null,
      source: null,
      recruiter_name: '',
      recruiter_email: '',
      expected_ctc: null,
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          company_name: initialData.company_name,
          job_role: initialData.job_role,
          applied_date: initialData.applied_date,
          status: initialData.status,
          job_url: initialData.job_url || '',
          location: initialData.location || '',
          work_mode: initialData.work_mode || null,
          source: initialData.source || null,
          recruiter_name: initialData.recruiter_name || '',
          recruiter_email: initialData.recruiter_email || '',
          expected_ctc: initialData.expected_ctc || null,
          notes: initialData.notes || '',
        });
      } else {
        reset({
          company_name: '',
          job_role: '',
          applied_date: getTodayISODate(profile?.timezone),
          status: 'Applied',
          job_url: '',
          location: '',
          work_mode: null,
          source: null,
          recruiter_name: '',
          recruiter_email: '',
          expected_ctc: null,
          notes: '',
        });
      }
    }
  }, [open, initialData, reset, profile]);

  const handleFormSubmit = async (data: ApplicationFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        {isEdit ? 'Edit Application' : 'Add New Job Application'}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers sx={{ pt: 2.5 }}>
          <Grid container spacing={2.5}>
            {/* Required Fields */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="company_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Company Name *"
                    fullWidth
                    error={!!errors.company_name}
                    helperText={errors.company_name?.message}
                    placeholder="e.g. Google, TCS, Razorpay"
                    autoFocus={!isEdit}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="job_role"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Job Role *"
                    fullWidth
                    error={!!errors.job_role}
                    helperText={errors.job_role?.message}
                    placeholder="e.g. React Developer, Software Engineer"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="applied_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Applied Date *"
                    type="date"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={!!errors.applied_date}
                    helperText={
                      errors.applied_date?.message ||
                      (!isEdit ? 'Follow-up #1 automatically calculated from this date' : '')
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Status"
                    fullWidth
                    error={!!errors.status}
                    helperText={errors.status?.message}
                  >
                    {APPLICATION_STATUSES.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="work_mode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value || ''}
                    select
                    label="Work Mode"
                    fullWidth
                    error={!!errors.work_mode}
                    helperText={errors.work_mode?.message}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {WORK_MODES.map((mode) => (
                      <MenuItem key={mode.value} value={mode.value}>
                        {mode.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            {/* Optional Details */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="source"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value || ''}
                    select
                    label="Application Source"
                    fullWidth
                    error={!!errors.source}
                    helperText={errors.source?.message}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {APPLICATION_SOURCES.map((src) => (
                      <MenuItem key={src.value} value={src.value}>
                        {src.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value || ''}
                    label="Location"
                    fullWidth
                    placeholder="e.g. Bangalore, Remote, London"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="job_url"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value || ''}
                    label="Job URL"
                    fullWidth
                    placeholder="https://linkedin.com/jobs/view/..."
                    error={!!errors.job_url}
                    helperText={errors.job_url?.message}
                  />
                )}
              />
            </Grid>

            {/* Recruiter & Compensation */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="recruiter_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value || ''}
                    label="Recruiter / Contact Name"
                    fullWidth
                    placeholder="e.g. Sarah Jenkins"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="recruiter_email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value || ''}
                    label="Recruiter Email"
                    fullWidth
                    placeholder="sarah@company.com"
                    error={!!errors.recruiter_email}
                    helperText={errors.recruiter_email?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="expected_ctc"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Expected CTC / Salary"
                    type="number"
                    fullWidth
                    placeholder="e.g. 1800000"
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val === '' ? null : parseFloat(val));
                    }}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start">₹ / $</InputAdornment>,
                      },
                    }}
                    error={!!errors.expected_ctc}
                    helperText={errors.expected_ctc?.message}
                  />
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
                    label="Notes & Observations"
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Add details about referral, key tech stack requirements, or interview notes..."
                  />
                )}
              />
            </Grid>
          </Grid>
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
            {isEdit ? 'Save Changes' : 'Create Application'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
