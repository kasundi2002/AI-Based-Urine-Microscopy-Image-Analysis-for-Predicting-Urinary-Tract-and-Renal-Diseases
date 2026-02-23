import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Grid, Divider, TextField, Button, Avatar, Radio, RadioGroup, 
  FormControlLabel, Chip, LinearProgress, IconButton, Tooltip, Snackbar, Alert, FormControl, FormLabel
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ShieldIcon from '@mui/icons-material/Shield';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import DiamondIcon from '@mui/icons-material/Diamond';
import BugReportIcon from '@mui/icons-material/BugReport';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GavelIcon from '@mui/icons-material/Gavel';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import TuneIcon from '@mui/icons-material/Tune';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import SpeedIcon from '@mui/icons-material/Speed';
import microscopyImage from '../../assets/c2.jpg';

const ImageContainer = styled(Box)(() => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  backgroundColor: '#f8f9fa',
  borderRadius: 0,
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
  top: -26, left: -2,
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

const DiagnosticView = ({ report }) => {
  const [agreement, setAgreement] = useState('agree');
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!report) return (
    <Box sx={{ p: 8, textAlign: 'center' }}>
      <LocalHospitalIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h6" color="text.secondary">Select a patient report to begin diagnostic review</Typography>
      <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>Choose a patient from the Diagnostic Review list</Typography>
    </Box>
  );

  const displayReport = {
    image: report.image && !report.image.includes('placeholder') ? report.image : microscopyImage,
    riskScore: report.riskScore || (report.riskAssessment === 'High' ? 85 : 20),
    riskLabel: report.riskAssessment || 'Normal',
    findings: report.findings || { wbc: 12, rbc: 3, crystals: 'Calcium Oxalate', bacteria: 'None' },
    patientName: report.patientName || report.name,
    patientId: report.patientId || report.id,
    patientAge: report.patientAge || report.age
  };

  const riskScore = displayReport.riskScore;
  const isHighRisk = riskScore > 50;
  const riskColor = riskScore >= 70 ? '#ef5350' : riskScore >= 40 ? '#ff9100' : '#66bb6a';
  const riskGradient = riskScore >= 70 
    ? 'linear-gradient(135deg, #ef5350, #c62828)' 
    : riskScore >= 40 
      ? 'linear-gradient(135deg, #ff9100, #e65100)'
      : 'linear-gradient(135deg, #66bb6a, #2e7d32)';

  const boxes = [
    { id: 1, type: 'WBC', x: 25, y: 35, w: 8, h: 8, color: '#00bcd4' },
    { id: 2, type: 'RBC', x: 55, y: 55, w: 7, h: 7, color: '#ef5350' },
    { id: 3, type: 'CaOx Crystal', x: 68, y: 22, w: 13, h: 13, color: '#ff9100' },
    { id: 4, type: 'WBC', x: 40, y: 60, w: 6, h: 6, color: '#00bcd4' },
  ];

  const findings = [
    { label: 'WBC Count', value: `${displayReport.findings.wbc} /hpf`, color: '#00bcd4', icon: <ShieldIcon sx={{ fontSize: 16 }} />, level: Math.min(displayReport.findings.wbc / 20 * 100, 100) },
    { label: 'RBC Count', value: `${displayReport.findings.rbc} /hpf`, color: '#ef5350', icon: <BloodtypeIcon sx={{ fontSize: 16 }} />, level: Math.min(displayReport.findings.rbc / 10 * 100, 100) },
    { label: 'Crystals', value: displayReport.findings.crystals, color: '#ff9100', icon: <DiamondIcon sx={{ fontSize: 16 }} />, level: displayReport.findings.crystals !== 'None' ? 70 : 0 },
    { label: 'Bacteria', value: displayReport.findings.bacteria, color: '#66bb6a', icon: <BugReportIcon sx={{ fontSize: 16 }} />, level: displayReport.findings.bacteria !== 'None' ? 80 : 0 },
  ];

  const handleSubmit = () => {
    setSubmitted(true);
    setShowSuccess(true);
  };

  const agreementOptions = [
    { value: 'agree', label: 'Agree', icon: <TaskAltIcon />, color: '#66bb6a', desc: 'AI diagnosis is accurate' },
    { value: 'modify', label: 'Modify', icon: <TuneIcon />, color: '#ff9100', desc: 'Needs minor adjustments' },
    { value: 'reject', label: 'Reject', icon: <DoNotDisturbIcon />, color: '#ef5350', desc: 'Disagree with AI findings' },
  ];

  return (
    <Box sx={{ animation: 'fadeIn 0.4s ease-out' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <GavelIcon sx={{ color: '#7c4dff', fontSize: 26 }} />
            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: -0.5 }}>Diagnostic Review</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Review AI-generated analysis and provide clinical verification
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="contained"
            disabled={submitted}
            startIcon={submitted ? <CheckCircleIcon /> : <VerifiedUserIcon />}
            onClick={handleSubmit}
            sx={{
              textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3,
              background: submitted 
                ? 'linear-gradient(135deg, #43a047, #66bb6a)' 
                : 'linear-gradient(135deg, #0f172a, #1e3a5f)',
              boxShadow: submitted ? '0 4px 14px rgba(67,160,71,0.3)' : '0 4px 14px rgba(15,23,42,0.25)',
              '&.Mui-disabled': { background: 'linear-gradient(135deg, #43a047, #66bb6a)', color: 'white' },
            }}
          >
            {submitted ? 'Verified & Signed ✓' : 'Verify & Sign Report'}
          </Button>
        </Box>
      </Box>

      {/* Patient Info Bar */}
      <Paper elevation={0} sx={{
        p: 2.5, mb: 3, borderRadius: 3,
        border: '1px solid', borderColor: 'divider',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: alpha('#7c4dff', 0.1), color: '#7c4dff', fontWeight: 700, fontSize: '1.1rem' }}>
            {displayReport.patientName?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>{displayReport.patientName}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">ID: {displayReport.patientId}</Typography>
              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }} />
              <Typography variant="caption" color="text.secondary">Age: {displayReport.patientAge}</Typography>
              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }} />
              <Typography variant="caption" color="text.secondary">
                <CalendarTodayIcon sx={{ fontSize: 11, mr: 0.3, verticalAlign: 'middle' }} />
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Risk Badge */}
        <Box sx={{ 
          display: 'flex', alignItems: 'center', gap: 2, 
          px: 3, py: 1.5, borderRadius: 3, background: riskGradient,
          boxShadow: `0 4px 14px ${riskColor}33`,
        }}>
          <SpeedIcon sx={{ color: 'white', fontSize: 22 }} />
          <Box>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1, fontWeight: 600 }}>AI Risk Assessment</Typography>
            <Typography variant="h6" fontWeight={800} sx={{ color: 'white', lineHeight: 1.2 }}>{riskScore}% — {displayReport.riskLabel}</Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Left: Microscopy */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={0} sx={{ 
            borderRadius: 3, overflow: 'hidden', height: 500,
            border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column'
          }}>
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

            <Box sx={{ flexGrow: 1, position: 'relative' }}>
              <ImageContainer>
                <img src={displayReport.image} alt="Microscopy" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                {boxes.map(box => (
                  <BoundingBox key={box.id} color={box.color}
                    sx={{
                      left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%`,
                      boxShadow: `0 0 12px ${box.color}55`,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': { transform: 'scale(1.08)', zIndex: 10, boxShadow: `0 0 20px ${box.color}88` }
                    }}
                  >
                    <LabelTag color={box.color}>{box.type}</LabelTag>
                  </BoundingBox>
                ))}
              </ImageContainer>
            </Box>

            <Box sx={{ 
              px: 2, py: 1.2, display: 'flex', gap: 2, alignItems: 'center',
              borderTop: '1px solid', borderColor: 'divider', bgcolor: alpha('#f8fafc', 0.5)
            }}>
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mr: 1 }}>LEGEND:</Typography>
              {[
                { label: 'WBC', color: '#00bcd4' },
                { label: 'RBC', color: '#ef5350' },
                { label: 'Crystal', color: '#ff9100' },
              ].map(l => (
                <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: 1, bgcolor: l.color }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>{l.label}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Right: Findings + Clinical Verification */}
        <Grid size={{ xs: 12, md: 5 }}>
          {/* Detailed Findings */}
          <Paper elevation={0} sx={{ 
            borderRadius: 3, overflow: 'hidden', mb: 3,
            border: '1px solid', borderColor: 'divider'
          }}>
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <MedicalServicesIcon sx={{ color: '#7c4dff', fontSize: 20 }} />
                <Typography variant="subtitle1" fontWeight={700}>Sediment Findings</Typography>
              </Box>
              <Chip label="AI Generated" size="small" sx={{ bgcolor: alpha('#7c4dff', 0.1), color: '#7c4dff', fontWeight: 600, fontSize: '0.65rem' }} />
            </Box>
            <Box sx={{ p: 2 }}>
              {findings.map((f, i) => (
                <Paper key={i} elevation={0} sx={{ 
                  p: 2, mb: i < findings.length - 1 ? 1.5 : 0, borderRadius: 2.5,
                  border: '1px solid', borderColor: alpha(f.color, 0.12),
                  bgcolor: alpha(f.color, 0.02),
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: alpha(f.color, 0.05), transform: 'translateX(4px)' }
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ p: 0.6, borderRadius: 1.5, bgcolor: alpha(f.color, 0.1), color: f.color, display: 'flex' }}>
                        {f.icon}
                      </Box>
                      <Typography variant="body2" fontWeight={600}>{f.label}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={800} sx={{ color: f.color }}>{f.value}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={f.level} sx={{
                    height: 4, borderRadius: 2, bgcolor: alpha(f.color, 0.08),
                    '& .MuiLinearProgress-bar': { bgcolor: f.color, borderRadius: 2 }
                  }} />
                </Paper>
              ))}
            </Box>
          </Paper>

          {/* Clinical Verification */}
          <Paper elevation={0} sx={{ 
            borderRadius: 3, overflow: 'hidden',
            border: '1px solid', borderColor: 'divider'
          }}>
            <Box sx={{ 
              px: 3, py: 2,
              background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
              color: 'white',
              display: 'flex', alignItems: 'center', gap: 1.5
            }}>
              <GavelIcon sx={{ fontSize: 20 }} />
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>Clinical Verification</Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>Clinician sign-off required</Typography>
              </Box>
            </Box>
            
            <Box sx={{ p: 3 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>
                Do you agree with the AI diagnosis?
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
                {agreementOptions.map(opt => (
                  <Paper
                    key={opt.value}
                    elevation={0}
                    onClick={() => setAgreement(opt.value)}
                    sx={{
                      flex: 1, p: 1.5, borderRadius: 2.5, cursor: 'pointer', textAlign: 'center',
                      border: '2px solid',
                      borderColor: agreement === opt.value ? opt.color : 'divider',
                      bgcolor: agreement === opt.value ? alpha(opt.color, 0.06) : 'transparent',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: alpha(opt.color, 0.5), bgcolor: alpha(opt.color, 0.03) }
                    }}
                  >
                    <Box sx={{ color: agreement === opt.value ? opt.color : 'text.secondary', mb: 0.5 }}>
                      {React.cloneElement(opt.icon, { sx: { fontSize: 22 } })}
                    </Box>
                    <Typography variant="body2" fontWeight={700} sx={{ color: agreement === opt.value ? opt.color : 'text.primary' }}>
                      {opt.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      {opt.desc}
                    </Typography>
                  </Paper>
                ))}
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  <EditNoteIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                  CLINICAL NOTES
                </Typography>
                <TextField 
                  multiline rows={2} fullWidth size="small" placeholder="Add your clinical observations..."
                  value={notes} onChange={(e) => setNotes(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  <MedicalServicesIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                  PRESCRIPTION
                </Typography>
                <TextField 
                  multiline rows={2} fullWidth size="small" placeholder="Write prescription and recommendations..."
                  value={prescription} onChange={(e) => setPrescription(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>

              {agreement === 'reject' && (
                <Paper elevation={0} sx={{ p: 1.5, mb: 2, bgcolor: alpha('#ef5350', 0.05), border: '1px solid', borderColor: alpha('#ef5350', 0.15), borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningAmberIcon sx={{ color: '#ef5350', fontSize: 16 }} />
                    <Typography variant="caption" fontWeight={600} color="#ef5350">
                      Rejecting will flag this report for re-analysis by the MLT team.
                    </Typography>
                  </Box>
                </Paper>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar open={showSuccess} autoHideDuration={4000} onClose={() => setShowSuccess(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setShowSuccess(false)} severity="success" variant="filled" icon={<VerifiedUserIcon />} sx={{ width: '100%', fontWeight: 600, borderRadius: 2 }}>
          Report verified and signed successfully. Patient has been notified.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DiagnosticView;
