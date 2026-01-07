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

  const handleSelectReport = (report) => {
      setSelectedReport(report);
      setView('review');
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
        <DiagnosticView report={selectedReport} />
      )}
    </Box>
  );
};

export default ClinicianDashboard;
