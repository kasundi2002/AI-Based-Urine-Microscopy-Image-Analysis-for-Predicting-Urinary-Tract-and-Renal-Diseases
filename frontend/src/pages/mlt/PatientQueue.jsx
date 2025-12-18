import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Typography, Chip, IconButton, Tooltip 
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
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
      case 'Awaiting Analysis': return 'warning';
      case 'Ready for Review': return 'info';
      case 'Completed': return 'success';
      default: return 'default';
    }
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', mb: 4 }}>
      <Typography variant="h6" sx={{ p: 2, bgcolor: 'background.paper' }}>
        Patient Queue
      </Typography>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell>Patient ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((patient) => (
              <TableRow hover role="checkbox" tabIndex={-1} key={patient.id}>
                <TableCell>{patient.id}</TableCell>
                <TableCell>{patient.name}</TableCell>
                <TableCell>{patient.age}</TableCell>
                <TableCell>{patient.date}</TableCell>
                <TableCell>
                  <Chip 
                    label={patient.status} 
                    color={getStatusColor(patient.status)} 
                    size="small" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  {patient.status === 'Awaiting Analysis' ? (
                    <Tooltip title="Start Analysis">
                      <IconButton color="primary" onClick={() => onSelectPatient(patient)}>
                        <PlayArrowIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="View Details">
                      <IconButton onClick={() => onSelectPatient(patient)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default PatientQueue;
