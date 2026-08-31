import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Button,
  Divider,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import { ApplicationWithFollowups } from '../../types/application';
import { Followup } from '../../types/followup';
import { StatusChip } from '../common/StatusChip';
import { FollowupBadge } from '../common/FollowupBadge';
import { formatDate } from '../../utils/dateUtils';
import { getFollowupState } from '../../utils/followupEngine';
import { useAuth } from '../../context/AuthContext';

interface ApplicationCardProps {
  application: ApplicationWithFollowups;
  onView: (app: ApplicationWithFollowups) => void;
  onEdit: (app: ApplicationWithFollowups) => void;
  onDelete: (id: string) => void;
  onFollowUp: (followup: Followup, app: ApplicationWithFollowups) => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onView,
  onEdit,
  onDelete,
  onFollowUp,
}) => {
  const { profile } = useAuth();
  const nextFollowup = application.nextFollowup;
  const followupState = nextFollowup
    ? getFollowupState(nextFollowup, application.status, profile?.timezone)
    : null;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        },
      }}
    >
      <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
        {/* Card Header: Company Name & Status Badge */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            mb: 1.5,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              fontSize: '1.05rem',
              cursor: 'pointer',
              '&:hover': { color: 'primary.main' },
            }}
            onClick={() => onView(application)}
          >
            {application.company_name}
          </Typography>

          <StatusChip status={application.status} />
        </Box>

        {/* 2-Column Structured Data Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1.75,
            mb: 1.75,
          }}
        >
          {/* Row 1: Role & Location */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5, display: 'block', mb: 0.25 }}>
              ROLE
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', wordBreak: 'break-word' }}>
              {application.job_role || '—'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5, display: 'block', mb: 0.25 }}>
              LOCATION
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', wordBreak: 'break-word' }}>
              {application.location || '—'}
            </Typography>
          </Box>

          {/* Row 2: Applied Date & Work Mode */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5, display: 'block', mb: 0.25 }}>
              APPLIED DATE
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {formatDate(application.applied_date)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5, display: 'block', mb: 0.25 }}>
              WORK MODE
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {application.work_mode || '—'}
            </Typography>
          </Box>

          {/* Row 3: Source & Next Follow-up */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5, display: 'block', mb: 0.25 }}>
              SOURCE
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {application.source || '—'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5, display: 'block', mb: 0.25 }}>
              NEXT FOLLOW-UP
            </Typography>
            {nextFollowup && followupState ? (
              <Box sx={{ mt: 0.25 }}>
                <FollowupBadge
                  state={followupState}
                  dueDate={nextFollowup.due_date}
                  sequenceNumber={nextFollowup.sequence_number}
                />
              </Box>
            ) : (
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.disabled' }}>
                —
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Action Items Footer */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          {/* Primary Action: Follow Up (if active/pending) */}
          {nextFollowup && followupState ? (
            <Button
              variant="contained"
              size="small"
              color={followupState === 'Today' || followupState === 'Overdue' ? 'warning' : 'primary'}
              startIcon={<SendOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={() => onFollowUp(nextFollowup, application)}
              sx={{
                fontWeight: 700,
                fontSize: '0.78rem',
                textTransform: 'none',
                px: 1.75,
                py: 0.5,
                borderRadius: 2,
              }}
            >
              Follow Up
            </Button>
          ) : (
            <Button
              variant="outlined"
              size="small"
              color="primary"
              startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={() => onView(application)}
              sx={{
                fontWeight: 600,
                fontSize: '0.78rem',
                textTransform: 'none',
                borderRadius: 2,
              }}
            >
              View Details
            </Button>
          )}

          {/* Secondary Action Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, ml: 'auto' }}>
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => onView(application)}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  p: 0.75,
                }}
              >
                <VisibilityOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Edit Application">
              <IconButton
                size="small"
                onClick={() => onEdit(application)}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  p: 0.75,
                }}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete Application">
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(application.id)}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  p: 0.75,
                }}
              >
                <DeleteOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
