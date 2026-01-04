import React, { useState } from 'react';
import { Box, Typography, Breadcrumbs, Link, Button } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ReviewQueue from './ReviewQueue';
import DiagnosticView from './DiagnosticView';
import VerificationPanel from './VerificationPanel';
import LongitudinalView from './LongitudinalView';
import { api } from '../../services/api';

const ClinicianDashboard = () => {
  const [currentView, setCurrentView] = useState('queue'); // queue, review
  const [selectedReport, setSelectedReport] = useState(null);

  const handleSelectReport = async (reportStub) => {
    // Fetch full report details
    const fullReport = await api.getReport(reportStub.id);
    setSelectedReport(fullReport);
    setCurrentView('review');
  };

  const handleVerificationComplete = () => {
    setCurrentView('queue');
    setSelectedReport(null);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
          Clinician Workspace
        </Typography>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
          <Link 
            underline="hover" 
            color="inherit" 
            onClick={() => setCurrentView('queue')} 
            sx={{ cursor: 'pointer' }}
          >
            Dashboard
          </Link>
          {currentView === 'review' && (
            <Typography color="text.primary">Review: {selectedReport?.patientName}</Typography>
          )}
        </Breadcrumbs>
      </Box>

      {currentView === 'queue' && (
        <Box>
          <ReviewQueue onSelectReport={handleSelectReport} />
          <LongitudinalView />
        </Box>
      )}

      {currentView === 'review' && selectedReport && (
        <Box>
          <DiagnosticView report={selectedReport} />
          <VerificationPanel report={selectedReport} onVerify={handleVerificationComplete} />
          <Box sx={{ mt: 4 }}>
            <LongitudinalView />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ClinicianDashboard;
