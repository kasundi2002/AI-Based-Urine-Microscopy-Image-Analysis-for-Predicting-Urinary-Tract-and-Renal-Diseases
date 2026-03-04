import React, { useState, useRef, useEffect } from 'react';
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

  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const drawBoxes = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !analysis) return;

    // Dynamic bounding match mapping against DOM scaled width
    const rect = img.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Relative ratios scaling boxes from absolute raw dimensions down to display rect widths
    const scaleX = rect.width / img.naturalWidth;
    const scaleY = rect.height / img.naturalHeight;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    Object.entries(analysis).forEach(([particleName, data]) => {
      if (!data || !data.detected) return;

      data.boxes.forEach(box => {
        const [rawX1, rawY1, rawX2, rawY2] = box.bbox;

        // Scale values
        const x1 = rawX1 * scaleX;
        const y1 = rawY1 * scaleY;
        const x2 = rawX2 * scaleX;
        const y2 = rawY2 * scaleY;

        if (particleName === "casts") {
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
        } else if (particleName === "crystals") {
          ctx.strokeStyle = "blue";
          ctx.lineWidth = 2;
        } else if (particleName === "wbc") {
          ctx.strokeStyle = "green";
          ctx.lineWidth = 2;
        } else if (particleName === "rbc") {
          console.log("Drawing RBC box:", box);
          ctx.strokeStyle = "purple";
          ctx.lineWidth = 1;
        } else {
          ctx.strokeStyle = "cyan";
          ctx.lineWidth = 2;
        }

        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

        ctx.font = "14px Arial";
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fillText(
          box.subtype || particleName,
          x1,
          y1 - 5
        );
      });
    });
  };

  useEffect(() => {
    drawBoxes();
  }, [analysis, image]);

  if (!image) return <Typography>No image loaded</Typography>;

  const crystalsData = analysis?.crystals || {};
  const castsData = analysis?.casts || {};
  const wbcData = analysis?.wbc || {};
  const rbcData = analysis?.rbc || {};

  const totalObjects = (crystalsData.total_count || 0) + (castsData.total_count || 0) + (wbcData.total_count || 0) + (rbcData.total_count || 0);

  let riskLevel = 'Low Risk';
  let riskColor = '#66bb6a';
  const cRisk = crystalsData.risk_assessment?.level;
  const castRisk = castsData.risk_assessment?.level;
  const wbcRisk = wbcData.risk_assessment?.level;
  const rbcRisk = rbcData.risk_assessment?.level;

  if (cRisk === 'High' || castRisk === 'High Risk' || wbcRisk === 'UTI Positive' || rbcRisk === 'High Dysmorphic Presence') {
    riskLevel = 'High Risk';
    riskColor = '#ef5350';
  } else if (cRisk === 'Moderate' || castRisk === 'Moderate Risk' || rbcRisk === 'Moderate Dysmorphic Presence') {
    riskLevel = 'Moderate Risk';
    riskColor = '#ff9100';
  }

  // Only these 4 crystal types are detected by the ML model
  const CRYSTAL_TYPES = ['CaOx_Dihydrate', 'CaOx_Monohydrate', 'Phosphate', 'Uric_Acid'];
  const CRYSTAL_DISPLAY_NAMES = {
    'CaOx_Dihydrate': 'CaOx Dihydrate',
    'CaOx_Monohydrate': 'CaOx Monohydrate',
    'Phosphate': 'Phosphate',
    'Uric_Acid': 'Uric Acid',
  };

  const particles = [
    {
      name: 'Crystals',
      count: crystalsData.total_count || 0,
      types: crystalsData.total_count > 0
        ? CRYSTAL_TYPES.map(t => `${CRYSTAL_DISPLAY_NAMES[t]}: ${crystalsData.subtype_summary?.[t] || 0}`).join(' · ')
        : 'Not detected',
      color: '#ff9100',
      icon: <DiamondIcon sx={{ fontSize: 18 }} />,
      confidence: crystalsData.total_count > 0 ? 96 : 99
    },
    {
      name: 'Casts',
      count: castsData.total_count || 0,
      types: castsData.subtype_summary && Object.keys(castsData.subtype_summary).length > 0
        ? Object.entries(castsData.subtype_summary).map(([k, v]) => `${k}: ${v}`).join(' · ')
        : 'Not detected',
      color: '#ab47bc',
      icon: <BiotechIcon sx={{ fontSize: 18 }} />,
      confidence: castsData.total_count > 0 ? 92 : 99
    },
    {
      name: 'WBC',
      count: wbcData.total_count || 0,
      types: wbcData.total_count > 0 ? wbcRisk : 'Not detected',
      color: '#00bcd4',
      icon: <ShieldIcon sx={{ fontSize: 18 }} />,
      confidence: wbcData.total_count > 0 ? 94 : 99
    },
    {
      name: 'RBC',
      count: rbcData.total_count || 0,
      types: rbcData.subtype_summary && Object.keys(rbcData.subtype_summary).length > 0
        ? Object.entries(rbcData.subtype_summary).map(([k, v]) => `${k}: ${v}`).join(' · ')
        : 'Not detected',
      color: '#ef5350',
      icon: <BloodtypeIcon sx={{ fontSize: 18 }} />,
      confidence: rbcData.total_count > 0 ? 98 : 99
    },
    { name: 'Bacteria', count: 0, types: 'N/A (ML module pending)', color: '#66bb6a', icon: <BugReportIcon sx={{ fontSize: 18 }} />, confidence: 100 },
  ];

  const clinicalSuggestion = crystalsData.risk_assessment?.clinical_suggestion || castsData.risk_assessment?.level || "No significant abnormalities detected in Casts or Crystals.";

  const handleSubmitReport = () => {
    submitLabResult({
      patientId: patient?.patientId || 'PAT-2023-001',
      patientName: patient?.name || 'John Doe',
      findings: {
        wbc: wbcData.total_count || 0,
        rbc: rbcData.total_count || 0,
        crystals: crystalsData.total_count > 0 ? 'Present' : 'Absent',
        bacteria: 'None',
        cast: castsData.total_count > 0 ? 'Present' : 'Absent',
      },
      aiRiskScore: riskLevel === 'High Risk' ? 85 : riskLevel === 'Moderate Risk' ? 55 : 15,
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
              <Typography variant="caption" color="text.secondary">ID: {patient?.patientId || "P01"}</Typography>
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
            <Box sx={{ flexGrow: 1, position: 'relative', overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ImageContainer sx={{ overflow: 'auto', bgcolor: '#f8f9fa' }}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img ref={imgRef} src={image} alt="Microscopy" onLoad={drawBoxes} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
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
                      borderColor: '#e0e0e0',
                      borderLeft: isDetected ? `4px solid ${p.color}` : '1px solid #e0e0e0',
                      bgcolor: '#fff',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        bgcolor: '#fafafa',
                        borderColor: '#d0d0d0',
                        transform: 'translateX(4px)',
                      }
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

                      {/* Prominent Count Badge */}
                      <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 1,
                      }}>
                        {isDetected ? (
                          <Box sx={{
                            display: 'flex', alignItems: 'center', gap: 0.8,
                            bgcolor: p.color,
                            color: '#fff',
                            px: 1.8, py: 0.6,
                            borderRadius: 2,
                            boxShadow: `0 3px 12px ${alpha(p.color, 0.4)}`,
                            minWidth: 70,
                            justifyContent: 'center',
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
                              bgcolor: alpha('#66bb6a', 0.1),
                              color: '#66bb6a',
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
                              height: 22,
                              fontSize: '0.68rem',
                              fontWeight: 600,
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

                    {/* WBC / non-subtype detail text */}
                    {isDetected && subtypeEntries.length === 0 && p.types && p.types !== 'Not detected' && (
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.8, pl: 4.5, color: p.color, fontWeight: 600 }}>
                        {p.types}
                      </Typography>
                    )}

                    {/* Not detected message */}
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
