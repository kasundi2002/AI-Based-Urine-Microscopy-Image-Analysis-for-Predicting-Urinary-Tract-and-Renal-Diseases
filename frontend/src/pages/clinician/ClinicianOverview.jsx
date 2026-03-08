import React from 'react';
import { Box, Grid, Paper, Typography, Button, List, ListItem, ListItemAvatar, Avatar, Chip, Card, CardContent, Divider, useTheme, alpha } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BuildIcon from '@mui/icons-material/Build';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { api } from '../../services/api';

// A premium-looking stat card utilizing white space, soft shadows, and subtle color accents
const StatCard = ({ title, value, color, icon, trendLabel }) => {
    const theme = useTheme();
    return (
        <Card 
            elevation={0}
            sx={{ 
                height: '100%', 
                backgroundColor: theme.palette.background.paper, 
                borderRadius: 4,
                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: `0 4px 20px 0 ${alpha(theme.palette.common.black, 0.03)}`,
                '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 28px 0 ${alpha(color, 0.12)}`,
                    borderColor: alpha(color, 0.3)
                }
            }}
        >
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', zIndex: 1, position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box 
                        sx={{ 
                            p: 1.2, 
                            borderRadius: 3, 
                            bgcolor: alpha(color, 0.08), 
                            color: color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {React.cloneElement(icon, { sx: { fontSize: 26 } })}
                    </Box>
                    {trendLabel && (
                         <Chip 
                         label={trendLabel} 
                         size="small" 
                         sx={{ 
                             bgcolor: alpha(color, 0.08), 
                             color: color,
                             fontWeight: 600,
                             fontSize: '0.7rem',
                             height: 22
                         }} 
                     />
                    )}
                </Box>
                <Box sx={{ mt: 'auto' }}>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.text.primary, letterSpacing: '-1px', mb: 0.5 }}>
                        {value}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.text.secondary, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        {title}
                    </Typography>
                </Box>
            </CardContent>
            {/* Subtle background decoration */}
            <Box 
                sx={{ 
                    position: 'absolute', 
                    top: -20, 
                    right: -20, 
                    opacity: 0.04, 
                    color: color,
                    transform: 'rotate(15deg)'
                }}
            >
                {React.cloneElement(icon, { sx: { fontSize: 130 } })}
            </Box>
        </Card>
    );
};

const ClinicianOverview = ({ onNavigate }) => {
  const theme = useTheme();
  const [patients, setPatients] = React.useState([]);
  const [reports, setReports] = React.useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [pData, rData] = await Promise.all([
          api.getPatients(),
          api.getAllReports()
        ]);
        setPatients(pData);
        setReports(rData);
      } catch (err) {
        console.error('Failed to fetch clinician dashboard data:', err);
      }
    };
    fetchData();
  }, []);

  const todayStr = new Date().toDateString();
  const completedToday = patients.filter(p => p.status === 'Completed' && new Date(p.updatedAt || p.createdAt).toDateString() === todayStr).length;

  const stats = {
    pendingReviews: patients.filter(p => p.status === 'Ready for Review').length,
    totalPatients: patients.length,
    criticalCases: patients.filter(p => p.status === 'Ready for Review' && (p.riskAssessment === 'High' || p.riskAssessment === 'Critical')).length,
    completedToday: completedToday
  };

  const pendingList = patients
    .filter(p => p.status === 'Ready for Review')
    .sort((a, b) => {
      // Sort High risk first, then by date
      if ((a.riskAssessment === 'High' || a.riskAssessment === 'Critical') && !(b.riskAssessment === 'High' || b.riskAssessment === 'Critical')) return -1;
      if (!(a.riskAssessment === 'High' || a.riskAssessment === 'Critical') && (b.riskAssessment === 'High' || b.riskAssessment === 'Critical')) return 1;
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    })
    .slice(0, 4)
    .map(p => {
      const d = new Date(p.updatedAt || p.createdAt);
      return {
        id: p._id || p.patientId,
        patient: p, // keep ref for navigation if needed
        name: p.name || 'Unknown',
        risk: p.riskAssessment || 'Pending',
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
    });

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.5px', mb: 1, color: theme.palette.text.primary }}>
                Dashboard Overview
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                Welcome back, Dr. Smith. Here's your shift summary for today.
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<PendingActionsIcon />}
            onClick={() => onNavigate('patients')}
            sx={{ 
                borderRadius: 2, 
                px: 3, 
                py: 1, 
                textTransform: 'none', 
                fontWeight: 600,
                boxShadow: `0 8px 16px 0 ${alpha(theme.palette.primary.main, 0.24)}`
            }}
          >
              View All Tasks
          </Button>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Pending Reviews" 
            value={stats.pendingReviews} 
            color="#FF9800" 
            icon={<AssignmentIcon />} 
            trendLabel={`${stats.criticalCases} Urgent`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Critical Cases" 
            value={stats.criticalCases} 
            color="#F44336" 
            icon={<WarningIcon />} 
            trendLabel="Needs Action"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Total Patients" 
            value={stats.totalPatients} 
            color="#2196F3" 
            icon={<PeopleIcon />} 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Signed Off Today" 
            value={stats.completedToday} 
            color="#4CAF50" 
            icon={<CheckCircleIcon />} 
          />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
            <Card 
                elevation={0} 
                sx={{ 
                    height: '100%', 
                    borderRadius: 4, 
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    boxShadow: `0 4px 24px 0 ${alpha(theme.palette.common.black, 0.02)}`
                }}
            >
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 4, pb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ p: 1.2, bgcolor: alpha('#F44336', 0.1), borderRadius: 2, mr: 2, color: '#F44336' }}>
                                <WarningIcon fontSize="small" />
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Urgent Reviews Needed</Typography>
                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>High priority patients waiting for sign-off</Typography>
                            </Box>
                        </Box>
                        <Button 
                            endIcon={<ArrowForwardIcon />} 
                            onClick={() => onNavigate('review')}
                            sx={{ fontWeight: 600, textTransform: 'none', borderRadius: 2 }}
                            color="inherit"
                        >
                            View All
                        </Button>
                    </Box>
                    <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.06) }} />
                    <List sx={{ p: 0 }}>
                        {pendingList.map((item, index) => (
                            <ListItem 
                                key={item.id} 
                                divider={index !== pendingList.length - 1}
                                sx={{ 
                                    py: 3, 
                                    px: 4,
                                    transition: 'all 0.2s ease',
                                    borderBottom: index !== pendingList.length - 1 ? `1px solid ${alpha(theme.palette.divider, 0.06)}` : 'none',
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar 
                                        sx={{ 
                                            bgcolor: item.risk === 'High' ? alpha('#F44336', 0.1) : alpha('#FF9800', 0.1), 
                                            color: item.risk === 'High' ? '#F44336' : '#FF9800',
                                            width: 52, 
                                            height: 52, 
                                            fontSize: '1.2rem',
                                            fontWeight: 700,
                                            mr: 3,
                                            border: `2px solid ${item.risk === 'High' ? alpha('#F44336', 0.2) : alpha('#FF9800', 0.2)}`
                                        }}
                                    >
                                        {item.name.charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.5 }}>{item.name}</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Chip 
                                                label={item.risk} 
                                                size="small" 
                                                sx={{ 
                                                    height: 22, 
                                                    fontSize: '0.7rem', 
                                                    fontWeight: 700,
                                                    bgcolor: item.risk === 'High' ? alpha('#F44336', 0.1) : alpha('#FF9800', 0.1),
                                                    color: item.risk === 'High' ? '#F44336' : '#FF9800',
                                                    borderRadius: 1.5
                                                }}
                                            />
                                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}>
                                                <AccessTimeFilledIcon sx={{ fontSize: 14, opacity: 0.7 }} />
                                                {item.date}, {item.time}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                                <Button 
                                    variant="outlined" 
                                    color="primary"
                                    onClick={() => onNavigate('review')}
                                    sx={{ 
                                        borderRadius: 2, 
                                        textTransform: 'none', 
                                        fontWeight: 600,
                                        px: 3,
                                        borderWidth: 1.5,
                                        '&:hover': { borderWidth: 1.5 }
                                    }}
                                >
                                    Review Case
                                </Button>
                            </ListItem>
                        ))}
                    </List>
                </CardContent>
            </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
            <Card 
                elevation={0} 
                sx={{ 
                    height: '100%', 
                    borderRadius: 4,
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    boxShadow: `0 4px 24px 0 ${alpha(theme.palette.common.black, 0.02)}`
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                        <Box sx={{ p: 1.2, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2, mr: 2, color: theme.palette.primary.main }}>
                           <AssignmentIcon fontSize="small" />
                        </Box>
                        <Box>
                             <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Recent AI Reports</Typography>
                             <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Latest analyses from the lab</Typography>
                        </Box>
                    </Box>
                    
                    {reports.slice(0, 3).map((r, i) => {
                        const pat = patients.find(p => p._id === (typeof r.patientId === 'object' ? r.patientId._id : r.patientId));
                        const patName = pat?.name || 'Unknown Patient';
                        const timeStr = new Date(r.createdAt || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                        const dateStr = new Date(r.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        const isHighRisk = pat?.riskAssessment === 'High' || pat?.riskAssessment === 'Critical';
                        const color = isHighRisk ? '#F44336' : theme.palette.primary.main;

                        return (
                            <Box key={r._id || i} sx={{ display: 'flex', gap: 2.5, mb: 4, position: 'relative' }}>
                                {i < 2 && <Box sx={{ position: 'absolute', left: 24, top: 48, bottom: -24, width: 2, bgcolor: alpha(theme.palette.divider, 0.1) }} />}
                                
                                <Avatar sx={{ bgcolor: alpha(color, 0.1), color: color, width: 48, height: 48, zIndex: 1, border: `1px solid ${alpha(color, 0.2)}` }}>
                                    {isHighRisk ? <WarningIcon fontSize="small" /> : <AssignmentIcon fontSize="small" />}
                                </Avatar>
                                <Box sx={{ pt: 0.5, flex: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.5 }}>
                                        {isHighRisk ? 'Critical Analysis Flagged' : 'New Report Generated'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6, fontWeight: 500 }}>
                                        Results available for {patName}.
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: theme.palette.text.disabled, mt: 1, display: 'block', fontWeight: 600 }}>
                                        {dateStr} at {timeStr}
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    })}
                    {reports.length === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>No recent reports available.</Typography>
                    )}
                </CardContent>
            </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClinicianOverview;
