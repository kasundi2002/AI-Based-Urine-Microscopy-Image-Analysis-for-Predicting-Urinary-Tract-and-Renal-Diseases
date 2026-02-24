import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, 
  Alert, CircularProgress, Paper, InputAdornment, Chip
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import LoginIcon from '@mui/icons-material/Login';
import BiotechIcon from '@mui/icons-material/Biotech';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import BadgeIcon from '@mui/icons-material/Badge';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('mlt_user');
  const [password, setPassword] = useState('password');
  const [role, setRole] = useState('MLT');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await api.login(username, password);
      if (user.role !== role) {
        const demoUser = {
          'MLT': { username: 'mlt_user', password: 'password' },
          'CLINICIAN': { username: 'doc_user', password: 'password' },
          'PATIENT': { username: 'pat_user', password: 'password' }
        }[role];
        const realUser = await api.login(demoUser.username, demoUser.password);
        login(realUser);
      } else {
        login(user);
      }
      if (role === 'MLT') navigate('/mlt-dashboard');
      else if (role === 'CLINICIAN') navigate('/clinician-dashboard');
      else if (role === 'PATIENT') navigate('/patient-portal');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <BiotechIcon />, title: 'AI-Powered Analysis', desc: 'Advanced microscopy image analysis with deep learning' },
    { icon: <SpeedIcon />, title: 'Instant Risk Scoring', desc: 'Real-time urinary tract and renal disease risk assessment' },
    { icon: <SecurityIcon />, title: 'Clinical Verification', desc: 'Multi-tier verification workflow for diagnostic accuracy' },
  ];

  return (
    <Box sx={{ 
      height: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    }}>
      {/* Left Panel — Branding */}
      <Box sx={{ 
        flex: 1, display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0f1e 0%, #0f172a 40%, #1e3a5f 100%)',
        position: 'relative', overflow: 'hidden', p: 8
      }}>
        {/* Background decorations */}
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', bgcolor: alpha('#00bcd4', 0.03) }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, borderRadius: '50%', bgcolor: alpha('#7c4dff', 0.04) }} />
        <Box sx={{ position: 'absolute', top: '50%', right: -150, width: 500, height: 1, bgcolor: alpha('#00bcd4', 0.06), transform: 'rotate(-30deg)' }} />
        <Box sx={{ position: 'absolute', top: '30%', right: -100, width: 400, height: 1, bgcolor: alpha('#00bcd4', 0.04), transform: 'rotate(-30deg)' }} />

        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
          {/* Logo */}
          <Typography sx={{ color: '#00bcd4', fontWeight: 900, fontSize: '2.5rem', letterSpacing: -1, mb: 0.5 }}>
            Uro.AI
          </Typography>
          <Typography variant="caption" sx={{ color: alpha('#fff', 0.4), fontSize: '0.7rem', letterSpacing: 2, textTransform: 'uppercase', mb: 4, display: 'block' }}>
            Diagnostics Platform
          </Typography>

          <Typography variant="h3" sx={{ color: '#fff', fontWeight: 800, lineHeight: 1.15, mb: 2, letterSpacing: -0.5 }}>
            Intelligent Urinary
            <br />
            <span style={{ color: '#00bcd4' }}>Disease Detection</span>
          </Typography>

          <Typography variant="body1" sx={{ color: alpha('#fff', 0.5), lineHeight: 1.7, mb: 5, maxWidth: 400 }}>
            AI-powered urine microscopy analysis platform for predicting urinary tract and renal diseases with clinical-grade accuracy.
          </Typography>

          {/* Feature cards */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {features.map((f, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ 
                  p: 1, borderRadius: 2, bgcolor: alpha('#00bcd4', 0.08), color: '#00bcd4',
                  display: 'flex', flexShrink: 0, mt: 0.3
                }}>
                  {React.cloneElement(f.icon, { sx: { fontSize: 18 } })}
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700, mb: 0.3 }}>{f.title}</Typography>
                  <Typography variant="caption" sx={{ color: alpha('#fff', 0.4), lineHeight: 1.4 }}>{f.desc}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Bottom text */}
        <Box sx={{ position: 'absolute', bottom: 40, left: 64 }}>
          <Typography variant="caption" sx={{ color: alpha('#fff', 0.2), fontSize: '0.65rem' }}>
            © 2026 Uro.AI Diagnostics · Research Project
          </Typography>
        </Box>
      </Box>

      {/* Right Panel — Login Form */}
      <Box sx={{ 
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4,
        maxWidth: { md: 520 }
      }}>
        <Box sx={{ width: '100%', maxWidth: 380 }}>
          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 4, textAlign: 'center' }}>
            <Typography sx={{ color: '#00bcd4', fontWeight: 900, fontSize: '2rem', letterSpacing: -1 }}>Uro.AI</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', letterSpacing: 1.5, textTransform: 'uppercase' }}>Diagnostics</Typography>
          </Box>

          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -0.5, mb: 0.5, color: '#0f172a' }}>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Sign in to access your diagnostic workspace
          </Typography>

          {error && (
            <Alert severity="error" variant="outlined" sx={{ mb: 3, borderRadius: 2, fontSize: '0.85rem' }}>{error}</Alert>
          )}

          <form onSubmit={handleLogin}>
            {/* Role selector */}
            <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, mb: 1, display: 'block' }}>
              Select Role
            </Typography>
            <FormControl fullWidth sx={{ mb: 2.5 }}>
              <Select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  if (e.target.value === 'MLT') setUsername('mlt_user');
                  if (e.target.value === 'CLINICIAN') setUsername('doc_user');
                  if (e.target.value === 'PATIENT') setUsername('pat_user');
                }}
                startAdornment={
                  <InputAdornment position="start">
                    <BadgeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                }
                sx={{ 
                  borderRadius: 2.5, bgcolor: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha('#0f172a', 0.1) },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha('#00bcd4', 0.4) },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00bcd4' },
                }}
              >
                <MenuItem value="MLT">Medical Lab Technician</MenuItem>
                <MenuItem value="CLINICIAN">Clinician / Doctor</MenuItem>
                <MenuItem value="PATIENT">Patient</MenuItem>
              </Select>
            </FormControl>

            {/* Username */}
            <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, mb: 1, display: 'block' }}>
              Username
            </Typography>
            <TextField
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 2.5,
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2.5, bgcolor: '#fff',
                  '& fieldset': { borderColor: alpha('#0f172a', 0.1) },
                }
              }}
            />
            
            {/* Password */}
            <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, mb: 1, display: 'block' }}>
              Password
            </Typography>
            <TextField
              fullWidth
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 1,
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2.5, bgcolor: '#fff',
                  '& fieldset': { borderColor: alpha('#0f172a', 0.1) },
                }
              }}
            />

            {/* Remember & Forgot */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <Typography variant="caption" sx={{ color: '#00bcd4', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                Forgot password?
              </Typography>
            </Box>

            {/* Submit */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading}
              startIcon={loading ? null : <LoginIcon />}
              sx={{ 
                py: 1.5, borderRadius: 2.5, fontWeight: 700, fontSize: '0.95rem',
                textTransform: 'none', letterSpacing: 0,
                background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
                boxShadow: '0 4px 20px rgba(15,23,42,0.3)',
                transition: 'all 0.2s',
                '&:hover': { 
                  boxShadow: '0 8px 30px rgba(15,23,42,0.4)',
                  transform: 'translateY(-1px)' 
                }
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Sign In'}
            </Button>
          </form>

          {/* Demo hint */}
          <Paper elevation={0} sx={{ 
            mt: 3, p: 2, borderRadius: 2.5, textAlign: 'center',
            bgcolor: alpha('#00bcd4', 0.04),
            border: '1px solid', borderColor: alpha('#00bcd4', 0.1)
          }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Demo mode — select a role and click Sign In to explore
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
