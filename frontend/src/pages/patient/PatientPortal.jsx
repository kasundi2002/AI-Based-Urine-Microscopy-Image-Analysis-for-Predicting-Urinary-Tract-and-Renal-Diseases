import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Avatar, Paper, Button, Chip, CircularProgress, AppBar, Toolbar,
  IconButton, Grid, Table, TableBody, TableRow, TableCell, Alert, Snackbar, CssBaseline
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Questionnaire from './Questionnaire';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BiotechIcon from '@mui/icons-material/Biotech';
import LogoutIcon from '@mui/icons-material/Logout';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ShieldIcon from '@mui/icons-material/Shield';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import DiamondIcon from '@mui/icons-material/Diamond';
import BugReportIcon from '@mui/icons-material/BugReport';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ScienceIcon from '@mui/icons-material/Science';
import { useAuth } from '../../context/AuthContext';
import generateReport from '../../utils/generateReport';

const BACKEND_URL = 'http://localhost:5000/api';

const PatientPortal = () => {
  const navigate = useNavigate();
  const { patientToken, clearPatientToken } = useAuth();

  const storedPatientInfo = JSON.parse(localStorage.getItem('patientInfo') || 'null');

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false);
  const [riskPrediction, setRiskPrediction] = useState(null);
  const [patientInfo, setPatientInfo] = useState(storedPatientInfo);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const patientName = patientInfo?.name || storedPatientInfo?.name || 'Patient';
  const displayPatientId = patientInfo?.patientId || storedPatientInfo?.patientId || 'N/A';

  const getToken = () => patientToken || localStorage.getItem('patientToken') || localStorage.getItem('token');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const token = getToken();
        if (!token) { setLoading(false); return; }
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

        // Use the patient-specific endpoint that works with patient JWT
        const res = await fetch(`${BACKEND_URL}/patient-access/my-report`, { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load report');

        // Update patient info from the response if available
        if (data.patient) {
          setPatientInfo(data.patient);
          localStorage.setItem('patientInfo', JSON.stringify(data.patient));
        }

        if (data.reports?.length > 0) {
          setReport(data.reports[0]); // Latest report
        }
      } catch (err) {
        console.error('Failed to load report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const handleLogout = () => {
    clearPatientToken();
    localStorage.removeItem('patientInfo');
    navigate('/login');
  };

  // Extract data from report
  const analysis = report?.analysis || {};
  const getCount = (node) => Number(node?.total_count || node?.count || 0);
  const wbcCount = getCount(analysis?.wbc);
  const rbcCount = getCount(analysis?.rbc);
  const crystalCount = getCount(analysis?.crystals);
  const castCount = getCount(analysis?.casts);
  const yeastCount = getCount(analysis?.yeast);
  const bacteriaCount = getCount(analysis?.bacteria);
  const totalDetections = wbcCount + rbcCount + crystalCount + castCount + yeastCount + bacteriaCount;

  const riskLevel = analysis.risk_level || 'Low';
  const baseRiskScore = riskLevel === 'High' ? 75 : riskLevel === 'Moderate' ? 45 : 20;
  const riskScore = riskPrediction?.riskScore || baseRiskScore;
  const isHighRisk = riskScore > 50;
  const riskLabel = riskPrediction?.riskLabel ||
    (riskLevel === 'High' ? 'High Risk Detected' : riskLevel === 'Moderate' ? 'Moderate Risk' : 'Low Risk');

  const riskGradient = isHighRisk
    ? 'linear-gradient(135deg, #ef5350, #c62828)'
    : riskScore > 30
      ? 'linear-gradient(135deg, #ff9100, #e65100)'
      : 'linear-gradient(135deg, #66bb6a, #2e7d32)';

  const reportDate = report ? new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
  const imageUrl = report?.imageUrl ? `http://localhost:5000${report.imageUrl}` : '';

  const sediments = [
    { label: 'WBC', value: `${wbcCount}`, unit: '/hpf', color: '#00bcd4', icon: <ShieldIcon /> },
    { label: 'RBC', value: `${rbcCount}`, unit: '/hpf', color: '#ef5350', icon: <BloodtypeIcon /> },
    { label: 'Crystals', value: `${crystalCount}`, unit: '', color: '#ff9100', icon: <DiamondIcon /> },
    { label: 'Casts', value: `${castCount}`, unit: '', color: '#66bb6a', icon: <BiotechIcon /> },
  ];

  // Build PDF-compatible report object
  const pdfReport = report ? {
    date: reportDate, riskScore, riskLabel,
    wbc: sediments[0].value, rbc: sediments[1].value, crystals: sediments[2].value, bacteria: `${bacteriaCount}`,
    chemicalParameters: report.chemicalParameters,
    questionnaireCompleted, enhancedRiskScore: riskPrediction?.riskScore, enhancedRiskLabel: riskPrediction?.riskLabel,
    prescription: 'Drink plenty of water. Follow up in 3 months.', doctorNote: '- Dr. Smith (Urologist)',
  } : null;

  const drawBoxes = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !analysis || !img.naturalWidth || !img.naturalHeight) return;

    const displayWidth = img.offsetWidth;
    const displayHeight = img.offsetHeight;
    canvas.width = displayWidth;
    canvas.height = displayHeight;

    const ctx = canvas.getContext('2d');
    const scaleX = displayWidth / img.naturalWidth;
    const scaleY = displayHeight / img.naturalHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const colorByType = {
      wbc: '#9c27b0',
      rbc: '#f44336',
      crystals: '#2196f3',
      casts: '#4caf50',
      bacteria: '#00bcd4',
      yeast: '#ff9800',
    };

    Object.entries(analysis).forEach(([particleName, data]) => {
      const boxes = Array.isArray(data?.boxes) ? data.boxes : [];
      if (boxes.length === 0) return;

      const color = colorByType[particleName] || '#ffffff';
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = particleName === 'rbc' ? 1 : 2;
      ctx.font = '12px Arial';

      boxes.forEach((box) => {
        if (!Array.isArray(box?.bbox) || box.bbox.length < 4) return;
        const [rawX1, rawY1, rawX2, rawY2] = box.bbox;
        const x1 = rawX1 * scaleX;
        const y1 = rawY1 * scaleY;
        const x2 = rawX2 * scaleX;
        const y2 = rawY2 * scaleY;

        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        const label = box?.subtype ? `${particleName}: ${box.subtype}` : particleName;
        ctx.fillText(label, x1, Math.max(10, y1 - 4));
      });
    });
  };

  useEffect(() => {
    drawBoxes();
    const onResize = () => drawBoxes();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [report, analysis]);

  const handleQuestionnaireComplete = (formData) => {
    const prediction = generateRiskPrediction(formData, report);
    setRiskPrediction(prediction);
    setQuestionnaireCompleted(true);
    setShowQuestionnaire(false);
  };

  const generateRiskPrediction = (q, r) => {
    const isYes = (key) => String(q?.[key] || '').toLowerCase() === 'yes';
    const countYes = (keys) => keys.reduce((n, key) => n + (isYes(key) ? 1 : 0), 0);
    const waterLow = (q?.q28 || '') === 'Less than 1 liter';
    const waterMid = (q?.q28 || '') === '1-2 liters';

    const mappings = {
      uti: ['q4', 'q5', 'q6', 'q10', 'q11', 'q13', 'q14', 'q15', 'q18'],
      lowerUti: ['q4', 'q5', 'q6', 'q10'],
      upperUti: ['q11', 'q13', 'q14', 'q15'],
      yeastUti: ['q4', 'q5', 'q22', 'q26'],
      kidneyStone: ['q7', 'q11', 'q12', 'q13', 'q14', 'q24', 'q29', 'q30', 'q31'],
      hematuria: ['q7', 'q8', 'q11', 'q12', 'q18', 'q24', 'q32'],
      rbcCast: ['q7', 'q8', 'q11'],
      wbcCast: ['q14', 'q15', 'q18', 'q19'],
      granularCast: ['q17', 'q9', 'q25', 'q27'],
      waxyCast: ['q16', 'q20', 'q21', 'q22', 'q17', 'q9'],
    };

    const age = parseInt(q?.q1, 10) || 0;
    const lowerUtiScore = countYes(mappings.lowerUti);
    const upperUtiScore = countYes(mappings.upperUti);
    const utiScore = countYes(mappings.uti);
    const yeastUtiScore = countYes(mappings.yeastUti);
    const kidneyStoneScore = countYes(mappings.kidneyStone) + (waterLow ? 2 : waterMid ? 1 : 0);
    const hematuriaScore = countYes(mappings.hematuria) + (age >= 50 ? 1 : 0);
    const castScore =
      countYes(mappings.rbcCast) +
      countYes(mappings.wbcCast) +
      countYes(mappings.granularCast) +
      countYes(mappings.waxyCast) +
      (waterLow ? 1 : 0);

    let score = 12;
    score += utiScore * 2;
    score += lowerUtiScore >= 3 ? 5 : 0;
    score += upperUtiScore >= 2 ? 6 : 0;
    score += yeastUtiScore >= 3 ? 6 : 0;
    score += kidneyStoneScore * 2;
    score += hematuriaScore * 2;
    score += Math.round(castScore * 1.5);

    if (age >= 60) score += 8;
    else if (age >= 45) score += 4;

    if (isYes('q33')) score += 3;
    if (r?.analysis?.risk_level === 'High') score += 12;
    else if (r?.analysis?.risk_level === 'Moderate') score += 6;

    if (r?.chemicalParameters) {
      const c = r.chemicalParameters;
      if (c.protein && c.protein !== 'Nil') score += 6;
      if (c.glucose && c.glucose !== 'Nil') score += 4;
      if (c.blood && c.blood !== 'Nil') score += 8;
      if (c.nitrite === 'Positive') score += 7;
    }

    score = Math.max(5, Math.min(score, 95));

    const dominantPattern = (() => {
      const items = [
        { key: 'UTI', value: utiScore + upperUtiScore },
        { key: 'Kidney Stone', value: kidneyStoneScore },
        { key: 'Hematuria/RBC', value: hematuriaScore },
        { key: 'Kidney Cast Disease', value: castScore },
      ];
      items.sort((a, b) => b.value - a.value);
      return items[0].value > 0 ? items[0].key : 'General Urinary';
    })();

    let label = 'Low Risk - Monitor and stay hydrated';
    if (score > 60) label = `High Risk - ${dominantPattern} pattern, immediate consultation recommended`;
    else if (score > 40) label = `Moderate Risk - ${dominantPattern} pattern, follow-up advised`;
    else if (score > 25) label = `Low-Moderate Risk - ${dominantPattern} pattern, monitor closely`;

    return { riskScore: score, riskLabel: label };
  };

  // ── Questionnaire View ──
  if (showQuestionnaire) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <CssBaseline />
        {/* Top Bar */}
        <AppBar position="fixed" elevation={0} sx={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', borderBottom: '2px solid', borderColor: '#00bcd4' }}>
          <Toolbar sx={{ minHeight: '56px !important' }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => setShowQuestionnaire(false)} sx={{ color: 'white', textTransform: 'none', fontWeight: 600 }}>
              Back to Report
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <Typography variant="body2" sx={{ color: alpha('#fff', 0.7), fontWeight: 600 }}>Health Questionnaire</Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ pt: '72px', px: 3, pb: 4, maxWidth: 900, mx: 'auto' }}>
          <Questionnaire onComplete={handleQuestionnaireComplete} />
        </Box>
      </Box>
    );
  }

  // ── Loading ──
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: 2, bgcolor: '#f8fafc' }}>
        <CircularProgress sx={{ color: '#00bcd4' }} />
        <Typography variant="body2" color="text.secondary">Loading your report...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <CssBaseline />

      {/* ── Top Bar ── */}
      <AppBar position="fixed" elevation={0} sx={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', borderBottom: '2px solid', borderColor: '#00bcd4' }}>
        <Toolbar sx={{ minHeight: '56px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h6" sx={{ color: '#00bcd4', fontWeight: 850, fontSize: '1.3rem', letterSpacing: -0.5 }}>
              Uro.AI
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.4), fontSize: '0.6rem', letterSpacing: 1, textTransform: 'uppercase' }}>
              Patient Portal
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip label={patientName} size="small" avatar={<Avatar sx={{ bgcolor: '#00bcd4' }}>{patientName?.charAt(0) || 'P'}</Avatar>}
              sx={{ color: 'white', fontWeight: 600, fontSize: '0.75rem', bgcolor: alpha('#fff', 0.08), border: '1px solid', borderColor: alpha('#fff', 0.1) }} />
            <IconButton size="small" onClick={handleLogout} sx={{ color: alpha('#fff', 0.6), '&:hover': { color: '#ef5350' } }}>
              <LogoutIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ── Page Content ── */}
      <Box sx={{ pt: '72px', px: { xs: 2, md: 4 }, pb: 4, maxWidth: 1200, mx: 'auto' }}>
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

        {/* Patient Info Header */}
        <Paper elevation={0} sx={{
          mb: 3, p: 3, borderRadius: 3, animation: 'fadeIn 0.4s ease-out',
          background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
          color: 'white', position: 'relative', overflow: 'hidden',
          border: '1px solid', borderColor: alpha('#fff', 0.06)
        }}>
          <Box sx={{ position: 'absolute', top: -30, right: -30, opacity: 0.04 }}>
            <FavoriteIcon sx={{ fontSize: 200 }} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 56, height: 56, background: 'linear-gradient(135deg, #00bcd4, #0097a7)', border: '3px solid', borderColor: alpha('#fff', 0.2), fontSize: '1.3rem', fontWeight: 800 }}>
                {patientName.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: -0.5 }}>
                  Welcome, {patientName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                  <Chip label={`ID: ${displayPatientId}`} size="small" sx={{ bgcolor: alpha('#fff', 0.1), color: 'white', fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
                  {patientInfo?.age && (
                    <Chip label={`Age: ${patientInfo.age}`} size="small" sx={{ bgcolor: alpha('#fff', 0.1), color: 'white', fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
                  )}
                  {patientInfo?.gender && (
                    <Chip label={`Sex: ${patientInfo.gender}`} size="small" sx={{ bgcolor: alpha('#fff', 0.1), color: 'white', fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.7 }}>
                    <CalendarTodayIcon sx={{ fontSize: 13 }} />
                    <Typography variant="caption">Report: {reportDate}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
            {pdfReport && (
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => generateReport(pdfReport, patientName)}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, borderColor: alpha('#fff', 0.2), color: 'white', '&:hover': { borderColor: '#00bcd4', color: '#00bcd4' } }}>
                Download PDF
              </Button>
            )}
          </Box>
        </Paper>

        {/* No report */}
        {!report && (
          <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <ScienceIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="h6" color="text.secondary" fontWeight={600}>No Reports Available</Typography>
            <Typography variant="body2" color="text.disabled">Your lab report will appear here once the analysis is complete.</Typography>
          </Paper>
        )}

        {report && (
          <>
            {/* Questionnaire CTA Banner */}
            {!questionnaireCompleted && (
              <Paper elevation={0} sx={{
                p: 2.5, mb: 3, borderRadius: 3, animation: 'fadeIn 0.5s ease-out',
                bgcolor: alpha('#2196f3', 0.04), border: '1px solid', borderColor: alpha('#2196f3', 0.15),
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha('#2196f3', 0.08), color: '#2196f3', display: 'flex' }}>
                    <AssignmentIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>Enhance Your Risk Prediction!</Typography>
                    <Typography variant="caption" color="text.secondary">Complete the Health Questionnaire for personalized UTI, kidney stone, hematuria, and kidney disease risk scoring.</Typography>
                  </Box>
                </Box>
                <Button variant="contained" size="small" startIcon={<BiotechIcon />} onClick={() => setShowQuestionnaire(true)}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3, background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', boxShadow: '0 4px 14px rgba(15,23,42,0.25)' }}>
                  More Analysis
                </Button>
              </Paper>
            )}

            {questionnaireCompleted && (
              <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: alpha('#66bb6a', 0.04), border: '1px solid', borderColor: alpha('#66bb6a', 0.15), display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: alpha('#66bb6a', 0.08), color: '#66bb6a', display: 'flex' }}>
                  <AutoAwesomeIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="body2" fontWeight={600} color="text.secondary">
                  <span style={{ color: '#66bb6a', fontWeight: 700 }}>Enhanced prediction active</span> — your results include Health Questionnaire data for improved accuracy.
                </Typography>
              </Paper>
            )}

            {/* ── Report Content ── */}
            <Grid container spacing={3}>
              {/* Risk Score */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper elevation={0} sx={{
                  height: '100%', background: riskGradient, color: 'white', borderRadius: 3,
                  position: 'relative', overflow: 'hidden', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-4px)' }
                }}>
                  <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.12 }}>
                    {isHighRisk ? <WarningIcon sx={{ fontSize: 160 }} /> : <CheckCircleIcon sx={{ fontSize: 160 }} />}
                  </Box>
                  <Box sx={{ textAlign: 'center', py: 5, px: 3, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'inline-flex', p: 1.5, bgcolor: 'rgba(255,255,255,0.18)', borderRadius: '50%', mb: 2 }}>
                      {isHighRisk ? <WarningIcon fontSize="large" /> : <CheckCircleIcon fontSize="large" />}
                    </Box>
                    <Typography variant="h2" fontWeight={900} sx={{ textShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>{riskScore}%</Typography>
                    <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5, opacity: 0.9 }}>{riskLabel}</Typography>
                    <Typography variant="body2" sx={{ mt: 1.5, opacity: 0.75, maxWidth: '85%', mx: 'auto', lineHeight: 1.5 }}>
                      {questionnaireCompleted ? 'Enhanced prediction combining lab analysis + health questionnaire data.' : 'Based on AI analysis of your urine microscopy sample.'}
                    </Typography>
                    {questionnaireCompleted && (
                      <Chip icon={<AutoAwesomeIcon sx={{ fontSize: 13, color: 'white !important' }} />} label="AI + Questionnaire" size="small" sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, fontSize: '0.7rem' }} />
                    )}
                  </Box>
                </Paper>
              </Grid>

              {/* Sediments */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper elevation={0} sx={{ height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Urine Sediments</Typography>
                  <Grid container spacing={1.5}>
                    {sediments.map((item, i) => (
                      <Grid size={{ xs: 6 }} key={i}>
                        <Paper elevation={0} sx={{
                          p: 2, textAlign: 'center', borderRadius: 2.5, bgcolor: alpha(item.color, 0.04),
                          border: '1px solid', borderColor: alpha(item.color, 0.12), transition: 'all 0.2s',
                          '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${alpha(item.color, 0.12)}` }
                        }}>
                          <Box sx={{ color: item.color, mb: 0.8, opacity: 0.8 }}>{React.cloneElement(item.icon, { sx: { fontSize: 20 } })}</Box>
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

              {/* Microscopy Image */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper elevation={0} sx={{ height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle1" fontWeight={700}>Microscopy Analysis</Typography>
                    <Typography variant="caption" color="text.secondary">AI-detected sediments with bounding boxes</Typography>
                  </Box>
                  {imageUrl ? (
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1.5, bgcolor: '#000' }}>
                      <Box sx={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
                        <img
                          ref={imgRef}
                          src={imageUrl}
                          alt="Microscopy"
                          onLoad={drawBoxes}
                          style={{ maxWidth: '100%', maxHeight: 240, objectFit: 'contain', borderRadius: 8, display: 'block' }}
                        />
                        <canvas
                          ref={canvasRef}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            pointerEvents: 'none',
                            borderRadius: 8,
                          }}
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
                      <Typography variant="body2" color="text.disabled">No microscopy image available</Typography>
                    </Box>
                  )}
                  <Box sx={{ px: 3, py: 1, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                    {[
                      { label: 'WBC', color: '#9c27b0' },
                      { label: 'RBC', color: '#f44336' },
                      { label: 'Crystal', color: '#2196f3' },
                      { label: 'Cast', color: '#4caf50' },
                      { label: 'Yeast', color: '#ff9800' },
                    ].map((item) => (
                      <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: 1, bgcolor: item.color }} />
                        <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Box sx={{ px: 3, py: 1.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">Total detections</Typography>
                    <Chip label={`${totalDetections} objects`} size="small" sx={{ fontWeight: 700, fontSize: '0.68rem', height: 20, bgcolor: alpha('#00bcd4', 0.08), color: '#00bcd4' }} />
                  </Box>
                </Paper>
              </Grid>

              {/* Chemical Analysis */}
              {report.chemicalParameters && (
                <Grid size={{ xs: 12 }}>
                  <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ px: 3, py: 2, background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', color: 'white' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700}>Chemical Analysis Report</Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>Urine full report parameters</Typography>
                        </Box>
                        <Chip label="Lab Verified" size="small" sx={{ bgcolor: alpha('#66bb6a', 0.2), color: '#a5d6a7', fontWeight: 700, fontSize: '0.7rem', border: '1px solid', borderColor: alpha('#66bb6a', 0.3) }} />
                      </Box>
                    </Box>
                    <Table size="small">
                      <TableBody>
                        {[
                          { label: 'Colour', value: report.chemicalParameters.colour },
                          { label: 'Appearance', value: report.chemicalParameters.appearance },
                          { label: 'S.G. (Refractometer)', value: report.chemicalParameters.specificGravity },
                          { label: 'pH', value: report.chemicalParameters.pH },
                          { label: 'Protein', value: report.chemicalParameters.protein },
                          { label: 'Glucose', value: report.chemicalParameters.glucose },
                          { label: 'Ketone Bodies', value: report.chemicalParameters.ketoneBodies },
                          { label: 'Bilirubin', value: report.chemicalParameters.bilirubin },
                          { label: 'Nitrite', value: report.chemicalParameters.nitrite },
                          { label: 'Urobilinogen', value: report.chemicalParameters.urobilinogen },
                          { label: 'Blood (Occult)', value: report.chemicalParameters.blood },
                        ].map((row, i) => {
                          const isAbnormal = (() => {
                            const v = row.value;
                            if (['Protein', 'Glucose', 'Ketone Bodies', 'Bilirubin'].includes(row.label) || row.label.includes('Blood')) return v !== 'Nil';
                            if (row.label === 'Nitrite') return v === 'Positive';
                            if (row.label === 'Urobilinogen') return v === 'Elevated';
                            return false;
                          })();
                          return (
                            <TableRow key={i} sx={{ '&:last-child td': { borderBottom: 0 }, bgcolor: isAbnormal ? alpha('#ef5350', 0.04) : 'transparent' }}>
                              <TableCell sx={{ pl: 3, py: 1.2, width: '45%', fontWeight: 600, fontSize: '0.82rem', color: 'text.secondary' }}>{row.label}</TableCell>
                              <TableCell sx={{ py: 1.2, fontWeight: 700, fontSize: '0.85rem', color: isAbnormal ? '#ef5350' : 'text.primary' }}>
                                {row.value || '—'}
                                {isAbnormal && <Chip label="Abnormal" size="small" sx={{ ml: 1, height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: alpha('#ef5350', 0.1), color: '#ef5350' }} />}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Paper>
                </Grid>
              )}

              {/* Doctor's Recommendations */}
              <Grid size={{ xs: 12 }}>
                <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 36, height: 36, background: 'linear-gradient(135deg, #0f172a, #1e3a5f)' }}>
                      <LocalHospitalIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight={700}>Doctor's Recommendations</Typography>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, height: '100%', bgcolor: alpha('#2196f3', 0.04), border: '1px solid', borderColor: alpha('#2196f3', 0.12) }}>
                          <Typography variant="caption" fontWeight={700} color="primary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Prescription & Notes</Typography>
                          <Typography variant="body1" sx={{ mt: 1.5, fontWeight: 500, lineHeight: 1.7 }}>Drink plenty of water. Follow up in 3 months.</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>- Dr. Smith (Urologist)</Typography>
                        </Paper>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5, display: 'block' }}>Lifestyle Adjustments</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          {[
                            { icon: <WaterDropIcon />, text: 'Increase daily water intake to 2.5L', color: '#00bcd4' },
                            { icon: <RestaurantIcon />, text: 'Reduce sodium intake (salt)', color: '#ff9100' },
                            { icon: <FitnessCenterIcon />, text: 'Limit oxalate-rich foods', color: '#7c4dff' },
                          ].map((item, i) => (
                            <Paper key={i} elevation={0} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', transition: 'all 0.15s', '&:hover': { borderColor: alpha(item.color, 0.3), bgcolor: alpha(item.color, 0.02) } }}>
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
          </>
        )}
      </Box>
    </Box>
  );
};

export default PatientPortal;
