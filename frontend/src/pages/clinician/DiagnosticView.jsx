import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, TextField, Button, Avatar, 
  Chip, LinearProgress, IconButton, Tooltip, Snackbar, Alert
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
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GavelIcon from '@mui/icons-material/Gavel';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import TuneIcon from '@mui/icons-material/Tune';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import SpeedIcon from '@mui/icons-material/Speed';
import ScienceIcon from '@mui/icons-material/Science';
import BiotechIcon from '@mui/icons-material/Biotech';
import PersonIcon from '@mui/icons-material/Person';
import microscopyImage from '../../assets/c2.jpg';
import { api } from '../../services/api';

const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

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

// Crystal type display names (same as MLT)
const CRYSTAL_TYPES = ['CaOx_Dihydrate', 'CaOx_Monohydrate', 'Phosphate', 'Uric_Acid'];
const CRYSTAL_DISPLAY_NAMES = {
  'CaOx_Dihydrate': 'CaOx Dihydrate',
  'CaOx_Monohydrate': 'CaOx Monohydrate',
  'Phosphate': 'Phosphate',
  'Uric_Acid': 'Uric Acid',
};

const DiagnosticView = ({ report, onVerify }) => {
  const [agreement, setAgreement] = useState('agree');
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [submitted, setSubmitted] = useState(report?.status === 'Verified' || report?.patientId?.status === 'Completed');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Sync submitted state with report/patient status changes
  useEffect(() => {
    if (report) {
      const isVerified = report.status === 'Verified' || report.patientId?.status === 'Completed';
      setSubmitted(isVerified);
      
      // If report already has verification data (populated by backend getReport), load it
      if (report.verification) {
        setAgreement(report.verification.agreement || 'agree');
        setNotes(report.verification.clinicalNotes || report.comments || '');
        setPrescription(report.verification.prescription || '');
      } else {
        setAgreement('agree');
        setNotes(report.comments || '');
        setPrescription('');
      }
    }
  }, [report]);

  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const imagePanelRef = useRef(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);
  const handleFullscreen = () => {
    if (imagePanelRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        imagePanelRef.current.requestFullscreen();
      }
    }
  };

  // ── Canvas bounding box drawing (same logic as MLT AnalysisView) ──
  const drawBoxes = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !analysis) return;

    const displayWidth = img.offsetWidth;
    const displayHeight = img.offsetHeight;
    canvas.width = displayWidth;
    canvas.height = displayHeight;

    const scaleX = displayWidth / img.naturalWidth;
    const scaleY = displayHeight / img.naturalHeight;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    Object.entries(analysis).forEach(([particleName, data]) => {
      if (!data || !data.detected) return;
      if (particleName === "yeast") return;

      if (!data.boxes) return;

      data.boxes.forEach(box => {
        const [rawX1, rawY1, rawX2, rawY2] = box.bbox;
        const x1 = rawX1 * scaleX;
        const y1 = rawY1 * scaleY;
        const x2 = rawX2 * scaleX;
        const y2 = rawY2 * scaleY;

        if (particleName === "casts") {
          ctx.strokeStyle = "green";
          ctx.lineWidth = 2;
        } else if (particleName === "crystals") {
          ctx.strokeStyle = "blue";
          ctx.lineWidth = 2;
        } else if (particleName === "wbc") {
          ctx.strokeStyle = "purple";
          ctx.lineWidth = 2;
        } else if (particleName === "rbc") {
          ctx.strokeStyle = "red";
          ctx.lineWidth = 1;
        } else if (particleName === "bacteria") {
          ctx.strokeStyle = "cyan";
          ctx.lineWidth = 2;
        } else {
          ctx.strokeStyle = "white";
          ctx.lineWidth = 2;
        }

        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

        ctx.font = "14px Arial";
        ctx.fillStyle = ctx.strokeStyle;

        let labelText = box.subtype || particleName;
        if (particleName === "casts" && box.subtype) {
          const st = box.subtype.trim();
          const upperSt = st.toUpperCase();
          if (upperSt === "WBC" || upperSt === "RBC") {
            labelText = `${upperSt} Cast`;
          } else {
            labelText = `${st.charAt(0).toUpperCase() + st.slice(1)} Cast`;
          }
        }

        ctx.fillText(labelText, x1, y1 - 5);
      });
    });
  };

  if (!report) return (
    <Box sx={{ p: 8, textAlign: 'center' }}>
      <LocalHospitalIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h6" color="text.secondary">Select a patient report to begin diagnostic review</Typography>
      <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>Choose a patient from the Diagnostic Review list</Typography>
    </Box>
  );

  // ── Extract real data from report ──
  const analysis = report.analysis || {};
  const patientData = report.patientId || {};
  
  const patientName = report.patientName || patientData.name || report.name || 'Unknown';
  const patientAge = report.patientAge || patientData.age || report.age || '-';
  const patientId = report.patientDisplayId || patientData.patientId || report.id || '-';
  const reportId = report._id;

  // Build microscopy image URL from report
  const imageUrl = report.imageUrl 
    ? `${BACKEND_BASE}${report.imageUrl}`
    : microscopyImage;

  // ── Parse analysis data ──
  const crystalsData = analysis.crystals || {};
  const castsData = analysis.casts || {};
  const wbcData = analysis.wbc || {};
  const rbcData = analysis.rbc || {};
  const yeastData = analysis.yeast || {};
  const bacteriaData = analysis.bacteria || {};

  const totalObjects = (crystalsData.total_count || 0) + (castsData.total_count || 0) + 
    (wbcData.total_count || 0) + (rbcData.total_count || 0) + (yeastData.total_count || 0);

  // ── Risk calculation (same as MLT AnalysisView) ──
  const cRisk = crystalsData.risk_assessment?.level;
  const castRisk = castsData.risk_assessment?.level;
  const wbcRisk = wbcData.risk_assessment?.level;
  const rbcRisk = rbcData.risk_assessment?.level;
  const yeastRisk = yeastData.risk_assessment?.level;

  let riskLevel = 'Low Risk';
  let riskColor = '#66bb6a';
  if (cRisk === 'High' || castRisk === 'High Risk' || wbcRisk === 'UTI Positive' || rbcRisk === 'High Dysmorphic Presence' || yeastRisk === 'Possible Yeast Infection') {
    riskLevel = 'High Risk';
    riskColor = '#ef5350';
  } else if (cRisk === 'Moderate' || castRisk === 'Moderate Risk' || rbcRisk === 'Moderate Dysmorphic Presence' || yeastRisk === 'Low Yeast Presence') {
    riskLevel = 'Moderate Risk';
    riskColor = '#ff9100';
  }

  // ── Detected particles list (same as MLT) ──
  const particles = [
    {
      name: 'Crystals',
      count: crystalsData.total_count || 0,
      types: crystalsData.total_count > 0
        ? CRYSTAL_TYPES.map(t => `${CRYSTAL_DISPLAY_NAMES[t]}: ${crystalsData.subtype_summary?.[t] || 0}`).join(' · ')
        : 'Not detected',
      color: '#2196f3',
      icon: <DiamondIcon sx={{ fontSize: 18 }} />,
    },
    {
      name: 'Casts',
      count: castsData.total_count || 0,
      types: castsData.subtype_summary && Object.keys(castsData.subtype_summary).length > 0
        ? Object.entries(castsData.subtype_summary).map(([k, v]) => `${k}: ${v}`).join(' · ')
        : 'Not detected',
      color: '#4caf50',
      icon: <BiotechIcon sx={{ fontSize: 18 }} />,
    },
    {
      name: 'WBC',
      count: wbcData.total_count || 0,
      types: wbcData.total_count > 0 ? wbcRisk : 'Not detected',
      color: '#9c27b0',
      icon: <ShieldIcon sx={{ fontSize: 18 }} />,
    },
    {
      name: 'RBC',
      count: rbcData.total_count || 0,
      types: rbcData.subtype_summary && Object.keys(rbcData.subtype_summary).length > 0
        ? Object.entries(rbcData.subtype_summary).map(([k, v]) => `${k}: ${v}`).join(' · ')
        : 'Not detected',
      color: '#f44336',
      icon: <BloodtypeIcon sx={{ fontSize: 18 }} />,
    },
    {
      name: 'Yeast',
      count: yeastData.total_count || 0,
      types: yeastData.total_count > 0 ? yeastRisk : 'Not detected',
      color: '#ff9800',
      icon: <ScienceIcon sx={{ fontSize: 18 }} />,
    },
    {
      name: 'Bacteria',
      count: bacteriaData.total_count || 0,
      types: bacteriaData.total_count > 0 ? bacteriaData.risk_assessment?.level : 'Not detected',
      color: '#00bcd4',
      icon: <BugReportIcon sx={{ fontSize: 18 }} />,
    },
  ];

  // Trigger drawBoxes when analysis/image loads
  useEffect(() => {
    drawBoxes();
  }, [analysis, imageUrl]);

  // ── Submit verification ──
  const handleSubmit = async () => {
    if (!reportId) {
      console.error('No report ID available for verification');
      return;
    }
    setSubmitting(true);
    try {
      await api.submitVerification(reportId, { agreement, notes, prescription });
      
      // Optimistically update the report status
      report.status = 'Verified';
      if (report.patientId) report.patientId.status = 'Completed';
      
      setSubmitted(true);
      setShowSuccess(true);
      setTimeout(() => {
        if (onVerify) onVerify();
      }, 2000);
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setSubmitting(false);
    }
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <GavelIcon sx={{ color: '#7c4dff', fontSize: 28 }} />
            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: -0.5 }}>Diagnostic Review</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Review AI-generated analysis and provide clinical verification
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="contained"
            disabled={submitting}
            startIcon={submitted ? <EditNoteIcon /> : <VerifiedUserIcon />}
            onClick={handleSubmit}
            sx={{
              textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3,
              background: submitted 
                ? 'linear-gradient(135deg, #43a047, #66bb6a)' 
                : 'linear-gradient(135deg, #0f172a, #1e3a5f)',
              boxShadow: submitted ? '0 4px 14px rgba(67,160,71,0.3)' : '0 4px 14px rgba(15,23,42,0.25)',
              '&:hover': {
                background: submitted 
                  ? 'linear-gradient(135deg, #2e7d32, #43a047)' 
                  : 'linear-gradient(135deg, #1e293b, #2d4a6f)',
              }
            }}
          >
            {submitting ? 'Submitting...' : submitted ? 'Update Verification' : 'Verify & Sign Report'}
          </Button>
        </Box>
      </Box>

      {/* Patient Info & Summary Stats (Same as MLT layout) */}
      <Paper elevation={0} sx={{
        p: 1.5, mb: 1.5, borderRadius: 3,
        border: '1px solid', borderColor: 'divider',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 44, height: 44, bgcolor: alpha('#7c4dff', 0.1), color: '#7c4dff' }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>{patientName}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">ID: {patientId}</Typography>
              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }} />
              <Typography variant="caption" color="text.secondary">Age: {patientAge}</Typography>
              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }} />
              <Typography variant="caption" color="text.secondary">
                <CalendarTodayIcon sx={{ fontSize: 11, mr: 0.3, verticalAlign: 'middle' }} />
                {report.createdAt 
                  ? new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                }
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
              <Typography variant="subtitle2" fontWeight={800}>{totalObjects}</Typography>
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

      <Grid container spacing={2}>
        {/* Left: Microscopy Image with Bounding Boxes */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={0} sx={{ 
            height: 440, borderRadius: 3, overflow: 'hidden',
            border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column'
          }}>
            {/* Image toolbar */}
            <Box sx={{ 
              px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha('#f8fafc', 0.5)
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#66bb6a' }} />
                <Typography variant="caption" fontWeight={600} color="text.secondary">MICROSCOPY VIEW</Typography>
                <Chip label={`${Math.round(zoom * 100)}%`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Zoom In"><IconButton size="small" onClick={handleZoomIn}><ZoomInIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                <Tooltip title="Zoom Out"><IconButton size="small" onClick={handleZoomOut}><ZoomOutIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                <Tooltip title="Reset Zoom"><IconButton size="small" onClick={handleResetZoom}><CenterFocusStrongIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                <Tooltip title="Fullscreen"><IconButton size="small" onClick={handleFullscreen}><FullscreenIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
              </Box>
            </Box>

            {/* Image with Canvas Overlay for Bounding Boxes */}
            <Box ref={imagePanelRef} sx={{ flexGrow: 1, position: 'relative', overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8f9fa' }}>
              <ImageContainer sx={{ overflow: 'visible', bgcolor: '#f8f9fa' }}>
                <div style={{ position: "relative", display: "inline-block", transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.2s ease' }}>
                  <img ref={imgRef} src={imageUrl} alt="Microscopy" onLoad={drawBoxes} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
                  <canvas
                    ref={canvasRef}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      pointerEvents: "none"
                    }}
                  />
                </div>
              </ImageContainer>
            </Box>

            {/* Legend */}
            <Box sx={{ 
              px: 2, py: 1.2, display: 'flex', gap: 2, alignItems: 'center',
              borderTop: '1px solid', borderColor: 'divider', bgcolor: alpha('#f8fafc', 0.5)
            }}>
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mr: 1 }}>LEGEND:</Typography>
              {[
                { label: 'WBC', color: '#9c27b0' },
                { label: 'RBC', color: '#f44336' },
                { label: 'Crystal', color: '#2196f3' },
                { label: 'Cast', color: '#4caf50' },
                { label: 'Bacteria', color: '#00bcd4' },
              ].map(l => (
                <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: 1, bgcolor: l.color }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>{l.label}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Right: AI Detection Report + Clinical Verification */}
        <Grid size={{ xs: 12, md: 5 }}>
          {/* AI Detection Report (same as MLT AnalysisView) */}
          <Paper elevation={0} sx={{ 
            height: 440, borderRadius: 3, overflow: 'hidden',
            border: '1px solid', borderColor: 'divider',
            display: 'flex', flexDirection: 'column'
          }}>
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

            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
              <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ px: 1, letterSpacing: 1.5 }}>
                Detected Particles
              </Typography>

              {particles.map((p, i) => {
                const isDetected = p.count > 0;
                const subtypeEntries = p.name === 'Crystals'
                  ? CRYSTAL_TYPES.map(t => [CRYSTAL_DISPLAY_NAMES[t], crystalsData.subtype_summary?.[t] || 0])
                  : p.name === 'Casts' && castsData.subtype_summary
                    ? Object.entries(castsData.subtype_summary)
                    : p.name === 'RBC' && rbcData.subtype_summary
                      ? Object.entries(rbcData.subtype_summary)
                      : [];

                return (
                  <Paper
                    key={i}
                    elevation={0}
                    sx={{
                      p: 2, mt: 1.5, borderRadius: 2.5,
                      border: '1px solid',
                      borderColor: alpha(p.color, 0.35),
                      borderLeft: isDetected ? `4px solid ${p.color}` : `1px solid ${alpha(p.color, 0.35)}`,
                      bgcolor: '#fff',
                      transition: 'all 0.25s ease',
                      '&:hover': { bgcolor: '#fafafa', borderColor: '#d0d0d0', transform: 'translateX(4px)' }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                          p: 0.8, borderRadius: 1.5,
                          bgcolor: alpha(p.color, 0.12), color: p.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {p.icon}
                        </Box>
                        <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.95rem' }}>{p.name}</Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {isDetected ? (
                          <Box sx={{
                            display: 'flex', alignItems: 'center', gap: 0.8,
                            bgcolor: p.color, color: '#fff',
                            px: 1.8, py: 0.6, borderRadius: 2,
                            boxShadow: `0 3px 12px ${alpha(p.color, 0.4)}`,
                            minWidth: 70, justifyContent: 'center',
                          }}>
                            <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', lineHeight: 1 }}>
                              {p.count}
                            </Typography>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.65rem', opacity: 0.9, lineHeight: 1, textTransform: 'uppercase' }}>
                              found
                            </Typography>
                          </Box>
                        ) : (
                          <Chip
                            label="Clear"
                            size="small"
                            sx={{
                              bgcolor: alpha('#66bb6a', 0.1), color: '#66bb6a',
                              fontWeight: 700, fontSize: '0.72rem', height: 26,
                              border: '1px solid', borderColor: alpha('#66bb6a', 0.25),
                            }}
                          />
                        )}
                      </Box>
                    </Box>

                    {/* Subtype breakdown tags */}
                    {isDetected && subtypeEntries.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7, mt: 1.2, pl: 4.5 }}>
                        {subtypeEntries.map(([subtype, count]) => (
                          <Chip
                            key={subtype}
                            label={`${subtype.replace(/_/g, ' ')}: ${count}`}
                            size="small"
                            sx={{
                              height: 22, fontSize: '0.68rem', fontWeight: 600,
                              bgcolor: count > 0 ? alpha(p.color, 0.1) : alpha('#9e9e9e', 0.08),
                              color: count > 0 ? p.color : 'text.secondary',
                              border: '1px solid',
                              borderColor: count > 0 ? alpha(p.color, 0.2) : alpha('#9e9e9e', 0.15),
                              textTransform: 'capitalize',
                            }}
                          />
                        ))}
                      </Box>
                    )}

                    {isDetected && subtypeEntries.length === 0 && p.types && p.types !== 'Not detected' && (
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.8, pl: 4.5, color: p.color, fontWeight: 600 }}>
                        {p.types}
                      </Typography>
                    )}

                    {!isDetected && p.types === 'Not detected' && (
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5, pl: 4.5, color: 'text.disabled', fontStyle: 'italic' }}>
                        Not detected in sample
                      </Typography>
                    )}
                  </Paper>
                );
              })}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Clinical Verification Section (below) */}
      <Paper elevation={0} sx={{ 
        mt: 2, borderRadius: 3, overflow: 'hidden',
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
                  flex: 1, p: 2, borderRadius: 2.5, cursor: 'pointer', textAlign: 'center',
                  border: '2px solid',
                  borderColor: agreement === opt.value ? opt.color : 'divider',
                  bgcolor: agreement === opt.value ? alpha(opt.color, 0.06) : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: alpha(opt.color, 0.5), bgcolor: alpha(opt.color, 0.03) }
                }}
              >
                <Box sx={{ color: agreement === opt.value ? opt.color : 'text.secondary', mb: 0.5 }}>
                  {React.cloneElement(opt.icon, { sx: { fontSize: 28 } })}
                </Box>
                <Typography variant="body2" fontWeight={700} sx={{ color: agreement === opt.value ? opt.color : 'text.primary' }}>
                  {opt.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  {opt.desc}
                </Typography>
              </Paper>
            ))}
          </Box>

          {agreement === 'reject' && (
            <Paper elevation={0} sx={{ p: 1.5, mb: 2.5, bgcolor: alpha('#ef5350', 0.05), border: '1px solid', borderColor: alpha('#ef5350', 0.15), borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningAmberIcon sx={{ color: '#ef5350', fontSize: 16 }} />
                <Typography variant="caption" fontWeight={600} color="#ef5350">
                  Rejecting will flag this report for re-analysis by the MLT team.
                </Typography>
              </Box>
            </Paper>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  <EditNoteIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                  CLINICAL NOTES
                </Typography>
                <TextField 
                  multiline rows={3} fullWidth size="small" placeholder="Add your clinical observations..."
                  value={notes} onChange={(e) => setNotes(e.target.value)}
                  disabled={submitting}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  <MedicalServicesIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                  PRESCRIPTION / RECOMMENDATIONS
                </Typography>
                <TextField 
                  multiline rows={3} fullWidth size="small" placeholder="Write prescription and recommendations..."
                  value={prescription} onChange={(e) => setPrescription(e.target.value)}
                  disabled={submitting}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Chemical Parameters if available */}
      {report.chemicalParameters && (
        <Paper elevation={0} sx={{ 
          mt: 2, borderRadius: 3, overflow: 'hidden',
          border: '1px solid', borderColor: 'divider'
        }}>
          <Box sx={{ 
            px: 3, py: 2,
            background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
            color: 'white'
          }}>
            <Typography variant="subtitle1" fontWeight={700}>Chemical Analysis Report</Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>Urine full report — manual entry by MLT</Typography>
          </Box>
          <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Object.entries(report.chemicalParameters).map(([key, value]) => (
              <Chip key={key} label={`${key}: ${value}`} size="small" variant="outlined" sx={{ fontSize: '0.75rem', fontWeight: 600 }} />
            ))}
          </Box>
        </Paper>
      )}

      <Snackbar open={showSuccess} autoHideDuration={4000} onClose={() => setShowSuccess(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setShowSuccess(false)} severity="success" variant="filled" icon={<VerifiedUserIcon />} sx={{ width: '100%', fontWeight: 600, borderRadius: 2 }}>
          Report verified and signed successfully. Patient status updated to Completed.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DiagnosticView;
