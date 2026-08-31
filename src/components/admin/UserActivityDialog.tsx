import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  CircularProgress,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { UserWithStats } from '../../hooks/useAdmin';
import { ApplicationWithFollowups } from '../../types/application';
import { StatusChip } from '../common/StatusChip';
import { formatDate } from '../../utils/dateUtils';

interface UserActivityDialogProps {
  open: boolean;
  onClose: () => void;
  user: UserWithStats | null;
  onFetchActivity: (userId: string) => Promise<ApplicationWithFollowups[]>;
  onToggleRole: (userId: string, currentRole: string) => Promise<void>;
  updatingRole?: boolean;
}

export const UserActivityDialog: React.FC<UserActivityDialogProps> = ({
  open,
  onClose,
  user,
  onFetchActivity,
  onToggleRole,
  updatingRole = false,
}) => {
  const [applications, setApplications] = useState<ApplicationWithFollowups[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (open && user) {
      setLoading(true);
      onFetchActivity(user.id)
        .then((apps) => setApplications(apps))
        .catch((err) => console.error('Error fetching user activity:', err))
        .finally(() => setLoading(false));
    } else {
      setApplications([]);
    }
  }, [open, user, onFetchActivity]);

  if (!user) return null;

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
      {/* 1. Locked Modal Header */}
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
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(37,99,235,0.08)' : 'rgba(37,99,235,0.04)',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PersonOutlinedIcon sx={{ color: 'primary.main', fontSize: 24 }} />
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {user.full_name || 'Anonymous User'}
              </Typography>
              <Chip
                size="small"
                label={user.role.toUpperCase()}
                color={user.role === 'admin' ? 'primary' : 'default'}
                sx={{ fontWeight: 700, fontSize: '0.7rem' }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {user.email} • Joined {formatDate(user.created_at)} • Timezone: {user.timezone}
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* 2. Scrollable Body Content */}
      <DialogContent sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
        {/* User Metric Summary Chips */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' },
            gap: 1.5,
            mb: 3,
          }}
        >
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              APPLICATIONS
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
              {user.totalApplications}
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              ACTIVE
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'info.main' }}>
              {user.activeApplications}
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              FOLLOW-UPS
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'warning.main' }}>
              {user.totalFollowups}
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              COMPLETED
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'success.main' }}>
              {user.completedFollowups}
            </Typography>
          </Paper>
        </Box>

        {/* User Application & Follow-up History */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: 'text.secondary', letterSpacing: 0.5 }}>
          USER ACTIVITY &amp; JOB APPLICATIONS
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : applications.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              This user has not logged any job applications yet.
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {applications.map((app) => (
              <Paper
                key={app.id}
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  backgroundColor: 'background.paper',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: 'primary.main' },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WorkOutlineOutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {app.company_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      — {app.job_role}
                    </Typography>
                  </Box>
                  <StatusChip status={app.status} />
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, my: 1, fontSize: '0.825rem', color: 'text.secondary' }}>
                  <span>Applied: <strong>{formatDate(app.applied_date)}</strong></span>
                  <span>Location: <strong>{app.location || '—'}</strong></span>
                  <span>Mode: <strong>{app.work_mode || '—'}</strong></span>
                  <span>Source: <strong>{app.source || '—'}</strong></span>
                </Box>

                {/* Follow-up Timeline Summary */}
                {app.followups && app.followups.length > 0 && (
                  <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <NotificationsActiveIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        FOLLOW-UP TIMELINE ({app.followups.length})
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                      {app.followups.map((f) => (
                        <Box
                          key={f.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 1.5,
                            py: 0.5,
                            backgroundColor: 'action.hover',
                            borderRadius: 1.5,
                            fontSize: '0.78rem',
                          }}
                        >
                          <span>Follow-up #{f.sequence_number} (Due: {formatDate(f.due_date)})</span>
                          <span style={{ fontWeight: 600, color: f.completed_at ? '#16a34a' : '#d97706' }}>
                            {f.completed_at ? `✓ Completed (${f.result})` : 'Pending Outreach'}
                          </span>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>
            ))}
          </Box>
        )}
      </DialogContent>

      {/* 3. Locked Footer Actions */}
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
        <Button
          variant="outlined"
          color={user.role === 'admin' ? 'warning' : 'primary'}
          startIcon={<AdminPanelSettingsIcon />}
          disabled={updatingRole}
          onClick={() => onToggleRole(user.id, user.role)}
        >
          {user.role === 'admin' ? 'Revoke Admin Role' : 'Grant Admin Role'}
        </Button>

        <Button onClick={onClose} variant="contained" color="primary">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};
