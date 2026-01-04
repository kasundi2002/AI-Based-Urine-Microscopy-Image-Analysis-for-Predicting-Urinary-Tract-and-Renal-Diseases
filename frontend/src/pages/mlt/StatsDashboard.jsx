import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const data = [
  { name: '23 Nov', value: 24000 },
  { name: '24', value: 25000 },
  { name: '25', value: 28000 },
  { name: '26', value: 27000 },
  { name: '27', value: 32000 },
  { name: '28', value: 36000 },
  { name: '29', value: 34000 },
  { name: '30', value: 42000 },
];

const StatCard = ({ title, value, subtitle, icon, color }) => (
  <Paper sx={{ p: 3, height: '100%', borderRadius: 3, boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
      <Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          {value}
        </Typography>
      </Box>
      <Box sx={{ 
        p: 1.5, 
        borderRadius: 2, 
        bgcolor: `${color}15`, 
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </Box>
    </Box>
    <Typography variant="body2" color="text.secondary">
      {subtitle}
    </Typography>
  </Paper>
);

const StatsDashboard = () => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Dashboard Overview</Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StatCard 
            title="Total Revenue" 
            value="$45,678.90" 
            subtitle="+20% month over month" 
            icon={<TrendingUpIcon />}
            color="#2ecc71"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard 
            title="Total Patients" 
            value="2,405" 
            subtitle="+33% month over month" 
            icon={<PeopleAltIcon />}
            color="#3498db"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard 
            title="Pending Reports" 
            value="101" 
            subtitle="-8% month over month" 
            icon={<AssignmentIcon />}
            color="#f1c40f"
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Analytics Trends</Typography>
        <Box sx={{ height: 400, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9e9e9e', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9e9e9e', fontSize: 12 }} 
                tickFormatter={(value) => `$${value/1000}k`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0px 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#2c3e50" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#2c3e50', strokeWidth: 0 }} 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Box>
  );
};

export default StatsDashboard;
