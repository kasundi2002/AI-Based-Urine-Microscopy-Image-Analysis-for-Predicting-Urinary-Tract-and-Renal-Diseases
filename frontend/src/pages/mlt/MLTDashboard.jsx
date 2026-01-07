import React, { useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import StatsDashboard from './StatsDashboard';
import PatientQueue from './PatientQueue';
import AnalysisWorkflow from './AnalysisWorkflow';

const MLTDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get('view') || 'dashboard';

  const [selectedPatient, setSelectedPatient] = useState(null);

  const setView = (view) => {
    setSearchParams({ view });
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    // If patient selected, go to analysis workflow with this patient pre-selected
    setView('analysis');
  };

  return (
    <Box>
      {currentView === 'dashboard' && (
        <StatsDashboard />
      )}

      {currentView === 'patients' && (
        <PatientQueue onSelectPatient={handleSelectPatient} />
      )}

      {currentView === 'analysis' && (
        <AnalysisWorkflow preSelectedPatient={selectedPatient} />
      )}

      {currentView === 'results' && (
         <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
                Results Module - Coming Soon
            </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default MLTDashboard;
