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
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import { ApplicationWithFollowups } from '../../types/application';
import { StatusChip } from '../common/StatusChip';
import { formatDate } from '../../utils/dateUtils';
import { useNavigate } from 'react-router-dom';

interface RecentApplicationsCardProps {
  applications: ApplicationWithFollowups[];
  onView: (app: ApplicationWithFollowups) => void;
}

export const RecentApplicationsCard: React.FC<RecentApplicationsCardProps> = ({
  applications,
  onView,
}) => {
  const navigate = useNavigate();

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WorkOutlineOutlinedIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Recent Applications
          </Typography>
        </Box>
        <Button
          size="small"
          endIcon={<ArrowForwardIcon fontSize="small" />}
          onClick={() => navigate('/applications')}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          View All
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {applications.length === 0 ? (
        <Box
          sx={{
            my: 'auto',
            py: 4,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            No applications added yet.
          </Typography>
        </Box>
      ) : (
        <List sx={{ p: 0 }}>
          {applications.map((app, idx) => (
            <React.Fragment key={app.id}>
              <ListItem
                disableGutters
                sx={{
                  py: 1.25,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  borderRadius: 1,
                  px: 1,
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
                onClick={() => onView(app)}
              >
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {app.company_name}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {app.job_role} • {formatDate(app.applied_date)}
                    </Typography>
                  }
                />
                <StatusChip status={app.status} />
              </ListItem>
              {idx < applications.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};
