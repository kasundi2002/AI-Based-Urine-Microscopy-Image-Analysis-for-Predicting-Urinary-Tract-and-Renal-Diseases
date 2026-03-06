import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Chip, Avatar, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, InputAdornment, Snackbar, Alert,
  CircularProgress, IconButton, Tooltip, Grid
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SendIcon from '@mui/icons-material/Send';
import ScienceIcon from '@mui/icons-material/Science';
import PersonIcon from '@mui/icons-material/Person';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { api } from '../../services/api';

const ResultsPage = ({ onViewReport }) => {
  const [patients, setPatients] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sendingEmail, setSendingEmail] = useState(null); // patientId being sent
  const [emailSent, setEmailSent] = useState({}); // { patientId: true }
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [patientsData, reportsData] = await Promise.all([
        api.getPatients(),
        api.getAllReports()
      ]);
      setPatients(patientsData);
      setReports(reportsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setSnackbar({ open: true, message: 'Failed to load data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Get patients with completed analysis (Ready for Review or Completed status)
  const completedPatients = patients.filter(
    p => p.status === 'Ready for Review' || p.status === 'Completed'
  );

  // Build a lookup: patientId -> latest report
  const reportsByPatient = {};
  reports.forEach(r => {
    const pid = r.patientId?._id || r.patientId;
    if (!reportsByPatient[pid]) reportsByPatient[pid] = r;
  });

  // Filter by search
  const filteredPatients = completedPatients.filter(p => {
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.patientId.toLowerCase().includes(q);
  });

  const handleSendEmail = async (patient) => {
    if (!patient.email) {
      setSnackbar({ open: true, message: `No email registered for ${patient.name}. Please add an email first.`, severity: 'warning' });
      return;
    }
    try {
      setSendingEmail(patient.patientId);
      await api.sendAccessLink(patient.patientId);
      setEmailSent(prev => ({ ...prev, [patient.patientId]: true }));
      setSnackbar({ open: true, message: `Secure access link sent to ${patient.email}`, severity: 'success' });
    } catch (error) {
      console.error('Failed to send email:', error);
      setSnackbar({ open: true, message: error.message || 'Failed to send email', severity: 'error' });
    } finally {
      setSendingEmail(null);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'High': case 'Critical': return '#ef5350';
      case 'Moderate': return '#ff9800';
      case 'Low': case 'Normal': return '#66bb6a';
      default: return '#9e9e9e';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#66bb6a';
      case 'Ready for Review': return '#00bcd4';
      default: return '#9e9e9e';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress sx={{ color: '#00bcd4' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ animation: 'fadeIn 0.4s ease-out' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <AssignmentIcon sx={{ color: '#00bcd4', fontSize: 28 }} />
            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: -0.5 }}>
              Analysis Results
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            All patients with completed analysis — send secure access links to view their reports
          </Typography>
        </Box>
        <Chip
          icon={<CalendarTodayIcon sx={{ fontSize: 14 }} />}
          label={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600, fontSize: '0.7rem' }}
        />
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: alpha('#00bcd4', 0.08), color: '#00bcd4', display: 'flex' }}>
              <ScienceIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={800}>{completedPatients.length}</Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>Completed Analyses</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: alpha('#66bb6a', 0.08), color: '#66bb6a', display: 'flex' }}>
              <EmailIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={800}>{Object.keys(emailSent).length}</Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>Emails Sent (this session)</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: alpha('#ef5350', 0.08), color: '#ef5350', display: 'flex' }}>
              <WarningAmberIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={800}>
                {completedPatients.filter(p => p.riskAssessment === 'High' || p.riskAssessment === 'Critical').length}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>High Risk Cases</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Search + Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        {/* Toolbar */}
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={700}>Patient Reports</Typography>
            <Chip label={`${filteredPatients.length} results`} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', height: 22, bgcolor: alpha('#00bcd4', 0.08), color: '#00bcd4' }} />
          </Box>
          <TextField
            size="small"
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                </InputAdornment>
              )
            }}
            sx={{ width: 260, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.85rem' } }}
          />
        </Box>

        {/* Table */}
        {filteredPatients.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <PersonIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body1" color="text.secondary" fontWeight={500}>No completed analyses found</Typography>
            <Typography variant="caption" color="text.disabled">Patients will appear here after their analysis is complete</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha('#f8fafc', 0.5) }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>Patient</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>Risk</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>Report Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPatients.map((patient) => {
                  const report = reportsByPatient[patient._id];
                  const riskColor = getRiskColor(patient.riskAssessment);
                  const statusColor = getStatusColor(patient.status);
                  const isSending = sendingEmail === patient.patientId;
                  const wasSent = emailSent[patient.patientId];

                  return (
                    <TableRow
                      key={patient._id}
                      sx={{
                        transition: 'all 0.15s',
                        '&:hover': { bgcolor: alpha('#00bcd4', 0.02) },
                        '&:last-child td': { borderBottom: 0 }
                      }}
                    >
                      {/* Patient */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 38, height: 38, bgcolor: alpha('#00bcd4', 0.1), color: '#00bcd4', fontWeight: 700, fontSize: '0.85rem' }}>
                            {patient.name?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={700}>{patient.name}</Typography>
                            <Typography variant="caption" color="text.secondary">ID: {patient.patientId} · Age: {patient.age}</Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Chip
                          label={patient.status}
                          size="small"
                          sx={{
                            bgcolor: alpha(statusColor, 0.1), color: statusColor,
                            fontWeight: 700, fontSize: '0.68rem', height: 24,
                            border: '1px solid', borderColor: alpha(statusColor, 0.2)
                          }}
                        />
                      </TableCell>

                      {/* Risk */}
                      <TableCell>
                        <Chip
                          label={patient.riskAssessment || 'Pending'}
                          size="small"
                          sx={{
                            bgcolor: alpha(riskColor, 0.1), color: riskColor,
                            fontWeight: 700, fontSize: '0.68rem', height: 24,
                            border: '1px solid', borderColor: alpha(riskColor, 0.2)
                          }}
                        />
                      </TableCell>

                      {/* Email */}
                      <TableCell>
                        <Typography variant="caption" color={patient.email ? 'text.primary' : 'text.disabled'} fontWeight={500}>
                          {patient.email || 'Not registered'}
                        </Typography>
                      </TableCell>

                      {/* Report Date */}
                      <TableCell>
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                          {report ? new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          {onViewReport && (
                            <Tooltip title="View Report">
                              <IconButton
                                size="small"
                                onClick={() => onViewReport(patient)}
                                sx={{
                                  color: '#00bcd4',
                                  bgcolor: alpha('#00bcd4', 0.06),
                                  '&:hover': { bgcolor: alpha('#00bcd4', 0.12) }
                                }}
                              >
                                <VisibilityIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Button
                            variant={wasSent ? 'outlined' : 'contained'}
                            size="small"
                            disabled={isSending || !patient.email}
                            startIcon={
                              isSending ? <CircularProgress size={14} color="inherit" /> :
                              wasSent ? <CheckCircleIcon sx={{ fontSize: 16 }} /> :
                              <SendIcon sx={{ fontSize: 16 }} />
                            }
                            onClick={() => handleSendEmail(patient)}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 700,
                              borderRadius: 2,
                              fontSize: '0.75rem',
                              px: 2,
                              minWidth: 120,
                              ...(wasSent ? {
                                borderColor: alpha('#66bb6a', 0.3),
                                color: '#66bb6a',
                                '&:hover': { borderColor: '#66bb6a', bgcolor: alpha('#66bb6a', 0.04) }
                              } : {
                                background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
                                boxShadow: '0 2px 8px rgba(15,23,42,0.2)',
                                '&:hover': { background: 'linear-gradient(135deg, #1e293b, #2d4a6f)' },
                                '&.Mui-disabled': {
                                  background: alpha('#9e9e9e', 0.12),
                                  color: alpha('#9e9e9e', 0.5)
                                }
                              })
                            }}
                          >
                            {isSending ? 'Sending...' : wasSent ? 'Email Sent' : 'Send Email'}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', fontWeight: 600, borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResultsPage;
