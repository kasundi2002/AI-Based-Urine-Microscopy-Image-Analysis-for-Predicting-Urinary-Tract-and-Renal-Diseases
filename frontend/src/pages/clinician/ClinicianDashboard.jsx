import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import ClinicianOverview from './ClinicianOverview';
import DoctorPatientQueue from './DoctorPatientQueue';
import DiagnosticView from './DiagnosticView';
import { api } from '../../services/api';

const ClinicianDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get('view') || 'dashboard';
  const [selectedReport, setSelectedReport] = useState(null);

  const setView = (view) => {
    setSearchParams({ view });
  };

  const handleSelectReport = async (patient) => {
    try {
      // Fetch the latest report for this patient from the database
      const reports = await api.getReportsByPatient(patient._id);
      if (reports && reports.length > 0) {
        const latestReport = reports[0]; // Already sorted by createdAt desc
        setSelectedReport({
          ...latestReport,
          // Attach patient info for easy access
          patientName: patient.name,
          patientAge: patient.age,
          patientDisplayId: patient.patientId || patient.id,
        });
      } else {
        // Fallback: pass patient info directly if no report found
        setSelectedReport(patient);
      }
      setView('review');
    } catch (error) {
      console.error('Failed to fetch report:', error);
      setSelectedReport(patient);
      setView('review');
    }
  };

  const handleVerificationComplete = () => {
    setSelectedReport(null);
    setView('patients');
  };

  return (
    <Box>
      {currentView === 'dashboard' && (
        <ClinicianOverview onNavigate={setView} />
      )}

      {currentView === 'patients' && (
        <DoctorPatientQueue onSelectPatient={handleSelectReport} />
      )}

      {currentView === 'review' && (
        <DiagnosticView report={selectedReport} onVerify={handleVerificationComplete} />
      )}
    </Box>
  );
};

export default ClinicianDashboard;

