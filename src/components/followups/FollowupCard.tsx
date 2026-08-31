import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
} from '@mui/material';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { FollowupWithApplication } from '../../types/followup';
import { ApplicationStatus } from '../../types/application';
import { FollowupBadge } from '../common/FollowupBadge';
import { StatusChip } from '../common/StatusChip';
import { formatDate } from '../../utils/dateUtils';
import { getFollowupState } from '../../utils/followupEngine';
import { useAuth } from '../../context/AuthContext';

interface FollowupCardProps {
  followup: FollowupWithApplication;
  onFollowUp: (followup: FollowupWithApplication) => void;
  onViewApplication: (applicationId: string) => void;
}

export const FollowupCard: React.FC<FollowupCardProps> = ({
  followup,
  onFollowUp,
  onViewApplication,
}) => {
  const { profile } = useAuth();
  const app = followup.applications;
  const state = getFollowupState(
    followup,
    app?.status as ApplicationStatus,
    profile?.timezone
  );
  const isCompleted = Boolean(followup.completed_at);

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
          <NotificationsActiveOutlinedIcon sx={{ fontSize: 20, color: 'primary.main', flexShrink: 0 }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: '1.1rem',
              letterSpacing: '-0.25px',
              color: 'primary.main',
              lineHeight: 1.2,
              cursor: 'pointer',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              '&:hover': { textDecoration: 'underline' },
            }}
            onClick={() => app?.id && onViewApplication(app.id)}
          >
            {app?.company_name || 'Application'}
          </Typography>
        </Box>

        <Box sx={{ flexShrink: 0 }}>
          {app?.status && <StatusChip status={app.status as ApplicationStatus} />}
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
          {/* Row 1: Role & Sequence */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: 0.6, display: 'block', mb: 0.35 }}
            >
              JOB ROLE
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', wordBreak: 'break-word', fontSize: '0.925rem' }}>
              {app?.job_role || '—'}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: 0.6, display: 'block', mb: 0.35 }}
            >
              STAGE
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Follow-up #{followup.sequence_number}
            </Typography>
          </Box>

          {/* Row 2: Due Date & Follow-up State */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: 0.6, display: 'block', mb: 0.35 }}
            >
              DUE DATE
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {formatDate(followup.due_date)}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: 0.6, display: 'block', mb: 0.35 }}
            >
              FOLLOW-UP STATE
            </Typography>
            <Box sx={{ mt: 0.25 }}>
              <FollowupBadge
                state={state}
                dueDate={followup.due_date}
                sequenceNumber={followup.sequence_number}
                showDate={false}
              />
            </Box>
          </Box>

          {/* Row 3: Result & Outreach Method */}
          <Box sx={{ gridColumn: 'span 2' }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: 0.6, display: 'block', mb: 0.35 }}
            >
              OUTREACH STATUS
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: isCompleted ? 'success.main' : 'text.secondary',
              }}
            >
              {isCompleted
                ? `✓ Logged: ${followup.result || 'Response'} (via ${followup.method || 'Direct'} on ${formatDate(followup.completed_at)})`
                : 'Pending Outreach Action'}
            </Typography>
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
        {!isCompleted ? (
          <Button
            variant="contained"
            size="small"
            color={state === 'Today' || state === 'Overdue' ? 'warning' : 'primary'}
            startIcon={<SendOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={() => onFollowUp(followup)}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'success.main' }}>
            <CheckCircleOutlinedIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
              Completed on {formatDate(followup.completed_at)}
            </Typography>
          </Box>
        )}

        <Button
          size="small"
          variant="outlined"
          color="primary"
          startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={() => app?.id && onViewApplication(app.id)}
          sx={{
            fontWeight: 600,
            fontSize: '0.8rem',
            textTransform: 'none',
            borderRadius: 2,
            ml: 'auto',
          }}
        >
          View Application
        </Button>
      </Box>
    </Card>
  );
};
