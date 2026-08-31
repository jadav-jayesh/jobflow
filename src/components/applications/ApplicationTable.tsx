import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Typography,
  Box,
  Button,
  TablePagination,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { ApplicationWithFollowups } from '../../types/application';
import { Followup } from '../../types/followup';
import { StatusChip } from '../common/StatusChip';
import { FollowupBadge } from '../common/FollowupBadge';
import { formatDate } from '../../utils/dateUtils';
import { getFollowupState } from '../../utils/followupEngine';
import { useAuth } from '../../context/AuthContext';

interface ApplicationTableProps {
  applications: ApplicationWithFollowups[];
  onView: (app: ApplicationWithFollowups) => void;
  onEdit: (app: ApplicationWithFollowups) => void;
  onDelete: (id: string) => void;
  onFollowUp: (followup: Followup, app: ApplicationWithFollowups) => void;
}

export const ApplicationTable: React.FC<ApplicationTableProps> = ({
  applications,
  onView,
  onEdit,
  onDelete,
  onFollowUp,
}) => {
  const { profile } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedApps = applications.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <TableContainer>
        <Table sx={{ minWidth: 700 }} aria-label="applications table">
          <TableHead>
            <TableRow>
              <TableCell>Company &amp; Role</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Applied Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Next Follow-up</TableCell>
              <TableCell>Source</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedApps.map((app) => {
              const nextFollowup = app.nextFollowup;
              const followupState = nextFollowup
                ? getFollowupState(nextFollowup, app.status, profile?.timezone)
                : null;

              return (
                <TableRow
                  key={app.id}
                  hover
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    cursor: 'pointer',
                  }}
                  onClick={() => onView(app)}
                >
                  {/* Company & Role */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: 'text.primary', display: 'block' }}
                    >
                      {app.company_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {app.job_role}
                    </Typography>
                  </TableCell>

                  {/* Location & Work Mode */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {app.location || '—'}
                    </Typography>
                    {app.work_mode && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {app.work_mode}
                      </Typography>
                    )}
                  </TableCell>

                  {/* Applied Date */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatDate(app.applied_date)}
                    </Typography>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <StatusChip status={app.status} />
                  </TableCell>

                  {/* Next Follow-up */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {nextFollowup && followupState ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <FollowupBadge
                          state={followupState}
                          dueDate={nextFollowup.due_date}
                          sequenceNumber={nextFollowup.sequence_number}
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          color={followupState === 'Today' || followupState === 'Overdue' ? 'warning' : 'primary'}
                          onClick={() => onFollowUp(nextFollowup, app)}
                          sx={{
                            fontSize: '0.725rem',
                            py: 0.25,
                            px: 1,
                            minWidth: 'auto',
                            fontWeight: 600,
                          }}
                        >
                          Follow Up
                        </Button>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>

                  {/* Source */}
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {app.source || '—'}
                    </Typography>
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => onView(app)}>
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Application">
                        <IconButton size="small" onClick={() => onEdit(app)}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Application">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDelete(app.id)}
                        >
                          <DeleteOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {applications.length > rowsPerPage && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={applications.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Paper>
  );
};
