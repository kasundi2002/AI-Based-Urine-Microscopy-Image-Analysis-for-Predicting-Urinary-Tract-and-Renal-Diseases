import React, { useState } from 'react';
import { Box, Typography, Paper, Avatar, useTheme } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import Questionnaire from './Questionnaire';
import ResultsDashboard from './ResultsDashboard';
import HistoryView from './HistoryView';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const PatientPortal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get('view') || 'dashboard';
  const [selectedReport, setSelectedReport] = useState(null); 
  const theme = useTheme();

  // Mock latest report
  const latestReport = {
    date: 'Oct 26, 2023',
    riskScore: 20,
    riskLabel: 'Low Risk',
    prescription: 'Maintain current hydration levels. No immediate concerns.',
    doctorNote: 'Results look good. Keep up the good work!'
  };

  const handleQuestionnaireComplete = (data) => {
    console.log('Questionnaire submitted:', data);
    // Ideally navigate to results or show success
  };

  const handleViewDetails = (historyRecord) => {
      // Convert history record to report format
      const reportData = {
          date: historyRecord.date,
          riskScore: historyRecord.score,
          riskLabel: historyRecord.risk === 'Moderate' ? 'Moderate Risk' : (historyRecord.risk === 'High' ? 'High Risk Detected' : 'Low Risk'),
          prescription: historyRecord.prescription,
          doctorNote: historyRecord.doctorNote
      };
      setSelectedReport(reportData);
      setSearchParams({ view: 'dashboard' });
  };

  // Determine which report to show: selected historical or latest
  const displayReport = selectedReport || latestReport;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', mr: 2 }}>
                <AccountCircleIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Welcome, John
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Patient ID: PAT-2023-001
                </Typography>
            </Box>
        </Box>
        {selectedReport && (
            <Box>
                <Typography 
                    variant="button" 
                    color="primary" 
                    onClick={() => { setSelectedReport(null); setSearchParams({ view: 'results' }); }}
                    sx={{ cursor: 'pointer', textTransform: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}
                >
                    &larr; Back to History
                </Typography>
            </Box>
        )}
      </Box>

      {currentView === 'dashboard' && (
        <React.Fragment>
             <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                 <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                 <ResultsDashboard report={displayReport} />
             </Box>
        </React.Fragment>
      )}

      {currentView === 'analysis' && (
        <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
            <Questionnaire onComplete={handleQuestionnaireComplete} />
        </Box>
      )}

      {currentView === 'results' && (
        <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
            <HistoryView onViewDetails={handleViewDetails} />
        </Box>
      )}
    </Box>
  );
};

export default PatientPortal;
