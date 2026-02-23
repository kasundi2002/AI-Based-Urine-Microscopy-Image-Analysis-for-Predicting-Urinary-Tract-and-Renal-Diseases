import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Divider, List, ListItem, ListItemText, TextField, Button, Avatar, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningIcon from '@mui/icons-material/Warning';
import { styled } from '@mui/material/styles';
import microscopyImage from '../../assets/c2.jpg';

const ImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative', // Needed for absolute positioning of boxes
  width: '100%',
  height: 400,
  backgroundColor: '#f5f5f5',
  border: '1px solid #e0e0e0',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const BoundingBox = styled(Box)(({ color }) => ({
  position: 'absolute',
  border: `2px solid ${color}`,
  backgroundColor: 'transparent',
  '&:hover': {
    backgroundColor: `${color}1a`,
    cursor: 'pointer',
  }
}));

const LabelTag = styled(Box)(({ color }) => ({
   position: 'absolute', 
   top: -24, 
   left: -2,
   backgroundColor: color, 
   color: '#000', 
   fontSize: '0.75rem', 
   padding: '2px 6px',
   borderRadius: 2,
   fontWeight: 'bold',
   whiteSpace: 'nowrap'
}));

const DiagnosticView = ({ report }) => {
  const [agreement, setAgreement] = useState('agree');
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');

  if (!report) return (
      <Box sx={{ p: 5, textAlign: 'center' }}>
          <Typography color="text.secondary">Select a patient report to view details.</Typography>
      </Box>
  );

  // Mock data if report is simple patient object
  const displayReport = {
      image: report.image && !report.image.includes('placeholder') ? report.image : microscopyImage,
      riskScore: report.riskScore || (report.riskAssessment === 'High' ? 85 : 20),
      riskLabel: report.riskAssessment || 'Normal',
      findings: report.findings || { wbc: 12, rbc: 3, crystals: 'Calcium Oxalate', bacteria: 'None' },
      patientName: report.patientName || report.name,
      patientId: report.patientId || report.id,
      patientAge: report.patientAge || report.age
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Microscopy Analysis</Typography>
            <ImageContainer sx={{ height: 'calc(100% - 40px)' }}> {/* Adjust height to fill */}
              <img 
                src={displayReport.image} 
                alt="Microscopy" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
              {/* Mock Bounding Boxes - In production this would come from report.findings.boxes */}
              {[
                { id: 1, type: 'WBC', x: 25, y: 35, w: 8, h: 8, color: '#00bcd4' },
                { id: 2, type: 'RBC', x: 55, y: 55, w: 7, h: 7, color: '#ff1744' },
                { id: 3, type: 'Crystal', x: 70, y: 25, w: 12, h: 12, color: '#ff9100' },
              ].map(box => (
                <BoundingBox
                  key={box.id}
                  color={box.color}
                  sx={{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.w}%`,
                    height: `${box.h}%`,
                    boxShadow: `0 0 10px ${box.color}`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'scale(1.1)',
                        zIndex: 10
                    }
                  }}
                >
                  <LabelTag color={box.color}>
                      {box.type}
                  </LabelTag>
                </BoundingBox>
              ))}
            </ImageContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.main' }}>
                    {displayReport.patientName.charAt(0)}
                </Avatar>
                <Box>
                    <Typography variant="h6">{displayReport.patientName}</Typography>
                    <Typography variant="body2" color="text.secondary">ID: {displayReport.patientId} | Age: {displayReport.patientAge}</Typography>
                </Box>
            </Box>
            
            <Divider sx={{ mb: 3 }} />

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>AI Risk Assessment</Typography>
            <Box sx={{ 
                p: 2, 
                bgcolor: displayReport.riskScore > 50 ? 'error.light' : 'success.light', 
                color: displayReport.riskScore > 50 ? 'error.contrastText' : 'success.contrastText',
                borderRadius: 2,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Typography fontWeight="bold">{displayReport.riskLabel}</Typography>
                <Typography fontWeight="bold">{displayReport.riskScore}% Probability</Typography>
            </Box>

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Detailed Findings</Typography>
            <List dense>
              <ListItem disableGutters divider>
                <ListItemText primary="WBC Count" />
                <Typography fontWeight="bold">{displayReport.findings.wbc} / HPF</Typography>
              </ListItem>
              <ListItem disableGutters divider>
                <ListItemText primary="RBC Count" />
                <Typography fontWeight="bold">{displayReport.findings.rbc} / HPF</Typography>
              </ListItem>
              <ListItem disableGutters divider>
                <ListItemText primary="Crystals" />
                <Typography fontWeight="bold">{displayReport.findings.crystals}</Typography>
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Bacteria" />
                <Typography fontWeight="bold">{displayReport.findings.bacteria}</Typography>
              </ListItem>
            </List>
          </Paper>

          {/* Clinical Verification Form - Moved Here */}
          <Paper sx={{ 
              p: 3, 
              bgcolor: '#0a1929', // Deep navy background
              color: 'white',
              borderRadius: 2,
              border: '1px solid rgba(0, 188, 212, 0.3)'
          }}>
              <Typography variant="h6" gutterBottom>Clinical Verification</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>Do you agree with the AI diagnosis?</Typography>
              
              <RadioGroup
                row
                value={agreement}
                onChange={(e) => setAgreement(e.target.value)}
                sx={{ mb: 3 }}
              >
                <FormControlLabel value="agree" control={<Radio sx={{ color: 'primary.main', '&.Mui-checked': { color: 'cyan' } }} />} label="Yes, Agree" />
                <FormControlLabel value="modify" control={<Radio sx={{ color: 'primary.main', '&.Mui-checked': { color: 'cyan' } }} />} label="Modify" />
                <FormControlLabel value="reject" control={<Radio sx={{ color: 'primary.main', '&.Mui-checked': { color: 'cyan' } }} />} label="Reject" />
              </RadioGroup>

              <TextField 
                multiline
                rows={2}
                fullWidth
                placeholder="Clinical Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={{ 
                    mb: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    '& .MuiOutlinedInput-root': { color: 'white' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' }
                }}
              />

              <TextField 
                multiline
                rows={2}
                fullWidth
                placeholder="Prescription"
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                sx={{ 
                    mb: 3,
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    '& .MuiOutlinedInput-root': { color: 'white' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' }
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    sx={{ 
                        bgcolor: 'cyan', 
                        color: 'black', 
                        fontWeight: 'bold',
                        '&:hover': { bgcolor: '#00bcd4' }
                    }}
                  >
                      Verify & Sign
                  </Button>
              </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DiagnosticView;
