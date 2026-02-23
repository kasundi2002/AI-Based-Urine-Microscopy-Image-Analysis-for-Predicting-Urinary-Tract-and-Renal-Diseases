import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Divider, Chip, Button, Avatar } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import DownloadIcon from '@mui/icons-material/Download';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShieldIcon from '@mui/icons-material/Shield';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import DiamondIcon from '@mui/icons-material/Diamond';
import BugReportIcon from '@mui/icons-material/BugReport';
import { 
  XAxis, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const ResultsDashboard = ({ report }) => {
  if (!report) return (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <Typography color="text.secondary">No recent reports found. Please check back later.</Typography>
    </Paper>
  );

  const isHighRisk = report.riskScore > 50;
  
  // Premium Colors
  const riskGradient = isHighRisk 
    ? 'linear-gradient(135deg, #FF1744 0%, #D50000 100%)' 
    : 'linear-gradient(135deg, #00C853 0%, #009624 100%)';

  // Mock Trend Data
  const trendData = [
    { name: 'Aug', score: 45 },
    { name: 'Sep', score: 30 },
    { name: 'Oct', score: 20 },
    { name: 'Nov', score: 25 },
  ];
    
  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
        <Box>
            <Typography variant="h5" fontWeight="900" sx={{ letterSpacing: -0.5, mb: 1 }}>
                My Latest Results
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
               Analysis Date: <Chip label={report.date || 'Oct 26, 2023'} size="small" sx={{ ml: 1, borderRadius: 1 }} />
            </Typography>
        </Box>
        <Button variant="outlined" color="primary" startIcon={<DownloadIcon />}>
            Download Report
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Risk Score Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card 
            elevation={4}
            sx={{ 
                height: '100%', 
                background: riskGradient,
                color: 'white',
                borderRadius: 4,
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-5px)' }
            }}
          >
            <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.2 }}>
                {isHighRisk ? <WarningIcon sx={{ fontSize: 180 }} /> : <CheckCircleIcon sx={{ fontSize: 180 }} />}
            </Box>
            
            <CardContent sx={{ textAlign: 'center', py: 6, position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'inline-flex', p: 1.5, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '50%', mb: 2 }}>
                  {isHighRisk ? <WarningIcon fontSize="large" /> : <CheckCircleIcon fontSize="large" />}
              </Box>
              
              <Typography variant="h2" fontWeight="900" sx={{ textShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                {report.riskScore}%
              </Typography>
              
              <Typography variant="h6" fontWeight="bold" sx={{ mt: 1, opacity: 0.9 }}>
                {report.riskLabel || (isHighRisk ? 'High Risk Detected' : 'Low Risk')}
              </Typography>

              <Typography variant="body2" sx={{ mt: 3, opacity: 0.8, maxWidth: '80%', mx: 'auto' }}>
                Based on AI analysis of your urine microscopy sample.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Urine Sediments Count Card */}
        <Grid size={{ xs: 12, md: 4 }}>
            <Card elevation={4} sx={{ height: '100%', borderRadius: 4, bgcolor: 'background.paper' }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                         Urine Sediments
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        {[
                            { label: 'WBC', value: report.wbc || '0-2', unit: '/hpf', color: '#00bcd4', icon: <ShieldIcon /> },
                            { label: 'RBC', value: report.rbc || '0-1', unit: '/hpf', color: '#ff1744', icon: <BloodtypeIcon /> },
                            { label: 'Crystals', value: report.crystals || 'None', unit: '', color: '#ff9100', icon: <DiamondIcon /> },
                            { label: 'Bacteria', value: report.bacteria || 'None', unit: '', color: '#4caf50', icon: <BugReportIcon /> }
                        ].map((item, index) => (
                            <Grid size={{ xs: 6 }} key={index}>
                                <Paper 
                                    elevation={0}
                                    sx={{ 
                                        p: 2, 
                                        textAlign: 'center', 
                                        bgcolor: `${item.color}08`, 
                                        border: `1px solid ${item.color}20`,
                                        borderRadius: 3,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-3px)',
                                            boxShadow: `0 4px 12px ${item.color}20`,
                                            bgcolor: `${item.color}15`,
                                            borderColor: `${item.color}40`
                                        }
                                    }}
                                >
                                    <Box sx={{ color: item.color, mb: 1, opacity: 0.8 }}>
                                        {item.icon}
                                    </Box>
                                    <Typography variant="h5" fontWeight="900" sx={{ color: 'text.primary', mb: 0.5 }}>
                                        {item.value}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" fontWeight="600" sx={{ fontSize: '0.75rem' }}>
                                        {item.label} {item.unit && <span style={{ opacity: 0.7, fontWeight: 400 }}>{item.unit}</span>}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>
        </Grid>

        {/* Health Trend Card - NEW */}
        <Grid size={{ xs: 12, md: 4 }}>
            <Card elevation={4} sx={{ height: '100%', borderRadius: 4, bgcolor: 'background.paper', position: 'relative', overflow: 'visible' }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(33, 150, 243, 0.1)', color: 'primary.main', mr: 2 }}>
                             <TrendingUpIcon />
                        </Box>
                        <Typography variant="h6" fontWeight="bold">Health Trend</Typography>
                    </Box>
                    
                    <Box sx={{ flexGrow: 1, minHeight: 180, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2196f3" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#2196f3" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9eaebb', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    cursor={{ stroke: '#2196f3', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="score" 
                                    stroke="#2196f3" 
                                    strokeWidth={3} 
                                    fillOpacity={1} 
                                    fill="url(#colorScore)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Box>
                    <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 1, display: 'block' }}>
                        Risk Score History (Last 4 Months)
                    </Typography>
                </CardContent>
            </Card>
        </Grid>

        {/* Recommendations Card */}
        <Grid size={{ xs: 12, md: 12 }}>
          <Paper sx={{ 
              p: 4, 
              height: '100%', 
              borderRadius: 4,
              backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.02), rgba(255,255,255,0))',
              border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <LocalHospitalIcon />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">Doctor's Recommendations</Typography>
            </Box>
            
            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ p: 2, bgcolor: 'rgba(33, 150, 243, 0.08)', borderRadius: 2, height: '100%' }}>
                         <Typography variant="subtitle2" color="primary" gutterBottom fontWeight="bold">PRESCRIPTION & NOTES</Typography>
                         <Typography variant="body1" sx={{ fontSize: '1.1rem', mt: 1 }}>
                            {report.prescription || 'Drink plenty of water. Follow up in 3 months.'}
                         </Typography>
                         <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                            - Dr. Smith (Urologist)
                         </Typography>
                    </Box>
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="bold" sx={{ px: 1 }}>LIFESTYLE ADJUSTMENTS</Typography>
                    <Grid container spacing={2} sx={{ mt: 0 }}>
                        <Grid size={{ xs: 12 }}>
                            <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: 'transparent' }}>
                                <WaterDropIcon sx={{ color: '#29b6f6', mr: 2 }} />
                                <Typography>Increase daily water intake to 2.5L</Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                             <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: 'transparent' }}>
                                <Typography sx={{ width: 24, textAlign: 'center', color: 'warning.main', fontWeight: 'bold', mr: 2 }}>•</Typography>
                                <Typography>Reduce sodium intake (salt)</Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                             <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: 'transparent' }}>
                                <Typography sx={{ width: 24, textAlign: 'center', color: 'warning.main', fontWeight: 'bold', mr: 2 }}>•</Typography>
                                <Typography>Limit oxalate-rich foods</Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ResultsDashboard;
