import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Typography, Chip, IconButton, Tooltip, Box, Button 
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import { api } from '../../services/api';

const PatientQueue = ({ onSelectPatient }) => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      const data = await api.getPatients();
      setPatients(data);
    };
    fetchPatients();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Awaiting Analysis': return 'default'; // Or specific color
      case 'Ready for Review': return 'default';
      case 'Completed': return 'default';
      default: return 'default';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'High': return 'error';
      case 'Normal': return 'success';
      case 'Pending': return 'primary';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Patient Management
        </Typography>
        <Button variant="contained" color="primary" sx={{ 
          textTransform: 'none', 
          borderRadius: 2,
          px: 4
        }}>
          Add Patient
        </Button>
      </Box>
      
      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2, boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' }}>
        <TableContainer>
          <Table stickyHeader aria-label="patient queue table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Age</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>AI Risk Assessment</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.map((patient) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={patient.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ fontWeight: 600 }}>{patient.id}</TableCell>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.date}</TableCell>
                  <TableCell>
                    <Chip 
                      label={patient.riskAssessment} 
                      color={getRiskColor(patient.riskAssessment)} 
                      size="small" 
                      sx={{ 
                        fontWeight: 'bold', 
                        borderRadius: 1,
                        minWidth: 80
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {patient.status}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <IconButton size="small">
                         <DescriptionIcon fontSize="small" />
                      </IconButton>
                      
                      {patient.status === 'Awaiting Analysis' ? (
                        <Tooltip title="Start Analysis">
                          <IconButton size="small" onClick={() => onSelectPatient(patient)}>
                            <PlayArrowIcon fontSize="small"  />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => onSelectPatient(patient)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      <IconButton size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default PatientQueue;
