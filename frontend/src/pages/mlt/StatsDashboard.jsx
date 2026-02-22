import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Grid, Paper, Typography, Card, CardContent } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScienceIcon from '@mui/icons-material/Science';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ShieldIcon from '@mui/icons-material/Shield';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import DiamondIcon from '@mui/icons-material/Diamond';
import BugReportIcon from '@mui/icons-material/BugReport';

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
    const theme = useTheme();

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: '900', letterSpacing: -0.5, color: 'text.primary' }}>Overview</Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard 
            title="Samples Analyzed" 
            value="145" 
            subtitle="+12% vs yesterday" 
            icon={<ScienceIcon />}
            gradient="linear-gradient(135deg, #00C853 0%, #009624 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard 
            title="Pending Reviews" 
            value="24" 
            subtitle="Needs urgent attention" 
            icon={<AssignmentLateIcon />}
            gradient="linear-gradient(135deg, #FF9100 0%, #FF6D00 100%)" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard 
            title="Critical Findings" 
            value="8" 
            subtitle="High risk detected" 
            icon={<WarningAmberIcon />}
            gradient="linear-gradient(135deg, #FF1744 0%, #D50000 100%)" 
          />
        </Grid>
      </Grid>

      {/* New Sediment Summary Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
            <Card elevation={4} sx={{ borderRadius: 4, bgcolor: 'background.paper' }}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                         Common Sediments Detected Today
                    </Typography>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        {[
                            { label: 'WBC (Average)', value: '4-6', unit: '/hpf', color: '#00bcd4', icon: <ShieldIcon /> },
                            { label: 'RBC (Average)', value: '1-3', unit: '/hpf', color: '#ff1744', icon: <BloodtypeIcon /> },
                            { label: 'Crystals Detected', value: '15', unit: 'samples', color: '#ff9100', icon: <DiamondIcon /> },
                            { label: 'Bacteria Detected', value: '8', unit: 'samples', color: '#4caf50', icon: <BugReportIcon /> }
                        ].map((item, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Paper 
                                    elevation={0}
                                    sx={{ 
                                        p: 3, 
                                        textAlign: 'center', 
                                        bgcolor: `${item.color}08`, 
                                        border: `1px solid ${item.color}20`,
                                        borderRadius: 3,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-5px)',
                                            boxShadow: `0 8px 24px ${item.color}20`,
                                            bgcolor: `${item.color}15`,
                                            borderColor: `${item.color}40`
                                        }
                                    }}
                                >
                                    <Box sx={{ color: item.color, mb: 2, opacity: 0.9 }}>
                                        {React.cloneElement(item.icon, { sx: { fontSize: 40 } })}
                                    </Box>
                                    <Typography variant="h4" fontWeight="900" sx={{ color: 'text.primary', mb: 1 }}>
                                        {item.value}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" fontWeight="600">
                                        {item.label} {item.unit && <span style={{ opacity: 0.7, fontWeight: 400 }}>{item.unit}</span>}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', color: 'text.primary' }}>
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight="bold">Analytics Trends</Typography>
            <Typography variant="body2" color="text.secondary">Patient volume analysis over the last week</Typography>
        </Box>
        
        <Box sx={{ height: 450, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} 
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} 
                tickFormatter={(value) => `$${value/1000}k`}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ 
                    borderRadius: 12, 
                    border: 'none', 
                    boxShadow: theme.shadows[3], 
                    backgroundColor: theme.palette.background.paper, 
                    color: theme.palette.text.primary 
                }}
                itemStyle={{ color: theme.palette.primary.main }}
                cursor={{ stroke: theme.palette.divider, strokeWidth: 1 }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={theme.palette.primary.main} 
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
