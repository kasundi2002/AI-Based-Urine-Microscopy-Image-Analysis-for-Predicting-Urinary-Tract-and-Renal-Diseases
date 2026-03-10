import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, CircularProgress, Alert, Stepper, Step, StepLabel } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const steps = ['Access Link', 'Identity Verification', 'OTP Verification', 'Portal'];

const PatientOTP = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { setPatientToken } = useAuth();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  // Redirect if no state (arrived directly)
  useEffect(() => {
    if (!state?.token) {
      navigate('/login');
    }
  }, [state, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // max 1 digit per box
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newOtp = [...otp];
      pasted.split('').forEach((digit, i) => { newOtp[i] = digit; });
      setOtp(newOtp);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/patient-access/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: state.token, otp: otpString }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        // Store patient JWT and navigate to portal
        setPatientToken(data.token);
        // Also store patient info for portal use
        localStorage.setItem('patientInfo', JSON.stringify(data.patient));
        navigate('/patient-portal');
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
        <Stepper activeStep={2} alternativeLabel sx={{ mb: 3 }}>
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
                <EmailIcon sx={{ fontSize: 22, color: '#00bcd4' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700} color="white">
                  Enter Your OTP
                </Typography>
                <Typography variant="caption" sx={{ color: alpha('#fff', 0.5) }}>
                  A 6-digit code was sent to your registered email address
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Card Body */}
          <Box sx={{ px: 4, py: 3 }}>
            <Box component="form" onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2, fontSize: '0.85rem' }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              <Typography variant="body2" sx={{ color: alpha('#fff', 0.6), mb: 3.5, lineHeight: 1.6, textAlign: 'center' }}>
                Please enter the 6-digit One-Time Password sent to your email address. This code expires in{' '}
                <span style={{ color: '#00bcd4', fontWeight: 700 }}>10 minutes</span>.
              </Typography>

              {/* OTP Input Grid */}
              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', mb: 3.5 }} onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <TextField
                    key={index}
                    inputRef={(el) => (inputRefs.current[index] = el)}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    inputProps={{ maxLength: 1, style: { textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, padding: '12px 0' } }}
                    sx={{
                      width: 56, height: 64,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2, color: 'white', height: 64,
                        '& fieldset': { borderColor: digit ? '#00bcd4' : alpha('#fff', 0.15), borderWidth: digit ? 2 : 1 },
                        '&:hover fieldset': { borderColor: alpha('#00bcd4', 0.5) },
                        '&.Mui-focused fieldset': { borderColor: '#00bcd4', borderWidth: 2 },
                        background: digit ? alpha('#00bcd4', 0.08) : 'transparent',
                      },
                    }}
                  />
                ))}
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || otp.join('').length < 6}
                startIcon={!loading && otp.join('').length === 6 ? <CheckCircleOutlineIcon /> : null}
                sx={{
                  py: 1.5, borderRadius: 2.5, fontWeight: 700, fontSize: '0.95rem',
                  background: otp.join('').length === 6
                    ? 'linear-gradient(135deg, #00bcd4, #0097a7)'
                    : alpha('#00bcd4', 0.3),
                  boxShadow: otp.join('').length === 6 ? '0 8px 24px rgba(0,188,212,0.35)' : 'none',
                  textTransform: 'none',
                  '&:hover': { background: 'linear-gradient(135deg, #00acc1, #00838f)' },
                  transition: 'all 0.25s',
                }}
              >
                {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Verify & Access Portal'}
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2.5 }}>
                <Typography variant="caption" sx={{ color: alpha('#fff', 0.4) }}>
                  Didn't receive the code?{' '}
                </Typography>
                <Typography
                  component="span"
                  variant="caption"
                  sx={{
                    color: resendCooldown > 0 ? alpha('#00bcd4', 0.4) : '#00bcd4',
                    fontWeight: 600, cursor: resendCooldown > 0 ? 'default' : 'pointer',
                    '&:hover': resendCooldown === 0 ? { textDecoration: 'underline' } : {},
                  }}
                  onClick={() => {
                    if (resendCooldown === 0) {
                      setResendCooldown(30);
                      setOtp(['', '', '', '', '', '']);
                      // Could call verify-identity again, but requires going back to step 1
                      alert('Please go back and re-enter your Patient ID and mobile number to receive a new OTP.');
                    }
                  }}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </Typography>
              </Box>
            </Box>
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

export default PatientOTP;
