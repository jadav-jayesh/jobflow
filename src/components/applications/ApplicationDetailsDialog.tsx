import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Paper,
  Link,
  IconButton,
  MenuItem,
  TextField,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CloseIcon from '@mui/icons-material/Close';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { ApplicationWithFollowups, ApplicationStatus } from '../../types/application';
import { Followup } from '../../types/followup';
import { StatusChip } from '../common/StatusChip';
import { FollowupBadge } from '../common/FollowupBadge';
import { FollowupTimeline } from '../followups/FollowupTimeline';
import { formatDate } from '../../utils/dateUtils';
import { getFollowupState } from '../../utils/followupEngine';
import { APPLICATION_STATUSES } from '../../constants/statuses';
import { useAuth } from '../../context/AuthContext';

interface ApplicationDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  application: ApplicationWithFollowups | null;
  onEdit: (app: ApplicationWithFollowups) => void;
  onDelete: (id: string) => void;
  onFollowUp: (followup: Followup, app: ApplicationWithFollowups) => void;
  onStatusChange: (status: ApplicationStatus) => Promise<void>;
}

export const ApplicationDetailsDialog: React.FC<ApplicationDetailsDialogProps> = ({
  open,
  onClose,
  application,
  onEdit,
  onDelete,
  onFollowUp,
  onStatusChange,
}) => {
  const { profile } = useAuth();
  const [updatingStatus, setUpdatingStatus] = useState(false);

  if (!application) return null;

  const nextFollowup = application.nextFollowup;
  const followupState = nextFollowup
    ? getFollowupState(nextFollowup, application.status, profile?.timezone)
    : null;

  const handleStatusSelect = async (newStatus: ApplicationStatus) => {
    try {
      setUpdatingStatus(true);
      await onStatusChange(newStatus);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
      {/* 1. Fixed Header (Non-scrollable) */}
      <DialogTitle
        sx={{
          m: 0,
          px: 3,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          flexShrink: 0,
        }}
      >
        <Box sx={{ minWidth: 0, pr: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.25, flexWrap: 'wrap' }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 800 }}>
              {application.company_name}
            </Typography>
            <StatusChip status={application.status} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {application.job_role}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* 2. Scrollable Body Content */}
      <DialogContent sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
        <Grid container spacing={3}>
          {/* Left Column: Application Details */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary', letterSpacing: 0.5 }}>
              APPLICATION DETAILS
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Applied Date
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatDate(application.applied_date)}
                </Typography>
              </Grid>

              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Source
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {application.source || '—'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Work Mode
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {application.work_mode || '—'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Location
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {application.location || '—'}
                </Typography>
              </Grid>
            </Grid>

            {/* Status Selector */}
            <Box sx={{ mb: 2.5, p: 2, backgroundColor: 'action.hover', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                UPDATE STATUS
              </Typography>
              <TextField
                select
                size="small"
                fullWidth
                value={application.status}
                disabled={updatingStatus}
                onChange={(e) => handleStatusSelect(e.target.value as ApplicationStatus)}
                sx={{ backgroundColor: 'background.paper' }}
              >
                {APPLICATION_STATUSES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Recruiter & Job Link */}
            {(application.recruiter_name || application.recruiter_email || application.expected_ctc || application.job_url) && (
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary', letterSpacing: 0.5 }}>
                  CONTACT &amp; OFFER
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {application.recruiter_name && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonOutlinedIcon fontSize="small" color="action" />
                      <Typography variant="body2">{application.recruiter_name}</Typography>
                    </Box>
                  )}

                  {application.recruiter_email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailOutlinedIcon fontSize="small" color="action" />
                      <Link href={`mailto:${application.recruiter_email}`} variant="body2">
                        {application.recruiter_email}
                      </Link>
                    </Box>
                  )}

                  {application.expected_ctc && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttachMoneyIcon fontSize="small" color="action" />
                      <Typography variant="body2">Expected: ₹{application.expected_ctc.toLocaleString()}</Typography>
                    </Box>
                  )}

                  {application.job_url && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <OpenInNewIcon fontSize="small" color="action" />
                      <Link href={application.job_url} target="_blank" rel="noreferrer" variant="body2">
                        View Job Posting
                      </Link>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* Notes */}
            {application.notes && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: 'text.secondary', letterSpacing: 0.5 }}>
                  NOTES
                </Typography>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'background.paper' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {application.notes}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Grid>

          {/* Right Column: Follow-up Timeline */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 0.5 }}>
                FOLLOW-UP TIMELINE
              </Typography>
              {nextFollowup && followupState && (
                <FollowupBadge
                  state={followupState}
                  dueDate={nextFollowup.due_date}
                  sequenceNumber={nextFollowup.sequence_number}
                />
              )}
            </Box>

            <FollowupTimeline
              followups={application.followups}
              onFollowUpClick={(f: Followup) => onFollowUp(f, application)}
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
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlinedIcon />}
            onClick={() => {
              onDelete(application.id);
              onClose();
            }}
          >
            Delete
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => {
              onClose();
              onEdit(application);
            }}
          >
            Edit
          </Button>
        </Box>

        <Button onClick={onClose} variant="contained" color="primary">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};
