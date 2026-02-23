import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Paper, Typography, Button, TextField, Autocomplete, Tabs, Tab, 
  CircularProgress, Grid, Divider 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import VideocamIcon from '@mui/icons-material/Videocam';
import ImageUpload from './ImageUpload';
import AnalysisView from './AnalysisView';
import { api } from '../../services/api';
import microscopyImage from '../../assets/c5.jpg'; // Import generic image for mock results

const AnalysisWorkflow = ({ preSelectedPatient }) => {
  const [selectedPatient, setSelectedPatient] = useState(preSelectedPatient || null);
  const [patients, setPatients] = useState([]);
  const [inputMethod, setInputMethod] = useState(0); // 0: Upload, 1: Camera
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  
  // Camera state
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
        
        // Auto-load result if patient is already processed
        if (preSelectedPatient.status === 'Ready for Review' || preSelectedPatient.status === 'Completed') {
            setUploadedImage(microscopyImage);
            setAnalysisResult({
                wbc: 5,
                rbc: 2,
                crystals: 'Calcium Oxalate',
                risk: 45
            });
        } else {
            // Reset if new analysis needed
            setAnalysisResult(null);
            setUploadedImage(null);
        }
    }
  }, [preSelectedPatient]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleTabChange = (event, newValue) => {
    setInputMethod(newValue);
    if (newValue === 1) {
        startCamera();
    } else {
        stopCamera();
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      // alert("Could not access camera. Please check permissions."); // Suppress alert for better UX in mock
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
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob((blob) => {
         const file = new File([blob], "microscope_capture.png", { type: "image/png" });
         handleAnalysis(file);
      }, 'image/png');
      
      stopCamera();
    }
  };

  const handleAnalysis = async (file) => {
    setAnalyzing(true);
    try {
      const result = await api.uploadImage(file);
      setUploadedImage(result.url);
      setAnalysisResult(result.analysis);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getOptionLabel = (option) => {
      if (!option) return '';
      return `${option.name} (ID: ${option.id})`;
  }

  // Render Result View
  if (analysisResult && uploadedImage) {
      return (
          <Box>
            <Button onClick={() => { 
                setAnalysisResult(null); 
                setUploadedImage(null); 
                setInputMethod(0);
            }} sx={{ mb: 2 }}>
                &larr; New Analysis
            </Button>
            <AnalysisView image={uploadedImage} analysis={analysisResult} patient={selectedPatient} />
          </Box>
      )
  }

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
        <style>
            {`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}
        </style>
       <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold' }}>
            Analysis Workspace
       </Typography>
       
       <Grid container spacing={4}>
           {/* Left Panel: Patient Selection */}
           <Grid size={{ xs: 12, md: 4 }}>
               <Paper sx={{ 
                   p: 4, 
                   height: '100%', 
                   borderRadius: 3,
                   borderBottom: '4px solid #00bcd4',
                   transition: 'transform 0.2s',
                   '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
               }}>
                   <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                       <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', mr: 2 }}>1</Box>
                       <Typography variant="h6" fontWeight="bold">Select Patient</Typography>
                   </Box>
                   
                   <Autocomplete
                        options={patients}
                        getOptionLabel={getOptionLabel}
                        value={selectedPatient}
                        onChange={(event, newValue) => setSelectedPatient(newValue)}
                        renderInput={(params) => <TextField {...params} label="Search Patient ID or Name" variant="outlined" />}
                        sx={{ mb: 3 }}
                   />
                   
                   {selectedPatient ? (
                       <Box sx={{ p: 3, bgcolor: 'rgba(0, 188, 212, 0.08)', borderRadius: 2, border: '1px solid rgba(0, 188, 212, 0.2)' }}>
                           <Typography variant="subtitle2" color="primary.main" gutterBottom>SELECTED PATIENT</Typography>
                           <Typography variant="h6" fontWeight="bold">{selectedPatient.name}</Typography>
                           <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>ID: {selectedPatient.id}</Typography>
                           <Typography variant="body2" color="text.secondary">Age: {selectedPatient.age}</Typography>
                           <Divider sx={{ my: 2 }} />
                           <Typography variant="caption" sx={{ bgcolor: 'background.paper', px: 1, py: 0.5, borderRadius: 1, border: '1px solid divider' }}>
                               History: Recurrent Stones
                           </Typography>
                       </Box>
                   ) : (
                       <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default', borderRadius: 2, border: '1px dashed divider' }}>
                           <Typography variant="body2" color="text.secondary">No patient selected</Typography>
                       </Box>
                   )}
               </Paper>
           </Grid>

           {/* Right Panel: Image Input */}
           <Grid size={{ xs: 12, md: 8 }}>
               <Paper sx={{ 
                   p: 4, 
                   height: '100%',
                   borderRadius: 3,
                   borderBottom: '4px solid #00bcd4',
                   opacity: selectedPatient ? 1 : 0.7,
                   pointerEvents: selectedPatient ? 'auto' : 'none',
                   transition: 'opacity 0.3s'
               }}>
                   <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                       <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: selectedPatient ? 'primary.main' : 'action.disabled', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', mr: 2 }}>2</Box>
                       <Typography variant="h6" fontWeight="bold" color={selectedPatient ? 'text.primary' : 'text.secondary'}>Acquire Image</Typography>
                   </Box>
                   
                   {!selectedPatient ? (
                        <Box sx={{ p: 10, textAlign: 'center', color: 'text.secondary', border: '1px dashed divider', borderRadius: 2 }}>
                            <Typography>Please select a patient first to proceed with analysis.</Typography>
                        </Box>
                   ) : (
                       <>
                        <Tabs 
                            value={inputMethod} 
                            onChange={handleTabChange} 
                            sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}
                            indicatorColor="primary"
                            textColor="primary"
                        >
                            <Tab icon={<CloudUploadIcon />} label="Upload File" iconPosition="start" />
                            <Tab icon={<VideocamIcon />} label="Microscope Camera" iconPosition="start" />
                        </Tabs>

                        {analyzing ? (
                            <Box sx={{ p: 8, textAlign: 'center' }}>
                                <CircularProgress size={60} thickness={4} />
                                <Typography variant="h6" sx={{ mt: 3, fontWeight: 'bold' }}>Analyzing Sample...</Typography>
                                <Typography variant="body2" color="text.secondary">Running AI detection for crystals and cells.</Typography>
                            </Box>
                        ) : (
                            <>
                                {inputMethod === 0 && (
                                    <Box sx={{ p: 2 }}>
                                        <ImageUpload onUpload={handleAnalysis} />
                                    </Box>
                                )}

                                {inputMethod === 1 && (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        {isCameraActive ? (
                                            <Paper elevation={4} sx={{ width: '100%', height: 450, bgcolor: '#000', mb: 3, display: 'flex', justifyContent: 'center', overflow: 'hidden', borderRadius: 2 }}>
                                                <video ref={videoRef} autoPlay playsInline style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                            </Paper>
                                        ) : (
                                            <Box sx={{ width: '100%', height: 300, bgcolor: 'background.default', mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, border: '1px dashed #666' }}>
                                                <Typography variant="body1" color="text.secondary">Camera is currently inactive</Typography>
                                            </Box>
                                        )}
                                        
                                        <Button 
                                            variant="contained" 
                                            size="large"
                                            startIcon={<CameraAltIcon />} 
                                            onClick={captureImage}
                                            disabled={!isCameraActive}
                                            sx={{ 
                                                py: 1.5, px: 4, 
                                                borderRadius: 2,
                                                background: isCameraActive ? 'linear-gradient(45deg, #f44336 30%, #ff1744 90%)' : undefined,
                                                boxShadow: isCameraActive ? '0 3px 5px 2px rgba(255, 23, 68, .3)' : undefined
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
               </Paper>
           </Grid>
       </Grid>
    </Box>
  );
};

export default AnalysisWorkflow;
