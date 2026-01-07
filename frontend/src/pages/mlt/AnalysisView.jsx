import React from 'react';
import { Box, Typography, Paper, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import ReplayIcon from '@mui/icons-material/Replay';

const ImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: 500, // Taller image area
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
    backgroundColor: `${color}1a`, // low opacity on hover
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

const AnalysisView = ({ image, analysis }) => {
  if (!image) return <Typography>No image loaded</Typography>;

  // Mock analysis data if null (for preview)
  const data = analysis || {
    wbc: 5,
    rbc: 2,
    crystals: 'Calcium Oxalate',
    risk: 45
  };

  const rows = [
    { particle: 'Crystals', count: `Caox - 05\nUric Acid - 02` },
    { particle: 'RBC', count: 'Caox - 05' }, // Mocking redundant data to match image style
    { particle: 'WBC', count: 'Caox - 05' },
    { particle: 'Cast', count: 'Caox - 05' },
    { particle: 'Bacteria', count: 'Caox - 05' },
  ];
  
  // Refined boxes based on image
  const boxes = [
    { id: 1, type: 'WBC', x: 25, y: 35, w: 8, h: 8, color: '#00bcd4' }, // Cyan
    { id: 2, type: 'RBC', x: 55, y: 55, w: 7, h: 7, color: '#ff1744' }, // Red
    { id: 3, type: 'Crystal', x: 70, y: 25, w: 12, h: 12, color: '#ff9100' }, // Orange
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            MLT Workspace
        </Typography>
        <Button variant="contained" color="primary">
            Submit Report
        </Button>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography sx={{ mr: 2, fontWeight: 'bold' }}>Patient Name :</Typography>
           <TextField 
             variant="outlined" 
             size="small" 
             value="Anura kumara" 
             sx={{ width: 300, bgcolor: 'background.paper' }}
             InputProps={{ readOnly: true }}
           />
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <ImageContainer>
            <img 
              src={image} 
              alt="Microscopy" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
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
                  <LabelTag color={box.color}>
                      {box.type}
                  </LabelTag>
                </BoundingBox>
              ))}
          </ImageContainer>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
               <Button 
                variant="contained" 
                color="success" 
                startIcon={<ReplayIcon />}
                size="large"
                sx={{ textTransform: 'none', px: 4 }}
               >
                   Re-Analyze
               </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, height: '100%' }}>
            <Typography variant="h6" sx={{ color: 'success.main', mb: 2 }}>Findings</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>Particle Counts:</Typography>

            <TableContainer component={Box} sx={{ border: '1px solid #e0e0e0' }}>
              <Table>
                <TableHead>
                  <TableRow>
                     <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Particle</TableCell>
                     <TableCell sx={{ fontWeight: 'bold' }}>Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ height: 60 }}>{row.particle}</TableCell>
                      <TableCell>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                            {row.count}
                          </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalysisView;
