import React from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Chip, Avatar, Button 
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import HistoryIcon from '@mui/icons-material/History';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SpeedIcon from '@mui/icons-material/Speed';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useLabData } from '../../context/LabDataContext';

const PATIENT_ID = 'PAT-2023-001';

const HistoryView = ({ onViewDetails }) => {
  const { getPatientResults } = useLabData();
  const labResults = getPatientResults(PATIENT_ID);

  const mockHistory = [
    { id: 'mock-1', date: 'Oct 26, 2023', risk: 'Low', score: 20, status: 'Reviewed', wbc: '0-2', rbc: '0-1', crystals: 'None', bacteria: 'None', prescription: 'Maintain hydration.', doctorNote: 'Good progress.' },
    { id: 'mock-2', date: 'Aug 15, 2023', risk: 'Moderate', score: 45, status: 'Reviewed', wbc: '8', rbc: '4', crystals: 'Uric Acid', bacteria: 'None', prescription: 'Reduce salt intake.', doctorNote: 'Monitor blood pressure.' },
    { id: 'mock-3', date: 'Mar 10, 2023', risk: 'High', score: 78, status: 'Follow-up Complete', wbc: '15', rbc: '8', crystals: 'Calcium Oxalate', bacteria: 'Present', prescription: 'Immediate consultation required.', doctorNote: 'High crystal count detected.' },
  ];

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

  const getRiskConfig = (risk) => {
    switch (risk) {
      case 'High': return { color: '#ef5350', bgcolor: alpha('#ef5350', 0.08), border: alpha('#ef5350', 0.2) };
      case 'Moderate': return { color: '#ff9100', bgcolor: alpha('#ff9100', 0.08), border: alpha('#ff9100', 0.2) };
      default: return { color: '#66bb6a', bgcolor: alpha('#66bb6a', 0.08), border: alpha('#66bb6a', 0.2) };
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Enhanced Analysis': return { color: '#7c4dff', bgcolor: alpha('#7c4dff', 0.08), border: alpha('#7c4dff', 0.2) };
      case 'Follow-up Complete': return { color: '#00bcd4', bgcolor: alpha('#00bcd4', 0.08), border: alpha('#00bcd4', 0.2) };
      default: return { color: '#66bb6a', bgcolor: alpha('#66bb6a', 0.08), border: alpha('#66bb6a', 0.2) };
    }
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.4s ease-out' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <HistoryIcon sx={{ color: '#7c4dff', fontSize: 28 }} />
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: -0.5 }}>Health History</Typography>
          <Typography variant="body2" color="text.secondary">{history.length} past analyses on record</Typography>
        </Box>
      </Box>

      {/* Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha('#f8fafc', 0.5) }}>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase', py: 1.8 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>Risk Level</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>Score</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((row) => {
                const risk = getRiskConfig(row.risk);
                const status = getStatusConfig(row.status);
                return (
                  <TableRow 
                    hover key={row.id}
                    sx={{ 
                      transition: 'all 0.15s',
                      '&:hover': { bgcolor: alpha('#7c4dff', 0.02) },
                      '&:last-child td': { border: 0 }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                        <Typography variant="body2" fontWeight={500}>{row.date}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        icon={<SpeedIcon sx={{ fontSize: 14 }} />}
                        label={row.risk} 
                        size="small"
                        sx={{ 
                          bgcolor: risk.bgcolor, color: risk.color, fontWeight: 700, fontSize: '0.7rem',
                          border: '1px solid', borderColor: risk.border, height: 24,
                          '& .MuiChip-icon': { color: risk.color }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} sx={{ color: risk.color }}>{row.score}%</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={row.status}
                          size="small"
                          sx={{ 
                            bgcolor: status.bgcolor, color: status.color, fontWeight: 600, fontSize: '0.65rem',
                            border: '1px solid', borderColor: status.border, height: 22
                          }}
                        />
                        {row.questionnaireCompleted && (
                          <Chip 
                            icon={<AutoAwesomeIcon sx={{ fontSize: 12 }} />}
                            label="Enhanced" 
                            size="small"
                            sx={{ 
                              bgcolor: alpha('#7c4dff', 0.08), color: '#7c4dff', fontWeight: 600, fontSize: '0.6rem',
                              border: '1px solid', borderColor: alpha('#7c4dff', 0.2), height: 20,
                              '& .MuiChip-icon': { color: '#7c4dff' }
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon sx={{ fontSize: 15 }} />}
                        onClick={() => onViewDetails(row)}
                        sx={{
                          textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 2,
                          fontSize: '0.75rem', color: '#7c4dff',
                          '&:hover': { bgcolor: alpha('#7c4dff', 0.06) }
                        }}
                      >
                        View Details
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

export default HistoryView;
