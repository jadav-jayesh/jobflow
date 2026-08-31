import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface ApplicationsByMonthChartProps {
  data: { month: string; applications: number }[];
}

export const ApplicationsByMonthChart: React.FC<ApplicationsByMonthChartProps> = ({ data }) => {
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
        Applications Activity
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
        Monthly application volume over the past 6 months
      </Typography>

      <Box sx={{ width: '100%', height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
              contentStyle={{
                borderRadius: 8,
                fontSize: '0.85rem',
                border: '1px solid #e2e8f0',
              }}
              formatter={(val: any) => [`${val} applied`, 'Applications']}
            />
            <Bar dataKey="applications" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};
