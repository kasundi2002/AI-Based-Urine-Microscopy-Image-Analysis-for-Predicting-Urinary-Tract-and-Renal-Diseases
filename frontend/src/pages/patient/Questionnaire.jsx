import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, FormControl, FormLabel, 
  RadioGroup, FormControlLabel, Radio, Stepper, Step, StepLabel, StepConnector, Chip, Grid,
  LinearProgress
} from '@mui/material';
import { alpha, styled, keyframes } from '@mui/material/styles';
import ScienceIcon from '@mui/icons-material/Science';
import PersonIcon from '@mui/icons-material/Person';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import BiotechIcon from '@mui/icons-material/Biotech';
import VerifiedIcon from '@mui/icons-material/Verified';

// Animations
const pulse = keyframes`0%,100%{transform:scale(1);opacity:0.8}50%{transform:scale(1.1);opacity:1}`;
const rotate = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;
const fadeUp = keyframes`from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}`;
const scan = keyframes`0%{width:0%}100%{width:100%}`;
const float = keyframes`0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}`;
const dotPulse = keyframes`0%,80%,100%{opacity:0.3}40%{opacity:1}`;

const processingPhases = [
  { icon: <QueryStatsIcon />, label: 'Analyzing questionnaire responses...' },
  { icon: <BiotechIcon />, label: 'Correlating with lab sediment data...' },
  { icon: <PsychologyIcon />, label: 'Running AI risk prediction model...' },
  { icon: <VerifiedIcon />, label: 'Generating enhanced risk assessment...' },
];

const steps = ['Basic Info', 'UTI Symptoms', 'Lifestyle', 'Urinary Health'];
const stepIcons = [<PersonIcon />, <MonitorHeartIcon />, <RestaurantIcon />, <WaterDropIcon />];

const CustomStepIcon = ({ active, completed, icon }) => {
  const idx = parseInt(icon) - 1;
  return (
    <Box sx={{
      width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: completed ? 'linear-gradient(135deg, #66bb6a, #2e7d32)' : active ? 'linear-gradient(135deg, #0f172a, #1e3a5f)' : alpha('#9e9e9e', 0.1),
      color: completed || active ? 'white' : '#9e9e9e',
      transition: 'all 0.3s',
      boxShadow: active ? '0 4px 14px rgba(15,23,42,0.3)' : 'none',
    }}>
      {completed ? <CheckCircleIcon sx={{ fontSize: 18 }} /> : React.cloneElement(stepIcons[idx], { sx: { fontSize: 18 } })}
    </Box>
  );
};

const Questionnaire = ({ onComplete, patientDetails, reportId }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Basic info
    age: '',
    gender: 'male',
    
    // UTI-specific clinical fields (Dataset 1)
    dysuria: 'no',
    abd_pain: '0',
    fever: 'no',
    polyuria: 'no',
    
    // UTI-specific clinical fields (Dataset 2)
    temperature: '',
    nausea: 'no',
    lumbar_pain: 'no',
    urine_pushing: 'no',
    micturition_pain: 'no',
    urethral_burning: 'no',
    
    // Keep existing fields for other diseases
    hydration: 'adequate',
    history: 'no',
    diet: 'normal',
    medication: 'no',
    urinaryFrequency: 'normal',
    bloodInUrine: 'no',
    burning: 'no',
    painLevel: '0',
  });

  // AI loading animation phases & form submission
  useEffect(() => {
    if (answers.q2 !== 'Female' && answers.q3 !== 'No') {
      setAnswers((prev) => ({ ...prev, q3: 'No' }));
    }
  }, [answers.q2, answers.q3]);

  useEffect(() => {
    if (!submitting) return undefined;

    let cancelled = false;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 2;
        return next > 100 ? 100 : next;
      });
    }, 70);

    const submitAsync = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      try {
        if (reportId) {
          const token = localStorage.getItem('patientToken') || localStorage.getItem('token');
          await fetch(`http://localhost:5000/api/reports/${reportId}/submit-questionnaire`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(answers),
          });
        }
      } catch (err) {
        console.error('Questionnaire backend submission failed:', err);
      }

      if (!cancelled) {
        clearInterval(interval);
        setProgress(100);
        onComplete(answers);
      }
    };

    submitAsync();

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [submitting, onComplete, answers, reportId]);

  const visibleQuestions = (sectionIndex) => {
    return (questionsBySection[sectionIndex] || []).filter((q) => {
      if (!q.condition) return true;
      return q.condition(answers);
    });
  };

  const validateStep = () => {
    const missing = visibleQuestions(activeStep).filter((q) => {
      const key = `q${q.id}`;
      const value = answers[key];
      if (q.type === 'number') return value === '' || value === null;
      return !value;
    });

    if (missing.length > 0) {
      setError(`Please answer all questions in ${SECTION_TITLES[activeStep]}.`);
      return false;
    }

    if (activeStep === 0) {
      const age = parseInt(answers.q1, 10);
      if (Number.isNaN(age) || age <= 0 || age > 120) {
        setError('Please enter a valid age (1-120).');
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) { setSubmitting(true); } 
    else { setActiveStep(prev => prev + 1); }
  };
  const handleBack = () => setActiveStep(prev => prev - 1);
  const handleChange = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  const RadioCard = ({ value, label, currentValue, onChange }) => (
    <Paper
      elevation={0}
      onClick={() => onChange({ target: { value } })}
      sx={{
        p: 2, borderRadius: 2.5, cursor: 'pointer', textAlign: 'center',
        border: '2px solid', borderColor: currentValue === value ? '#00bcd4' : 'divider',
        bgcolor: currentValue === value ? alpha('#00bcd4', 0.04) : 'transparent',
        transition: 'all 0.2s',
        '&:hover': { borderColor: alpha('#00bcd4', 0.5) }
      }}
    >
      <Radio checked={currentValue === value} size="small" sx={{ p: 0, mb: 0.5, color: currentValue === value ? '#00bcd4' : 'text.disabled' }} />
      <Typography variant="body2" fontWeight={currentValue === value ? 700 : 500} sx={{ color: currentValue === value ? '#00bcd4' : 'text.primary' }}>
        {label}
      </Typography>
    </Paper>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Personal Details</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This helps calibrate the risk prediction model for your demographic.
            </Typography>
            <TextField
              fullWidth label="Age" type="number" variant="outlined"
              value={formData.age} onChange={handleChange('age')}
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5, display: 'block' }}>
              Gender
            </Typography>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6 }}><RadioCard value="male" label="Male" currentValue={formData.gender} onChange={handleChange('gender')} /></Grid>
              <Grid size={{ xs: 6 }}><RadioCard value="female" label="Female" currentValue={formData.gender} onChange={handleChange('gender')} /></Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>UTI Symptoms Assessment</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Current symptoms help identify potential UTI patterns.
            </Typography>

            {/* Fever */}
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5, display: 'block' }}>
              Do you have a fever?
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6 }}><RadioCard value="yes" label="Yes" currentValue={formData.fever} onChange={handleChange('fever')} /></Grid>
              <Grid size={{ xs: 6 }}><RadioCard value="no" label="No" currentValue={formData.fever} onChange={handleChange('fever')} /></Grid>
            </Grid>

            {/* Temperature */}
            {formData.fever === 'yes' && (
              <TextField
                fullWidth label="Temperature (°C)" type="number" variant="outlined" placeholder="e.g. 38.5"
                value={formData.temperature} onChange={handleChange('temperature')}
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            )}

            {/* Abdominal Pain */}
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1, display: 'block' }}>
              Abdominal Pain Level (0–10)
            </Typography>
            <TextField
              fullWidth type="number" inputProps={{ min: 0, max: 10 }}
              value={formData.abd_pain} onChange={handleChange('abd_pain')}
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            {/* Lumbar/Lower Back Pain */}
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5, display: 'block' }}>
              Lumbar/Lower Back Pain?
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6 }}><RadioCard value="yes" label="Yes" currentValue={formData.lumbar_pain} onChange={handleChange('lumbar_pain')} /></Grid>
              <Grid size={{ xs: 6 }}><RadioCard value="no" label="No" currentValue={formData.lumbar_pain} onChange={handleChange('lumbar_pain')} /></Grid>
            </Grid>

            {/* Nausea */}
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5, display: 'block' }}>
              Nausea or Vomiting?
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6 }}><RadioCard value="yes" label="Yes" currentValue={formData.nausea} onChange={handleChange('nausea')} /></Grid>
              <Grid size={{ xs: 6 }}><RadioCard value="no" label="No" currentValue={formData.nausea} onChange={handleChange('nausea')} /></Grid>
            </Grid>

            {/* Dysuria */}
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5, display: 'block' }}>
              Difficulty Urinating (Dysuria)?
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6 }}><RadioCard value="yes" label="Yes" currentValue={formData.dysuria} onChange={handleChange('dysuria')} /></Grid>
              <Grid size={{ xs: 6 }}><RadioCard value="no" label="No" currentValue={formData.dysuria} onChange={handleChange('dysuria')} /></Grid>
            </Grid>

            {/* Urinary Urgency */}
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5, display: 'block' }}>
              Urinary Urgency (Pressure to urinate)?
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6 }}><RadioCard value="yes" label="Yes" currentValue={formData.urine_pushing} onChange={handleChange('urine_pushing')} /></Grid>
              <Grid size={{ xs: 6 }}><RadioCard value="no" label="No" currentValue={formData.urine_pushing} onChange={handleChange('urine_pushing')} /></Grid>
            </Grid>

            {/* Micturition Pain */}
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5, display: 'block' }}>
              Pain During Urination (Micturition pain)?
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6 }}><RadioCard value="yes" label="Yes" currentValue={formData.micturition_pain} onChange={handleChange('micturition_pain')} /></Grid>
              <Grid size={{ xs: 6 }}><RadioCard value="no" label="No" currentValue={formData.micturition_pain} onChange={handleChange('micturition_pain')} /></Grid>
            </Grid>

            {/* Urethral Burning */}
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5, display: 'block' }}>
              Burning Sensation During Urination?
            </Typography>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6 }}><RadioCard value="yes" label="Yes" currentValue={formData.urethral_burning} onChange={handleChange('urethral_burning')} /></Grid>
              <Grid size={{ xs: 6 }}><RadioCard value="no" label="No" currentValue={formData.urethral_burning} onChange={handleChange('urethral_burning')} /></Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Lifestyle & Medical History</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Lifestyle factors and medical history play a significant role in urinary tract health.
            </Typography>

            {/* Family History */}
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5, display: 'block' }}>
              Family History of Kidney Stones / UTI?
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6 }}><RadioCard value="yes" label="Yes" currentValue={formData.history} onChange={handleChange('history')} /></Grid>
              <Grid size={{ xs: 6 }}><RadioCard value="no" label="No" currentValue={formData.history} onChange={handleChange('history')} /></Grid>
            </Grid>

            {/* Currently on Medication */}
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5, display: 'block' }}>
              Currently on medication?
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6 }}><RadioCard value="yes" label="Yes" currentValue={formData.medication} onChange={handleChange('medication')} /></Grid>
              <Grid size={{ xs: 6 }}><RadioCard value="no" label="No" currentValue={formData.medication} onChange={handleChange('medication')} /></Grid>
            </Grid>

            {/* Daily Water Intake */}
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5, display: 'block' }}>
              Daily Water Intake
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              <Grid size={{ xs: 4 }}><RadioCard value="low" label="Low (< 1L)" currentValue={formData.hydration} onChange={handleChange('hydration')} /></Grid>
              <Grid size={{ xs: 4 }}><RadioCard value="adequate" label="Adequate (1-2L)" currentValue={formData.hydration} onChange={handleChange('hydration')} /></Grid>
              <Grid size={{ xs: 4 }}><RadioCard value="high" label="High (> 2L)" currentValue={formData.hydration} onChange={handleChange('hydration')} /></Grid>
            </Grid>

            {/* Dietary Habits */}
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5, display: 'block' }}>
              Dietary Habits
            </Typography>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6 }}><RadioCard value="normal" label="Balanced diet" currentValue={formData.diet} onChange={handleChange('diet')} /></Grid>
              <Grid size={{ xs: 6 }}><RadioCard value="high_salt" label="High salt intake" currentValue={formData.diet} onChange={handleChange('diet')} /></Grid>
              <Grid size={{ xs: 6 }}><RadioCard value="high_oxalate" label="High oxalate foods" currentValue={formData.diet} onChange={handleChange('diet')} /></Grid>
              <Grid size={{ xs: 6 }}><RadioCard value="high_protein" label="High protein diet" currentValue={formData.diet} onChange={handleChange('diet')} /></Grid>
            </Grid>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Urinary Health</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              These symptoms are directly correlated with urinary tract and renal conditions.
            </Typography>

            {/* Urinary Frequency */}
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5, display: 'block' }}>
              Urinary Frequency
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              <Grid size={{ xs: 4 }}><RadioCard value="normal" label="Normal" currentValue={formData.urinaryFrequency} onChange={handleChange('urinaryFrequency')} /></Grid>
              <Grid size={{ xs: 4 }}><RadioCard value="frequent" label="Frequent" currentValue={formData.urinaryFrequency} onChange={handleChange('urinaryFrequency')} /></Grid>
              <Grid size={{ xs: 4 }}><RadioCard value="reduced" label="Reduced" currentValue={formData.urinaryFrequency} onChange={handleChange('urinaryFrequency')} /></Grid>
            </Grid>

            {/* Excessive Urination */}
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5, display: 'block' }}>
              Excessive/Polyuria (Unable to retain urine)?
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6 }}><RadioCard value="yes" label="Yes" currentValue={formData.polyuria} onChange={handleChange('polyuria')} /></Grid>
              <Grid size={{ xs: 6 }}><RadioCard value="no" label="No" currentValue={formData.polyuria} onChange={handleChange('polyuria')} /></Grid>
            </Grid>

            {/* Blood in Urine */}
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5, display: 'block' }}>
              Blood in Urine (Haematuria)?
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6 }}><RadioCard value="yes" label="Yes" currentValue={formData.bloodInUrine} onChange={handleChange('bloodInUrine')} /></Grid>
              <Grid size={{ xs: 6 }}><RadioCard value="no" label="No" currentValue={formData.bloodInUrine} onChange={handleChange('bloodInUrine')} /></Grid>
            </Grid>

            {/* General Pain */}
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1, display: 'block' }}>
              Current Pain Level (0–10)
            </Typography>
            <TextField
              fullWidth type="number" inputProps={{ min: 0, max: 10 }}
              value={formData.painLevel} onChange={handleChange('painLevel')}
              sx={{ mb: 0, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Box>
        );
      default: return null;
    }
  };

  // AI Loading Animation Screen
  if (submitting) {
    return (
      <Paper elevation={0} sx={{ maxWidth: 700, mx: 'auto', borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ 
          background: 'linear-gradient(135deg, #0a0f1e 0%, #0f172a 40%, #1e3a5f 100%)',
          color: 'white', py: 8, px: 4, textAlign: 'center', position: 'relative', overflow: 'hidden', minHeight: 500,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          {/* Background animated circles */}
          {[...Array(3)].map((_, i) => (
            <Box key={i} sx={{
              position: 'absolute', borderRadius: '50%',
              border: '1px solid', borderColor: alpha('#00bcd4', 0.06 + i * 0.02),
              width: 200 + i * 120, height: 200 + i * 120,
              top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              animation: `${rotate} ${20 + i * 10}s linear infinite`,
              '&::after': {
                content: '""', position: 'absolute', width: 6, height: 6, borderRadius: '50%',
                bgcolor: alpha('#00bcd4', 0.3 - i * 0.08), top: 0, left: '50%', transform: 'translateX(-50%)',
              }
            }} />
          ))}

          {/* Central brain icon */}
          <Box sx={{ position: 'relative', zIndex: 1, mb: 4 }}>
            <Box sx={{
              width: 90, height: 90, borderRadius: '50%',
              background: `linear-gradient(135deg, ${alpha('#00bcd4', 0.15)}, ${alpha('#7c4dff', 0.1)})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: `${pulse} 2s ease-in-out infinite`,
              border: '2px solid', borderColor: alpha('#00bcd4', 0.2),
              boxShadow: `0 0 40px ${alpha('#00bcd4', 0.15)}, 0 0 80px ${alpha('#00bcd4', 0.05)}`,
            }}>
              <PsychologyIcon sx={{ fontSize: 44, color: '#00bcd4' }} />
            </Box>
            {/* Sparkles */}
            {[0, 1, 2].map(i => (
              <AutoAwesomeIcon key={i} sx={{
                position: 'absolute', fontSize: 14, color: alpha('#00bcd4', 0.5),
                animation: `${float} ${1.5 + i * 0.3}s ease-in-out infinite`,
                animationDelay: `${i * 0.4}s`,
                top: i === 0 ? -5 : i === 1 ? 10 : 60,
                left: i === 0 ? 70 : i === 1 ? -10 : 85,
              }} />
            ))}
          </Box>

          {/* Title */}
          <Typography variant="h5" fontWeight={800} sx={{ mb: 1, animation: `${fadeUp} 0.5s ease-out`, letterSpacing: -0.5 }}>
            AI Processing
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.5, mb: 5, maxWidth: 350 }}>
            Combining your health data with laboratory analysis for an enhanced prediction
          </Typography>

          {/* Progress bar */}
          <Box sx={{ width: '80%', maxWidth: 350, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ color: '#00bcd4', fontWeight: 700 }}>
                Processing
              </Typography>
              <Typography variant="caption" sx={{ color: alpha('#fff', 0.5), fontWeight: 600 }}>
                {Math.min(progress, 100)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(progress, 100)}
              sx={{
                height: 6, borderRadius: 3, bgcolor: alpha('#fff', 0.06),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  background: 'linear-gradient(90deg, #00bcd4, #7c4dff)',
                  boxShadow: `0 0 12px ${alpha('#00bcd4', 0.4)}`,
                }
              }}
            />
          </Box>

          {/* Phase indicators */}
          <Box sx={{ width: '80%', maxWidth: 350 }}>
            {processingPhases.map((phase, i) => (
              <Box key={i} sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, py: 1,
                opacity: i <= currentPhase ? 1 : 0.2,
                transition: 'all 0.5s ease',
                animation: i === currentPhase ? `${fadeUp} 0.4s ease-out` : 'none',
              }}>
                <Box sx={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: i < currentPhase ? alpha('#66bb6a', 0.15) : i === currentPhase ? alpha('#00bcd4', 0.15) : alpha('#fff', 0.04),
                  color: i < currentPhase ? '#66bb6a' : i === currentPhase ? '#00bcd4' : alpha('#fff', 0.3),
                  transition: 'all 0.4s'
                }}>
                  {i < currentPhase ? <CheckCircleIcon sx={{ fontSize: 15 }} /> : React.cloneElement(phase.icon, { sx: { fontSize: 15 } })}
                </Box>
                <Typography variant="caption" sx={{
                  color: i < currentPhase ? '#66bb6a' : i === currentPhase ? '#fff' : alpha('#fff', 0.3),
                  fontWeight: i === currentPhase ? 700 : 500, transition: 'all 0.4s'
                }}>
                  {phase.label}
                  {i === currentPhase && (
                    <Box component="span" sx={{ display: 'inline-flex', ml: 0.5 }}>
                      {[0,1,2].map(d => (
                        <Box key={d} component="span" sx={{
                          width: 3, height: 3, borderRadius: '50%', bgcolor: '#00bcd4', mx: 0.2,
                          animation: `${dotPulse} 1.4s ease-in-out infinite`,
                          animationDelay: `${d * 0.2}s`,
                        }} />
                      ))}
                    </Box>
                  )}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ maxWidth: 700, mx: 'auto', borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
      {/* Header */}
      <Box sx={{ 
        px: 4, py: 3, textAlign: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', color: 'white'
      }}>
        <Box sx={{ display: 'inline-flex', p: 1.5, bgcolor: alpha('#fff', 0.1), borderRadius: '50%', mb: 1.5 }}>
          <ScienceIcon sx={{ fontSize: 28 }} />
        </Box>
        <Typography variant="h5" fontWeight={800}>Health Questionnaire</Typography>
        <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5, maxWidth: 400, mx: 'auto' }}>
          Your responses will be combined with lab analysis to generate an enhanced AI risk prediction.
        </Typography>
      </Box>

      {/* Stepper */}
      <Box sx={{ px: 4, py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stepper activeStep={activeStep} alternativeLabel
          connector={<StepConnector sx={{ '& .MuiStepConnector-line': { borderColor: alpha('#00bcd4', 0.15), borderTopWidth: 2 } }} />}
        >
          {steps.map((label, idx) => (
            <Step key={label} completed={activeStep > idx}>
              <StepLabel StepIconComponent={CustomStepIcon}>
                <Typography variant="caption" fontWeight={activeStep >= idx ? 700 : 500} color={activeStep >= idx ? 'text.primary' : 'text.secondary'}>
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Content */}
      <Box sx={{ px: 4, py: 3, minHeight: 320 }}>
        {getStepContent(activeStep)}
      </Box>

      {/* Footer */}
      <Box sx={{ 
        px: 4, py: 2.5, borderTop: '1px solid', borderColor: 'divider',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <Chip 
          label={`Step ${activeStep + 1} of ${steps.length}`} 
          size="small"
          sx={{ fontWeight: 600, fontSize: '0.7rem', bgcolor: alpha('#00bcd4', 0.06), color: '#00bcd4', height: 24 }}
        />
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {activeStep !== 0 && (
            <Button 
              startIcon={<ArrowBackIcon />}
              onClick={handleBack} 
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, color: 'text.secondary' }}
            >
              Back
            </Button>
          )}
          <Button 
            variant="contained" 
            endIcon={activeStep === steps.length - 1 ? <SendIcon /> : <ArrowForwardIcon />}
            onClick={handleNext}
            sx={{ 
              textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 4,
              background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
              boxShadow: '0 4px 14px rgba(15,23,42,0.25)',
            }}
          >
            {activeStep === steps.length - 1 ? 'Submit & Get Prediction' : 'Next Step'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default Questionnaire;
