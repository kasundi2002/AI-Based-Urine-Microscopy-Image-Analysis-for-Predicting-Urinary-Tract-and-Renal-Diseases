import React, { useState } from 'react';
import { Box, Typography, Button, Breadcrumbs, Link, Paper, CircularProgress } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PatientQueue from './PatientQueue';
import ImageUpload from './ImageUpload';
import AnalysisView from './AnalysisView';
import { api } from '../../services/api';

const MLTDashboard = () => {
  const [currentView, setCurrentView] = useState('queue'); // queue, upload, analysis
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    if (patient.status === 'Awaiting Analysis') {
      setCurrentView('upload');
    } else {
      // For completed patients, we might show the report directly (mocked here)
      setCurrentView('queue'); 
    }
  };

  const handleUpload = async (file) => {
    setAnalyzing(true);
    try {
      const result = await api.uploadImage(file);
      setUploadedImage(result.url);
      setAnalysisResult(result.analysis);
      setCurrentView('analysis');
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setCurrentView('queue');
    setSelectedPatient(null);
    setUploadedImage(null);
    setAnalysisResult(null);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          MLT Workspace
        </Typography>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
          <Link underline="hover" color="inherit" onClick={handleReset} sx={{ cursor: 'pointer' }}>
            Dashboard
          </Link>
          {selectedPatient && (
            <Typography color="text.primary">{selectedPatient.name}</Typography>
          )}
          {currentView === 'analysis' && (
            <Typography color="text.primary">Analysis</Typography>
          )}
        </Breadcrumbs>
      </Box>

      {currentView === 'queue' && (
        <PatientQueue onSelectPatient={handleSelectPatient} />
      )}

      {currentView === 'upload' && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Upload Microscopy Sample for {selectedPatient?.name}
          </Typography>
          {analyzing ? (
            <Paper sx={{ p: 10, textAlign: 'center' }}>
              <CircularProgress size={60} />
              <Typography sx={{ mt: 2 }}>Analyzing Sample with AI Model...</Typography>
            </Paper>
          ) : (
            <ImageUpload onUpload={handleUpload} />
          )}
          <Button onClick={() => setCurrentView('queue')} sx={{ mt: 2 }}>
            Cancel
          </Button>
        </Box>
      )}

      {currentView === 'analysis' && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Analysis Results: {selectedPatient?.name}
            </Typography>
            <Button variant="contained" color="primary" onClick={handleReset}>
              Submit Report
            </Button>
          </Box>
          <AnalysisView image={uploadedImage} analysis={analysisResult} />
        </Box>
      )}
    </Box>
  );
};

export default MLTDashboard;
