import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { FollowupTable } from '../components/followups/FollowupTable';
import { EmptyState } from '../components/common/EmptyState';
import { TableLoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ConfigAlert } from '../components/common/ConfigAlert';
import { useFollowups, FollowupTabValue } from '../hooks/useFollowups';
import { FollowupWithApplication } from '../types/followup';

export const FollowupsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = (searchParams.get('tab') as FollowupTabValue) || 'all';
  const [activeTab, setActiveTab] = useState<FollowupTabValue>(
    ['all', 'today', 'overdue', 'upcoming', 'completed'].includes(tabParam) ? tabParam : 'all'
  );

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [accumulatedFollowups, setAccumulatedFollowups] = useState<FollowupWithApplication[]>([]);

  // Sync tab state when URL search params change
  useEffect(() => {
    const currentTab = searchParams.get('tab') as FollowupTabValue;
    if (currentTab && ['all', 'today', 'overdue', 'upcoming', 'completed'].includes(currentTab)) {
      setActiveTab(currentTab);
    } else if (!currentTab) {
      setActiveTab('all');
    }
    setPage(0);
    setAccumulatedFollowups([]);
  }, [searchParams]);

  // Backend-Driven Data Query
  const { followups, totalCount, counts, isLoading } = useFollowups({
    page,
    pageSize: rowsPerPage,
    tab: activeTab,
  });

  // Accumulate items for mobile infinite scrolling
  useEffect(() => {
    if (isLoading) return;

    if (page === 0) {
      setAccumulatedFollowups(followups);
    } else if (followups.length > 0) {
      setAccumulatedFollowups((prev) => {
        const existingIds = new Set(prev.map((f) => f.id));
        const newItems = followups.filter((f) => !existingIds.has(f.id));
        return [...prev, ...newItems];
      });
    }
  }, [followups, page, isLoading]);

  const { onFollowUp, onViewApplication } = useOutletContext<{
    onFollowUp: (followup: any, app: any) => void;
    onViewApplication: (app: any) => void;
  }>();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: FollowupTabValue) => {
    setActiveTab(newValue);
    setPage(0);
    setAccumulatedFollowups([]);
    if (newValue === 'all') {
      searchParams.delete('tab');
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ tab: newValue }, { replace: true });
    }
  };

  const hasMore = accumulatedFollowups.length < totalCount;
  const isLoadingMore = isLoading && page > 0;

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      setPage((prev) => prev + 1);
    }
  };

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
      {isLoading && page === 0 ? (
        <TableLoadingSkeleton rows={5} />
      ) : accumulatedFollowups.length === 0 && !isLoading ? (
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
          followups={followups}
          mobileFollowups={accumulatedFollowups}
          totalCount={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onPageChange={setPage}
          onRowsPerPageChange={(newSize) => {
            setRowsPerPage(newSize);
            setPage(0);
            setAccumulatedFollowups([]);
          }}
          onLoadMore={handleLoadMore}
          onFollowUp={(item) => onFollowUp(item, item.applications)}
          onViewApplication={(appId) => {
            const app = itemAppFromId(appId, accumulatedFollowups);
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
