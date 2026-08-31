import React, { useState } from 'react';
import {
  Grid,
  Box,
  Button,
  Typography,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import SendIcon from '@mui/icons-material/Send';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import BlockIcon from '@mui/icons-material/Block';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { MetricCard } from '../components/dashboard/MetricCard';
import { TodayFollowupsCard } from '../components/dashboard/TodayFollowupsCard';
import { StatusDistributionChart } from '../components/dashboard/StatusDistributionChart';
import { ApplicationsByMonthChart } from '../components/dashboard/ApplicationsByMonthChart';
import { RecentApplicationsCard } from '../components/dashboard/RecentApplicationsCard';
import { EmptyState } from '../components/common/EmptyState';
import { DashboardLoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ConfigAlert } from '../components/common/ConfigAlert';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useApplications } from '../hooks/useApplications';
import { useAuth } from '../context/AuthContext';
import { seedDemoDataForUser } from '../utils/demoData';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { onOpenAddModal, onViewApplication, onFollowUp } = useOutletContext<{
    onOpenAddModal: () => void;
    onViewApplication: (app: any) => void;
    onFollowUp: (followup: any, app: any) => void;
  }>();

  const { stats, isLoading } = useDashboardStats();
  const { refetch: refetchApps } = useApplications();
  const [seeding, setSeeding] = useState(false);

  const handleSeedDemoData = async () => {
    if (!user) return;
    try {
      setSeeding(true);
      await seedDemoDataForUser(user.id);
      await refetchApps();
    } catch (err) {
      console.error('Error seeding demo data:', err);
    } finally {
      setSeeding(false);
    }
  };

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  const greetingName = profile?.full_name || user?.email?.split('@')[0] || 'there';

  return (
    <Box>
      <ConfigAlert />

      <PageHeader
        title={`Welcome back, ${greetingName}`}
        subtitle="Track your applications, scheduled follow-ups, and recruiter responses."
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onOpenAddModal}
            sx={{ fontWeight: 600, px: 2.5 }}
          >
            Add Application
          </Button>
        }
      />

      {/* Top Cards: KPI Metrics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 4, md: 3, lg: 1.5 }}>
          <MetricCard
            title="Total"
            value={stats.total}
            icon={<WorkOutlineOutlinedIcon fontSize="small" />}
            color="#2563eb"
            onClick={() => navigate('/applications')}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3, lg: 1.5 }}>
          <MetricCard
            title="Applied"
            value={stats.statusCounts.Applied}
            icon={<SendIcon fontSize="small" />}
            color="#0288d1"
            onClick={() => navigate('/applications')}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3, lg: 1.5 }}>
          <MetricCard
            title="HR Contact"
            value={stats.statusCounts['HR Contact']}
            icon={<ContactPhoneIcon fontSize="small" />}
            color="#ed6c02"
            onClick={() => navigate('/applications')}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3, lg: 1.5 }}>
          <MetricCard
            title="Interviews"
            value={stats.statusCounts.Interview}
            icon={<GroupsIcon fontSize="small" />}
            color="#7b1fa2"
            onClick={() => navigate('/applications')}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3, lg: 1.5 }}>
          <MetricCard
            title="Selected"
            value={stats.statusCounts.Selected}
            icon={<EmojiEventsIcon fontSize="small" />}
            color="#2e7d32"
            onClick={() => navigate('/applications')}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3, lg: 1.5 }}>
          <MetricCard
            title="Rejected"
            value={stats.statusCounts.Rejected}
            icon={<BlockIcon fontSize="small" />}
            color="#d32f2f"
            onClick={() => navigate('/applications')}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3, lg: 1.5 }}>
          <MetricCard
            title="Due Today"
            value={stats.todayCount}
            icon={<NotificationsActiveIcon fontSize="small" />}
            color="#eab308"
            onClick={() => navigate('/followups')}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3, lg: 1.5 }}>
          <MetricCard
            title="Overdue"
            value={stats.overdueCount}
            icon={<WarningAmberIcon fontSize="small" />}
            color="#ef4444"
            onClick={() => navigate('/followups')}
          />
        </Grid>
      </Grid>

      {/* Performance Summary Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              RESPONSE RATE
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'info.main' }}>
              {stats.responseRate}%
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              INTERVIEW RATE
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {stats.interviewRate}%
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              SELECTION RATE
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
              {stats.selectionRate}%
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              THIS MONTH'S ACTIVITY
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {stats.appsThisMonth} applications ({stats.appsThisWeek} this week)
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Zero State if no applications exist */}
      {stats.total === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Start tracking your job search today. Add your first application and let JobFlow handle the follow-up timeline automatically."
          actionText="+ Add Application"
          actionIcon={<AddIcon />}
          onAction={onOpenAddModal}
          secondaryActionText={seeding ? 'Populating...' : 'Load Demo Applications'}
          onSecondaryAction={handleSeedDemoData}
          icon={<WorkOutlineOutlinedIcon sx={{ fontSize: 56, color: 'primary.main' }} />}
        />
      ) : (
        /* Main Dashboard Grid */
        <Grid container spacing={3}>
          {/* Left Column: Today Follow-ups & Activity */}
          <Grid size={{ xs: 12, lg: 7 }}>
            <Box sx={{ mb: 3 }}>
              <TodayFollowupsCard
                followups={[...stats.overdueFollowupsList, ...stats.todayFollowupsList]}
                onFollowUp={(item) => onFollowUp(item, item.applications)}
              />
            </Box>
            <Box>
              <ApplicationsByMonthChart data={stats.monthlyChartData} />
            </Box>
          </Grid>

          {/* Right Column: Status Donut Chart & Recent Applications */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Box sx={{ mb: 3 }}>
              <StatusDistributionChart data={stats.statusChartData} />
            </Box>
            <Box>
              <RecentApplicationsCard
                applications={stats.recentApplications}
                onView={onViewApplication}
              />
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};
