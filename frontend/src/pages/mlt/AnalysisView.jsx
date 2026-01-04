import React from 'react';
import { Box, Typography, Paper, Grid, Chip, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

const ImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: 400,
  backgroundColor: '#000',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const BoundingBox = styled(Box)(({ color }) => ({
  position: 'absolute',
  border: `2px solid ${color}`,
  backgroundColor: `${color}33`, // 20% opacity
  '&:hover': {
    backgroundColor: `${color}66`, // 40% opacity
    cursor: 'pointer',
  }
}));

const AnalysisView = ({ image, analysis }) => {
  if (!image || !analysis) return null;

  // Mock bounding boxes based on analysis
  // In a real app, these coordinates would come from the backend
  const boxes = [
    { id: 1, type: 'WBC', x: 20, y: 30, w: 10, h: 10, color: '#00e5ff' },
    { id: 2, type: 'RBC', x: 50, y: 60, w: 8, h: 8, color: '#ff1744' },
    { id: 3, type: 'Crystal', x: 70, y: 20, w: 15, h: 15, color: '#ff9100' },
  ];

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Microscopy Analysis</Typography>
            <ImageContainer>
              <img 
                src={image} 
                alt="Microscopy" 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
              />
              {boxes.map(box => (
                <BoundingBox
                  key={box.id}
                  color={box.color}
                  sx={{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.w}%`,
                    height: `${box.h}%`,
                  }}
                >
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: -20, 
                      left: 0, 
                      bgcolor: box.color, 
                      color: '#000', 
                      fontSize: '0.75rem', 
                      px: 0.5,
                      borderRadius: 0.5,
                      fontWeight: 'bold'
                    }}
                  >
                    {box.type}
                  </Box>
                </BoundingBox>
              ))}
            </ImageContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Findings</Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">Risk Assessment</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={analysis.risk} 
                    color={analysis.risk > 70 ? 'error' : analysis.risk > 30 ? 'warning' : 'success'}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">{`${analysis.risk}%`}</Typography>
                </Box>
              </Box>
              <Typography variant="body2" color={analysis.risk > 70 ? 'error.main' : 'text.primary'}>
                {analysis.risk > 70 ? 'High Risk of Pathologies' : 'Moderate Risk'}
              </Typography>
            </Box>

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Particle Counts</Typography>
            <Grid container spacing={1} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">{analysis.wbc}</Typography>
                  <Typography variant="caption">WBC / HPF</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                  <Typography variant="h4" color="error">{analysis.rbc}</Typography>
                  <Typography variant="caption">RBC / HPF</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Detected Features</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {analysis.crystals === 'Present' && <Chip label="Crystals Detected" color="warning" size="small" />}
              {analysis.wbc > 5 && <Chip label="Leukocyturia" color="primary" size="small" />}
              {analysis.rbc > 3 && <Chip label="Hematuria" color="error" size="small" />}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalysisView;
