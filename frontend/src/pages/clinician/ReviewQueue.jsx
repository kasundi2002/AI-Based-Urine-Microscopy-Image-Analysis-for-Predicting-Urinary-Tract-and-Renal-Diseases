import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Typography, Chip, IconButton, Tooltip, Avatar 
} from '@mui/material';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { api } from '../../services/api';

const ReviewQueue = ({ onSelectReport }) => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    // In a real app, we'd fetch reports specifically. Here we mock it.
    const fetchReports = async () => {
      // Mocking a list of reports ready for review
      const mockReports = [
        { id: 'r1', patientName: 'Bob Williams', date: '2023-10-26', risk: 'High', status: 'Pending Verification' },
        { id: 'r2', patientName: 'Alice Johnson', date: '2023-10-27', risk: 'Low', status: 'Pending Verification' },
      ];
      setReports(mockReports);
    };
    fetchReports();
  }, []);

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', mb: 4 }}>
      <Typography variant="h6" sx={{ p: 2, bgcolor: 'background.paper' }}>
        Pending Reviews
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>AI Risk Assessment</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow hover key={report.id}>
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>{report.patientName.charAt(0)}</Avatar>
                    {report.patientName}
                  </div>
                </TableCell>
                <TableCell>{report.date}</TableCell>
                <TableCell>
                  <Chip 
                    label={report.risk} 
                    color={report.risk === 'High' ? 'error' : 'success'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>{report.status}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Review & Verify">
                    <IconButton color="primary" onClick={() => onSelectReport(report)}>
                      <RateReviewIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ReviewQueue;
