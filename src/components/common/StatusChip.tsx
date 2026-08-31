import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { ApplicationStatus } from '../../types/application';
import { getStatusConfig } from '../../constants/statuses';

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: ApplicationStatus;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, ...props }) => {
  const config = getStatusConfig(status);

  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      variant="filled"
      sx={{
        fontWeight: 600,
        fontSize: '0.75rem',
        letterSpacing: '0.02em',
        ...props.sx,
      }}
      {...props}
    />
  );
};
