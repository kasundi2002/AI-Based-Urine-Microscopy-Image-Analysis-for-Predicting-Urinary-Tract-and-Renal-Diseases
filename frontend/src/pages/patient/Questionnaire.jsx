import React, { useState } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, FormControl, FormLabel, 
  RadioGroup, FormControlLabel, Radio, Stepper, Step, StepLabel, Chip 
} from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';

const steps = ['Basic Info', 'Symptoms', 'Lifestyle', 'Urinary Health'];

const Questionnaire = ({ onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    painLevel: '0',
    hydration: 'adequate',
    history: 'no',
    diet: 'normal',
    medication: 'no',
    urinaryFrequency: 'normal',
    bloodInUrine: 'no',
    burning: 'no',
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
            <Typography variant="h6" gutterBottom fontWeight="bold">Personal Details</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This information helps calibrate the risk prediction model for your demographic.
            </Typography>
            <TextField
              fullWidth
              label="Age"
              type="number"
              variant="outlined"
              value={formData.age}
              onChange={handleChange('age')}
              margin="normal"
            />
            <FormControl component="fieldset" margin="normal" sx={{ mt: 3, display: 'block' }}>
              <FormLabel component="legend" sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}>Gender</FormLabel>
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
            <Typography variant="h6" gutterBottom fontWeight="bold">Symptoms Assessment</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Current symptoms significantly impact the risk calculation.
            </Typography>
            <Typography gutterBottom color="text.primary" fontWeight={600} sx={{ mt: 2 }}>Current Pain Level (0 = No Pain, 10 = Severe)</Typography>
            <TextField
              fullWidth
              type="number"
              variant="outlined"
              inputProps={{ min: 0, max: 10 }}
              value={formData.painLevel}
              onChange={handleChange('painLevel')}
              margin="normal"
            />
            <FormControl component="fieldset" margin="normal" sx={{ mt: 3, display: 'block' }}>
              <FormLabel component="legend" sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}>Family History of Kidney Stones / UTI?</FormLabel>
              <RadioGroup row value={formData.history} onChange={handleChange('history')}>
                <FormControlLabel value="yes" control={<Radio color="primary" />} label="Yes" sx={{ mr: 4 }} />
                <FormControlLabel value="no" control={<Radio color="primary" />} label="No" />
              </RadioGroup>
            </FormControl>
            <FormControl component="fieldset" margin="normal" sx={{ mt: 2, display: 'block' }}>
              <FormLabel component="legend" sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}>Are you currently on any medication?</FormLabel>
              <RadioGroup row value={formData.medication} onChange={handleChange('medication')}>
                <FormControlLabel value="yes" control={<Radio color="primary" />} label="Yes" sx={{ mr: 4 }} />
                <FormControlLabel value="no" control={<Radio color="primary" />} label="No" />
              </RadioGroup>
            </FormControl>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">Lifestyle & Habits</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Lifestyle factors play a significant role in urinary tract health.
            </Typography>
             <FormControl component="fieldset" margin="normal" sx={{ mt: 1, display: 'block' }}>
              <FormLabel component="legend" sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}>Daily Water Intake</FormLabel>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'transparent' }}>
                  <RadioGroup value={formData.hydration} onChange={handleChange('hydration')}>
                    <FormControlLabel value="low" control={<Radio color="primary" />} label="Low (< 1L)" sx={{ mb: 1 }} />
                    <FormControlLabel value="adequate" control={<Radio color="primary" />} label="Adequate (1-2L)" sx={{ mb: 1 }} />
                    <FormControlLabel value="high" control={<Radio color="primary" />} label="High (> 2L)" />
                  </RadioGroup>
              </Paper>
            </FormControl>
            <FormControl component="fieldset" margin="normal" sx={{ mt: 3, display: 'block' }}>
              <FormLabel component="legend" sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}>Dietary Habits</FormLabel>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'transparent' }}>
                  <RadioGroup value={formData.diet} onChange={handleChange('diet')}>
                    <FormControlLabel value="normal" control={<Radio color="primary" />} label="Normal / Balanced diet" sx={{ mb: 1 }} />
                    <FormControlLabel value="high_salt" control={<Radio color="primary" />} label="High salt intake" sx={{ mb: 1 }} />
                    <FormControlLabel value="high_oxalate" control={<Radio color="primary" />} label="High oxalate foods (spinach, nuts, chocolate)" sx={{ mb: 1 }} />
                    <FormControlLabel value="high_protein" control={<Radio color="primary" />} label="High protein diet" />
                  </RadioGroup>
              </Paper>
            </FormControl>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">Urinary Health</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              These symptoms are directly correlated with urinary tract and renal conditions.
            </Typography>
            <FormControl component="fieldset" margin="normal" sx={{ mt: 1, display: 'block' }}>
              <FormLabel component="legend" sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}>Urinary Frequency</FormLabel>
              <RadioGroup row value={formData.urinaryFrequency} onChange={handleChange('urinaryFrequency')}>
                <FormControlLabel value="normal" control={<Radio color="primary" />} label="Normal" sx={{ mr: 3 }} />
                <FormControlLabel value="frequent" control={<Radio color="primary" />} label="Frequent" sx={{ mr: 3 }} />
                <FormControlLabel value="reduced" control={<Radio color="primary" />} label="Reduced" />
              </RadioGroup>
            </FormControl>
            <FormControl component="fieldset" margin="normal" sx={{ mt: 3, display: 'block' }}>
              <FormLabel component="legend" sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}>Have you noticed blood in your urine?</FormLabel>
              <RadioGroup row value={formData.bloodInUrine} onChange={handleChange('bloodInUrine')}>
                <FormControlLabel value="yes" control={<Radio color="primary" />} label="Yes" sx={{ mr: 4 }} />
                <FormControlLabel value="no" control={<Radio color="primary" />} label="No" />
              </RadioGroup>
            </FormControl>
            <FormControl component="fieldset" margin="normal" sx={{ mt: 3, display: 'block' }}>
              <FormLabel component="legend" sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}>Do you experience a burning sensation during urination?</FormLabel>
              <RadioGroup row value={formData.burning} onChange={handleChange('burning')}>
                <FormControlLabel value="yes" control={<Radio color="primary" />} label="Yes" sx={{ mr: 4 }} />
                <FormControlLabel value="no" control={<Radio color="primary" />} label="No" />
              </RadioGroup>
            </FormControl>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Paper sx={{ p: 5, maxWidth: 700, mx: 'auto', borderRadius: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
        <ScienceIcon sx={{ color: 'primary.main', mr: 1, fontSize: 28 }} />
        <Typography variant="h5" fontWeight="bold">
            Health Questionnaire
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Your responses will be combined with lab sediment analysis to generate an enhanced AI risk prediction.
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary">
          Step {activeStep + 1} of {steps.length}
        </Typography>
        <Box>
          {activeStep !== 0 && (
            <Button onClick={handleBack} sx={{ mr: 2, px: 3 }}>
              Back
            </Button>
          )}
          <Button variant="contained" size="large" onClick={handleNext} sx={{ px: 4 }}>
            {activeStep === steps.length - 1 ? 'Submit & Get Prediction' : 'Next Step'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default Questionnaire;
