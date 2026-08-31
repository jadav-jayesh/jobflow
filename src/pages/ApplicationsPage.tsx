import React, { useState, useEffect } from 'react';
import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { ApplicationFilters, ApplicationFilterState } from '../components/applications/ApplicationFilters';
import { ApplicationTable } from '../components/applications/ApplicationTable';
import { EmptyState } from '../components/common/EmptyState';
import { TableLoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ConfigAlert } from '../components/common/ConfigAlert';
import { useApplications } from '../hooks/useApplications';
import { useDebounce } from '../hooks/useDebounce';
import { ApplicationWithFollowups, ApplicationStatus, ApplicationSource } from '../types/application';
import { Followup, FollowupState } from '../types/followup';

const initialFilters: ApplicationFilterState = {
  search: '',
  status: 'All',
  source: 'All',
  followupState: 'All',
};

export const ApplicationsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [accumulatedApps, setAccumulatedApps] = useState<ApplicationWithFollowups[]>([]);

  const [filters, setFilters] = useState<ApplicationFilterState>(() => {
    const statusParam = (searchParams.get('status') as ApplicationStatus) || 'All';
    const sourceParam = (searchParams.get('source') as ApplicationSource) || 'All';
    const followupParam = (searchParams.get('followup') as FollowupState) || 'All';
    const queryParam = searchParams.get('q') || '';

    return {
      search: queryParam,
      status: statusParam,
      source: sourceParam,
      followupState: followupParam,
    };
  });

  const debouncedSearch = useDebounce(filters.search, 250);

  // Sync state if URL search params change
  useEffect(() => {
    const statusParam = (searchParams.get('status') as ApplicationStatus) || 'All';
    const sourceParam = (searchParams.get('source') as ApplicationSource) || 'All';
    const followupParam = (searchParams.get('followup') as FollowupState) || 'All';
    const queryParam = searchParams.get('q') || '';

    setFilters({
      search: queryParam,
      status: statusParam,
      source: sourceParam,
      followupState: followupParam,
    });
    setPage(0);
  }, [searchParams]);

  // Query Backend with Server-Side Pagination & Filtering
  const {
    applications,
    totalCount,
    isLoading,
    isFetching,
    deleteApplication,
    refetch,
  } = useApplications({
    page,
    pageSize: rowsPerPage,
    search: debouncedSearch,
    status: filters.status,
    source: filters.source,
    followupState: filters.followupState,
  });

  // Accumulate items for mobile infinite scrolling without DOM collapse
  useEffect(() => {
    if (page === 0) {
      setAccumulatedApps(applications);
    } else if (applications && applications.length > 0) {
      setAccumulatedApps((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const newItems = applications.filter((a) => !existingIds.has(a.id));
        if (newItems.length === 0) return prev;
        return [...prev, ...newItems];
      });
    }
  }, [applications, page]);

  const {
    onOpenAddModal,
    onEditApplication,
    onViewApplication,
    onDeleteApplication,
    onFollowUp,
  } = useOutletContext<{
    onOpenAddModal: () => void;
    onEditApplication: (app: ApplicationWithFollowups) => void;
    onViewApplication: (app: ApplicationWithFollowups) => void;
    onDeleteApplication: (id: string) => void;
    onFollowUp: (followup: Followup, app: ApplicationWithFollowups) => void;
  }>();

  const handleFilterChange = (newFilters: ApplicationFilterState) => {
    setFilters(newFilters);
    setPage(0);
    const params: Record<string, string> = {};
    if (newFilters.search) params.q = newFilters.search;
    if (newFilters.status !== 'All') params.status = newFilters.status;
    if (newFilters.source !== 'All') params.source = newFilters.source;
    if (newFilters.followupState !== 'All') params.followup = newFilters.followupState;
    setSearchParams(params, { replace: true });
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setPage(0);
    setSearchParams({}, { replace: true });
    refetch();
  };

  const mobileDisplayApps = accumulatedApps.length > 0 ? accumulatedApps : applications;
  const hasMore = mobileDisplayApps.length < totalCount;
  const isLoadingMore = isFetching && page > 0;

  const handleLoadMore = () => {
    if (hasMore && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <Box>
      <ConfigAlert />

      <PageHeader
        title="Job Applications"
        subtitle={`Track and manage your applications (${totalCount} total)`}
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

      {/* Filter and Search Controls */}
      <ApplicationFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Main Content Area */}
      {isLoading && page === 0 ? (
        <TableLoadingSkeleton rows={6} />
      ) : totalCount === 0 && !filters.search && filters.status === 'All' && filters.source === 'All' && filters.followupState === 'All' ? (
        <EmptyState
          title="No applications added yet"
          description="Click '+ Add Application' to log your first job application. CareerPulse will immediately calculate your follow-up schedule."
          actionText="+ Add Application"
          actionIcon={<AddIcon />}
          onAction={onOpenAddModal}
          icon={<WorkOutlineOutlinedIcon sx={{ fontSize: 56, color: 'primary.main' }} />}
        />
      ) : totalCount === 0 ? (
        <EmptyState
          title="No matching applications found"
          description="Try clearing your search query or adjusting your status and source filters."
          actionText="Reset Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <ApplicationTable
          applications={applications}
          mobileApplications={mobileDisplayApps}
          totalCount={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onPageChange={setPage}
          onRowsPerPageChange={(newSize) => {
            setRowsPerPage(newSize);
            setPage(0);
          }}
          onLoadMore={handleLoadMore}
          onView={onViewApplication}
          onEdit={onEditApplication}
          onDelete={onDeleteApplication}
          onFollowUp={onFollowUp}
        />
      )}
    </Box>
  );
};
