import React, { useState } from 'react';
import {
  Box, Paper, Typography, Button, Grid, TextField, MenuItem, Divider, Chip, Avatar
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ScienceIcon from '@mui/icons-material/Science';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpacityIcon from '@mui/icons-material/Opacity';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import BiotechIcon from '@mui/icons-material/Biotech';
import PersonIcon from '@mui/icons-material/Person';

const SELECT_OPTIONS = {
  colour: ['Pale Yellow', 'Yellow', 'Dark Yellow', 'Amber', 'Red', 'Brown'],
  appearance: ['Clear', 'Slightly Turbid', 'Turbid', 'Cloudy'],
  protein: ['Nil', 'Trace', '1+', '2+', '3+', '4+'],
  glucose: ['Nil', 'Trace', '1+', '2+', '3+', '4+'],
  ketoneBodies: ['Nil', 'Trace', '1+', '2+', '3+'],
  bilirubin: ['Nil', '1+', '2+', '3+'],
  nitrite: ['Nil', 'Positive'],
  urobilinogen: ['Normal Amounts', 'Elevated'],
  blood: ['Nil', 'Trace', '1+', '2+', '3+'],
};

const INITIAL_VALUES = {
  colour: 'Pale Yellow',
  appearance: 'Clear',
  specificGravity: '',
  pH: '',
  protein: 'Nil',
  glucose: 'Nil',
  ketoneBodies: 'Nil',
  bilirubin: 'Nil',
  nitrite: 'Nil',
  urobilinogen: 'Normal Amounts',
  blood: 'Nil',
};

const FIELD_CONFIG = [
  { key: 'colour', label: 'Colour', type: 'select', icon: <ColorLensIcon sx={{ fontSize: 16 }} /> },
  { key: 'appearance', label: 'Appearance', type: 'select', icon: <OpacityIcon sx={{ fontSize: 16 }} /> },
  { key: 'specificGravity', label: 'S.G. (Refractometer)', type: 'number', min: 1.001, max: 1.035, step: 0.001, icon: <BiotechIcon sx={{ fontSize: 16 }} /> },
  { key: 'pH', label: 'pH', type: 'number', min: 4.5, max: 8.5, step: 0.1, icon: <ScienceIcon sx={{ fontSize: 16 }} /> },
  { key: 'protein', label: 'Protein', type: 'select', icon: <BiotechIcon sx={{ fontSize: 16 }} /> },
  { key: 'glucose', label: 'Glucose', type: 'select', icon: <BiotechIcon sx={{ fontSize: 16 }} /> },
  { key: 'ketoneBodies', label: 'Ketone Bodies', type: 'select', icon: <BiotechIcon sx={{ fontSize: 16 }} /> },
  { key: 'bilirubin', label: 'Bilirubin', type: 'select', icon: <BiotechIcon sx={{ fontSize: 16 }} /> },
  { key: 'nitrite', label: 'Nitrite', type: 'select', icon: <BiotechIcon sx={{ fontSize: 16 }} /> },
  { key: 'urobilinogen', label: 'Urobilinogen', type: 'select', icon: <BiotechIcon sx={{ fontSize: 16 }} /> },
  { key: 'blood', label: 'Blood (Occult)', type: 'select', icon: <OpacityIcon sx={{ fontSize: 16 }} /> },
];

const ChemicalParametersForm = ({ patient, onSubmit, onBack, initialData }) => {
  const [values, setValues] = useState({ ...INITIAL_VALUES, ...initialData });
  const [errors, setErrors] = useState({});

  const handleChange = (key) => (e) => {
    setValues({ ...values, [key]: e.target.value });
    if (errors[key]) setErrors({ ...errors, [key]: null });
  };

  const validate = () => {
    const newErrors = {};
    if (!values.specificGravity) newErrors.specificGravity = 'Required';
    else if (values.specificGravity < 1.001 || values.specificGravity > 1.035) newErrors.specificGravity = '1.001–1.035';
    if (!values.pH) newErrors.pH = 'Required';
    else if (values.pH < 4.5 || values.pH > 8.5) newErrors.pH = '4.5–8.5';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSubmit(values);
  };

  const isAbnormal = (key, val) => {
    if (key === 'protein' || key === 'glucose' || key === 'ketoneBodies' || key === 'bilirubin' || key === 'blood') return val !== 'Nil';
    if (key === 'nitrite') return val === 'Positive';
    if (key === 'urobilinogen') return val === 'Elevated';
    if (key === 'pH') return val && (parseFloat(val) < 5.0 || parseFloat(val) > 7.5);
    if (key === 'specificGravity') return val && (parseFloat(val) < 1.005 || parseFloat(val) > 1.030);
    if (key === 'colour') return !['Pale Yellow', 'Yellow'].includes(val);
    if (key === 'appearance') return val !== 'Clear';
    return false;
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.4s ease-out' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <ScienceIcon sx={{ color: '#00bcd4', fontSize: 28 }} />
            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: -0.5 }}>
              Chemical Analysis
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Enter urine chemical test parameters from the dipstick / refractometer analysis
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {onBack && (
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
              sx={{
                textTransform: 'none', fontWeight: 600, borderRadius: 2,
                borderColor: alpha('#0f172a', 0.2), color: '#0f172a',
                '&:hover': { borderColor: '#0f172a', bgcolor: alpha('#0f172a', 0.04) }
              }}
            >
              Back to Analysis
            </Button>
          )}
        </Box>
      </Box>

      {/* Patient Info */}
      {patient && (
        <Paper elevation={0} sx={{ p: 1.5, mb: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: alpha('#00bcd4', 0.1), color: '#00bcd4' }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>{patient.name}</Typography>
            <Typography variant="caption" color="text.secondary">ID: {patient.patientId}</Typography>
          </Box>
          <Chip label="Chemical Analysis" size="small" sx={{ ml: 'auto', bgcolor: alpha('#00bcd4', 0.08), color: '#00bcd4', fontWeight: 700, fontSize: '0.7rem' }} />
        </Paper>
      )}

      {/* Form */}
      <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        {/* Form Header */}
        <Box sx={{ px: 3, py: 2, background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', color: 'white' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>Urine Full Report</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>Chemical examination parameters</Typography>
            </Box>
            <Chip
              label="Manual Entry"
              size="small"
              sx={{
                bgcolor: alpha('#ff9800', 0.2), color: '#ffcc80', fontWeight: 700, fontSize: '0.7rem',
                border: '1px solid', borderColor: alpha('#ff9800', 0.3)
              }}
            />
          </Box>
        </Box>

        {/* Form Fields */}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2.5}>
            {FIELD_CONFIG.map((field) => {
              const abnormal = isAbnormal(field.key, values[field.key]);
              return (
                <Grid size={{ xs: 12, sm: 6 }} key={field.key}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                    <Box sx={{
                      p: 0.5, borderRadius: 1, display: 'flex',
                      bgcolor: abnormal ? alpha('#ef5350', 0.1) : alpha('#00bcd4', 0.08),
                      color: abnormal ? '#ef5350' : '#00bcd4'
                    }}>
                      {field.icon}
                    </Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {field.label}
                    </Typography>
                    {abnormal && (
                      <Chip label="Abnormal" size="small" sx={{
                        height: 18, fontSize: '0.6rem', fontWeight: 700, ml: 'auto',
                        bgcolor: alpha('#ef5350', 0.1), color: '#ef5350',
                        border: '1px solid', borderColor: alpha('#ef5350', 0.2)
                      }} />
                    )}
                  </Box>
                  {field.type === 'select' ? (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      value={values[field.key]}
                      onChange={handleChange(field.key)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          borderColor: abnormal ? '#ef5350' : undefined,
                          '& fieldset': abnormal ? { borderColor: alpha('#ef5350', 0.4) } : {},
                        }
                      }}
                    >
                      {SELECT_OPTIONS[field.key].map((opt) => (
                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                      ))}
                    </TextField>
                  ) : (
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={values[field.key]}
                      onChange={handleChange(field.key)}
                      error={!!errors[field.key]}
                      helperText={errors[field.key]}
                      inputProps={{ min: field.min, max: field.max, step: field.step }}
                      placeholder={`${field.min} – ${field.max}`}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          borderColor: abnormal ? '#ef5350' : undefined,
                          '& fieldset': abnormal ? { borderColor: alpha('#ef5350', 0.4) } : {},
                        }
                      }}
                    />
                  )}
                </Grid>
              );
            })}
          </Grid>
        </Box>

        <Divider />

        {/* Footer */}
        <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {Object.entries(values).filter(([k, v]) => isAbnormal(k, v)).length > 0
              ? <Chip label={`${Object.entries(values).filter(([k, v]) => isAbnormal(k, v)).length} abnormal value(s)`} size="small" sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700, bgcolor: alpha('#ef5350', 0.1), color: '#ef5350' }} />
              : <Chip label="All values normal" size="small" sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700, bgcolor: alpha('#66bb6a', 0.1), color: '#66bb6a' }} />
            }
          </Typography>
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={handleSubmit}
            sx={{
              textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 4,
              background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
              boxShadow: '0 4px 14px rgba(15,23,42,0.3)',
              '&:hover': { background: 'linear-gradient(135deg, #1e293b, #2d4a6f)' }
            }}
          >
            Save & View Report
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChemicalParametersForm;
