import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, CircularProgress, Alert, InputAdornment, Stepper, Step, StepLabel } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useSearchParams, useNavigate } from 'react-router-dom';
import BadgeIcon from '@mui/icons-material/Badge';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';

const steps = ['Access Link', 'Identity Verification', 'OTP Verification', 'Portal'];

const PatientVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [patientId, setPatientId] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId.trim() || !mobile.trim()) {
      setError('Please enter both your Patient ID and mobile number.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/patient-access/verify-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, patientId: patientId.trim(), mobile: mobile.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Verification failed. Please check your details.');
      } else {
        // Pass token & patientId to OTP page via state
        navigate('/patient-otp', { state: { token, patientId: patientId.trim() } });
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0f4c75 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      p: 2, position: 'relative', overflow: 'hidden'
    }}>
      {/* Background decorations */}
      <Box sx={{ position: 'absolute', top: -120, right: -120, width: 500, height: 500, borderRadius: '50%', background: alpha('#00bcd4', 0.05), pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 350, height: 350, borderRadius: '50%', background: alpha('#7c4dff', 0.05), pointerEvents: 'none' }} />

      <Box sx={{ width: '100%', maxWidth: 520 }}>
        {/* Logo / Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{
            display: 'inline-flex', p: 2, borderRadius: 3,
            background: alpha('#00bcd4', 0.15), border: '1px solid', borderColor: alpha('#00bcd4', 0.3), mb: 2
          }}>
            <SecurityIcon sx={{ fontSize: 36, color: '#00bcd4' }} />
          </Box>
          <Typography variant="h4" fontWeight={800} color="white" sx={{ letterSpacing: -0.5 }}>
            UroAI Patient Portal
          </Typography>
          <Typography variant="body2" sx={{ color: alpha('#fff', 0.55), mt: 0.5 }}>
            Secure Identity Verification
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={1} alternativeLabel sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': { color: alpha('#fff', 0.45), fontSize: '0.7rem' },
                  '& .MuiStepLabel-label.Mui-active': { color: '#00bcd4', fontWeight: 700 },
                  '& .MuiStepLabel-label.Mui-completed': { color: alpha('#fff', 0.7) },
                  '& .MuiStepIcon-root': { color: alpha('#fff', 0.2) },
                  '& .MuiStepIcon-root.Mui-active': { color: '#00bcd4' },
                  '& .MuiStepIcon-root.Mui-completed': { color: '#66bb6a' },
                }}
              >{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Card */}
        <Paper elevation={0} sx={{
          borderRadius: 4, overflow: 'hidden',
          background: alpha('#fff', 0.04),
          border: '1px solid', borderColor: alpha('#fff', 0.1),
          backdropFilter: 'blur(20px)',
        }}>
          {/* Card Header */}
          <Box sx={{ px: 4, pt: 4, pb: 3, borderBottom: '1px solid', borderColor: alpha('#fff', 0.08) }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha('#00bcd4', 0.15), display: 'flex' }}>
                <VerifiedUserIcon sx={{ fontSize: 22, color: '#00bcd4' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700} color="white">
                  Verify Your Identity
                </Typography>
                <Typography variant="caption" sx={{ color: alpha('#fff', 0.5) }}>
                  Enter your Patient ID and registered mobile number
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Card Body */}
          <Box sx={{ px: 4, py: 3 }}>
            {!tokenValid ? (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                This access link is missing or invalid. Please request a new link from your laboratory.
              </Alert>
            ) : (
              <Box component="form" onSubmit={handleSubmit}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2, fontSize: '0.85rem' }} onClose={() => setError('')}>
                    {error}
                  </Alert>
                )}

                <Typography variant="body2" sx={{ color: alpha('#fff', 0.6), mb: 3, lineHeight: 1.6 }}>
                  Please enter the details provided to your laboratory during registration to verify your identity and access your results.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    label="Patient ID"
                    placeholder="e.g. P01"
                    fullWidth
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon sx={{ fontSize: 20, color: alpha('#fff', 0.4) }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2, color: 'white',
                        '& fieldset': { borderColor: alpha('#fff', 0.15) },
                        '&:hover fieldset': { borderColor: alpha('#00bcd4', 0.5) },
                        '&.Mui-focused fieldset': { borderColor: '#00bcd4' },
                      },
                      '& .MuiInputLabel-root': { color: alpha('#fff', 0.5) },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#00bcd4' },
                    }}
                  />

                  <TextField
                    label="Mobile Number"
                    placeholder="e.g. +94 77 123 4567"
                    fullWidth
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneAndroidIcon sx={{ fontSize: 20, color: alpha('#fff', 0.4) }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2, color: 'white',
                        '& fieldset': { borderColor: alpha('#fff', 0.15) },
                        '&:hover fieldset': { borderColor: alpha('#00bcd4', 0.5) },
                        '&.Mui-focused fieldset': { borderColor: '#00bcd4' },
                      },
                      '& .MuiInputLabel-root': { color: alpha('#fff', 0.5) },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#00bcd4' },
                    }}
                  />
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    mt: 3.5, py: 1.5, borderRadius: 2.5, fontWeight: 700, fontSize: '0.95rem',
                    background: 'linear-gradient(135deg, #00bcd4, #0097a7)',
                    boxShadow: '0 8px 24px rgba(0,188,212,0.35)',
                    textTransform: 'none',
                    '&:hover': { background: 'linear-gradient(135deg, #00acc1, #00838f)', boxShadow: '0 8px 24px rgba(0,188,212,0.5)' },
                    '&:disabled': { background: alpha('#00bcd4', 0.3) }
                  }}
                >
                  {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Verify Identity →'}
                </Button>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Security notice */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 3 }}>
          <LockIcon sx={{ fontSize: 14, color: alpha('#fff', 0.3) }} />
          <Typography variant="caption" sx={{ color: alpha('#fff', 0.3) }}>
            End-to-end encrypted · Your data is protected
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PatientVerification;
