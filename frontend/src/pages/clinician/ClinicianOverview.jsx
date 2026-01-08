import React from 'react';
import { Box, Grid, Paper, Typography, Button, List, ListItem, ListItemText, ListItemAvatar, Avatar, Chip, Card, CardContent, IconButton } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SystemUpdateIcon from '@mui/icons-material/SystemUpdate';
import BuildIcon from '@mui/icons-material/Build';

const StatCard = ({ title, value, color, icon, gradient }) => (
  <Card 
    elevation={4}
    sx={{ 
        height: '100%', 
        background: gradient || `linear-gradient(135deg, ${color} 0%, ${color}DD 100%)`, 
        color: 'white',
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': { 
            transform: 'translateY(-5px)',
            boxShadow: `0 8px 24px -4px ${color}80`
        }
    }}
  >
    <Box sx={{ position: 'absolute', top: -10, right: -10, opacity: 0.15 }}>
        {React.cloneElement(icon, { sx: { fontSize: 100 } })}
    </Box>
    <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex' }}>
                {icon}
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, opacity: 0.9 }}>{title}</Typography>
        </Box>
        <Typography variant="h3" fontWeight="900">{value}</Typography>
    </CardContent>
  </Card>
);

const ClinicianOverview = ({ onNavigate }) => {
  // Mock data
  const stats = {
    pendingReviews: 12,
    totalPatients: 145,
    criticalCases: 3,
    completedToday: 5
  };

  const pendingList = [
      { id: '1', name: 'Kane Peter', risk: 'High', date: 'Oct 20' },
      { id: '2', name: 'Alice Smith', risk: 'High', date: 'Oct 21' },
      { id: '3', name: 'Bob Johnson', risk: 'Moderate', date: 'Oct 21' },
      { id: '4', name: 'John Doe', risk: 'High', date: 'Oct 22' },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: '900', letterSpacing: -0.5, mb: 1 }}>
                Dashboard Overview
            </Typography>
            <Typography variant="body1" color="text.secondary">
                Welcome back, Dr. Smith. Here's your shift summary.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AssignmentIcon />}>
              View All Tasks
          </Button>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Pending Reviews" 
            value={stats.pendingReviews} 
            color="#ff9800" 
            gradient="linear-gradient(135deg, #FF9800 0%, #F57C00 100%)"
            icon={<AssignmentIcon />} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Critical Cases" 
            value={stats.criticalCases} 
            color="#f44336" 
            gradient="linear-gradient(135deg, #FF5252 0%, #D32F2F 100%)"
            icon={<WarningIcon />} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Patients" 
            value={stats.totalPatients} 
            color="#2196f3" 
            gradient="linear-gradient(135deg, #2196F3 0%, #1976D2 100%)"
            icon={<PeopleIcon />} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Signed Off Today" 
            value={stats.completedToday} 
            color="#4caf50" 
            gradient="linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)"
            icon={<CheckCircleIcon />} 
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
            <Card elevation={4} sx={{ height: '100%', borderRadius: 4, bgcolor: 'background.paper' }}>
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ p: 1, bgcolor: 'error.main', borderRadius: 1, mr: 2, color: 'white' }}>
                                <WarningIcon fontSize="small" />
                            </Box>
                            <Typography variant="h6" fontWeight="bold">Urgent Reviews</Typography>
                        </Box>
                        <Button 
                            endIcon={<ArrowForwardIcon />} 
                            onClick={() => onNavigate('review')}
                            sx={{ fontWeight: 'bold' }}
                        >
                            View All
                        </Button>
                    </Box>
                    <List sx={{ p: 0 }}>
                        {pendingList.map((item, index) => (
                            <ListItem 
                                key={item.id} 
                                divider={index !== pendingList.length - 1}
                                sx={{ 
                                    py: 2.5, 
                                    px: 3,
                                    transition: 'background-color 0.2s',
                                    '&:hover': { bgcolor: 'action.hover' },
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar 
                                        sx={{ 
                                            bgcolor: item.risk === 'High' ? 'error.main' : 'warning.main', 
                                            width: 48, 
                                            height: 48, 
                                            fontSize: '1.2rem',
                                            boxShadow: 2,
                                            mr: 2
                                        }}
                                    >
                                        {item.name.charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">{item.name}</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 1 }}>
                                            <Chip 
                                                label={item.risk} 
                                                size="small" 
                                                color={item.risk === 'High' ? 'error' : 'warning'} 
                                                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 'bold' }}
                                            />
                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                                • {item.date}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                                <Button 
                                    variant="outlined" 
                                    color="primary"
                                    size="small" 
                                    onClick={() => onNavigate('review')}
                                    sx={{ borderRadius: 2 }}
                                >
                                    Review Case
                                </Button>
                            </ListItem>
                        ))}
                    </List>
                </CardContent>
            </Card>
        </Grid>
        <Grid item xs={12} md={4}>
            <Card 
                elevation={4} 
                sx={{ 
                    height: '100%', 
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(33, 150, 243, 0.01) 100%)',
                    border: '1px solid rgba(33, 150, 243, 0.1)',
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <NotificationsIcon color="primary" sx={{ mr: 1.5 }} />
                        <Typography variant="h6" fontWeight="bold">System Updates</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <Avatar sx={{ bgcolor: 'rgba(33, 150, 243, 0.1)', color: 'primary.main', width: 40, height: 40 }}>
                            <SystemUpdateIcon fontSize="small" />
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Version 2.1 Deployed</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                New AI model deployed for improved crystal detection accuracy (98.5%).
                            </Typography>
                            <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>2 hours ago</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(255, 150, 0, 0.1)', color: 'warning.main', width: 40, height: 40 }}>
                            <BuildIcon fontSize="small" />
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Scheduled Maintenance</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                System will be offline for routine maintenance on Sunday 2 AM - 4 AM.
                            </Typography>
                            <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>Yesterday</Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClinicianOverview;
