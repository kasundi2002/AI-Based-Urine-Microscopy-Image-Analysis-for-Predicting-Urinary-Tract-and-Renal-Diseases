import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { useLabData } from '../../context/LabDataContext';

const PATIENT_ID = 'PAT-2023-001';

const HistoryView = ({ onViewDetails }) => {
  const { getPatientResults } = useLabData();
  const labResults = getPatientResults(PATIENT_ID);

  // Combine real results with mock history
  const mockHistory = [
    { id: 'mock-1', date: 'Oct 26, 2023', risk: 'Low', score: 20, status: 'Reviewed', wbc: '0-2', rbc: '0-1', crystals: 'None', bacteria: 'None', prescription: 'Maintain hydration.', doctorNote: 'Good progress.' },
    { id: 'mock-2', date: 'Aug 15, 2023', risk: 'Moderate', score: 45, status: 'Reviewed', wbc: '8', rbc: '4', crystals: 'Uric Acid', bacteria: 'None', prescription: 'Reduce salt intake.', doctorNote: 'Monitor blood pressure.' },
    { id: 'mock-3', date: 'Mar 10, 2023', risk: 'High', score: 78, status: 'Follow-up Complete', wbc: '15', rbc: '8', crystals: 'Calcium Oxalate', bacteria: 'Present', prescription: 'Immediate consultation required.', doctorNote: 'High crystal count detected.' },
  ];

  // Convert lab results to history format
  const realHistory = labResults.map(r => ({
    id: r.id,
    date: r.date,
    risk: r.questionnaireCompleted ? r.enhancedRiskLabel?.replace(' Risk', '') : r.riskLabel?.replace(' Risk', ''),
    score: r.questionnaireCompleted ? r.enhancedRiskScore : r.riskScore,
    status: r.questionnaireCompleted ? 'Enhanced Analysis' : r.status,
    wbc: `${r.findings?.wbc || 0}`,
    rbc: `${r.findings?.rbc || 0}`,
    crystals: r.findings?.crystals || 'None',
    bacteria: r.findings?.bacteria || 'None',
    prescription: 'Drink plenty of water. Follow up in 3 months.',
    doctorNote: 'AI-assisted analysis.',
    questionnaireCompleted: r.questionnaireCompleted,
    enhancedRiskScore: r.enhancedRiskScore,
    enhancedRiskLabel: r.enhancedRiskLabel,
  }));

  const history = [...realHistory, ...mockHistory];

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
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {row.status}
                    {row.questionnaireCompleted && (
                      <Chip label="Enhanced" size="small" color="success" sx={{ fontSize: '0.7rem', height: 20 }} />
                    )}
                  </Box>
                </TableCell>
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
