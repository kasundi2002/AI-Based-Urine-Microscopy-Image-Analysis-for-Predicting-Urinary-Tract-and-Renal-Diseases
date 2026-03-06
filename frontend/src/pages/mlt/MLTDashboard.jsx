import React, { useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import StatsDashboard from './StatsDashboard';
import PatientQueue from './PatientQueue';
import AnalysisWorkflow from './AnalysisWorkflow';
import ResultsPage from './ResultsPage';
import microscopyImage from '../../assets/c5.jpg';

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

  const handleViewReport = (patient) => {
    setSelectedPatient(patient);
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
        <ResultsPage onViewReport={handleViewReport} />
      )}
    </Box>
  );
};

export default MLTDashboard;

