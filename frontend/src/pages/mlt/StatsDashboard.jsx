import React from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import { Box, Grid, Paper, Typography, Chip, Avatar, LinearProgress } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ScienceIcon from '@mui/icons-material/Science';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShieldIcon from '@mui/icons-material/Shield';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import DiamondIcon from '@mui/icons-material/Diamond';
import BugReportIcon from '@mui/icons-material/BugReport';
import SpeedIcon from '@mui/icons-material/Speed';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const trendData = [
  { name: 'Mon', samples: 18, high: 3 },
  { name: 'Tue', samples: 24, high: 5 },
  { name: 'Wed', samples: 22, high: 2 },
  { name: 'Thu', samples: 28, high: 6 },
  { name: 'Fri', samples: 32, high: 4 },
  { name: 'Sat', samples: 15, high: 1 },
  { name: 'Sun', samples: 12, high: 2 },
];

const sedimentBarData = [
  { name: 'WBC', count: 68, color: '#00bcd4' },
  { name: 'RBC', count: 42, color: '#ef5350' },
  { name: 'Crystals', count: 35, color: '#ff9100' },
  { name: 'Cast', count: 12, color: '#ab47bc' },
  { name: 'Bacteria', count: 28, color: '#66bb6a' },
];

const recentActivity = [
  { patient: 'Kane Peter', id: 'P01', action: 'Analysis Complete', risk: 'Low', time: '2 min ago', color: '#66bb6a' },
  { patient: 'Amara Silva', id: 'P02', action: 'High Risk Flagged', risk: 'High', time: '15 min ago', color: '#ef5350' },
  { patient: 'David Cruz', id: 'P03', action: 'Report Submitted', risk: 'Normal', time: '32 min ago', color: '#66bb6a' },
  { patient: 'Lisa Chen', id: 'P04', action: 'Awaiting Review', risk: 'Moderate', time: '1 hr ago', color: '#ff9100' },
];

const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3, borderRadius: 3, height: '100%',
      border: '1px solid', borderColor: 'divider',
      transition: 'all 0.2s',
      '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
      <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: alpha(color, 0.08), color, display: 'flex' }}>
        {React.cloneElement(icon, { sx: { fontSize: 22 } })}
      </Box>
      <Chip
        icon={trend > 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
        label={`${trend > 0 ? '+' : ''}${trend}%`}
        size="small"
        sx={{
          bgcolor: trend > 0 ? alpha('#66bb6a', 0.1) : alpha('#ef5350', 0.1),
          color: trend > 0 ? '#66bb6a' : '#ef5350',
          fontWeight: 700, fontSize: '0.7rem', height: 24,
          '& .MuiChip-icon': { color: trend > 0 ? '#66bb6a' : '#ef5350' }
        }}
      />
    </Box>
    <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: -1, mb: 0.5 }}>{value}</Typography>
    <Typography variant="body2" fontWeight={600} color="text.secondary">{title}</Typography>
    <Typography variant="caption" color="text.disabled">{subtitle}</Typography>
  </Paper>
);


const StatsDashboard = () => {
  const theme = useTheme();

  return (
    <Box sx={{ animation: 'fadeIn 0.4s ease-out' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <SpeedIcon sx={{ color: '#00bcd4', fontSize: 28 }} />
            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: -0.5 }}>Dashboard Overview</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            <CalendarTodayIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </Typography>
        </Box>
        <Chip
          icon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
          label="Last updated: Just now"
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600, fontSize: '0.7rem' }}
        />
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Samples Analyzed" value="145" subtitle="Today's total" icon={<ScienceIcon />} color="#00bcd4" trend={12} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Pending Reviews" value="24" subtitle="Needs attention" icon={<AssignmentLateIcon />} color="#ff9100" trend={-5} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Critical Findings" value="8" subtitle="High risk cases" icon={<WarningAmberIcon />} color="#ef5350" trend={3} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Completed Reports" value="121" subtitle="Signed by clinicians" icon={<CheckCircleIcon />} color="#66bb6a" trend={18} />
        </Grid>
      </Grid>

      {/* Main Grid: Chart + Sediment Summary */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Trend Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden', height: '100%' }}>
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>Weekly Analysis Trends</Typography>
                <Typography variant="caption" color="text.secondary">Samples processed & high-risk detections</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 10, height: 3, borderRadius: 2, bgcolor: '#00bcd4' }} />
                  <Typography variant="caption" color="text.secondary">Samples</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 10, height: 3, borderRadius: 2, bgcolor: '#ef5350' }} />
                  <Typography variant="caption" color="text.secondary">High Risk</Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ p: 3, height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSamples" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00bcd4" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#00bcd4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef5350" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#ef5350" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.5)} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} dx={-5} />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13 }}
                    cursor={{ stroke: theme.palette.divider }}
                  />
                  <Area type="monotone" dataKey="samples" stroke="#00bcd4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSamples)" />
                  <Area type="monotone" dataKey="high" stroke="#ef5350" strokeWidth={2} fillOpacity={1} fill="url(#colorHigh)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Sediment Distribution */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" fontWeight={700}>Sediment Distribution</Typography>
              <Typography variant="caption" color="text.secondary">Detections this week</Typography>
            </Box>
            <Box sx={{ p: 2, flexGrow: 1 }}>
              {[
                { name: 'WBC', count: 68, total: 145, color: '#00bcd4', icon: <ShieldIcon sx={{ fontSize: 16 }} /> },
                { name: 'RBC', count: 42, total: 145, color: '#ef5350', icon: <BloodtypeIcon sx={{ fontSize: 16 }} /> },
                { name: 'Crystals', count: 35, total: 145, color: '#ff9100', icon: <DiamondIcon sx={{ fontSize: 16 }} /> },
                { name: 'Cast', count: 12, total: 145, color: '#ab47bc', icon: <ScienceIcon sx={{ fontSize: 16 }} /> },
                { name: 'Bacteria', count: 28, total: 145, color: '#66bb6a', icon: <BugReportIcon sx={{ fontSize: 16 }} /> },
              ].map((item, i) => (
                <Box key={i} sx={{
                  p: 1.5, mb: 1, borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: alpha(item.color, 0.04), transform: 'translateX(4px)' }
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ p: 0.5, borderRadius: 1.5, bgcolor: alpha(item.color, 0.1), color: item.color, display: 'flex' }}>
                        {item.icon}
                      </Box>
                      <Typography variant="body2" fontWeight={600}>{item.name}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={700} sx={{ color: item.color }}>{item.count}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={(item.count / item.total) * 100} sx={{
                    height: 5, borderRadius: 3, bgcolor: alpha(item.color, 0.08),
                    '& .MuiLinearProgress-bar': { bgcolor: item.color, borderRadius: 3 }
                  }} />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>Recent Activity</Typography>
            <Typography variant="caption" color="text.secondary">Latest lab results and actions</Typography>
          </Box>
          <Chip label="View All" size="small" variant="outlined" clickable sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
        </Box>
        <Box>
          {recentActivity.map((item, i) => (
            <Box
              key={i}
              sx={{
                px: 3, py: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: i < recentActivity.length - 1 ? '1px solid' : 'none', borderColor: 'divider',
                transition: 'all 0.15s',
                '&:hover': { bgcolor: alpha('#00bcd4', 0.02) }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(item.color, 0.1), color: item.color, fontSize: '0.85rem', fontWeight: 700 }}>
                  {item.patient.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{item.patient}</Typography>
                  <Typography variant="caption" color="text.secondary">{item.id} · {item.action}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  label={item.risk}
                  size="small"
                  sx={{
                    bgcolor: alpha(item.color, 0.1), color: item.color,
                    fontWeight: 700, fontSize: '0.65rem', height: 22,
                    border: '1px solid', borderColor: alpha(item.color, 0.2),
                  }}
                />
                <Typography variant="caption" color="text.disabled" sx={{ minWidth: 60, textAlign: 'right' }}>{item.time}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default StatsDashboard;
