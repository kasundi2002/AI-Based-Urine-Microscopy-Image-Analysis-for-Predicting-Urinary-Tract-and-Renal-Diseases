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
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Age"
              type="number"
              value={formData.age}
              onChange={handleChange('age')}
              margin="normal"
            />
            <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">Gender</FormLabel>
              <RadioGroup row value={formData.gender} onChange={handleChange('gender')}>
                <FormControlLabel value="male" control={<Radio />} label="Male" />
                <FormControlLabel value="female" control={<Radio />} label="Female" />
              </RadioGroup>
            </FormControl>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>Pain Level (0-10)</Typography>
            <TextField
              fullWidth
              type="number"
              inputProps={{ min: 0, max: 10 }}
              value={formData.painLevel}
              onChange={handleChange('painLevel')}
              margin="normal"
            />
            <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">Family History of Kidney Stones?</FormLabel>
              <RadioGroup row value={formData.history} onChange={handleChange('history')}>
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
             <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">Daily Water Intake</FormLabel>
              <RadioGroup value={formData.hydration} onChange={handleChange('hydration')}>
                <FormControlLabel value="low" control={<Radio />} label="Low (< 1L)" />
                <FormControlLabel value="adequate" control={<Radio />} label="Adequate (1-2L)" />
                <FormControlLabel value="high" control={<Radio />} label="High (> 2L)" />
              </RadioGroup>
            </FormControl>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom align="center">Health Questionnaire</Typography>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Box sx={{ minHeight: 200 }}>
        {getStepContent(activeStep)}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        {activeStep !== 0 && (
          <Button onClick={handleBack} sx={{ mr: 1 }}>
            Back
          </Button>
        )}
        <Button variant="contained" onClick={handleNext}>
          {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
        </Button>
      </Box>
    </Paper>
  );
};

export default Questionnaire;
