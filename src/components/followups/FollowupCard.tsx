import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Divider,
} from '@mui/material';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
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
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        },
      }}
    >
      <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
        {/* Card Header: Company, Role & Application Status */}
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
          <Box sx={{ flex: 1, pr: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 800,
                color: 'primary.main',
                fontSize: '1.05rem',
                cursor: 'pointer',
                lineHeight: 1.25,
                '&:hover': { textDecoration: 'underline' },
              }}
              onClick={() => app?.id && onViewApplication(app.id)}
            >
              {app?.company_name || 'Application'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mt: 0.25 }}>
              {app?.job_role}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {app?.status && <StatusChip status={app.status as ApplicationStatus} />}
          </Box>
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
          {/* Row 1: Sequence & Due Date */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5, display: 'block', mb: 0.25 }}>
              STAGE
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Follow-up #{followup.sequence_number}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5, display: 'block', mb: 0.25 }}>
              DUE DATE
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {formatDate(followup.due_date)}
            </Typography>
          </Box>

          {/* Row 2: Dynamic State & Outreach Status */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5, display: 'block', mb: 0.25 }}>
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

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5, display: 'block', mb: 0.25 }}>
              OUTREACH RESULT
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: isCompleted ? 'success.main' : 'text.secondary' }}>
              {isCompleted ? `${followup.result || 'Logged'} (${followup.method || 'Direct'})` : 'Pending Outreach'}
            </Typography>
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
          {!isCompleted ? (
            <Button
              variant="contained"
              size="small"
              color={state === 'Today' || state === 'Overdue' ? 'warning' : 'primary'}
              startIcon={<SendOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={() => onFollowUp(followup)}
              sx={{
                fontWeight: 700,
                fontSize: '0.78rem',
                textTransform: 'none',
                px: 2,
                py: 0.5,
                borderRadius: 2,
              }}
            >
              Follow Up
            </Button>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'success.main' }}>
              <CheckCircleOutlinedIcon fontSize="small" />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Logged on {formatDate(followup.completed_at)}
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
              fontSize: '0.78rem',
              textTransform: 'none',
              borderRadius: 2,
              ml: 'auto',
            }}
          >
            View Application
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
