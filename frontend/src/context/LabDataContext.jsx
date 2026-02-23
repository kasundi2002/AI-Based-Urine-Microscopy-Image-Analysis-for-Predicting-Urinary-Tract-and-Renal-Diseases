import React, { createContext, useState, useContext, useEffect } from 'react';

const LabDataContext = createContext(null);

// Risk calculation combining lab data + questionnaire
const calculateEnhancedRisk = (labResult, questionnaire) => {
  if (!labResult) return 0;

  // Base risk from lab sediment analysis
  let risk = 0;
  const wbc = labResult.findings?.wbc || 0;
  const rbc = labResult.findings?.rbc || 0;
  const crystals = labResult.findings?.crystals || 'None';
  const bacteria = labResult.findings?.bacteria || 'None';

  // Sediment-based risk factors
  if (wbc > 10) risk += 20;
  else if (wbc > 5) risk += 10;
  else risk += 3;

  if (rbc > 5) risk += 15;
  else if (rbc > 2) risk += 8;
  else risk += 2;

  if (crystals && crystals !== 'None' && crystals !== 'Absent') risk += 25;
  if (bacteria && bacteria !== 'None' && bacteria !== 'Absent') risk += 15;

  // If questionnaire is filled, adjust risk
  if (questionnaire) {
    // Age factor
    const age = parseInt(questionnaire.age) || 30;
    if (age > 50) risk += 10;
    else if (age > 40) risk += 5;

    // Pain level factor
    const pain = parseInt(questionnaire.painLevel) || 0;
    risk += pain * 2;

    // Family history factor
    if (questionnaire.history === 'yes') risk += 12;

    // Hydration factor (protective)
    if (questionnaire.hydration === 'high') risk -= 8;
    else if (questionnaire.hydration === 'low') risk += 10;

    // Dietary factors
    if (questionnaire.diet === 'high_salt') risk += 8;
    if (questionnaire.diet === 'high_oxalate') risk += 10;

    // Urinary symptoms
    if (questionnaire.urinaryFrequency === 'frequent') risk += 5;
    if (questionnaire.bloodInUrine === 'yes') risk += 15;
  }

  // Clamp between 0-100
  return Math.max(0, Math.min(100, Math.round(risk)));
};

const getRiskLabel = (score) => {
  if (score >= 70) return 'High Risk';
  if (score >= 40) return 'Moderate Risk';
  return 'Low Risk';
};

export const LabDataProvider = ({ children }) => {
  // Load from localStorage on mount
  const [labResults, setLabResults] = useState(() => {
    try {
      const stored = localStorage.getItem('labResults');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const [questionnaireMap, setQuestionnaireMap] = useState(() => {
    try {
      const stored = localStorage.getItem('questionnaireMap');
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem('labResults', JSON.stringify(labResults));
  }, [labResults]);

  useEffect(() => {
    localStorage.setItem('questionnaireMap', JSON.stringify(questionnaireMap));
  }, [questionnaireMap]);

  // MLT submits a lab result
  const submitLabResult = (result) => {
    const newResult = {
      id: `LR-${Date.now()}`,
      patientId: result.patientId || 'PAT-2023-001',
      patientName: result.patientName || 'Unknown',
      findings: result.findings || {},
      aiRiskScore: result.aiRiskScore || 0,
      image: result.image || null,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Ready for Review',
      mltName: result.mltName || 'MLT Tech',
      enhancedRiskScore: null,
      questionnaireCompleted: false,
    };

    // Calculate initial risk from lab data only
    newResult.riskScore = calculateEnhancedRisk(newResult, null);
    newResult.riskLabel = getRiskLabel(newResult.riskScore);

    setLabResults(prev => [newResult, ...prev]);
    return newResult;
  };

  // Patient submits questionnaire for a specific lab result
  const submitQuestionnaire = (labResultId, questionnaireData) => {
    // Store questionnaire
    setQuestionnaireMap(prev => ({
      ...prev,
      [labResultId]: questionnaireData
    }));

    // Recalculate risk with questionnaire data
    setLabResults(prev => prev.map(result => {
      if (result.id === labResultId) {
        const enhancedScore = calculateEnhancedRisk(result, questionnaireData);
        return {
          ...result,
          enhancedRiskScore: enhancedScore,
          enhancedRiskLabel: getRiskLabel(enhancedScore),
          questionnaireCompleted: true,
        };
      }
      return result;
    }));
  };

  // Get all results for a patient
  const getPatientResults = (patientId) => {
    return labResults.filter(r => r.patientId === patientId);
  };

  // Get latest result for a patient
  const getLatestResult = (patientId) => {
    const results = getPatientResults(patientId);
    return results.length > 0 ? results[0] : null;
  };

  // Get questionnaire for a lab result
  const getQuestionnaire = (labResultId) => {
    return questionnaireMap[labResultId] || null;
  };

  return (
    <LabDataContext.Provider value={{
      labResults,
      submitLabResult,
      submitQuestionnaire,
      getPatientResults,
      getLatestResult,
      getQuestionnaire,
      calculateEnhancedRisk,
      getRiskLabel,
    }}>
      {children}
    </LabDataContext.Provider>
  );
};

export const useLabData = () => useContext(LabDataContext);
