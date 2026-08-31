import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
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
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 6px 20px rgba(0,0,0,0.07)',
        },
      }}
    >
      {/* 1. Distinct Bold Card Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2.25,
          py: 1.75,
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(37,99,235,0.08)' : 'rgba(37,99,235,0.04)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, pr: 1 }}>
          <BusinessOutlinedIcon sx={{ fontSize: 20, color: 'primary.main', flexShrink: 0 }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: '1.1rem',
              letterSpacing: '-0.25px',
              color: 'text.primary',
              lineHeight: 1.2,
              cursor: 'pointer',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              '&:hover': { color: 'primary.main' },
            }}
            onClick={() => onView(application)}
          >
            {application.company_name}
          </Typography>
        </Box>

        <Box sx={{ flexShrink: 0 }}>
          <StatusChip status={application.status} />
        </Box>
      </Box>

      {/* 2. Structured 2-Column Key-Value Grid */}
      <CardContent sx={{ p: 2.25 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 2,
          }}
        >
          {/* Row 1: Role & Location */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: 0.6, display: 'block', mb: 0.35 }}
            >
              ROLE
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', wordBreak: 'break-word', fontSize: '0.925rem' }}>
              {application.job_role || '—'}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: 0.6, display: 'block', mb: 0.35 }}
            >
              LOCATION
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', wordBreak: 'break-word' }}>
              {application.location || '—'}
            </Typography>
          </Box>

          {/* Row 2: Applied Date & Work Mode */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: 0.6, display: 'block', mb: 0.35 }}
            >
              APPLIED DATE
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {formatDate(application.applied_date)}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: 0.6, display: 'block', mb: 0.35 }}
            >
              WORK MODE
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {application.work_mode || '—'}
            </Typography>
          </Box>

          {/* Row 3: Source & Next Follow-up */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: 0.6, display: 'block', mb: 0.35 }}
            >
              SOURCE
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {application.source || '—'}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: 0.6, display: 'block', mb: 0.35 }}
            >
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
      </CardContent>

      {/* 3. Action Items Footer Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
          px: 2.25,
          py: 1.5,
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Primary Action Button */}
        {nextFollowup && followupState ? (
          <Button
            variant="contained"
            size="small"
            color={followupState === 'Today' || followupState === 'Overdue' ? 'warning' : 'primary'}
            startIcon={<SendOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={() => onFollowUp(nextFollowup, application)}
            sx={{
              fontWeight: 700,
              fontSize: '0.8rem',
              textTransform: 'none',
              px: 2,
              py: 0.6,
              borderRadius: 2,
              boxShadow: 'none',
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
              fontSize: '0.8rem',
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
                borderRadius: 1.75,
                p: 0.75,
                '&:hover': { backgroundColor: 'action.hover' },
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
                borderRadius: 1.75,
                p: 0.75,
                '&:hover': { backgroundColor: 'action.hover' },
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
                borderRadius: 1.75,
                p: 0.75,
                '&:hover': { backgroundColor: 'error.lighter' },
              }}
            >
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Card>
  );
};
