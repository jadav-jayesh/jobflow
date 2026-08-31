import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { FollowupWithApplication } from '../../types/followup';
import { FollowupBadge } from '../common/FollowupBadge';
import { getFollowupState } from '../../utils/followupEngine';
import { ApplicationStatus } from '../../types/application';
import { useAuth } from '../../context/AuthContext';

interface TodayFollowupsCardProps {
  followups: FollowupWithApplication[];
  onFollowUp: (followup: FollowupWithApplication) => void;
}

export const TodayFollowupsCard: React.FC<TodayFollowupsCardProps> = ({
  followups,
  onFollowUp,
}) => {
  const { profile } = useAuth();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <NotificationsActiveOutlinedIcon color="warning" />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Today's &amp; Overdue Follow-ups
        </Typography>
        <Typography
          variant="caption"
          sx={{
            ml: 'auto',
            px: 1,
            py: 0.25,
            borderRadius: 9999,
            backgroundColor: followups.length > 0 ? 'warning.light' : 'success.light',
            color: followups.length > 0 ? 'warning.dark' : 'success.dark',
            fontWeight: 700,
          }}
        >
          {followups.length}
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {followups.length === 0 ? (
        <Box
          sx={{
            my: 'auto',
            py: 4,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckCircleOutlinedIcon sx={{ fontSize: 44, color: 'success.main', mb: 1.5, opacity: 0.9 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            🎉 No follow-ups today
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You're all caught up!
          </Typography>
        </Box>
      ) : (
        <List sx={{ p: 0, overflowY: 'auto', maxHeight: 360 }}>
          {followups.map((item, idx) => {
            const app = item.applications;
            const state = getFollowupState(
              item,
              app?.status as ApplicationStatus,
              profile?.timezone
            );

            return (
              <React.Fragment key={item.id}>
                <ListItem
                  disableGutters
                  sx={{
                    py: 1.5,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 1.5,
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {app?.company_name || 'Application'}
                        </Typography>
                        <FollowupBadge
                          state={state}
                          dueDate={item.due_date}
                          sequenceNumber={item.sequence_number}
                          showDate={false}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                        {app?.job_role} • Due: {item.due_date}
                      </Typography>
                    }
                  />
                  <Button
                    variant="contained"
                    size="small"
                    color={state === 'Overdue' ? 'error' : 'warning'}
                    onClick={() => onFollowUp(item)}
                    sx={{
                      fontWeight: 600,
                      px: 2,
                      width: { xs: '100%', sm: 'auto' },
                    }}
                  >
                    Follow Up
                  </Button>
                </ListItem>
                {idx < followups.length - 1 && <Divider />}
              </React.Fragment>
            );
          })}
        </List>
      )}
    </Paper>
  );
};
