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
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
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
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        '&:hover': {
          borderColor: 'primary.light',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      }}
    >
      <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
        {/* Header: Company, Role, Status & Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box sx={{ flex: 1, pr: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                lineHeight: 1.25,
                cursor: 'pointer',
                '&:hover': { color: 'primary.main' },
              }}
              onClick={() => onView(application)}
            >
              {application.company_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mt: 0.25 }}>
              {application.job_role}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <StatusChip status={application.status} />
          </Box>
        </Box>

        {/* Metadata Details Grid */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
            my: 1.5,
            py: 1,
            px: 1.5,
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            borderRadius: 2,
          }}
        >
          {/* Applied Date */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              Applied: <strong style={{ color: 'inherit' }}>{formatDate(application.applied_date)}</strong>
            </Typography>
          </Box>

          {/* Location & Work Mode */}
          {(application.location || application.work_mode) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <LocationOnOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {application.location || 'Remote'}{' '}
                {application.work_mode && `(${application.work_mode})`}
              </Typography>
            </Box>
          )}

          {/* Source */}
          {application.source && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <LanguageOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {application.source}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Next Follow-up Section */}
        {nextFollowup && followupState ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              mt: 1.5,
              pt: 1.5,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FollowupBadge
                state={followupState}
                dueDate={nextFollowup.due_date}
                sequenceNumber={nextFollowup.sequence_number}
              />
            </Box>

            <Button
              variant="outlined"
              size="small"
              color={followupState === 'Today' || followupState === 'Overdue' ? 'warning' : 'primary'}
              onClick={() => onFollowUp(nextFollowup, application)}
              sx={{
                fontSize: '0.75rem',
                fontWeight: 600,
                py: 0.35,
                px: 1.5,
                textTransform: 'none',
              }}
            >
              Follow Up
            </Button>
          </Box>
        ) : null}

        <Divider sx={{ my: 1.5 }} />

        {/* Bottom Actions Bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            size="small"
            variant="text"
            color="primary"
            startIcon={<VisibilityOutlinedIcon fontSize="small" />}
            onClick={() => onView(application)}
            sx={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'none' }}
          >
            View Details
          </Button>

          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Edit Application">
              <IconButton size="small" onClick={() => onEdit(application)}>
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Application">
              <IconButton size="small" color="error" onClick={() => onDelete(application.id)}>
                <DeleteOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
