import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Table, TableBody, TableCell, TableRow, Button, Snackbar, Alert, Chip, LinearProgress, Divider, IconButton, Tooltip, Avatar } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import ReplayIcon from '@mui/icons-material/Replay';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ScienceIcon from '@mui/icons-material/Science';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ShieldIcon from '@mui/icons-material/Shield';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import DiamondIcon from '@mui/icons-material/Diamond';
import BugReportIcon from '@mui/icons-material/BugReport';
import BiotechIcon from '@mui/icons-material/Biotech';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SpeedIcon from '@mui/icons-material/Speed';
import { useLabData } from '../../context/LabDataContext';

const ImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  backgroundColor: '#f8f9fa',
  borderRadius: 12,
  overflow: 'hidden',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const BoundingBox = styled(Box)(({ color }) => ({
  position: 'absolute',
  border: `2px solid ${color}`,
  backgroundColor: 'transparent',
  borderRadius: 4,
  '&:hover': {
    backgroundColor: `${color}1a`,
    cursor: 'pointer',
  }
}));

const LabelTag = styled(Box)(({ color }) => ({
   position: 'absolute', 
   top: -26, 
   left: -2,
   backgroundColor: color, 
   color: '#fff', 
   fontSize: '0.7rem', 
   padding: '3px 8px',
   borderRadius: 4,
   fontWeight: 700,
   whiteSpace: 'nowrap',
   letterSpacing: 0.5,
   boxShadow: `0 2px 8px ${color}66`,
}));

const StatChip = styled(Paper)(({ theme }) => ({
  padding: '12px 16px',
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  flex: 1,
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
  }
}));

const AnalysisView = ({ image, analysis, patient }) => {
  const { submitLabResult } = useLabData();
  const [submitted, setSubmitted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!image) return <Typography>No image loaded</Typography>;

  const data = analysis || {
    wbc: 5,
    rbc: 2,
    crystals: 'Calcium Oxalate',
    risk: 45
  };

  const particles = [
    { name: 'Crystals', count: 7, types: 'CaOx: 5 · Uric Acid: 2', color: '#ff9100', icon: <DiamondIcon sx={{ fontSize: 18 }} />, confidence: 96 },
    { name: 'RBC', count: 5, types: '5 /hpf', color: '#ef5350', icon: <BloodtypeIcon sx={{ fontSize: 18 }} />, confidence: 98 },
    { name: 'WBC', count: 5, types: '5 /hpf', color: '#00bcd4', icon: <ShieldIcon sx={{ fontSize: 18 }} />, confidence: 97 },
    { name: 'Cast', count: 2, types: '2 /lpf', color: '#ab47bc', icon: <BiotechIcon sx={{ fontSize: 18 }} />, confidence: 91 },
    { name: 'Bacteria', count: 0, types: 'Not detected', color: '#66bb6a', icon: <BugReportIcon sx={{ fontSize: 18 }} />, confidence: 99 },
  ];
  
  const boxes = [
    { id: 1, type: 'WBC', x: 25, y: 35, w: 8, h: 8, color: '#00bcd4' },
    { id: 2, type: 'RBC', x: 55, y: 55, w: 7, h: 7, color: '#ef5350' },
    { id: 3, type: 'CaOx Crystal', x: 68, y: 22, w: 13, h: 13, color: '#ff9100' },
    { id: 4, type: 'WBC', x: 40, y: 60, w: 6, h: 6, color: '#00bcd4' },
    { id: 5, type: 'RBC', x: 15, y: 50, w: 5, h: 5, color: '#ef5350' },
  ];

  const riskLevel = data.risk >= 70 ? 'High' : data.risk >= 40 ? 'Moderate' : 'Low';
  const riskColor = data.risk >= 70 ? '#ef5350' : data.risk >= 40 ? '#ff9100' : '#66bb6a';

  const handleSubmitReport = () => {
    submitLabResult({
      patientId: patient?.id || 'PAT-2023-001',
      patientName: patient?.name || 'John Doe',
      findings: {
        wbc: data.wbc || 5,
        rbc: data.rbc || 2,
        crystals: data.crystals || 'Calcium Oxalate',
        bacteria: 'None',
        cast: 'None',
      },
      aiRiskScore: data.risk || 45,
      image: image,
      mltName: 'Sarah Tech',
    });
    
    setSubmitted(true);
    setShowSuccess(true);
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.4s ease-out' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <ScienceIcon sx={{ color: '#00bcd4', fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
              Analysis Workspace
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            AI-powered urine microscopy sediment detection and classification
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button 
            variant="outlined" 
            startIcon={<ReplayIcon />}
            sx={{ 
              textTransform: 'none', 
              fontWeight: 600,
              borderRadius: 2,
              borderColor: alpha('#00bcd4', 0.3),
              color: '#00bcd4',
              '&:hover': { borderColor: '#00bcd4', bgcolor: alpha('#00bcd4', 0.04) }
            }}
          >
            Re-Analyze
          </Button>
          <Button 
            variant="contained" 
            disabled={submitted}
            onClick={handleSubmitReport}
            startIcon={submitted ? <CheckCircleIcon /> : <SendIcon />}
            sx={{ 
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: 700,
              px: 3,
              background: submitted 
                ? 'linear-gradient(135deg, #43a047, #66bb6a)' 
                : 'linear-gradient(135deg, #0f172a, #1e3a5f)',
              boxShadow: submitted 
                ? '0 4px 14px rgba(67,160,71,0.3)' 
                : '0 4px 14px rgba(15,23,42,0.3)',
              '&.Mui-disabled': {
                background: 'linear-gradient(135deg, #43a047, #66bb6a)',
                color: 'white',
              },
              '&:hover': {
                background: submitted 
                  ? 'linear-gradient(135deg, #43a047, #66bb6a)'
                  : 'linear-gradient(135deg, #1e293b, #2d4a6f)',
              }
            }}
          >
            {submitted ? 'Submitted ✓' : 'Submit Report'}
          </Button>
        </Box>
      </Box>

      {/* Patient Info & Summary Stats */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2.5, mb: 3, borderRadius: 3, 
          border: '1px solid', borderColor: 'divider',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 44, height: 44, bgcolor: alpha('#00bcd4', 0.1), color: '#00bcd4' }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>{patient?.name || "Kane Peter"}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">ID: {patient?.id || "P01"}</Typography>
              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }} />
              <Typography variant="caption" color="text.secondary">
                <CalendarTodayIcon sx={{ fontSize: 11, mr: 0.3, verticalAlign: 'middle' }} />
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <StatChip elevation={0}>
            <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: alpha('#00bcd4', 0.1) }}>
              <ScienceIcon sx={{ fontSize: 18, color: '#00bcd4', display: 'block' }} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>Objects Found</Typography>
              <Typography variant="subtitle2" fontWeight={800}>19</Typography>
            </Box>
          </StatChip>
          <StatChip elevation={0}>
            <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: alpha('#ab47bc', 0.1) }}>
              <BiotechIcon sx={{ fontSize: 18, color: '#ab47bc', display: 'block' }} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>AI Confidence</Typography>
              <Typography variant="subtitle2" fontWeight={800}>98.5%</Typography>
            </Box>
          </StatChip>
          <StatChip elevation={0}>
            <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: alpha(riskColor, 0.1) }}>
              <SpeedIcon sx={{ fontSize: 18, color: riskColor, display: 'block' }} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>Risk Level</Typography>
              <Typography variant="subtitle2" fontWeight={800} sx={{ color: riskColor }}>{riskLevel}</Typography>
            </Box>
          </StatChip>
        </Box>
      </Paper>

      {/* Main Content: Image + Findings */}
      <Grid container spacing={3}>
        {/* Microscopy Image */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              height: 520, borderRadius: 3, overflow: 'hidden', 
              border: '1px solid', borderColor: 'divider',
              display: 'flex', flexDirection: 'column'
            }}
          >
            {/* Image toolbar */}
            <Box sx={{ 
              px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha('#f8fafc', 0.5)
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#66bb6a' }} />
                <Typography variant="caption" fontWeight={600} color="text.secondary">MICROSCOPY VIEW</Typography>
                <Chip label="400x" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Zoom In"><IconButton size="small"><ZoomInIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                <Tooltip title="Zoom Out"><IconButton size="small"><ZoomOutIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                <Tooltip title="Focus"><IconButton size="small"><CenterFocusStrongIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                <Tooltip title="Fullscreen"><IconButton size="small"><FullscreenIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
              </Box>
            </Box>

            {/* Image */}
            <Box sx={{ flexGrow: 1, position: 'relative' }}>
              <ImageContainer>
                <img 
                  src={image} 
                  alt="Microscopy" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
                {boxes.map(box => (
                  <BoundingBox
                    key={box.id}
                    color={box.color}
                    sx={{
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.w}%`,
                      height: `${box.h}%`,
                      boxShadow: `0 0 12px ${box.color}55`,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.08)',
                        zIndex: 10,
                        boxShadow: `0 0 20px ${box.color}88`,
                      }
                    }}
                  >
                    <LabelTag color={box.color}>
                      {box.type}
                    </LabelTag>
                  </BoundingBox>
                ))}
              </ImageContainer>
            </Box>

            {/* Legend */}
            <Box sx={{ 
              px: 2, py: 1.2, display: 'flex', gap: 2, alignItems: 'center',
              borderTop: '1px solid', borderColor: 'divider', bgcolor: alpha('#f8fafc', 0.5)
            }}>
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mr: 1 }}>LEGEND:</Typography>
              {[
                { label: 'WBC', color: '#00bcd4' },
                { label: 'RBC', color: '#ef5350' },
                { label: 'Crystal', color: '#ff9100' },
                { label: 'Cast', color: '#ab47bc' },
                { label: 'Bacteria', color: '#66bb6a' },
              ].map(l => (
                <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: 1, bgcolor: l.color }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>{l.label}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Findings Panel */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              height: 520, borderRadius: 3, overflow: 'hidden',
              border: '1px solid', borderColor: 'divider',
              display: 'flex', flexDirection: 'column'
            }}
          >
            {/* Header */}
            <Box sx={{ 
              px: 3, py: 2, 
              background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
              color: 'white'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>AI Detection Report</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>Automated sediment classification</Typography>
                </Box>
                <Chip 
                  label="98.5% Accuracy" 
                  size="small" 
                  sx={{ 
                    bgcolor: alpha('#66bb6a', 0.2), color: '#a5d6a7', fontWeight: 700, fontSize: '0.7rem',
                    border: '1px solid', borderColor: alpha('#66bb6a', 0.3)
                  }} 
                />
              </Box>
            </Box>

            {/* Particle list */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
              <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ px: 1, letterSpacing: 1.5 }}>
                Detected Particles
              </Typography>
              
              {particles.map((p, i) => (
                <Paper
                  key={i}
                  elevation={0}
                  sx={{ 
                    p: 2, mt: 1.5, borderRadius: 2.5,
                    border: '1px solid', borderColor: alpha(p.color, 0.15),
                    bgcolor: alpha(p.color, 0.03),
                    transition: 'all 0.2s',
                    '&:hover': { 
                      bgcolor: alpha(p.color, 0.06),
                      borderColor: alpha(p.color, 0.3),
                      transform: 'translateX(4px)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ 
                        p: 0.7, borderRadius: 1.5, 
                        bgcolor: alpha(p.color, 0.12), color: p.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {p.icon}
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight={700}>{p.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{p.types}</Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label={p.count > 0 ? `${p.count} found` : 'Clear'}
                      size="small"
                      sx={{ 
                        bgcolor: p.count > 0 ? alpha(p.color, 0.1) : alpha('#66bb6a', 0.1),
                        color: p.count > 0 ? p.color : '#66bb6a',
                        fontWeight: 700, fontSize: '0.7rem', height: 22,
                        border: '1px solid', borderColor: p.count > 0 ? alpha(p.color, 0.2) : alpha('#66bb6a', 0.2),
                      }} 
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={p.confidence} 
                      sx={{ 
                        flexGrow: 1, height: 4, borderRadius: 2,
                        bgcolor: alpha(p.color, 0.08),
                        '& .MuiLinearProgress-bar': { 
                          bgcolor: p.color, borderRadius: 2 
                        }
                      }} 
                    />
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ minWidth: 28 }}>
                      {p.confidence}%
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>

            {/* Analysis Note Footer */}
            <Box sx={{ 
              px: 3, py: 2, 
              borderTop: '1px solid', borderColor: 'divider',
              bgcolor: alpha('#ff9100', 0.04)
            }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <WarningAmberIcon sx={{ color: '#ff9100', fontSize: 18, mt: 0.2 }} />
                <Box>
                  <Typography variant="caption" fontWeight={700} sx={{ color: '#ff9100' }}>CLINICAL NOTE</Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.3, lineHeight: 1.4 }}>
                    High concentration of Calcium Oxalate crystals detected. Recommended for clinical verification by specialist.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Success Snackbar */}
      <Snackbar 
        open={showSuccess} 
        autoHideDuration={4000} 
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccess(false)} 
          severity="success" 
          variant="filled" 
          icon={<CheckCircleIcon />}
          sx={{ width: '100%', fontWeight: 600, borderRadius: 2 }}
        >
          Report submitted successfully! Results are now available in the patient's portal.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AnalysisView;
