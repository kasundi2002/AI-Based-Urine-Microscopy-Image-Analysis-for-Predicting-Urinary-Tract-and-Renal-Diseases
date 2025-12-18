import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Card, CardContent, Typography, Button, TextField, 
  FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Pre-filled for demo convenience
  const [username, setUsername] = useState('mlt_user');
  const [password, setPassword] = useState('password');
  const [role, setRole] = useState('MLT');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await api.login(username, password);
      // In a real app, the backend would verify the role. Here we just check if the user matches the selected role for demo flow.
      if (user.role !== role) {
          // Allow login but warn or switch? For now, let's just force the user to pick the right user for the right role demo
          // Actually, let's just switch the user based on the dropdown for the demo to make it easy
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
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: 'background.default',
        backgroundImage: 'radial-gradient(circle at 50% 50%, #132f4c 0%, #0a1929 100%)'
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', mx: 2, p: 2 }}>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            AI Diagnostics
          </Typography>
          <Typography variant="body1" gutterBottom align="center" color="text.secondary" sx={{ mb: 4 }}>
            Secure Access Portal
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleLogin}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-select-label">Select Role</InputLabel>
              <Select
                labelId="role-select-label"
                value={role}
                label="Select Role"
                onChange={(e) => {
                    setRole(e.target.value);
                    // Auto-fill for demo
                    if (e.target.value === 'MLT') setUsername('mlt_user');
                    if (e.target.value === 'CLINICIAN') setUsername('doc_user');
                    if (e.target.value === 'PATIENT') setUsername('pat_user');
                }}
              >
                <MenuItem value="MLT">Medical Lab Technician</MenuItem>
                <MenuItem value="CLINICIAN">Clinician / Doctor</MenuItem>
                <MenuItem value="PATIENT">Patient</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Username"
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled
            />
            
            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
