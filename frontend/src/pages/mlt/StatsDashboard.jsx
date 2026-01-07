import React from 'react';
import { Box, Grid, Paper, Typography, Card, CardContent } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
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

const StatCard = ({ title, value, subtitle, icon, gradient }) => (
  <Card 
    elevation={4}
    sx={{ 
        height: '100%', 
        background: gradient, 
        color: 'white',
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': { 
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 24px -4px rgba(0,0,0,0.3)'
        }
    }}
  >
    <Box sx={{ position: 'absolute', top: -15, right: -15, opacity: 0.15 }}>
        {React.cloneElement(icon, { sx: { fontSize: 120 } })}
    </Box>
    <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
             <Box>
                <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', mb: 1 }}>
                {title}
                </Typography>
                <Typography variant="h3" fontWeight="900" sx={{ letterSpacing: -1 }}>
                {value}
                </Typography>
             </Box>
             <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}>
                {icon}
             </Box>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.9, display: 'flex', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.1)', width: 'fit-content', px: 1, py: 0.5, borderRadius: 1 }}>
          <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} /> {subtitle}
        </Typography>
    </CardContent>
  </Card>
);

const StatsDashboard = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: '900', letterSpacing: -0.5 }}>Overview</Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard 
            title="Total Revenue" 
            value="$45,678.90" 
            subtitle="+20% month over month" 
            icon={<TrendingUpIcon />}
            gradient="linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard 
            title="Total Patients" 
            value="2,405" 
            subtitle="+33% month over month" 
            icon={<PeopleAltIcon />}
            gradient="linear-gradient(135deg, #134E5E 0%, #71B280 100%)" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard 
            title="Pending Reports" 
            value="101" 
            subtitle="-8% month over month" 
            icon={<AssignmentIcon />}
            gradient="linear-gradient(135deg, #20002c 0%, #cbb4d4 100%)" 
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 4, borderRadius: 4, bgcolor: '#1a202c', color: 'white' }}>
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight="bold">Analytics Trends</Typography>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>Patient volume analysis over the last week</Typography>
        </Box>
        
        <Box sx={{ height: 450, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
                tickFormatter={(value) => `$${value/1000}k`}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', backgroundColor: 'rgba(30, 41, 59, 0.95)', color: 'white' }}
                itemStyle={{ color: '#fff' }}
                cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#6366f1" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Box>
  );
};

export default StatsDashboard;
