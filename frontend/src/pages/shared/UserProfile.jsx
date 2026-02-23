import React, { useState } from 'react';
import {
  Box, Typography, Paper, Grid, Avatar, Button, TextField, Divider, Chip,
  Card, CardContent, Switch, FormControlLabel, IconButton, Alert
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import WorkIcon from '@mui/icons-material/Work';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LanguageIcon from '@mui/icons-material/Language';
import ShieldIcon from '@mui/icons-material/Shield';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ScienceIcon from '@mui/icons-material/Science';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../../context/AuthContext';

const roleConfig = {
  MLT: {
    label: 'Medical Lab Technician',
    color: '#00bcd4',
    icon: <ScienceIcon />,
    department: 'Pathology Lab',
    specialization: 'Urine Microscopy Analysis',
  },
  CLINICIAN: {
    label: 'Clinician / Doctor',
    color: '#7c4dff',
    icon: <LocalHospitalIcon />,
    department: 'Nephrology',
    specialization: 'Renal & Urinary Diseases',
  },
  PATIENT: {
    label: 'Patient',
    color: '#2196f3',
    icon: <PersonIcon />,
    department: 'Outpatient',
    specialization: 'N/A',
  }
};

const UserProfile = () => {
  const { user } = useAuth();
  const role = roleConfig[user?.role] || roleConfig.PATIENT;
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || 'Sarah Tech',
    email: `${(user?.name || 'sarah').toLowerCase().replace(/\s/g, '.')}@uroai.health`,
    phone: '+94 77 123 4567',
    employeeId: user?.id || 'MLT-001',
    location: 'Colombo, Sri Lanka',
    joinDate: 'Jan 15, 2024',
    bio: 'Experienced medical professional specializing in urine microscopy analysis and AI-assisted diagnostics.',
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    darkMode: false,
    twoFactor: false,
  });

  const handleSave = () => {
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChange = (field) => (e) => {
    setProfile({ ...profile, [field]: e.target.value });
  };

  const stats = user?.role === 'MLT' 
    ? [
        { label: 'Samples Analyzed', value: '1,247', color: '#00bcd4' },
        { label: 'Reports Submitted', value: '1,189', color: '#66bb6a' },
        { label: 'This Month', value: '145', color: '#ff9100' },
      ]
    : user?.role === 'CLINICIAN'
    ? [
        { label: 'Patients Reviewed', value: '856', color: '#7c4dff' },
        { label: 'Reports Signed', value: '823', color: '#66bb6a' },
        { label: 'This Month', value: '67', color: '#ff9100' },
      ]
    : [
        { label: 'Tests Taken', value: '12', color: '#2196f3' },
        { label: 'Reports Available', value: '10', color: '#66bb6a' },
        { label: 'Next Checkup', value: 'Mar 15', color: '#ff9100' },
      ];

  return (
    <Box sx={{ animation: 'fadeIn 0.4s ease-out', maxWidth: 1100, mx: 'auto' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {saved && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          Profile updated successfully!
        </Alert>
      )}

      {/* Profile Header Card */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4, overflow: 'hidden', mb: 3,
          border: '1px solid', borderColor: 'divider',
        }}
      >
        {/* Banner */}
        <Box sx={{
          height: 140,
          background: `linear-gradient(135deg, ${role.color}22, ${role.color}08)`,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
            opacity: 0.85,
          }
        }}>
          {/* Decorative circles */}
          <Box sx={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', border: `1px solid ${alpha('#fff', 0.05)}` }} />
          <Box sx={{ position: 'absolute', top: 20, right: 60, width: 120, height: 120, borderRadius: '50%', border: `1px solid ${alpha('#fff', 0.03)}` }} />
        </Box>

        {/* Profile Info */}
        <Box sx={{ px: 4, pb: 4, mt: -8, position: 'relative' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 3 }}>
              <Avatar
                sx={{
                  width: 110, height: 110,
                  bgcolor: role.color,
                  border: '4px solid white',
                  boxShadow: `0 4px 20px ${alpha(role.color, 0.3)}`,
                  fontSize: '2.5rem', fontWeight: 800,
                }}
              >
                {profile.name.charAt(0)}
              </Avatar>
              <Box sx={{ mb: 1 }}>
                <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -0.5 }}>
                  {profile.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                  <Chip
                    icon={role.icon}
                    label={role.label}
                    size="small"
                    sx={{
                      bgcolor: alpha(role.color, 0.1), color: role.color,
                      fontWeight: 700, fontSize: '0.75rem',
                      border: '1px solid', borderColor: alpha(role.color, 0.2),
                      '& .MuiChip-icon': { color: role.color },
                    }}
                  />
                  <Chip
                    icon={<VerifiedUserIcon sx={{ fontSize: 14 }} />}
                    label="Verified"
                    size="small"
                    sx={{
                      bgcolor: alpha('#66bb6a', 0.1), color: '#66bb6a',
                      fontWeight: 600, fontSize: '0.7rem',
                      border: '1px solid', borderColor: alpha('#66bb6a', 0.2),
                      '& .MuiChip-icon': { color: '#66bb6a' },
                    }}
                  />
                </Box>
              </Box>
            </Box>
            <Button
              variant={editing ? 'contained' : 'outlined'}
              startIcon={editing ? <SaveIcon /> : <EditIcon />}
              onClick={editing ? handleSave : () => setEditing(true)}
              sx={{
                textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 3, mb: 1,
                ...(editing ? {
                  background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
                } : {
                  borderColor: alpha('#0f172a', 0.2),
                  color: '#0f172a',
                }),
              }}
            >
              {editing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </Box>

          {/* Stats Row */}
          <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
            {stats.map((s, i) => (
              <Paper
                key={i}
                elevation={0}
                sx={{
                  px: 3, py: 2, borderRadius: 3, flex: 1, minWidth: 140,
                  border: '1px solid', borderColor: 'divider',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={600}>{s.label}</Typography>
                <Typography variant="h5" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Content Grid */}
      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <BadgeIcon sx={{ color: role.color, fontSize: 20 }} />
              <Typography variant="subtitle1" fontWeight={700}>Personal Information</Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <AccountCircleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" fontWeight={600} color="text.secondary">Full Name</Typography>
                  </Box>
                  {editing ? (
                    <TextField fullWidth size="small" value={profile.name} onChange={handleChange('name')} variant="outlined" />
                  ) : (
                    <Typography variant="body1" fontWeight={500}>{profile.name}</Typography>
                  )}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" fontWeight={600} color="text.secondary">Email Address</Typography>
                  </Box>
                  {editing ? (
                    <TextField fullWidth size="small" value={profile.email} onChange={handleChange('email')} variant="outlined" />
                  ) : (
                    <Typography variant="body1" fontWeight={500}>{profile.email}</Typography>
                  )}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" fontWeight={600} color="text.secondary">Phone Number</Typography>
                  </Box>
                  {editing ? (
                    <TextField fullWidth size="small" value={profile.phone} onChange={handleChange('phone')} variant="outlined" />
                  ) : (
                    <Typography variant="body1" fontWeight={500}>{profile.phone}</Typography>
                  )}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" fontWeight={600} color="text.secondary">Location</Typography>
                  </Box>
                  {editing ? (
                    <TextField fullWidth size="small" value={profile.location} onChange={handleChange('location')} variant="outlined" />
                  ) : (
                    <Typography variant="body1" fontWeight={500}>{profile.location}</Typography>
                  )}
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <WorkIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" fontWeight={600} color="text.secondary">Bio</Typography>
                  </Box>
                  {editing ? (
                    <TextField fullWidth multiline rows={3} size="small" value={profile.bio} onChange={handleChange('bio')} variant="outlined" />
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{profile.bio}</Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Professional Details */}
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden', mt: 3 }}>
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <WorkIcon sx={{ color: role.color, fontSize: 20 }} />
              <Typography variant="subtitle1" fontWeight={700}>Professional Details</Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {[
                  { icon: <BadgeIcon sx={{ fontSize: 16 }} />, label: 'Employee ID', value: profile.employeeId },
                  { icon: <WorkIcon sx={{ fontSize: 16 }} />, label: 'Department', value: role.department },
                  { icon: <ScienceIcon sx={{ fontSize: 16 }} />, label: 'Specialization', value: role.specialization },
                  { icon: <CalendarTodayIcon sx={{ fontSize: 16 }} />, label: 'Joined', value: profile.joinDate },
                ].map((item, i) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={i}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Box sx={{ color: 'text.secondary' }}>{item.icon}</Box>
                      <Typography variant="caption" fontWeight={600} color="text.secondary">{item.label}</Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={500}>{item.value}</Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Right Sidebar - Settings */}
        <Grid size={{ xs: 12, md: 5 }}>
          {/* Preferences */}
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <SecurityIcon sx={{ color: role.color, fontSize: 20 }} />
              <Typography variant="subtitle1" fontWeight={700}>Preferences</Typography>
            </Box>
            <Box sx={{ p: 1 }}>
              {[
                { icon: <NotificationsIcon />, label: 'Email Notifications', desc: 'Receive reports via email', key: 'emailNotifications' },
                { icon: <NotificationsIcon />, label: 'Push Notifications', desc: 'Browser push alerts', key: 'pushNotifications' },
                { icon: <DarkModeIcon />, label: 'Dark Mode', desc: 'Switch to dark theme', key: 'darkMode' },
                { icon: <ShieldIcon />, label: 'Two-Factor Auth', desc: 'Extra security layer', key: 'twoFactor' },
              ].map((s, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    px: 2, py: 1.5, borderRadius: 2, mx: 1, my: 0.5,
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: alpha(role.color, 0.03) },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: alpha(role.color, 0.08), color: role.color, display: 'flex' }}>
                      {React.cloneElement(s.icon, { sx: { fontSize: 18 } })}
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{s.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{s.desc}</Typography>
                    </Box>
                  </Box>
                  <Switch
                    checked={settings[s.key]}
                    onChange={(e) => setSettings({ ...settings, [s.key]: e.target.checked })}
                    size="small"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: role.color },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: role.color },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Quick Actions */}
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden', mt: 3 }}>
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <LanguageIcon sx={{ color: role.color, fontSize: 20 }} />
              <Typography variant="subtitle1" fontWeight={700}>Quick Actions</Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              <Button fullWidth variant="outlined" sx={{ mb: 1.5, textTransform: 'none', justifyContent: 'flex-start', fontWeight: 600, borderRadius: 2, borderColor: 'divider', color: 'text.primary', py: 1.2 }}>
                🔑 Change Password
              </Button>
              <Button fullWidth variant="outlined" sx={{ mb: 1.5, textTransform: 'none', justifyContent: 'flex-start', fontWeight: 600, borderRadius: 2, borderColor: 'divider', color: 'text.primary', py: 1.2 }}>
                📄 Download My Data
              </Button>
              <Button fullWidth variant="outlined" sx={{ textTransform: 'none', justifyContent: 'flex-start', fontWeight: 600, borderRadius: 2, borderColor: alpha('#ef5350', 0.3), color: '#ef5350', py: 1.2 }}>
                🗑️ Delete Account
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserProfile;
