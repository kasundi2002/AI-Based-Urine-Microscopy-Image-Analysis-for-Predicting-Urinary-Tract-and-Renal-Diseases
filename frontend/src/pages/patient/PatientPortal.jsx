import React, { useState } from 'react';
import { Box, Typography, Avatar, useTheme, Alert, Button } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import Questionnaire from './Questionnaire';
import ResultsDashboard from './ResultsDashboard';
import HistoryView from './HistoryView';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useLabData } from '../../context/LabDataContext';
import { useAuth } from '../../context/AuthContext';

const PATIENT_ID = 'PAT-2023-001';

const PatientPortal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get('view') || 'dashboard';
  const [selectedReport, setSelectedReport] = useState(null); 
  const theme = useTheme();
  const { getLatestResult, getPatientResults, submitQuestionnaire, getQuestionnaire } = useLabData();
  const { user } = useAuth();

  // Get real lab results from context
  const latestResult = getLatestResult(PATIENT_ID);
  const allResults = getPatientResults(PATIENT_ID);

  // Convert lab result to report format for ResultsDashboard
  const convertToReport = (labResult) => {
    if (!labResult) return null;
    const questionnaire = getQuestionnaire(labResult.id);
    return {
      id: labResult.id,
      date: labResult.date,
      riskScore: labResult.questionnaireCompleted ? labResult.enhancedRiskScore : labResult.riskScore,
      riskLabel: labResult.questionnaireCompleted ? labResult.enhancedRiskLabel : labResult.riskLabel,
      wbc: `${labResult.findings?.wbc || 0}`,
      rbc: `${labResult.findings?.rbc || 0}`,
      crystals: labResult.findings?.crystals || 'None',
      bacteria: labResult.findings?.bacteria || 'None',
      prescription: 'Drink plenty of water. Follow up in 3 months.',
      doctorNote: '- Dr. Smith (Urologist)',
      questionnaireCompleted: labResult.questionnaireCompleted || false,
      enhancedRiskScore: labResult.enhancedRiskScore,
      enhancedRiskLabel: labResult.enhancedRiskLabel,
      mltName: labResult.mltName,
    };
  };

  // Fallback mock report if no real data exists
  const fallbackReport = {
    date: 'Oct 26, 2023',
    riskScore: 20,
    riskLabel: 'Low Risk',
    wbc: '0-2',
    rbc: '0-1',
    crystals: 'None',
    bacteria: 'None',
    prescription: 'Maintain current hydration levels. No immediate concerns.',
    doctorNote: '- Dr. Smith (Urologist)',
    questionnaireCompleted: false,
  };

  const latestReport = latestResult ? convertToReport(latestResult) : fallbackReport;
  const displayReport = selectedReport || latestReport;

  const handleQuestionnaireComplete = (data) => {
    if (latestResult) {
      submitQuestionnaire(latestResult.id, data);
    }
    // Navigate back to dashboard to see updated risk
    setSearchParams({ view: 'dashboard' });
    setSelectedReport(null);
  };

  const handleViewDetails = (historyRecord) => {
    const reportData = {
      id: historyRecord.id,
      date: historyRecord.date,
      riskScore: historyRecord.score,
      riskLabel: historyRecord.risk === 'Moderate' ? 'Moderate Risk' : (historyRecord.risk === 'High' ? 'High Risk Detected' : 'Low Risk'),
      wbc: historyRecord.wbc || '0-2',
      rbc: historyRecord.rbc || '0-1',
      crystals: historyRecord.crystals || 'None',
      bacteria: historyRecord.bacteria || 'None',
      prescription: historyRecord.prescription,
      doctorNote: historyRecord.doctorNote,
      questionnaireCompleted: historyRecord.questionnaireCompleted || false,
      enhancedRiskScore: historyRecord.enhancedRiskScore,
      enhancedRiskLabel: historyRecord.enhancedRiskLabel,
    };
    setSelectedReport(reportData);
    setSearchParams({ view: 'dashboard' });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', mr: 2 }}>
                <AccountCircleIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Welcome, {user?.name || 'John'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Patient ID: {PATIENT_ID}
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
                 
                 {/* Show banner if questionnaire not completed for latest result */}
                 {latestResult && !latestResult.questionnaireCompleted && (
                   <Alert 
                     severity="info" 
                     variant="outlined"
                     icon={<AssignmentIcon />}
                     action={
                       <Button 
                         color="primary" 
                         variant="contained" 
                         size="small" 
                         onClick={() => setSearchParams({ view: 'analysis' })}
                         sx={{ textTransform: 'none', fontWeight: 'bold' }}
                       >
                         Fill Questionnaire
                       </Button>
                     }
                     sx={{ mb: 3, borderRadius: 2, py: 1.5 }}
                   >
                     <Typography variant="body2" fontWeight={600}>
                       New lab results available! Complete the Health Questionnaire for a more accurate risk prediction.
                     </Typography>
                   </Alert>
                 )}

                 {latestResult?.questionnaireCompleted && (
                   <Alert 
                     severity="success" 
                     variant="outlined"
                     sx={{ mb: 3, borderRadius: 2, py: 1.5 }}
                   >
                     <Typography variant="body2" fontWeight={600}>
                       ✅ Enhanced risk prediction is active — your results now include Health Questionnaire data for improved accuracy.
                     </Typography>
                   </Alert>
                 )}

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
