import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Typography, Chip, IconButton, Tooltip, Box, Button, Avatar, TextField,
  InputAdornment
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import FilterListIcon from '@mui/icons-material/FilterList';
import { api } from '../../services/api';

const PatientQueue = ({ onSelectPatient }) => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      const data = await api.getPatients();
      setPatients(data);
    };
    fetchPatients();
  }, []);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Awaiting Analysis': return { color: '#ff9100', bgcolor: alpha('#ff9100', 0.08), border: alpha('#ff9100', 0.2) };
      case 'Ready for Review': return { color: '#2196f3', bgcolor: alpha('#2196f3', 0.08), border: alpha('#2196f3', 0.2) };
      case 'Completed': return { color: '#66bb6a', bgcolor: alpha('#66bb6a', 0.08), border: alpha('#66bb6a', 0.2) };
      default: return { color: '#9e9e9e', bgcolor: alpha('#9e9e9e', 0.08), border: alpha('#9e9e9e', 0.2) };
    }
  };

  const getRiskConfig = (risk) => {
    switch (risk) {
      case 'High': return { color: '#ef5350', bgcolor: alpha('#ef5350', 0.08), border: alpha('#ef5350', 0.2) };
      case 'Normal': return { color: '#66bb6a', bgcolor: alpha('#66bb6a', 0.08), border: alpha('#66bb6a', 0.2) };
      case 'Pending': return { color: '#00bcd4', bgcolor: alpha('#00bcd4', 0.08), border: alpha('#00bcd4', 0.2) };
      default: return { color: '#9e9e9e', bgcolor: alpha('#9e9e9e', 0.08), border: alpha('#9e9e9e', 0.2) };
    }
  };

  const filtered = patients.filter(p => 
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ animation: 'fadeIn 0.4s ease-out' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <PeopleAltIcon sx={{ color: '#00bcd4', fontSize: 28 }} />
            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: -0.5 }}>Patient Management</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {patients.length} patients in queue · {patients.filter(p => p.status === 'Awaiting Analysis').length} awaiting analysis
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          sx={{
            textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3,
            background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
            boxShadow: '0 4px 14px rgba(15,23,42,0.25)',
          }}
        >
          Add Patient
        </Button>
      </Box>

      {/* Search & Filter Bar */}
      <Paper elevation={0} sx={{ 
        p: 2, mb: 3, borderRadius: 3, 
        border: '1px solid', borderColor: 'divider',
        display: 'flex', alignItems: 'center', gap: 2
      }}>
        <TextField
          size="small"
          placeholder="Search by name or patient ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
      </Paper>

      {/* Patient Table */}
      <Paper elevation={0} sx={{ 
        borderRadius: 3, overflow: 'hidden', 
        border: '1px solid', borderColor: 'divider'
      }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha('#f8fafc', 0.5) }}>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase', py: 2 }}>Patient</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>Age</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>AI Risk</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((patient) => {
                const risk = getRiskConfig(patient.riskAssessment);
                const status = getStatusConfig(patient.status);
                return (
                  <TableRow 
                    hover key={patient.id} 
                    sx={{ 
                      transition: 'all 0.15s',
                      '&:hover': { bgcolor: alpha('#00bcd4', 0.02) },
                      '&:last-child td': { border: 0 }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ 
                          width: 34, height: 34, fontSize: '0.8rem', fontWeight: 700,
                          bgcolor: alpha('#00bcd4', 0.1), color: '#00bcd4'
                        }}>
                          {patient.name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{patient.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{patient.id}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{patient.age}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{patient.date}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={patient.riskAssessment} 
                        size="small"
                        sx={{ 
                          bgcolor: risk.bgcolor, color: risk.color, fontWeight: 700, fontSize: '0.7rem',
                          border: '1px solid', borderColor: risk.border, height: 24
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={patient.status} 
                        size="small"
                        sx={{ 
                          bgcolor: status.bgcolor, color: status.color, fontWeight: 600, fontSize: '0.65rem',
                          border: '1px solid', borderColor: status.border, height: 22
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                        <Tooltip title="View Report">
                          <IconButton size="small" sx={{ 
                            color: 'text.secondary',
                            '&:hover': { color: '#00bcd4', bgcolor: alpha('#00bcd4', 0.08) }
                          }}>
                            <DescriptionIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        
                        {patient.status === 'Awaiting Analysis' ? (
                          <Tooltip title="Start Analysis">
                            <IconButton size="small" onClick={() => onSelectPatient(patient)} sx={{
                              color: 'white', bgcolor: '#00bcd4',
                              '&:hover': { bgcolor: '#00acc1' }
                            }}>
                              <PlayArrowIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => onSelectPatient(patient)} sx={{
                              color: 'text.secondary',
                              '&:hover': { color: '#7c4dff', bgcolor: alpha('#7c4dff', 0.08) }
                            }}>
                              <VisibilityIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        <Tooltip title="Edit">
                          <IconButton size="small" sx={{
                            color: 'text.secondary',
                            '&:hover': { color: '#ff9100', bgcolor: alpha('#ff9100', 0.08) }
                          }}>
                            <EditIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
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

export default PatientQueue;
