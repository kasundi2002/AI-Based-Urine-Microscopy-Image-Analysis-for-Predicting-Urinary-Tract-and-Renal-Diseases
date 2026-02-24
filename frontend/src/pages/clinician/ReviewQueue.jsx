import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Typography, Chip, Box, Avatar, Button
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import RateReviewIcon from '@mui/icons-material/RateReview';
import GavelIcon from '@mui/icons-material/Gavel';
import SpeedIcon from '@mui/icons-material/Speed';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { api } from '../../services/api';

const ReviewQueue = ({ onSelectReport }) => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      const mockReports = [
        { id: 'r1', patientName: 'Bob Williams', date: '2023-10-26', risk: 'High', status: 'Pending Verification' },
        { id: 'r2', patientName: 'Alice Johnson', date: '2023-10-27', risk: 'Low', status: 'Pending Verification' },
        { id: 'r3', patientName: 'David Cruz', date: '2023-10-28', risk: 'High', status: 'Pending Verification' },
      ];
      setReports(mockReports);
    };
    fetchReports();
  }, []);

  const getRiskConfig = (risk) => {
    switch (risk) {
      case 'High': return { color: '#ef5350', bgcolor: alpha('#ef5350', 0.08), border: alpha('#ef5350', 0.2), gradient: 'linear-gradient(135deg, #ef5350, #c62828)' };
      case 'Low': return { color: '#66bb6a', bgcolor: alpha('#66bb6a', 0.08), border: alpha('#66bb6a', 0.2), gradient: 'linear-gradient(135deg, #66bb6a, #2e7d32)' };
      default: return { color: '#ff9100', bgcolor: alpha('#ff9100', 0.08), border: alpha('#ff9100', 0.2), gradient: 'linear-gradient(135deg, #ff9100, #e65100)' };
    }
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
      {/* Header */}
      <Box sx={{ 
        px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha('#7c4dff', 0.08), color: '#7c4dff', display: 'flex' }}>
            <RateReviewIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>Pending Verification</Typography>
            <Typography variant="caption" color="text.secondary">{reports.length} reports awaiting clinician sign-off</Typography>
          </Box>
        </Box>
        <Chip label="View All" size="small" variant="outlined" clickable icon={<ArrowForwardIcon sx={{ fontSize: 14 }} />} sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha('#f8fafc', 0.5) }}>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase', py: 1.5 }}>Patient</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>AI Risk</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => {
              const risk = getRiskConfig(report.risk);
              return (
                <TableRow 
                  hover key={report.id}
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
                        bgcolor: risk.bgcolor, color: risk.color,
                        border: '2px solid', borderColor: risk.border
                      }}>
                        {report.patientName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{report.patientName}</Typography>
                        <Typography variant="caption" color="text.secondary">ID: {report.id}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarTodayIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                      <Typography variant="body2" color="text.secondary">{report.date}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={<SpeedIcon sx={{ fontSize: 14 }} />}
                      label={report.risk} 
                      size="small"
                      sx={{ 
                        bgcolor: risk.bgcolor, color: risk.color, fontWeight: 700, fontSize: '0.7rem',
                        border: '1px solid', borderColor: risk.border, height: 24,
                        '& .MuiChip-icon': { color: risk.color }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={report.status} 
                      size="small"
                      sx={{ 
                        bgcolor: alpha('#ff9100', 0.08), color: '#ff9100', fontWeight: 600, fontSize: '0.65rem',
                        border: '1px solid', borderColor: alpha('#ff9100', 0.2), height: 22
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<GavelIcon sx={{ fontSize: 15 }} />}
                      onClick={() => onSelectReport(report)}
                      sx={{
                        textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 2.5,
                        fontSize: '0.75rem', height: 32,
                        background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
                        boxShadow: '0 2px 8px rgba(15,23,42,0.2)',
                      }}
                    >
                      Verify
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ReviewQueue;
