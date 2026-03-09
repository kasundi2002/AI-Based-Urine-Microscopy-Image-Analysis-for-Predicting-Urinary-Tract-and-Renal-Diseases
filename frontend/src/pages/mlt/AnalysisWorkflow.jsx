import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Autocomplete, Tabs, Tab,
  CircularProgress, Grid, Divider, Avatar, Chip, Stepper, Step, StepLabel, StepConnector
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import VideocamIcon from '@mui/icons-material/Videocam';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import PhotoCameraBackIcon from '@mui/icons-material/PhotoCameraBack';
import ScienceIcon from '@mui/icons-material/Science';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import ImageUpload from './ImageUpload';
import AnalysisView from './AnalysisView';
import ChemicalParametersForm from './ChemicalParametersForm';
import { api } from '../../services/api';
import microscopyImage from '../../assets/c5.jpg';

const StepIconRoot = styled('div')(({ ownerState }) => ({
  width: 36, height: 36, borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontWeight: 700, fontSize: '0.85rem',
  ...(ownerState.active && {
    background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
    color: 'white',
    boxShadow: '0 3px 10px rgba(15,23,42,0.3)',
  }),
  ...(ownerState.completed && {
    bgcolor: '#00bcd4',
    background: '#00bcd4',
    color: 'white',
  }),
  ...(!ownerState.active && !ownerState.completed && {
    backgroundColor: alpha('#9e9e9e', 0.12),
    color: '#9e9e9e',
  }),
}));

function CustomStepIcon(props) {
  const { active, completed, icon } = props;
  const icons = { 1: <PersonSearchIcon sx={{ fontSize: 18 }} />, 2: <PhotoCameraBackIcon sx={{ fontSize: 18 }} />, 3: <ScienceIcon sx={{ fontSize: 18 }} />, 4: <ScienceIcon sx={{ fontSize: 18 }} /> };
  return (
    <StepIconRoot ownerState={{ active, completed }}>
      {completed ? <CheckCircleIcon sx={{ fontSize: 20 }} /> : icons[String(icon)]}
    </StepIconRoot>
  );
}

const AnalysisWorkflow = ({ preSelectedPatient }) => {
  const [selectedPatient, setSelectedPatient] = useState(preSelectedPatient || null);
  const [patients, setPatients] = useState([]);
  const [inputMethod, setInputMethod] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [chemicalParameters, setChemicalParameters] = useState(null);

  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    if (isCameraActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraActive, stream, inputMethod]);

  useEffect(() => {
    const fetchPatients = async () => {
      const data = await api.getPatients();
      setPatients(data);
    };
    fetchPatients();
  }, []);

  useEffect(() => {
    if (preSelectedPatient) {
      setSelectedPatient(preSelectedPatient);
      if (preSelectedPatient.status === 'Ready for Review' || preSelectedPatient.status === 'Completed') {
        // Fetch real report from database
        const fetchReport = async () => {
          try {
            const reports = await api.getReportsByPatient(preSelectedPatient._id);
            if (reports && reports.length > 0) {
              const latestReport = reports[0]; // Already sorted by createdAt desc
              const fullImageUrl = latestReport.imageUrl ? `http://localhost:5000${latestReport.imageUrl}` : null;
              setUploadedImage(fullImageUrl);
              setAnalysisResult(latestReport.analysis);
              if (latestReport.chemicalParameters) {
                setChemicalParameters(latestReport.chemicalParameters);
              }
            } else {
              // No report found, reset
              setAnalysisResult(null);
              setUploadedImage(null);
              setChemicalParameters(null);
            }
          } catch (error) {
            console.error('Failed to fetch patient report:', error);
            setAnalysisResult(null);
            setUploadedImage(null);
            setChemicalParameters(null);
          }
        };
        fetchReport();
      } else {
        setAnalysisResult(null);
        setUploadedImage(null);
      }
    }
  }, [preSelectedPatient]);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [stream]);

  const handleTabChange = (event, newValue) => {
    setInputMethod(newValue);
    if (newValue === 1) startCamera();
    else stopCamera();
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setIsCameraActive(true);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        handleAnalysis(new File([blob], "microscope_capture.png", { type: "image/png" }));
      }, 'image/png');
      stopCamera();
    }
  };

  const handleAnalysis = async (file) => {
    setAnalyzing(true);
    try {
      // Ensure we pass patientId for the backend route
      const result = await api.uploadImage(file, selectedPatient?._id);

      // result holds the mongodb document (with imageUrl and analysis object)
      const fullImageUrl = `http://localhost:5000${result.imageUrl}`;

      setUploadedImage(fullImageUrl);
      setAnalysisResult(result.analysis);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getOptionLabel = (option) => option ? `${option.name} (ID: ${option.patientId})` : '';

  const [showChemForm, setShowChemForm] = useState(false);

  const activeStep = chemicalParameters ? 3 : analysisResult ? 2 : selectedPatient ? 1 : 0;

  // Render Chemical Parameters Form (optional step, triggered from AnalysisView)
  if (analysisResult && uploadedImage && showChemForm && !chemicalParameters) {
    return (
      <Box sx={{ animation: 'fadeIn 0.4s ease-out' }}>
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        <ChemicalParametersForm
          patient={selectedPatient}
          onSubmit={(params) => { setChemicalParameters(params); setShowChemForm(false); }}
          onBack={() => setShowChemForm(false)}
        />
      </Box>
    );
  }

  // Render Report View (after AI analysis, with or without chemical params)
  if (analysisResult && uploadedImage) {
    return (
      <Box sx={{ animation: 'fadeIn 0.4s ease-out' }}>
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        <AnalysisView image={uploadedImage} analysis={analysisResult} chemicalParameters={chemicalParameters} patient={selectedPatient} onNewAnalysis={() => { setAnalysisResult(null); setUploadedImage(null); setChemicalParameters(null); setShowChemForm(false); setInputMethod(0); setSelectedPatient(null); }} onReAnalysis={() => { setAnalysisResult(null); setUploadedImage(null); setChemicalParameters(null); setShowChemForm(false); setInputMethod(0); }} onAddChemicalParams={() => setShowChemForm(true)} />
      </Box>
    );
  }

  return (
    <Box sx={{ animation: 'fadeIn 0.4s ease-out' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <ScienceIcon sx={{ color: '#00bcd4', fontSize: 28 }} />
            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: -0.5 }}>Analysis Workspace</Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#8898aa' }}>
            Select a patient, upload a microscopy image, and run AI analysis
          </Typography>
        </Box>
      </Box>

      {/* Progress Stepper */}
      <Paper elevation={0} sx={{ px: 4, py: 2, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stepper activeStep={activeStep} alternativeLabel
          connector={<StepConnector sx={{ '& .MuiStepConnector-line': { borderColor: alpha('#00bcd4', 0.2), borderTopWidth: 2 } }} />}
        >
          {['Select Patient', 'Acquire Image', 'AI Analysis', 'Chemical Params'].map((label, idx) => (
            <Step key={label} completed={activeStep > idx}>
              <StepLabel StepIconComponent={CustomStepIcon}>
                <Typography variant="caption" fontWeight={activeStep >= idx ? 700 : 500} color={activeStep >= idx ? 'text.primary' : 'text.secondary'}>
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Grid container spacing={3}>
        {/* Left Panel: Patient Selection */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{
            borderRadius: 3, overflow: 'hidden', height: '100%',
            border: '1px solid', borderColor: selectedPatient ? '#00bcd4' : 'divider',
            transition: 'border-color 0.3s',
          }}>
            <Box sx={{
              px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider',
              display: 'flex', alignItems: 'center', gap: 1.5,
              bgcolor: selectedPatient ? alpha('#00bcd4', 0.03) : 'transparent',
            }}>
              <PersonSearchIcon sx={{ color: '#00bcd4', fontSize: 20 }} />
              <Typography variant="subtitle1" fontWeight={700}>Select Patient</Typography>
              {selectedPatient && <CheckCircleIcon sx={{ fontSize: 16, color: '#66bb6a', ml: 'auto' }} />}
            </Box>

            <Box sx={{ p: 3 }}>
              <Autocomplete
                options={patients.filter(p => p.status === 'Awaiting Analysis')}
                getOptionLabel={getOptionLabel}
                value={selectedPatient}
                onChange={(event, newValue) => setSelectedPatient(newValue)}
                renderOption={(props, option) => {
                  const { key, ...rest } = props;
                  return (
                    <Box component="li" key={key} {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                      <Avatar sx={{ width: 30, height: 30, bgcolor: alpha('#00bcd4', 0.1), color: '#00bcd4', fontSize: '0.75rem', fontWeight: 700 }}>
                        {option.name?.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">ID: {option.patientId}</Typography>
                      </Box>
                      <Chip
                        label={option.status}
                        size="small"
                        sx={{
                          height: 20, fontSize: '0.6rem', fontWeight: 600,
                          bgcolor: alpha('#ff9800', 0.1), color: '#e65100',
                        }}
                      />
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search by name or ID..."
                    variant="outlined"
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                )}
                noOptionsText="No patients awaiting analysis"
                sx={{ mb: 3 }}
              />

              {selectedPatient ? (
                <Paper elevation={0} sx={{
                  p: 2.5, borderRadius: 2.5,
                  border: '1px solid', borderColor: alpha('#00bcd4', 0.15),
                  bgcolor: alpha('#00bcd4', 0.03),
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ width: 44, height: 44, bgcolor: alpha('#00bcd4', 0.1), color: '#00bcd4', fontWeight: 700 }}>
                      {selectedPatient.name?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>{selectedPatient.name}</Typography>
                      <Typography variant="caption" color="text.secondary">ID: {selectedPatient.patientId}</Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 1.5 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">Age</Typography>
                      <Typography variant="caption" fontWeight={600}>{selectedPatient.age}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">Status</Typography>
                      <Chip label={selectedPatient.status} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600 }} />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">History</Typography>
                      <Typography variant="caption" fontWeight={600}>Recurrent Stones</Typography>
                    </Box>
                  </Box>
                </Paper>
              ) : (
                <Box sx={{
                  p: 4, textAlign: 'center', borderRadius: 2.5,
                  border: '1px dashed', borderColor: 'divider',
                }}>
                  <PersonIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">No patient selected</Typography>
                  <Typography variant="caption" color="text.disabled">Search or select from the dropdown</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right Panel: Image Input */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={0} sx={{
            borderRadius: 3, overflow: 'hidden', height: '100%',
            border: '1px solid', borderColor: 'divider',
            opacity: selectedPatient ? 1 : 0.5,
            pointerEvents: selectedPatient ? 'auto' : 'none',
            transition: 'opacity 0.3s',
          }}>
            <Box sx={{
              px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider',
              display: 'flex', alignItems: 'center', gap: 1.5
            }}>
              <PhotoCameraBackIcon sx={{ color: selectedPatient ? '#00bcd4' : 'text.disabled', fontSize: 20 }} />
              <Typography variant="subtitle1" fontWeight={700} color={selectedPatient ? 'text.primary' : 'text.secondary'}>
                Acquire Image
              </Typography>
            </Box>

            <Box sx={{ p: 3 }}>
              {!selectedPatient ? (
                <Box sx={{ p: 8, textAlign: 'center' }}>
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">Please select a patient first</Typography>
                  <Typography variant="caption" color="text.disabled">A patient must be selected before uploading a sample image</Typography>
                </Box>
              ) : (
                <>
                  <Tabs
                    value={inputMethod}
                    onChange={handleTabChange}
                    sx={{
                      mb: 3,
                      '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 44 },
                      '& .MuiTabs-indicator': { bgcolor: '#00bcd4', height: 3, borderRadius: '3px 3px 0 0' },
                    }}
                  >
                    <Tab icon={<CloudUploadIcon sx={{ fontSize: 18 }} />} label="Upload File" iconPosition="start" />
                    <Tab icon={<VideocamIcon sx={{ fontSize: 18 }} />} label="Microscope Camera" iconPosition="start" />
                  </Tabs>

                  {analyzing ? (
                    <Box sx={{ p: 8, textAlign: 'center' }}>
                      <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
                        <CircularProgress size={70} thickness={3} sx={{ color: '#00bcd4' }} />
                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ScienceIcon sx={{ fontSize: 28, color: '#00bcd4' }} />
                        </Box>
                      </Box>
                      <Typography variant="h6" fontWeight={700}>Analyzing Sample...</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Running AI detection for crystals, cells, and bacteria
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {inputMethod === 0 && <ImageUpload onUpload={handleAnalysis} />}

                      {inputMethod === 1 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          {isCameraActive ? (
                            <Paper elevation={0} sx={{
                              width: '100%', height: 400, bgcolor: '#000', mb: 3, overflow: 'hidden', borderRadius: 3,
                              display: 'flex', justifyContent: 'center', border: '1px solid', borderColor: 'divider'
                            }}>
                              <video ref={videoRef} autoPlay playsInline style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                            </Paper>
                          ) : (
                            <Box sx={{
                              width: '100%', height: 300, mb: 3, borderRadius: 3,
                              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                              border: '2px dashed', borderColor: alpha('#9e9e9e', 0.2), bgcolor: alpha('#f8fafc', 0.5)
                            }}>
                              <VideocamIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                              <Typography variant="body2" color="text.secondary">Camera is initializing...</Typography>
                            </Box>
                          )}

                          <Button
                            variant="contained"
                            size="large"
                            startIcon={<CameraAltIcon />}
                            onClick={captureImage}
                            disabled={!isCameraActive}
                            sx={{
                              py: 1.5, px: 5, borderRadius: 2, textTransform: 'none', fontWeight: 700,
                              background: isCameraActive ? 'linear-gradient(135deg, #ef5350, #c62828)' : undefined,
                              boxShadow: isCameraActive ? '0 4px 14px rgba(239,83,80,0.3)' : undefined
                            }}
                          >
                            Capture & Analyze
                          </Button>
                        </Box>
                      )}
                    </>
                  )}
                </>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalysisWorkflow;
