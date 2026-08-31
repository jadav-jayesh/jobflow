import React, { useState, useMemo } from 'react';
import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import { useOutletContext } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { ApplicationFilters, ApplicationFilterState } from '../components/applications/ApplicationFilters';
import { ApplicationTable } from '../components/applications/ApplicationTable';
import { EmptyState } from '../components/common/EmptyState';
import { TableLoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ConfigAlert } from '../components/common/ConfigAlert';
import { useApplications } from '../hooks/useApplications';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { getFollowupState } from '../utils/followupEngine';
import { ApplicationWithFollowups } from '../types/application';
import { Followup } from '../types/followup';

const initialFilters: ApplicationFilterState = {
  search: '',
  status: 'All',
  source: 'All',
  followupState: 'All',
};

export const ApplicationsPage: React.FC = () => {
  const { profile } = useAuth();
  const {
    applications,
    isLoading,
    deleteApplication,
  } = useApplications();

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

  const [filters, setFilters] = useState<ApplicationFilterState>(initialFilters);
  const debouncedSearch = useDebounce(filters.search, 250);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // 1. Search Query Filter
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase().trim();
        const matchesCompany = app.company_name.toLowerCase().includes(query);
        const matchesRole = app.job_role.toLowerCase().includes(query);
        const matchesLocation = app.location?.toLowerCase().includes(query) || false;
        if (!matchesCompany && !matchesRole && !matchesLocation) {
          return false;
        }
      }

      // 2. Status Filter
      if (filters.status !== 'All' && app.status !== filters.status) {
        return false;
      }

      // 3. Source Filter
      if (filters.source !== 'All' && app.source !== filters.source) {
        return false;
      }

      // 4. Follow-up State Filter
      if (filters.followupState !== 'All') {
        const nextFollowup = app.nextFollowup;
        if (!nextFollowup) {
          if (filters.followupState !== 'Completed') return false;
        } else {
          const state = getFollowupState(nextFollowup, app.status, profile?.timezone);
          if (state !== filters.followupState) {
            return false;
          }
        }
      }

      return true;
    });
  }, [applications, debouncedSearch, filters.status, filters.source, filters.followupState, profile]);

  return (
    <Box>
      <ConfigAlert />

      <PageHeader
        title="Job Applications"
        subtitle={`Track and manage your applications (${applications.length} total)`}
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
        onFilterChange={setFilters}
        onReset={() => setFilters(initialFilters)}
      />

      {/* Main Content Area */}
      {isLoading ? (
        <TableLoadingSkeleton rows={6} />
      ) : applications.length === 0 ? (
        <EmptyState
          title="No applications added yet"
          description="Click '+ Add Application' to log your first job application. JobFlow will immediately calculate your follow-up schedule."
          actionText="+ Add Application"
          actionIcon={<AddIcon />}
          onAction={onOpenAddModal}
          icon={<WorkOutlineOutlinedIcon sx={{ fontSize: 56, color: 'primary.main' }} />}
        />
      ) : filteredApplications.length === 0 ? (
        <EmptyState
          title="No matching applications found"
          description="Try clearing your search query or adjusting your status and source filters."
          actionText="Reset Filters"
          onAction={() => setFilters(initialFilters)}
        />
      ) : (
        <ApplicationTable
          applications={filteredApplications}
          onView={onViewApplication}
          onEdit={onEditApplication}
          onDelete={onDeleteApplication}
          onFollowUp={onFollowUp}
        />
      )}
    </Box>
  );
};
