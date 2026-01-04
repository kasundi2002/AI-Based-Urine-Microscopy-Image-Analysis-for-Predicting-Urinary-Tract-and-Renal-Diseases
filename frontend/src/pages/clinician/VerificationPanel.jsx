import React, { useState } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, FormControlLabel, Checkbox, 
  Radio, RadioGroup, FormControl, FormLabel, Snackbar, Alert 
} from '@mui/material';
import { api } from '../../services/api';

const VerificationPanel = ({ report, onVerify }) => {
  const [agreement, setAgreement] = useState('agree');
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.submitVerification(report.id, {
        agreement,
        notes,
        prescription
      });
      setOpenSnackbar(true);
      setTimeout(() => {
        onVerify();
      }, 1500);
    } catch (error) {
      console.error("Verification failed", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Clinical Verification</Typography>
      
      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <FormLabel component="legend">Do you agree with the AI diagnosis?</FormLabel>
        <RadioGroup
          row
          value={agreement}
          onChange={(e) => setAgreement(e.target.value)}
        >
          <FormControlLabel value="agree" control={<Radio />} label="Yes, Agree" />
          <FormControlLabel value="modify" control={<Radio />} label="Modify Diagnosis" />
          <FormControlLabel value="reject" control={<Radio />} label="Reject" />
        </RadioGroup>
      </FormControl>

      <TextField
        fullWidth
        multiline
        rows={3}
        label="Clinical Notes / Diagnosis Modification"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        margin="normal"
      />

      <TextField
        fullWidth
        multiline
        rows={2}
        label="Prescription / Recommendations"
        value={prescription}
        onChange={(e) => setPrescription(e.target.value)}
        margin="normal"
      />

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Verify & Sign Report'}
        </Button>
      </Box>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
          Report verified successfully!
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default VerificationPanel;
