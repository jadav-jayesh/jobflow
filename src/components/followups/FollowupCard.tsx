import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Divider,
} from '@mui/material';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
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
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        '&:hover': {
          borderColor: 'primary.light',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      }}
    >
      <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
        {/* Header: Company, Role & Application Status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box sx={{ flex: 1, pr: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                lineHeight: 1.25,
                cursor: 'pointer',
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

        {/* Followup Stage & Due Date Banner */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            my: 1.5,
            py: 1,
            px: 1.5,
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Follow-up #{followup.sequence_number}
            </Typography>
            <FollowupBadge
              state={state}
              dueDate={followup.due_date}
              sequenceNumber={followup.sequence_number}
              showDate={false}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Due: {formatDate(followup.due_date)}
            </Typography>
          </Box>
        </Box>

        {/* Method & Result or Notes */}
        {isCompleted ? (
          <Box sx={{ mb: 1.5, p: 1.25, backgroundColor: 'success.light', borderRadius: 1.5, opacity: 0.9 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.dark', display: 'block' }}>
              ✓ Result: {followup.result}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Logged via {followup.method || 'Direct'} on {formatDate(followup.completed_at)}
            </Typography>
          </Box>
        ) : null}

        <Divider sx={{ my: 1.5 }} />

        {/* Footer Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            size="small"
            variant="text"
            color="primary"
            onClick={() => app?.id && onViewApplication(app.id)}
            sx={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'none' }}
          >
            View Application
          </Button>

          {!isCompleted ? (
            <Button
              variant="contained"
              size="small"
              color={state === 'Today' || state === 'Overdue' ? 'warning' : 'primary'}
              onClick={() => onFollowUp(followup)}
              sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'none', px: 2 }}
            >
              Follow Up
            </Button>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'success.main' }}>
              <CheckCircleOutlinedIcon fontSize="small" />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                Completed
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
