import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';

const HistoryView = ({ onViewDetails }) => {
  const history = [
    { id: 1, date: 'Oct 26, 2023', risk: 'Low', score: 20, status: 'Reviewed', prescription: 'Maintain hydration.', doctorNote: 'Good progress.' },
    { id: 2, date: 'Aug 15, 2023', risk: 'Moderate', score: 45, status: 'Reviewed', prescription: 'Reduce salt intake.', doctorNote: 'Monitor blood pressure.' },
    { id: 3, date: 'Mar 10, 2023', risk: 'High', score: 78, status: 'Follow-up Complete', prescription: 'Immediate consultation required.', doctorNote: 'High crystal count detected.' },
  ];

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'High': return 'error';
      case 'Moderate': return 'warning';
      default: return 'success';
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Health History</Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Risk Assessment</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Score</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.date}</TableCell>
                <TableCell>
                  <Chip 
                    label={row.risk} 
                    color={getRiskColor(row.risk)} 
                    size="small" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{row.score}%</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell align="right">
                    <Typography 
                        variant="button" 
                        color="primary" 
                        onClick={() => onViewDetails(row)}
                        sx={{ cursor: 'pointer', textTransform: 'none', fontWeight: 'bold', '&:hover': { textDecoration: 'underline' } }}
                    >
                        View Details
                    </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default HistoryView;