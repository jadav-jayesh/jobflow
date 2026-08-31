import React from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  MenuItem,
  Grid,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { ApplicationStatus, ApplicationSource } from '../../types/application';
import { FollowupState } from '../../types/followup';
import { APPLICATION_STATUSES } from '../../constants/statuses';
import { APPLICATION_SOURCES } from '../../constants/sources';

export interface ApplicationFilterState {
  search: string;
  status: ApplicationStatus | 'All';
  source: ApplicationSource | 'All';
  followupState: FollowupState | 'All';
}

interface ApplicationFiltersProps {
  filters: ApplicationFilterState;
  onFilterChange: (filters: ApplicationFilterState) => void;
  onReset: () => void;
}

export const ApplicationFilters: React.FC<ApplicationFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.status !== 'All' ||
    filters.source !== 'All' ||
    filters.followupState !== 'All';

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} sx={{ alignItems: 'center' }}>
        {/* Search Input */}
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search company, role, or location..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: filters.search ? (
                  <InputAdornment position="end">
                    <ClearIcon
                      fontSize="small"
                      sx={{ cursor: 'pointer' }}
                      onClick={() => onFilterChange({ ...filters, search: '' })}
                    />
                  </InputAdornment>
                ) : null,
              },
            }}
          />
        </Grid>

        {/* Status Filter */}
        <Grid size={{ xs: 6, sm: 4, md: 2.5 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Status"
            value={filters.status}
            onChange={(e) =>
              onFilterChange({ ...filters, status: e.target.value as ApplicationStatus | 'All' })
            }
          >
            <MenuItem value="All">All Statuses</MenuItem>
            {APPLICATION_STATUSES.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Source Filter */}
        <Grid size={{ xs: 6, sm: 4, md: 2.5 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Source"
            value={filters.source}
            onChange={(e) =>
              onFilterChange({ ...filters, source: e.target.value as ApplicationSource | 'All' })
            }
          >
            <MenuItem value="All">All Sources</MenuItem>
            {APPLICATION_SOURCES.map((src) => (
              <MenuItem key={src.value} value={src.value}>
                {src.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Follow-up State Filter */}
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Follow-up"
            value={filters.followupState}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                followupState: e.target.value as FollowupState | 'All',
              })
            }
          >
            <MenuItem value="All">All Follow-ups</MenuItem>
            <MenuItem value="Today">🟡 Due Today</MenuItem>
            <MenuItem value="Overdue">🔴 Overdue</MenuItem>
            <MenuItem value="Upcoming">🟢 Upcoming</MenuItem>
            <MenuItem value="Completed">✓ Completed</MenuItem>
          </TextField>
        </Grid>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <Grid size={{ xs: 6, sm: 12, md: 1 }}>
            <Button
              variant="text"
              color="inherit"
              size="small"
              onClick={onReset}
              sx={{ minWidth: 'auto', textTransform: 'none' }}
            >
              Reset
            </Button>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
