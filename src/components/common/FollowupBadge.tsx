import React from 'react';
import { Chip, Box, Typography } from '@mui/material';
import { FollowupState } from '../../types/followup';
import { FOLLOWUP_STATES } from '../../constants/followups';
import { formatDate } from '../../utils/dateUtils';

interface FollowupBadgeProps {
  state: FollowupState;
  dueDate?: string;
  sequenceNumber?: number;
  showDate?: boolean;
}

export const FollowupBadge: React.FC<FollowupBadgeProps> = ({
  state,
  dueDate,
  sequenceNumber,
  showDate = true,
}) => {
  const config = FOLLOWUP_STATES.find((s) => s.value === state) || {
    value: state,
    label: state,
    icon: '•',
    color: 'default' as const,
  };

  return (
    <Box sx={{ display: 'inline-flex', flexDirection: 'column', gap: 0.25 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Chip
          label={`${config.icon} ${state}`}
          color={config.color}
          size="small"
          variant={state === 'Today' || state === 'Overdue' ? 'filled' : 'outlined'}
          sx={{
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 22,
          }}
        />
        {sequenceNumber && (
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            #{sequenceNumber}
          </Typography>
        )}
      </Box>
      {showDate && dueDate && (
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
          {formatDate(dueDate)}
        </Typography>
      )}
    </Box>
  );
};
