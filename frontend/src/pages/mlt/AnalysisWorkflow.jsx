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
    const fetchPatients = async () => {
      const data = await api.getPatients();
      setPatients(data);
    };
    fetchPatients();
  }, []);

  useEffect(() => {
    if (preSelectedPatient) {
        setSelectedPatient(preSelectedPatient);
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
      alert("Could not access camera. Please check permissions.");
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
            <AnalysisView image={uploadedImage} analysis={analysisResult} />
          </Box>
      )
  }

  return (
    <Box>
       <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            Analysis Workspace
       </Typography>
       
       <Grid container spacing={3}>
           {/* Left Panel: Patient Selection */}
           <Grid item xs={12} md={4}>
               <Paper sx={{ p: 3, height: '100%' }}>
                   <Typography variant="h6" gutterBottom>1. Select Patient</Typography>
                   <Autocomplete
                        options={patients}
                        getOptionLabel={getOptionLabel}
                        value={selectedPatient}
                        onChange={(event, newValue) => setSelectedPatient(newValue)}
                        renderInput={(params) => <TextField {...params} label="Search Patient ID or Name" variant="outlined" />}
                        sx={{ mb: 3 }}
                   />
                   
                   {selectedPatient && (
                       <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                           <Typography variant="subtitle2">Selected Patient Details:</Typography>
                           <Typography variant="body1" fontWeight="bold">{selectedPatient.name}</Typography>
                           <Typography variant="body2">ID: {selectedPatient.id}</Typography>
                           <Typography variant="body2">Age: {selectedPatient.age}</Typography>
                           <Typography variant="body2">History: Recurrent Stones</Typography> 
                       </Box>
                   )}
               </Paper>
           </Grid>

           {/* Right Panel: Image Input */}
           <Grid item xs={12} md={8}>
               <Paper sx={{ p: 3, height: '100%' }}>
                   <Typography variant="h6" gutterBottom>2. Acquire Image</Typography>
                   
                   {!selectedPatient ? (
                        <Box sx={{ p: 5, textAlign: 'center', color: 'text.secondary' }}>
                            <Typography>Please select a patient first to proceed with analysis.</Typography>
                        </Box>
                   ) : (
                       <>
                        <Tabs value={inputMethod} onChange={handleTabChange} sx={{ mb: 3 }}>
                            <Tab icon={<CloudUploadIcon />} label="Upload File" iconPosition="start" />
                            <Tab icon={<VideocamIcon />} label="Microscope Camera" iconPosition="start" />
                        </Tabs>

                        {analyzing ? (
                            <Box sx={{ p: 8, textAlign: 'center' }}>
                                <CircularProgress />
                                <Typography sx={{ mt: 2 }}>Analyzing Sample...</Typography>
                            </Box>
                        ) : (
                            <>
                                {inputMethod === 0 && (
                                    <Box>
                                        <ImageUpload onUpload={handleAnalysis} />
                                    </Box>
                                )}

                                {inputMethod === 1 && (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        {isCameraActive ? (
                                            <Box sx={{ width: '100%', height: 400, bgcolor: '#000', mb: 2, display: 'flex', justifyContent: 'center' }}>
                                                <video ref={videoRef} autoPlay playsInline style={{ maxWidth: '100%', maxHeight: '100%' }} />
                                            </Box>
                                        ) : (
                                            <Box sx={{ width: '100%', height: 300, bgcolor: '#f5f5f5', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">Camera is off</Typography>
                                            </Box>
                                        )}
                                        
                                        <Button 
                                            variant="contained" 
                                            color="primary" 
                                            startIcon={<CameraAltIcon />} 
                                            onClick={captureImage}
                                            disabled={!isCameraActive}
                                            size="large"
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
