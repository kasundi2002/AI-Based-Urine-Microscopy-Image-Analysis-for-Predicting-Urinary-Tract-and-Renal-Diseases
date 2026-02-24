import React, { useState } from 'react';
import { Box, Typography, Avatar, Paper, Button, Chip, Alert } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useSearchParams } from 'react-router-dom';
import Questionnaire from './Questionnaire';
import ResultsDashboard from './ResultsDashboard';
import HistoryView from './HistoryView';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useLabData } from '../../context/LabDataContext';
import { useAuth } from '../../context/AuthContext';

const PATIENT_ID = 'PAT-2023-001';

const PatientPortal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get('view') || 'dashboard';
  const [selectedReport, setSelectedReport] = useState(null); 
  const { getLatestResult, getPatientResults, submitQuestionnaire, getQuestionnaire } = useLabData();
  const { user } = useAuth();

  const latestResult = getLatestResult(PATIENT_ID);
  const allResults = getPatientResults(PATIENT_ID);

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
    <Box sx={{ animation: 'fadeIn 0.4s ease-out' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Premium Header Card */}
      <Paper elevation={0} sx={{ 
        mb: 3, p: 3, borderRadius: 3,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
        color: 'white', position: 'relative', overflow: 'hidden',
        border: '1px solid', borderColor: alpha('#fff', 0.06)
      }}>
        <Box sx={{ position: 'absolute', top: -30, right: -30, opacity: 0.04 }}>
          <FavoriteIcon sx={{ fontSize: 200 }} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              width: 56, height: 56, 
              background: 'linear-gradient(135deg, #00bcd4, #0097a7)',
              border: '3px solid', borderColor: alpha('#fff', 0.2),
              fontSize: '1.3rem', fontWeight: 800
            }}>
              {user?.name?.charAt(0) || 'J'}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: -0.5 }}>
                Welcome back, {user?.name || 'John'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                <Chip 
                  label={`ID: ${PATIENT_ID}`} 
                  size="small"
                  sx={{ bgcolor: alpha('#fff', 0.1), color: 'white', fontWeight: 600, fontSize: '0.7rem', height: 22 }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.7 }}>
                  <CalendarTodayIcon sx={{ fontSize: 13 }} />
                  <Typography variant="caption">Last visit: {displayReport?.date || 'N/A'}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          {selectedReport && (
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => { setSelectedReport(null); setSearchParams({ view: 'results' }); }}
              sx={{ 
                color: 'white', textTransform: 'none', fontWeight: 600, borderRadius: 2,
                bgcolor: alpha('#fff', 0.08),
                '&:hover': { bgcolor: alpha('#fff', 0.15) }
              }}
            >
              Back to History
            </Button>
          )}
        </Box>
      </Paper>

      {currentView === 'dashboard' && (
        <React.Fragment>
          {/* Questionnaire Banner */}
          {latestResult && !latestResult.questionnaireCompleted && (
            <Paper elevation={0} sx={{ 
              p: 2.5, mb: 3, borderRadius: 3, 
              bgcolor: alpha('#2196f3', 0.04),
              border: '1px solid', borderColor: alpha('#2196f3', 0.15),
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha('#2196f3', 0.08), color: '#2196f3', display: 'flex' }}>
                  <AssignmentIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>New Lab Results Available!</Typography>
                  <Typography variant="caption" color="text.secondary">Complete the Health Questionnaire for a more accurate AI risk prediction.</Typography>
                </Box>
              </Box>
              <Button 
                variant="contained" 
                size="small" 
                onClick={() => setSearchParams({ view: 'analysis' })}
                sx={{ 
                  textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3,
                  background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
                  boxShadow: '0 4px 14px rgba(15,23,42,0.25)',
                }}
              >
                Fill Questionnaire
              </Button>
            </Paper>
          )}

          {latestResult?.questionnaireCompleted && (
            <Paper elevation={0} sx={{ 
              p: 2, mb: 3, borderRadius: 3, 
              bgcolor: alpha('#66bb6a', 0.04),
              border: '1px solid', borderColor: alpha('#66bb6a', 0.15),
              display: 'flex', alignItems: 'center', gap: 1.5
            }}>
              <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: alpha('#66bb6a', 0.08), color: '#66bb6a', display: 'flex' }}>
                <AutoAwesomeIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                <span style={{ color: '#66bb6a', fontWeight: 700 }}>Enhanced prediction active</span> — your results now include Health Questionnaire data for improved accuracy.
              </Typography>
            </Paper>
          )}

          <ResultsDashboard report={displayReport} />
        </React.Fragment>
      )}

      {currentView === 'analysis' && (
        <Questionnaire onComplete={handleQuestionnaireComplete} />
      )}

      {currentView === 'results' && (
        <HistoryView onViewDetails={handleViewDetails} />
      )}
    </Box>
  );
};

export default PatientPortal;
