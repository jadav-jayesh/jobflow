import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button,
  TablePagination,
  Link,
} from '@mui/material';
import { FollowupWithApplication } from '../../types/followup';
import { ApplicationStatus } from '../../types/application';
import { FollowupBadge } from '../common/FollowupBadge';
import { StatusChip } from '../common/StatusChip';
import { formatDate } from '../../utils/dateUtils';
import { getFollowupState } from '../../utils/followupEngine';
import { useAuth } from '../../context/AuthContext';

interface FollowupTableProps {
  followups: FollowupWithApplication[];
  onFollowUp: (followup: FollowupWithApplication) => void;
  onViewApplication: (applicationId: string) => void;
}

export const FollowupTable: React.FC<FollowupTableProps> = ({
  followups,
  onFollowUp,
  onViewApplication,
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

  const paginatedFollowups = followups.slice(
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
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell>Company &amp; Role</TableCell>
              <TableCell>Follow-up</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status / State</TableCell>
              <TableCell>Method &amp; Result</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedFollowups.map((item) => {
              const app = item.applications;
              const state = getFollowupState(
                item,
                app?.status as ApplicationStatus,
                profile?.timezone
              );
              const isCompleted = Boolean(item.completed_at);

              return (
                <TableRow
                  key={item.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  {/* Company & Role */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: 'primary.main',
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                      onClick={() => app?.id && onViewApplication(app.id)}
                    >
                      {app?.company_name || 'Application'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {app?.job_role}
                    </Typography>
                  </TableCell>

                  {/* Sequence */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Follow-up #{item.sequence_number}
                    </Typography>
                  </TableCell>

                  {/* Due Date */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatDate(item.due_date)}
                    </Typography>
                  </TableCell>

                  {/* State / Status */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FollowupBadge
                        state={state}
                        dueDate={item.due_date}
                        sequenceNumber={item.sequence_number}
                        showDate={false}
                      />
                      {app?.status && <StatusChip status={app.status as ApplicationStatus} />}
                    </Box>
                  </TableCell>

                  {/* Method & Result */}
                  <TableCell>
                    {isCompleted ? (
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.result}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          via {item.method || 'Direct'} on {formatDate(item.completed_at)}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Pending Outreach
                      </Typography>
                    )}
                  </TableCell>

                  {/* Action */}
                  <TableCell align="right">
                    {!isCompleted ? (
                      <Button
                        variant="contained"
                        size="small"
                        color={state === 'Today' || state === 'Overdue' ? 'warning' : 'primary'}
                        onClick={() => onFollowUp(item)}
                        sx={{ fontWeight: 600 }}
                      >
                        Follow Up
                      </Button>
                    ) : (
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        ✓ Logged
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {followups.length > rowsPerPage && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={followups.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Paper>
  );
};
