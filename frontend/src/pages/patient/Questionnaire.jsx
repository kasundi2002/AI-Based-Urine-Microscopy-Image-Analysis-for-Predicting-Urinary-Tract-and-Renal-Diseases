import React, { useState } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, FormControl, FormLabel, 
  RadioGroup, FormControlLabel, Radio, Stepper, Step, StepLabel, StepConnector, Chip, Grid
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import ScienceIcon from '@mui/icons-material/Science';
import PersonIcon from '@mui/icons-material/Person';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const steps = ['Basic Info', 'Symptoms', 'Lifestyle', 'Urinary Health'];
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

const Questionnaire = ({ onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    age: '', gender: 'male', painLevel: '0', hydration: 'adequate',
    history: 'no', diet: 'normal', medication: 'no',
    urinaryFrequency: 'normal', bloodInUrine: 'no', burning: 'no',
  });

  const handleNext = () => {
    if (activeStep === steps.length - 1) { onComplete(formData); } 
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
            <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Symptoms Assessment</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Current symptoms significantly impact the risk calculation.
            </Typography>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1, display: 'block' }}>
              Current Pain Level (0–10)
            </Typography>
            <TextField
              fullWidth type="number" inputProps={{ min: 0, max: 10 }}
              value={formData.painLevel} onChange={handleChange('painLevel')}
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5, display: 'block' }}>
              Family History of Kidney Stones / UTI?
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6 }}><RadioCard value="yes" label="Yes" currentValue={formData.history} onChange={handleChange('history')} /></Grid>
              <Grid size={{ xs: 6 }}><RadioCard value="no" label="No" currentValue={formData.history} onChange={handleChange('history')} /></Grid>
            </Grid>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5, display: 'block' }}>
              Currently on medication?
            </Typography>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6 }}><RadioCard value="yes" label="Yes" currentValue={formData.medication} onChange={handleChange('medication')} /></Grid>
              <Grid size={{ xs: 6 }}><RadioCard value="no" label="No" currentValue={formData.medication} onChange={handleChange('medication')} /></Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Lifestyle & Habits</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Lifestyle factors play a significant role in urinary tract health.
            </Typography>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5, display: 'block' }}>
              Daily Water Intake
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              <Grid size={{ xs: 4 }}><RadioCard value="low" label="Low (< 1L)" currentValue={formData.hydration} onChange={handleChange('hydration')} /></Grid>
              <Grid size={{ xs: 4 }}><RadioCard value="adequate" label="Adequate (1-2L)" currentValue={formData.hydration} onChange={handleChange('hydration')} /></Grid>
              <Grid size={{ xs: 4 }}><RadioCard value="high" label="High (> 2L)" currentValue={formData.hydration} onChange={handleChange('hydration')} /></Grid>
            </Grid>
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
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5, display: 'block' }}>
              Urinary Frequency
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              <Grid size={{ xs: 4 }}><RadioCard value="normal" label="Normal" currentValue={formData.urinaryFrequency} onChange={handleChange('urinaryFrequency')} /></Grid>
              <Grid size={{ xs: 4 }}><RadioCard value="frequent" label="Frequent" currentValue={formData.urinaryFrequency} onChange={handleChange('urinaryFrequency')} /></Grid>
              <Grid size={{ xs: 4 }}><RadioCard value="reduced" label="Reduced" currentValue={formData.urinaryFrequency} onChange={handleChange('urinaryFrequency')} /></Grid>
            </Grid>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5, display: 'block' }}>
              Blood in urine?
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6 }}><RadioCard value="yes" label="Yes" currentValue={formData.bloodInUrine} onChange={handleChange('bloodInUrine')} /></Grid>
              <Grid size={{ xs: 6 }}><RadioCard value="no" label="No" currentValue={formData.bloodInUrine} onChange={handleChange('bloodInUrine')} /></Grid>
            </Grid>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5, display: 'block' }}>
              Burning sensation during urination?
            </Typography>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6 }}><RadioCard value="yes" label="Yes" currentValue={formData.burning} onChange={handleChange('burning')} /></Grid>
              <Grid size={{ xs: 6 }}><RadioCard value="no" label="No" currentValue={formData.burning} onChange={handleChange('burning')} /></Grid>
            </Grid>
          </Box>
        );
      default: return null;
    }
  };

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
