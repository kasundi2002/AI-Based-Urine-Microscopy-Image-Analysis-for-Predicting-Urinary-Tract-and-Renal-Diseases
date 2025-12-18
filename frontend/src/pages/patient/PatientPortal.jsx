import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import Questionnaire from './Questionnaire';
import ResultsDashboard from './ResultsDashboard';
import HistoryView from './HistoryView';

const PatientPortal = () => {
  const [tabValue, setTabValue] = useState(0);
  const [hasReport, setHasReport] = useState(true); // Mock state

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleQuestionnaireComplete = (data) => {
    console.log('Questionnaire submitted:', data);
    setTabValue(1); // Switch to results
  };

  // Mock report data
  const mockReport = {
    date: '2023-10-27',
    riskScore: 85,
    riskLabel: 'High Risk',
    prescription: 'Increase hydration immediately. Consult nephrologist.'
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Patient Portal
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="patient portal tabs">
          <Tab label="My Results" />
          <Tab label="Health History" />
          <Tab label="Update Profile" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <ResultsDashboard report={hasReport ? mockReport : null} />
      )}

      {tabValue === 1 && (
        <HistoryView />
      )}

      {tabValue === 2 && (
        <Questionnaire onComplete={handleQuestionnaireComplete} />
      )}
    </Box>
  );
};

export default PatientPortal;
