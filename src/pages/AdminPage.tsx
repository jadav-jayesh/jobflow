import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Card,
  CardContent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { PageHeader } from '../components/common/PageHeader';
import { TableLoadingSkeleton } from '../components/common/LoadingSkeleton';
import { UserActivityDialog } from '../components/admin/UserActivityDialog';
import { useAdmin, UserWithStats } from '../hooks/useAdmin';
import { formatDate } from '../utils/dateUtils';
import { formatDistanceToNow, parseISO } from 'date-fns';

export const AdminPage: React.FC = () => {
  const {
    isAdmin,
    users,
    stats,
    isLoading,
    fetchUserActivity,
    updateUserRole,
    isUpdatingRole,
  } = useAdmin();

  const [search, setSearch] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);

  if (!isAdmin) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <AdminPanelSettingsIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You must have the <strong>Admin</strong> role to access the platform management console.
        </Typography>
      </Box>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    await updateUserRole({ userId, newRole });
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser({ ...selectedUser, role: newRole });
    }
  };

  return (
    <Box>
      <PageHeader
        title="Admin Management Console"
        subtitle="Global platform overview, registered user directories, and real-time candidate activity tracking."
      />

      {/* 1. Global Platform Metric KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: 'primary.lighter',
                color: 'primary.main',
                display: 'flex',
              }}
            >
              <PeopleAltOutlinedIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                REGISTERED USERS
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {stats.totalUsers}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: 'info.lighter',
                color: 'info.main',
                display: 'flex',
              }}
            >
              <WorkOutlineOutlinedIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                TOTAL APPLICATIONS
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {stats.totalApplications}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: 'warning.lighter',
                color: 'warning.main',
                display: 'flex',
              }}
            >
              <NotificationsActiveOutlinedIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                FOLLOW-UP TASKS
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {stats.completedFollowups} / {stats.totalFollowups}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: 'success.lighter',
                color: 'success.main',
                display: 'flex',
              }}
            >
              <EmojiEventsOutlinedIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                INTERVIEWS &amp; OFFERS
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {stats.activeInterviews} / {stats.offersReceived}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 2. Search & User Directory Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          User Directory &amp; Activity ({filteredUsers.length})
        </Typography>

        <TextField
          size="small"
          placeholder="Search by name, email, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 280 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {/* 3. User Directory Table */}
      {isLoading ? (
        <TableLoadingSkeleton rows={5} />
      ) : (
        <>
          {/* Desktop Table View */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              display: { xs: 'none', md: 'block' },
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
            }}
          >
            <Table>
              <TableHead sx={{ backgroundColor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>USER</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ROLE</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>JOINED</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>APPLICATIONS</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>FOLLOW-UPS</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>LAST ACTIVITY</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No users found matching your search query.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u) => {
                    const lastActive = u.lastActivityAt
                      ? formatDistanceToNow(parseISO(u.lastActivityAt), { addSuffix: true })
                      : 'Never';

                    return (
                      <TableRow key={u.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {u.full_name || 'Anonymous'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {u.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={u.role.toUpperCase()}
                            color={u.role === 'admin' ? 'primary' : 'default'}
                            sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatDate(u.created_at)}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={`${u.totalApplications} apps`}
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {u.completedFollowups} / {u.totalFollowups}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {lastActive}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityOutlinedIcon />}
                            onClick={() => setSelectedUser(u)}
                            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                          >
                            Inspect
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Mobile Cards View */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
            {filteredUsers.map((u) => (
              <Card
                key={u.id}
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2,
                    py: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'action.hover',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {u.full_name || 'Anonymous'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {u.email}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={u.role.toUpperCase()}
                    color={u.role === 'admin' ? 'primary' : 'default'}
                    sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                  />
                </Box>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                        APPLICATIONS
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {u.totalApplications} logged
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                        FOLLOW-UPS
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {u.completedFollowups} / {u.totalFollowups} completed
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                        JOINED
                      </Typography>
                      <Typography variant="body2">{formatDate(u.created_at)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                        TIMEZONE
                      </Typography>
                      <Typography variant="body2">{u.timezone}</Typography>
                    </Box>
                  </Box>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<VisibilityOutlinedIcon />}
                    onClick={() => setSelectedUser(u)}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                  >
                    Inspect User Activity
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </>
      )}

      {/* 4. User Drilldown Modal */}
      <UserActivityDialog
        open={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
        onFetchActivity={fetchUserActivity}
        onToggleRole={handleToggleRole}
        updatingRole={isUpdatingRole}
      />
    </Box>
  );
};
