import React, { useState } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, Snackbar, Alert, Grid, Chip
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import GavelIcon from '@mui/icons-material/Gavel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import MedicationIcon from '@mui/icons-material/Medication';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
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
      await api.submitVerification(report.id, { agreement, notes, prescription });
      setOpenSnackbar(true);
      setTimeout(() => { onVerify(); }, 1500);
    } catch (error) {
      console.error("Verification failed", error);
    } finally {
      setSubmitting(false);
    }
  };

  const options = [
    { value: 'agree', label: 'Agree', subtitle: 'AI diagnosis is accurate', icon: <CheckCircleIcon />, color: '#66bb6a' },
    { value: 'modify', label: 'Modify', subtitle: 'Adjust the diagnosis', icon: <EditIcon />, color: '#ff9100' },
    { value: 'reject', label: 'Reject', subtitle: 'Diagnosis is incorrect', icon: <CancelIcon />, color: '#ef5350' },
  ];

  return (
    <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
      {/* Header */}
      <Box sx={{ 
        px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider',
        display: 'flex', alignItems: 'center', gap: 1.5
      }}>
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha('#7c4dff', 0.08), color: '#7c4dff', display: 'flex' }}>
          <GavelIcon sx={{ fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>Clinical Verification</Typography>
          <Typography variant="caption" color="text.secondary">Review AI diagnosis and provide your clinical assessment</Typography>
        </Box>
      </Box>

      <Box sx={{ p: 3 }}>
        {/* Agreement Selection */}
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5, display: 'block' }}>
          Do you agree with the AI diagnosis?
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {options.map(opt => (
            <Grid size={{ xs: 12, sm: 4 }} key={opt.value}>
              <Paper 
                elevation={0}
                onClick={() => setAgreement(opt.value)}
                sx={{ 
                  p: 2.5, borderRadius: 2.5, cursor: 'pointer', textAlign: 'center',
                  border: '2px solid',
                  borderColor: agreement === opt.value ? opt.color : 'divider',
                  bgcolor: agreement === opt.value ? alpha(opt.color, 0.04) : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: alpha(opt.color, 0.5), bgcolor: alpha(opt.color, 0.02) }
                }}
              >
                <Box sx={{ 
                  width: 44, height: 44, borderRadius: '50%', mx: 'auto', mb: 1.5,
                  bgcolor: agreement === opt.value ? alpha(opt.color, 0.12) : alpha(opt.color, 0.06),
                  color: opt.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {React.cloneElement(opt.icon, { sx: { fontSize: 22 } })}
                </Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: agreement === opt.value ? opt.color : 'text.primary' }}>
                  {opt.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">{opt.subtitle}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Warning for reject */}
        {agreement === 'reject' && (
          <Paper elevation={0} sx={{ 
            p: 2, mb: 3, borderRadius: 2, bgcolor: alpha('#ef5350', 0.04),
            border: '1px solid', borderColor: alpha('#ef5350', 0.15),
            display: 'flex', alignItems: 'center', gap: 1.5
          }}>
            <WarningAmberIcon sx={{ color: '#ef5350', fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">
              <strong style={{ color: '#ef5350' }}>Important:</strong> Rejecting the AI diagnosis requires detailed clinical notes explaining the reason.
            </Typography>
          </Paper>
        )}

        {/* Clinical Notes */}
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <NoteAltIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Clinical Notes
            </Typography>
          </Box>
          <TextField
            fullWidth multiline rows={3}
            placeholder="Add your clinical observations, diagnosis modifications, or rejection reasons..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Box>

        {/* Prescription */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <MedicationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Prescription / Recommendations
            </Typography>
          </Box>
          <TextField
            fullWidth multiline rows={2}
            placeholder="Recommend follow-up tests, medications, or patient instructions..."
            value={prescription}
            onChange={(e) => setPrescription(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Box>

        {/* Submit */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, color: 'text.secondary' }}>
            Save Draft
          </Button>
          <Button
            variant="contained"
            startIcon={<GavelIcon />}
            onClick={handleSubmit}
            disabled={submitting}
            sx={{
              textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 4,
              background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
              boxShadow: '0 4px 14px rgba(15,23,42,0.25)',
            }}
          >
            {submitting ? 'Submitting...' : 'Verify & Sign Report'}
          </Button>
        </Box>
      </Box>

      <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={() => setOpenSnackbar(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" variant="filled" icon={<CheckCircleIcon />} sx={{ fontWeight: 600, borderRadius: 2, width: '100%' }}>
          Report verified and signed successfully!
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default VerificationPanel;
