import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

interface StatusDistributionChartProps {
  data: { name: string; value: number; color: string }[];
}

export const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({ data }) => {
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
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        Applications by Status
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
        Current distribution across active and inactive stages
      </Typography>

      {data.length === 0 ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 220,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No application data to display yet.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ width: '100%', height: 260, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any) => [`${val} applications`, 'Total']}
                contentStyle={{
                  borderRadius: 8,
                  fontSize: '0.85rem',
                  border: '1px solid #e2e8f0',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
};
