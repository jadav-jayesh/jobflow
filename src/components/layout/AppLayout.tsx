import React, { useState } from 'react';
import {
  Box,
  Drawer,
  Container,
  Snackbar,
  Alert,
} from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ApplicationFormDialog } from '../applications/ApplicationFormDialog';
import { ApplicationDetailsDialog } from '../applications/ApplicationDetailsDialog';
import { FollowupActionDialog } from '../followups/FollowupActionDialog';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useApplications } from '../../hooks/useApplications';
import { useFollowups } from '../../hooks/useFollowups';
import { useUIStore } from '../../store/uiStore';
import { ApplicationWithFollowups, ApplicationStatus } from '../../types/application';
import { Followup } from '../../types/followup';
import { ApplicationFormData, FollowupLogFormData } from '../../utils/validation';

const DRAWER_EXPANDED_WIDTH = 240;
const DRAWER_COLLAPSED_WIDTH = 72;

export const AppLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const currentDesktopWidth = sidebarOpen ? DRAWER_EXPANDED_WIDTH : DRAWER_COLLAPSED_WIDTH;

  // Global Dialog States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<ApplicationWithFollowups | null>(null);
  const [viewingApp, setViewingApp] = useState<ApplicationWithFollowups | null>(null);
  const [activeFollowup, setActiveFollowup] = useState<{
    followup: Followup;
    application: ApplicationWithFollowups;
  } | null>(null);
  const [deleteAppId, setDeleteAppId] = useState<string | null>(null);

  // Snackbar Toast
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const {
    createApplication,
    isCreating,
    updateApplication,
    isUpdating,
    deleteApplication,
    isDeleting,
    applications,
  } = useApplications();

  const { logFollowup, isLogging } = useFollowups();

  const handleMobileDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Create or Update Application
  const handleSaveApplication = async (data: ApplicationFormData) => {
    try {
      if (editingApp) {
        await updateApplication({
          id: editingApp.id,
          dto: data,
          originalAppliedDate: editingApp.applied_date,
        });
        setToast({ open: true, message: 'Application updated successfully', severity: 'success' });
      } else {
        await createApplication(data);
        setToast({
          open: true,
          message: 'Application created & Follow-up #1 scheduled!',
          severity: 'success',
        });
      }
      setAddModalOpen(false);
      setEditingApp(null);
    } catch (err: any) {
      setToast({ open: true, message: err.message || 'Failed to save application', severity: 'error' });
    }
  };

  // Delete Application
  const handleConfirmDelete = async () => {
    if (!deleteAppId) return;
    try {
      await deleteApplication(deleteAppId);
      setToast({ open: true, message: 'Application and follow-ups deleted', severity: 'info' });
      setDeleteAppId(null);
      if (viewingApp?.id === deleteAppId) {
        setViewingApp(null);
      }
    } catch (err: any) {
      setToast({ open: true, message: err.message || 'Failed to delete application', severity: 'error' });
    }
  };

  // Log Follow-up Result
  const handleLogFollowup = async (dto: FollowupLogFormData) => {
    if (!activeFollowup) return;
    try {
      await logFollowup({
        followupId: activeFollowup.followup.id,
        applicationId: activeFollowup.application.id,
        sequenceNumber: activeFollowup.followup.sequence_number,
        dueDate: activeFollowup.followup.due_date,
        applicationStatus: activeFollowup.application.status,
        dto,
      });

      setToast({
        open: true,
        message:
          dto.result === 'No Response'
            ? 'Follow-up logged. Next follow-up automatically scheduled!'
            : 'Follow-up completed.',
        severity: 'success',
      });
      setActiveFollowup(null);

      // Refresh viewing app if currently open
      if (viewingApp && viewingApp.id === activeFollowup.application.id) {
        const updated = applications.find((a) => a.id === viewingApp.id);
        if (updated) setViewingApp(updated);
      }
    } catch (err: any) {
      setToast({ open: true, message: err.message || 'Failed to log follow-up', severity: 'error' });
    }
  };

  // Update Status directly from details dialog
  const handleStatusChange = async (status: ApplicationStatus) => {
    if (!viewingApp) return;
    try {
      await updateApplication({
        id: viewingApp.id,
        dto: { status },
      });
      setToast({ open: true, message: `Status updated to ${status}`, severity: 'success' });
      setViewingApp({ ...viewingApp, status });
    } catch (err: any) {
      setToast({ open: true, message: err.message || 'Failed to update status', severity: 'error' });
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.default',
        overflow: 'hidden',
      }}
    >
      {/* 1. Full-Width Fixed Top Navigation */}
      <Navbar
        onOpenAddModal={() => {
          setEditingApp(null);
          setAddModalOpen(true);
        }}
        onDrawerToggle={handleMobileDrawerToggle}
        onToggleDesktopSidebar={toggleSidebar}
      />

      {/* 2. Below Header Layout Container (Fixed Sidebar + Independently Scrolling Main Content) */}
      <Box
        sx={{
          display: 'flex',
          flexGrow: 1,
          width: '100%',
          height: 'calc(100vh - 64px)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Responsive Navigation Drawer / Sidebar */}
        <Box
          component="nav"
          sx={{
            width: { md: currentDesktopWidth },
            flexShrink: { md: 0 },
            transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            height: '100%',
          }}
          aria-label="navigation menus"
        >
          {/* Mobile Drawer (Temporary) */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleMobileDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: DRAWER_EXPANDED_WIDTH,
                backgroundColor: 'background.paper',
                borderRight: '1px solid',
                borderColor: 'divider',
              },
            }}
          >
            <Sidebar isMobile onItemClick={() => setMobileOpen(false)} />
          </Drawer>

          {/* Desktop Permanent Collapsible Sidebar */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              height: '100%',
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: currentDesktopWidth,
                transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                height: '100%',
                backgroundColor: 'background.paper',
                borderRight: '1px solid',
                borderColor: 'divider',
                overflowX: 'hidden',
              },
            }}
            open
          >
            <Sidebar
              collapsed={!sidebarOpen}
              onToggleCollapse={toggleSidebar}
            />
          </Drawer>
        </Box>

        {/* Main Application Content Area — Isolated Scroll */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 4 },
            width: { xs: '100%', md: `calc(100% - ${currentDesktopWidth}px)` },
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            backgroundColor: 'background.default',
          }}
        >
          <Container maxWidth="xl" disableGutters sx={{ pb: 6 }}>
            <Outlet
              context={{
                onOpenAddModal: () => {
                  setEditingApp(null);
                  setAddModalOpen(true);
                },
                onEditApplication: (app: ApplicationWithFollowups) => {
                  setEditingApp(app);
                  setAddModalOpen(true);
                },
                onViewApplication: (app: ApplicationWithFollowups) => {
                  setViewingApp(app);
                },
                onDeleteApplication: (id: string) => {
                  setDeleteAppId(id);
                },
                onFollowUp: (followup: Followup, app: ApplicationWithFollowups) => {
                  setActiveFollowup({ followup, application: app });
                },
              }}
            />
          </Container>
        </Box>
      </Box>

      {/* Global Application Form Dialog */}
      <ApplicationFormDialog
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setEditingApp(null);
        }}
        onSubmit={handleSaveApplication}
        initialData={editingApp}
        loading={isCreating || isUpdating}
      />

      {/* Global Application Details Dialog */}
      <ApplicationDetailsDialog
        open={Boolean(viewingApp)}
        onClose={() => setViewingApp(null)}
        application={viewingApp}
        onEdit={(app) => {
          setViewingApp(null);
          setEditingApp(app);
          setAddModalOpen(true);
        }}
        onDelete={(id) => {
          setDeleteAppId(id);
        }}
        onFollowUp={(followup, app) => {
          setActiveFollowup({ followup, application: app });
        }}
        onStatusChange={handleStatusChange}
      />

      {/* Global Follow-up Action Dialog */}
      <FollowupActionDialog
        open={Boolean(activeFollowup)}
        onClose={() => setActiveFollowup(null)}
        followup={activeFollowup?.followup || null}
        companyName={activeFollowup?.application.company_name || ''}
        jobRole={activeFollowup?.application.job_role || ''}
        applicationStatus={activeFollowup?.application.status || 'Applied'}
        onSubmit={handleLogFollowup}
        loading={isLogging}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteAppId)}
        title="Delete Application?"
        message="Are you sure you want to delete this job application? This will permanently remove its entire follow-up history."
        confirmText="Delete"
        confirmColor="error"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteAppId(null)}
      />

      {/* Global Feedback Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%', fontWeight: 600 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
