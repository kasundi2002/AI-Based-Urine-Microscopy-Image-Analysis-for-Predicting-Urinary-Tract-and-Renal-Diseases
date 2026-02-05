import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Typography, Chip, IconButton, Tooltip, Box, Button, TextField, InputAdornment 
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { api } from '../../services/api';

const DoctorPatientQueue = ({ onSelectPatient }) => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      // In real scenario this might fetch a different set or all patients
      const data = await api.getPatients();
      setPatients(data);
    };
    fetchPatients();
  }, []);

  const getStatusChip = (status, risk) => {
    if (status === 'Completed') {
        return <Chip icon={<CheckCircleIcon />} label="Reviewed" color="success" variant="outlined" size="small" />;
    }
    if (status === 'Ready for Review') {
       return <Chip icon={<PendingIcon />} label="Pending Review" color="warning" size="small" />;
    }
    return <Chip label={status} size="small" />;
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'High': return 'error';
      case 'Moderate': return 'warning';
      default: return 'success';
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Patient Management
        </Typography>
        <TextField
          size="small"
          placeholder="Search Patients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell fw="bold">ID</TableCell>
                <TableCell fw="bold">Name</TableCell>
                <TableCell fw="bold">Age</TableCell>
                <TableCell fw="bold">Date</TableCell>
                <TableCell fw="bold">AI Risk Assessment</TableCell>
                <TableCell fw="bold">Review Status</TableCell>
                <TableCell align="right" fw="bold">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow hover key={patient.id}>
                  <TableCell>{patient.id}</TableCell>
                  <TableCell fontWeight="bold">{patient.name}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.date}</TableCell>
                  <TableCell>
                    <Chip 
                      label={patient.riskAssessment || 'Normal'} 
                      color={getRiskColor(patient.riskAssessment || 'Normal')} 
                      size="small" 
                      sx={{ fontWeight: 'bold', width: 80 }}
                    />
                  </TableCell>
                  <TableCell>
                      {getStatusChip(patient.status, patient.riskAssessment)}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Open Diagnostic Review">
                        <Button 
                            variant="contained" 
                            size="small" 
                            startIcon={<VisibilityIcon />}
                            onClick={() => onSelectPatient(patient)}
                            sx={{ textTransform: 'none' }}
                        >
                            Review
                        </Button>
                    </Tooltip>
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

export default DoctorPatientQueue;
