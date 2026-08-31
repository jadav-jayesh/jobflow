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
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          pb: 1,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
              {application.company_name}
            </Typography>
            <StatusChip status={application.status} />
          </Box>
          <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
            {application.job_role}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 2.5 }}>
        <Grid container spacing={3}>
          {/* Main Info Columns */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary' }}>
              APPLICATION DETAILS
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Applied Date
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatDate(application.applied_date)}
                </Typography>
              </Grid>

              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Source
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {application.source || '—'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Work Mode
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {application.work_mode || '—'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Location
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {application.location && <LocationOnOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />}
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {application.location || '—'}
                  </Typography>
                </Box>
              </Grid>

              {application.expected_ctc && (
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Expected CTC
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AttachMoneyIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {application.expected_ctc.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
              )}

              {application.job_url && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Job Posting
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    color="primary"
                    startIcon={<OpenInNewIcon fontSize="small" />}
                    component={Link}
                    href={application.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Job
                  </Button>
                </Grid>
              )}
            </Grid>

            {/* Recruiter Section */}
            {(application.recruiter_name || application.recruiter_email) && (
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>
                  RECRUITER / CONTACT
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: 'action.hover',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {application.recruiter_name && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <PersonOutlinedIcon fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {application.recruiter_name}
                      </Typography>
                    </Box>
                  )}
                  {application.recruiter_email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailOutlinedIcon fontSize="small" color="action" />
                      <Link
                        href={`mailto:${application.recruiter_email}`}
                        variant="body2"
                        underline="hover"
                      >
                        {application.recruiter_email}
                      </Link>
                    </Box>
                  )}
                </Paper>
              </Box>
            )}

            {/* Notes Section */}
            {application.notes && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>
                  NOTES
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'action.hover',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {application.notes}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Grid>

          {/* Right Column: Next Follow-up & History */}
          <Grid size={{ xs: 12, md: 5 }}>
            {/* Quick Status Selector */}
            <Box sx={{ mb: 2.5 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Current Application Status"
                value={application.status}
                disabled={updatingStatus}
                onChange={(e) => handleStatusSelect(e.target.value as ApplicationStatus)}
              >
                {APPLICATION_STATUSES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Next Follow-up Box */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                border: '1.5px solid',
                borderColor: nextFollowup ? 'primary.main' : 'divider',
                backgroundColor: 'background.paper',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>
                NEXT FOLLOW-UP
              </Typography>

              {nextFollowup && followupState ? (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <FollowupBadge
                      state={followupState}
                      dueDate={nextFollowup.due_date}
                      sequenceNumber={nextFollowup.sequence_number}
                    />
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="small"
                    onClick={() => onFollowUp(nextFollowup, application)}
                    sx={{ fontWeight: 600 }}
                  >
                    Follow Up
                  </Button>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 1 }}>
                  No pending follow-ups required.
                </Typography>
              )}
            </Paper>

            {/* Follow-up History */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary' }}>
              FOLLOW-UP HISTORY
            </Typography>
            <FollowupTimeline
              followups={application.followups}
              onFollowUpClick={(f) => onFollowUp(f, application)}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Button
          color="error"
          variant="outlined"
          size="small"
          startIcon={<DeleteOutlinedIcon />}
          onClick={() => onDelete(application.id)}
        >
          Delete
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => onEdit(application)}
          >
            Edit
          </Button>
          <Button variant="contained" onClick={onClose}>
            Close
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
