import React, { useState } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, FormControl, FormLabel, 
  RadioGroup, FormControlLabel, Radio, Stepper, Step, StepLabel 
} from '@mui/material';

const steps = ['Basic Info', 'Symptoms', 'Lifestyle'];

const Questionnaire = ({ onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    painLevel: '0',
    hydration: 'adequate',
    history: 'no'
  });

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      onComplete(formData);
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Personal Details</Typography>
            <TextField
              fullWidth
              label="Age"
              type="number"
              variant="filled"
              value={formData.age}
              onChange={handleChange('age')}
              margin="normal"
              sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}
            />
            <FormControl component="fieldset" margin="normal" sx={{ mt: 3, display: 'block' }}>
              <FormLabel component="legend" sx={{ mb: 1, color: 'text.primary' }}>Gender</FormLabel>
              <RadioGroup row value={formData.gender} onChange={handleChange('gender')}>
                <FormControlLabel value="male" control={<Radio color="primary" />} label="Male" sx={{ mr: 4 }} />
                <FormControlLabel value="female" control={<Radio color="primary" />} label="Female" />
              </RadioGroup>
            </FormControl>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Symptoms Assessment</Typography>
            <Typography gutterBottom color="text.secondary" sx={{ mt: 2 }}>Current Pain Level (0 = No Pain, 10 = Severe)</Typography>
            <TextField
              fullWidth
              type="number"
              variant="filled"
              inputProps={{ min: 0, max: 10 }}
              value={formData.painLevel}
              onChange={handleChange('painLevel')}
              margin="normal"
              sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}
            />
            <FormControl component="fieldset" margin="normal" sx={{ mt: 3, display: 'block' }}>
              <FormLabel component="legend" sx={{ mb: 1, color: 'text.primary' }}>Family History of Kidney Stones?</FormLabel>
              <RadioGroup row value={formData.history} onChange={handleChange('history')}>
                <FormControlLabel value="yes" control={<Radio color="primary" />} label="Yes" sx={{ mr: 4 }} />
                <FormControlLabel value="no" control={<Radio color="primary" />} label="No" />
              </RadioGroup>
            </FormControl>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Lifestyle & Habits</Typography>
             <FormControl component="fieldset" margin="normal" sx={{ mt: 2, display: 'block' }}>
              <FormLabel component="legend" sx={{ mb: 1, color: 'text.primary' }}>Daily Water Intake</FormLabel>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'transparent', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <RadioGroup value={formData.hydration} onChange={handleChange('hydration')}>
                    <FormControlLabel value="low" control={<Radio color="primary" />} label="Low (< 1L)" sx={{ mb: 1 }} />
                    <FormControlLabel value="adequate" control={<Radio color="primary" />} label="Adequate (1-2L)" sx={{ mb: 1 }} />
                    <FormControlLabel value="high" control={<Radio color="primary" />} label="High (> 2L)" />
                  </RadioGroup>
              </Paper>
            </FormControl>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Paper sx={{ p: 5, maxWidth: 700, mx: 'auto', borderRadius: 4 }}>
      <Typography variant="h5" align="center" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
          Health Questionnaire
      </Typography>
      
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Box sx={{ minHeight: 300 }}>
        {getStepContent(activeStep)}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, pt: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        {activeStep !== 0 && (
          <Button onClick={handleBack} sx={{ mr: 2, px: 3 }}>
            Back
          </Button>
        )}
        <Button variant="contained" size="large" onClick={handleNext} sx={{ px: 4 }}>
          {activeStep === steps.length - 1 ? 'Submit Analysis' : 'Next Step'}
        </Button>
      </Box>
    </Paper>
  );
};

export default Questionnaire;
