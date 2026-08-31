import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import { Followup } from '../../types/followup';
import { formatDate } from '../../utils/dateUtils';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ScheduleIcon from '@mui/icons-material/Schedule';

interface FollowupTimelineProps {
  followups?: Followup[];
  onFollowUpClick?: (followup: Followup) => void;
}

export const FollowupTimeline: React.FC<FollowupTimelineProps> = ({
  followups = [],
  onFollowUpClick,
}) => {
  if (!followups || followups.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 1, fontStyle: 'italic' }}>
        No follow-up history recorded yet.
      </Typography>
    );
  }

  const sorted = [...followups].sort((a, b) => a.sequence_number - b.sequence_number);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {sorted.map((item, index) => {
        const isCompleted = Boolean(item.completed_at);
        const isLast = index === sorted.length - 1;

        return (
          <Paper
            key={item.id}
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: isCompleted ? 'divider' : 'primary.main',
              backgroundColor: isCompleted ? 'background.paper' : 'action.hover',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 1,
                mb: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isCompleted ? (
                  <CheckCircleIcon color="success" fontSize="small" />
                ) : (
                  <HourglassEmptyIcon color="primary" fontSize="small" />
                )}
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Follow-up #{item.sequence_number}
                </Typography>
                <Chip
                  label={isCompleted ? 'Completed' : 'Pending'}
                  size="small"
                  color={isCompleted ? 'success' : 'primary'}
                  variant={isCompleted ? 'outlined' : 'filled'}
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {isCompleted && item.completed_at
                    ? `Completed: ${formatDate(item.completed_at)}`
                    : `Due: ${formatDate(item.due_date)}`}
                </Typography>
              </Box>
            </Box>

            {isCompleted ? (
              <Box sx={{ mt: 1, pl: 3.5 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: item.notes ? 1 : 0 }}>
                  {item.method && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Method:</strong> {item.method}
                    </Typography>
                  )}
                  {item.result && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Result:</strong>{' '}
                      <span
                        style={{
                          color: item.result === 'Response Received' ? '#16a34a' : '#ea580c',
                          fontWeight: 600,
                        }}
                      >
                        {item.result}
                      </span>
                    </Typography>
                  )}
                </Box>
                {item.notes && (
                  <Typography
                    variant="body2"
                    sx={{
                      backgroundColor: 'action.hover',
                      p: 1,
                      borderRadius: 1,
                      fontStyle: 'italic',
                      color: 'text.secondary',
                    }}
                  >
                    "{item.notes}"
                  </Typography>
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  mt: 1,
                  pl: 3.5,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Scheduled outreach date: <strong>{formatDate(item.due_date)}</strong>
                </Typography>
                {onFollowUpClick && (
                  <Chip
                    label="Follow Up"
                    color="primary"
                    size="small"
                    onClick={() => onFollowUpClick(item)}
                    clickable
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Box>
            )}

            {!isLast && <Divider sx={{ my: 1.5, opacity: 0.5 }} />}
          </Paper>
        );
      })}
    </Box>
  );
};
