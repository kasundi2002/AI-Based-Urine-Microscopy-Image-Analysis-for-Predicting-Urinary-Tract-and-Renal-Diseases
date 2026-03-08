import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Typography, Chip, IconButton, Tooltip, Box, Button, Avatar, TextField,
  InputAdornment, Tabs, Tab
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import GavelIcon from '@mui/icons-material/Gavel';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { api } from '../../services/api';

const DoctorPatientQueue = ({ onSelectPatient }) => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const fetchPatients = async () => {
      const data = await api.getPatients();
      setPatients(data);
    };
    fetchPatients();
  }, []);

  const getStatusConfig = (status) => {
    if (status === 'Completed') return { label: 'Reviewed', color: '#66bb6a', icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> };
    if (status === 'Ready for Review') return { label: 'Pending Review', color: '#ff9100', icon: <PendingIcon sx={{ fontSize: 14 }} /> };
    return { label: status, color: '#9e9e9e', icon: null };
  };

  const getRiskConfig = (risk) => {
    switch (risk) {
      case 'High': return { color: '#ef5350', bgcolor: alpha('#ef5350', 0.08), border: alpha('#ef5350', 0.2) };
      case 'Normal': return { color: '#66bb6a', bgcolor: alpha('#66bb6a', 0.08), border: alpha('#66bb6a', 0.2) };
      case 'Pending': return { color: '#00bcd4', bgcolor: alpha('#00bcd4', 0.08), border: alpha('#00bcd4', 0.2) };
      default: return { color: '#9e9e9e', bgcolor: alpha('#9e9e9e', 0.08), border: alpha('#9e9e9e', 0.2) };
    }
  };

  const filtered = patients.filter(p => {
    // Only show patients that have been analyzed (Ready for Review or Completed)
    if (p.status !== 'Ready for Review' && p.status !== 'Completed') return false;
    const matchSearch = !searchTerm || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.patientId || p.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (tab === 1) return matchSearch && p.status === 'Ready for Review';
    if (tab === 2) return matchSearch && p.status === 'Completed';
    return matchSearch;
  });

  return (
    <Box sx={{ animation: 'fadeIn 0.4s ease-out' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <MedicalServicesIcon sx={{ color: '#7c4dff', fontSize: 28 }} />
            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: -0.5 }}>Patient Records</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {patients.length} patients · {patients.filter(p => p.status === 'Ready for Review').length} pending review
          </Typography>
        </Box>
      </Box>

      {/* Search & Tabs */}
      <Paper elevation={0} sx={{ 
        mb: 3, borderRadius: 3, overflow: 'hidden',
        border: '1px solid', borderColor: 'divider',
      }}>
        <Box sx={{ px: 2.5, pt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Button variant="outlined" startIcon={<FilterListIcon />} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, borderColor: 'divider', color: 'text.secondary' }}>
            Filter
          </Button>
        </Box>
        <Tabs 
          value={tab} onChange={(e, v) => setTab(v)} 
          sx={{ 
            px: 2.5, pt: 1,
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 42, fontSize: '0.85rem' },
            '& .MuiTabs-indicator': { bgcolor: '#7c4dff', height: 3, borderRadius: '3px 3px 0 0' }
          }}
        >
          <Tab label={`All (${patients.length})`} />
          <Tab label={`Pending (${patients.filter(p => p.status === 'Ready for Review').length})`} />
          <Tab label={`Reviewed (${patients.filter(p => p.status === 'Completed').length})`} />
        </Tabs>
      </Paper>

      {/* Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha('#f8fafc', 0.5) }}>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase', py: 1.8 }}>Patient</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>Age</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>AI Risk</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((patient) => {
                const risk = getRiskConfig(patient.riskAssessment || 'Normal');
                const status = getStatusConfig(patient.status);
                return (
                  <TableRow 
                    hover key={patient._id || patient.id} 
                    sx={{ 
                      transition: 'all 0.15s',
                      '&:hover': { bgcolor: alpha('#7c4dff', 0.02) },
                      '&:last-child td': { border: 0 }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ 
                          width: 36, height: 36, fontSize: '0.85rem', fontWeight: 700,
                          bgcolor: alpha('#7c4dff', 0.1), color: '#7c4dff'
                        }}>
                          {patient.name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{patient.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{patient.patientId || patient.id}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{patient.age}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarTodayIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                        <Typography variant="body2" color="text.secondary">{patient.dateAssigned ? new Date(patient.dateAssigned).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (patient.date || '-')}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={patient.riskAssessment || 'Normal'} 
                        size="small"
                        sx={{ 
                          bgcolor: risk.bgcolor, color: risk.color, fontWeight: 700, fontSize: '0.7rem',
                          border: '1px solid', borderColor: risk.border, height: 24
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        icon={status.icon}
                        label={status.label} 
                        size="small"
                        sx={{ 
                          bgcolor: alpha(status.color, 0.08), color: status.color, fontWeight: 600, fontSize: '0.65rem',
                          border: '1px solid', borderColor: alpha(status.color, 0.2), height: 24,
                          '& .MuiChip-icon': { color: status.color }
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button 
                        variant="contained" 
                        size="small"
                        startIcon={<GavelIcon sx={{ fontSize: 16 }} />}
                        onClick={() => onSelectPatient(patient)}
                        sx={{ 
                          textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 2.5,
                          fontSize: '0.75rem', height: 32,
                          background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
                          boxShadow: '0 2px 8px rgba(15,23,42,0.2)',
                        }}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default DoctorPatientQueue;
