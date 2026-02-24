import React from 'react';
import { Box, Typography, Paper, Grid, Chip, Button, Avatar } from '@mui/material';
import { alpha } from '@mui/material/styles';
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
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import BiomedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { XAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const ResultsDashboard = ({ report }) => {
  if (!report) return (
    <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <Typography color="text.secondary" fontWeight={500}>No recent reports found. Please check back later.</Typography>
    </Paper>
  );

  const riskScore = report.questionnaireCompleted ? (report.enhancedRiskScore || report.riskScore) : report.riskScore;
  const isHighRisk = riskScore > 50;
  
  const riskGradient = isHighRisk 
    ? 'linear-gradient(135deg, #ef5350 0%, #c62828 100%)' 
    : riskScore > 30 
      ? 'linear-gradient(135deg, #ff9100 0%, #e65100 100%)'
      : 'linear-gradient(135deg, #66bb6a 0%, #2e7d32 100%)';

  const trendData = [
    { name: 'Aug', score: 45 },
    { name: 'Sep', score: 30 },
    { name: 'Oct', score: 20 },
    { name: 'Nov', score: riskScore },
  ];
    
  const sediments = [
    { label: 'WBC', value: report.wbc || '0-2', unit: '/hpf', color: '#00bcd4', icon: <ShieldIcon /> },
    { label: 'RBC', value: report.rbc || '0-1', unit: '/hpf', color: '#ef5350', icon: <BloodtypeIcon /> },
    { label: 'Crystals', value: report.crystals || 'None', unit: '', color: '#ff9100', icon: <DiamondIcon /> },
    { label: 'Bacteria', value: report.bacteria || 'None', unit: '', color: '#66bb6a', icon: <BugReportIcon /> }
  ];

  const lifestyle = [
    { icon: <WaterDropIcon />, text: 'Increase daily water intake to 2.5L', color: '#00bcd4' },
    { icon: <RestaurantIcon />, text: 'Reduce sodium intake (salt)', color: '#ff9100' },
    { icon: <FitnessCenterIcon />, text: 'Limit oxalate-rich foods', color: '#7c4dff' },
  ];

  return (
    <Box>
      {/* Title Row */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <BiomedicalServicesIcon sx={{ color: '#00bcd4', fontSize: 26 }} />
            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: -0.5 }}>My Latest Results</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">Analysis Date:</Typography>
            <Chip label={report.date || 'Oct 26, 2023'} size="small" sx={{ borderRadius: 1.5, fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
            {report.questionnaireCompleted && (
              <Chip 
                icon={<AutoAwesomeIcon sx={{ fontSize: 13 }} />}
                label="Enhanced Prediction" 
                size="small" 
                sx={{ 
                  bgcolor: alpha('#66bb6a', 0.08), color: '#66bb6a', fontWeight: 600, fontSize: '0.65rem',
                  border: '1px solid', borderColor: alpha('#66bb6a', 0.2), height: 22,
                  '& .MuiChip-icon': { color: '#66bb6a' }
                }} 
              />
            )}
          </Box>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<DownloadIcon />}
          sx={{ 
            textTransform: 'none', fontWeight: 600, borderRadius: 2, 
            borderColor: 'divider', color: 'text.secondary',
            '&:hover': { borderColor: '#00bcd4', color: '#00bcd4' }
          }}
        >
          Download Report
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Risk Score Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper 
            elevation={0}
            sx={{ 
              height: '100%', background: riskGradient, color: 'white',
              borderRadius: 3, position: 'relative', overflow: 'hidden',
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}
          >
            <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.12 }}>
              {isHighRisk ? <WarningIcon sx={{ fontSize: 160 }} /> : <CheckCircleIcon sx={{ fontSize: 160 }} />}
            </Box>
            <Box sx={{ textAlign: 'center', py: 5, px: 3, position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'inline-flex', p: 1.5, bgcolor: 'rgba(255,255,255,0.18)', borderRadius: '50%', mb: 2 }}>
                {isHighRisk ? <WarningIcon fontSize="large" /> : <CheckCircleIcon fontSize="large" />}
              </Box>
              <Typography variant="h2" fontWeight={900} sx={{ textShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                {riskScore}%
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5, opacity: 0.9 }}>
                {report.questionnaireCompleted 
                  ? (report.enhancedRiskLabel || report.riskLabel || (isHighRisk ? 'High Risk Detected' : 'Low Risk'))
                  : (report.riskLabel || (isHighRisk ? 'High Risk Detected' : 'Low Risk'))
                }
              </Typography>
              <Typography variant="body2" sx={{ mt: 1.5, opacity: 0.75, maxWidth: '85%', mx: 'auto', lineHeight: 1.5 }}>
                {report.questionnaireCompleted 
                  ? 'Enhanced prediction combining lab analysis + health questionnaire data.'
                  : 'Based on AI analysis of your urine microscopy sample.'
                }
              </Typography>
              {report.questionnaireCompleted && (
                <Chip 
                  icon={<AutoAwesomeIcon sx={{ fontSize: 13, color: 'white !important' }} />}
                  label="AI + Questionnaire" 
                  size="small" 
                  sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, fontSize: '0.7rem' }} 
                />
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Urine Sediments */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Urine Sediments</Typography>
            <Grid container spacing={1.5}>
              {sediments.map((item, i) => (
                <Grid size={{ xs: 6 }} key={i}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 2, textAlign: 'center', borderRadius: 2.5,
                      bgcolor: alpha(item.color, 0.04),
                      border: '1px solid', borderColor: alpha(item.color, 0.12),
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${alpha(item.color, 0.12)}` }
                    }}
                  >
                    <Box sx={{ color: item.color, mb: 0.8, opacity: 0.8 }}>
                      {React.cloneElement(item.icon, { sx: { fontSize: 20 } })}
                    </Box>
                    <Typography variant="h6" fontWeight={800} sx={{ mb: 0.3 }}>{item.value}</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {item.label} {item.unit && <span style={{ opacity: 0.6 }}>{item.unit}</span>}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Health Trend */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 3, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: alpha('#2196f3', 0.08), color: '#2196f3', display: 'flex' }}>
                <TrendingUpIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography variant="subtitle1" fontWeight={700}>Health Trend</Typography>
            </Box>
            <Box sx={{ flexGrow: 1, minHeight: 170 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="patientScoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2196f3" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2196f3" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9e9e9e', fontSize: 12 }} dy={8} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 13 }}
                    cursor={{ stroke: '#2196f3', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#2196f3" strokeWidth={2.5} fillOpacity={1} fill="url(#patientScoreGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
            <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 1, display: 'block' }}>
              Risk Score History (Last 4 Months)
            </Typography>
          </Paper>
        </Grid>

        {/* Doctor's Recommendations */}
        <Grid size={{ xs: 12 }}>
          <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
            {/* Header */}
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 36, height: 36, background: 'linear-gradient(135deg, #0f172a, #1e3a5f)' }}>
                <LocalHospitalIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography variant="subtitle1" fontWeight={700}>Doctor's Recommendations</Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper elevation={0} sx={{ 
                    p: 2.5, borderRadius: 2.5, height: '100%',
                    bgcolor: alpha('#2196f3', 0.04),
                    border: '1px solid', borderColor: alpha('#2196f3', 0.12)
                  }}>
                    <Typography variant="caption" fontWeight={700} color="primary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Prescription & Notes
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1.5, fontWeight: 500, lineHeight: 1.7 }}>
                      {report.prescription || 'Drink plenty of water. Follow up in 3 months.'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                      {report.doctorNote || '- Dr. Smith (Urologist)'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5, display: 'block' }}>
                    Lifestyle Adjustments
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {lifestyle.map((item, i) => (
                      <Paper key={i} elevation={0} sx={{ 
                        p: 2, display: 'flex', alignItems: 'center', gap: 1.5,
                        borderRadius: 2.5, border: '1px solid', borderColor: 'divider',
                        transition: 'all 0.15s',
                        '&:hover': { borderColor: alpha(item.color, 0.3), bgcolor: alpha(item.color, 0.02) }
                      }}>
                        <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: alpha(item.color, 0.08), color: item.color, display: 'flex' }}>
                          {React.cloneElement(item.icon, { sx: { fontSize: 18 } })}
                        </Box>
                        <Typography variant="body2" fontWeight={500}>{item.text}</Typography>
                      </Paper>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ResultsDashboard;
