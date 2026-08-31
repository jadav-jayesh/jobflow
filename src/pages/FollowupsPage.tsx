import React, { useState, useEffect, useMemo } from 'react';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { FollowupTable } from '../components/followups/FollowupTable';
import { EmptyState } from '../components/common/EmptyState';
import { TableLoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ConfigAlert } from '../components/common/ConfigAlert';
import { useFollowups } from '../hooks/useFollowups';
import { useAuth } from '../context/AuthContext';
import { getFollowupState } from '../utils/followupEngine';
import { FollowupWithApplication } from '../types/followup';
import { ApplicationStatus } from '../types/application';

type TabValue = 'all' | 'today' | 'overdue' | 'upcoming' | 'completed';

export const FollowupsPage: React.FC = () => {
  const { profile } = useAuth();
  const { followups, isLoading } = useFollowups();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = (searchParams.get('tab') as TabValue) || 'all';
  const [activeTab, setActiveTab] = useState<TabValue>(
    ['all', 'today', 'overdue', 'upcoming', 'completed'].includes(tabParam) ? tabParam : 'all'
  );

  // Sync state if URL query param changes
  useEffect(() => {
    const currentTab = searchParams.get('tab') as TabValue;
    if (currentTab && ['all', 'today', 'overdue', 'upcoming', 'completed'].includes(currentTab)) {
      setActiveTab(currentTab);
    } else if (!currentTab) {
      setActiveTab('all');
    }
  }, [searchParams]);

  const { onFollowUp, onViewApplication } = useOutletContext<{
    onFollowUp: (followup: any, app: any) => void;
    onViewApplication: (app: any) => void;
  }>();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
    if (newValue === 'all') {
      searchParams.delete('tab');
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ tab: newValue }, { replace: true });
    }
  };

  const filteredFollowups = useMemo(() => {
    return followups.filter((item) => {
      const state = getFollowupState(
        item,
        item.applications?.status as ApplicationStatus,
        profile?.timezone
      );

      if (activeTab === 'today') return state === 'Today';
      if (activeTab === 'overdue') return state === 'Overdue';
      if (activeTab === 'upcoming') return state === 'Upcoming';
      if (activeTab === 'completed') return state === 'Completed';

      return true;
    });
  }, [followups, activeTab, profile]);

  const counts = useMemo(() => {
    let today = 0;
    let overdue = 0;
    let upcoming = 0;
    let completed = 0;

    followups.forEach((item) => {
      const state = getFollowupState(
        item,
        item.applications?.status as ApplicationStatus,
        profile?.timezone
      );
      if (state === 'Today') today++;
      if (state === 'Overdue') overdue++;
      if (state === 'Upcoming') upcoming++;
      if (state === 'Completed') completed++;
    });

    return { today, overdue, upcoming, completed, all: followups.length };
  }, [followups, profile]);

  return (
    <Box>
      <ConfigAlert />

      <PageHeader
        title="Follow-up Schedule"
        subtitle="Manage scheduled outreach timelines, response logs, and due reminders."
      />

      {/* Tabs Filter Header */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          mb: 3,
          backgroundColor: 'background.paper',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 1 }}
        >
          <Tab label={`All (${counts.all})`} value="all" sx={{ fontWeight: 600 }} />
          <Tab
            label={`🟡 Due Today (${counts.today})`}
            value="today"
            sx={{ fontWeight: 600 }}
          />
          <Tab
            label={`🔴 Overdue (${counts.overdue})`}
            value="overdue"
            sx={{ fontWeight: 600 }}
          />
          <Tab
            label={`🟢 Upcoming (${counts.upcoming})`}
            value="upcoming"
            sx={{ fontWeight: 600 }}
          />
          <Tab
            label={`✓ Completed (${counts.completed})`}
            value="completed"
            sx={{ fontWeight: 600 }}
          />
        </Tabs>
      </Paper>

      {/* Main Follow-up List */}
      {isLoading ? (
        <TableLoadingSkeleton rows={5} />
      ) : filteredFollowups.length === 0 ? (
        <EmptyState
          title={
            activeTab === 'today'
              ? "🎉 No follow-ups due today"
              : activeTab === 'overdue'
              ? "No overdue follow-ups"
              : "No follow-up items found"
          }
          description={
            activeTab === 'today' || activeTab === 'overdue'
              ? "You're all caught up with your scheduled application outreach!"
              : "As you apply to jobs, CareerPulse will automatically populate your follow-up timeline."
          }
          icon={<CheckCircleOutlinedIcon sx={{ fontSize: 56, color: 'success.main' }} />}
        />
      ) : (
        <FollowupTable
          followups={filteredFollowups}
          onFollowUp={(item) => onFollowUp(item, item.applications)}
          onViewApplication={(appId) => {
            const app = itemAppFromId(appId, followups);
            if (app) onViewApplication(app);
          }}
        />
      )}
    </Box>
  );
};

function itemAppFromId(id: string, followups: FollowupWithApplication[]) {
  const found = followups.find((f) => f.applications?.id === id);
  return found?.applications ? { ...found.applications, followups: [] } : null;
}
