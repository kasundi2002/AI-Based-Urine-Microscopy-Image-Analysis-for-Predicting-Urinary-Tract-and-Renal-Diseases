import React from 'react';
import { Paper, Typography, Box, Chip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TimelineIcon from '@mui/icons-material/Timeline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const data = [
  { date: 'Jan 23', wbc: 2, rbc: 1, risk: 10 },
  { date: 'Mar 23', wbc: 5, rbc: 2, risk: 25 },
  { date: 'Jun 23', wbc: 8, rbc: 4, risk: 45 },
  { date: 'Sep 23', wbc: 12, rbc: 6, risk: 60 },
  { date: 'Oct 23', wbc: 10, rbc: 5, risk: 55 },
];

const LongitudinalView = () => {
  const theme = useTheme();

  return (
    <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider', mt: 3 }}>
      {/* Header */}
      <Box sx={{ 
        px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha('#7c4dff', 0.08), color: '#7c4dff', display: 'flex' }}>
            <TimelineIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>Patient History & Trends</Typography>
            <Typography variant="caption" color="text.secondary">Longitudinal tracking of key biomarkers</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2.5 }}>
          {[
            { label: 'Risk Score', color: '#ff9100' },
            { label: 'WBC', color: '#00bcd4' },
            { label: 'RBC', color: '#ef5350' },
          ].map(item => (
            <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 3, borderRadius: 2, bgcolor: item.color }} />
              <Typography variant="caption" color="text.secondary" fontWeight={500}>{item.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Trend Summary Chips */}
      <Box sx={{ px: 3, py: 1.5, display: 'flex', gap: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        {[
          { label: 'Risk: 55%', trend: '▼ 5% from peak', color: '#ff9100' },
          { label: 'WBC: 10 /hpf', trend: '▲ +8 over period', color: '#00bcd4' },
          { label: 'RBC: 5 /hpf', trend: '▲ +4 over period', color: '#ef5350' },
        ].map(item => (
          <Chip
            key={item.label}
            icon={<TrendingUpIcon sx={{ fontSize: 14 }} />}
            label={`${item.label} — ${item.trend}`}
            size="small"
            sx={{
              bgcolor: alpha(item.color, 0.06), color: item.color, fontWeight: 600, fontSize: '0.7rem', height: 26,
              border: '1px solid', borderColor: alpha(item.color, 0.15),
              '& .MuiChip-icon': { color: item.color }
            }}
          />
        ))}
      </Box>

      {/* Chart */}
      <Box sx={{ p: 3, height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff9100" stopOpacity={0.12}/>
                <stop offset="95%" stopColor="#ff9100" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="wbcGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00bcd4" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#00bcd4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.5)} />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} dx={-5} />
            <Tooltip
              contentStyle={{ 
                borderRadius: 10, border: 'none', fontSize: 13,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                backgroundColor: theme.palette.background.paper,
              }}
              cursor={{ stroke: theme.palette.divider }}
            />
            <Area type="monotone" dataKey="risk" stroke="#ff9100" strokeWidth={2.5} fillOpacity={1} fill="url(#riskGrad)" name="Risk Score (%)" />
            <Area type="monotone" dataKey="wbc" stroke="#00bcd4" strokeWidth={2} fillOpacity={1} fill="url(#wbcGrad)" name="WBC Count" />
            <Line type="monotone" dataKey="rbc" stroke="#ef5350" strokeWidth={2} dot={{ r: 3, fill: '#ef5350' }} name="RBC Count" />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default LongitudinalView;
