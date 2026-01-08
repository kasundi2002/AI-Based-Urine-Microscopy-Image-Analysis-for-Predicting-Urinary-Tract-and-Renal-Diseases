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

const AnalysisView = ({ image, analysis, patient }) => {
  if (!image) return <Typography>No image loaded</Typography>;

  // Mock analysis data if null (for preview)
  const data = analysis || {
    wbc: 5,
    rbc: 2,
    crystals: 'Calcium Oxalate',
    risk: 45
  };

  const rows = [
    { particle: 'Crystals', count: `Caox - 05\nUric Acid - 02`, color: '#ff9100' },
    { particle: 'RBC', count: 'Caox - 05', color: '#ff1744' }, 
    { particle: 'WBC', count: 'Caox - 05', color: '#00bcd4' },
    { particle: 'Cast', count: 'Caox - 05', color: '#9c27b0' },
    { particle: 'Bacteria', count: 'Caox - 05', color: '#4caf50' },
  ];
  
  // Refined boxes based on image
  const boxes = [
    { id: 1, type: 'WBC', x: 25, y: 35, w: 8, h: 8, color: '#00bcd4' }, // Cyan
    { id: 2, type: 'RBC', x: 55, y: 55, w: 7, h: 7, color: '#ff1744' }, // Red
    { id: 3, type: 'Crystal', x: 70, y: 25, w: 12, h: 12, color: '#ff9100' }, // Orange
  ];

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            MLT Workspace
        </Typography>
        <Button 
            variant="contained" 
            sx={{ 
                background: 'linear-gradient(45deg, #00bcd4 30%, #00e5ff 90%)',
                color: 'white',
                boxShadow: '0 3px 5px 2px rgba(0, 188, 212, .3)',
                fontWeight: 'bold',
                px: 4
            }}
        >
            Submit Report
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 4, bgcolor: 'background.paper', borderRadius: 2, borderLeft: '6px solid #00bcd4', display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ mr: 2, fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: 1 }}>Patient:</Typography>
          <Typography variant="h6" fontWeight="bold">
            {patient?.name || "Unknown Patient"}
          </Typography>
          <Box sx={{ mx: 2, height: 20, width: '1px', bgcolor: 'divider' }} />
          <Typography variant="body2" color="text.secondary">ID: {patient?.id || "N/A"}</Typography>
      </Paper>

      <Grid container spacing={2} sx={{ width: '100%', mt: 0 }}>
        <Grid item xs={12} sm={6} md={6}>
          <ImageContainer sx={{ boxShadow: 4, height: 450 }}>
            <img 
              src={image} 
              alt="Microscopy" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
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
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
               <Button 
                variant="outlined" 
                startIcon={<ReplayIcon />}
                size="large"
                sx={{ 
                    textTransform: 'none', 
                    px: 4, 
                    borderWidth: 2, 
                    borderColor: 'rgba(255,255,255,0.2)', 
                    color: 'text.primary', 
                    '&:hover': { borderWidth: 2, borderColor: 'primary.main' } 
                }}
               >
                   Re-Analyze Sample
               </Button>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <Paper sx={{ 
              p: 0, 
              height: 450, // Fixed height to match image container
              overflow: 'hidden', 
              borderRadius: 3,
              bgcolor: '#0f172a', // Darker background for contrast
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              flexDirection: 'column'
          }}>
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'linear-gradient(90deg, rgba(0, 188, 212, 0.1) 0%, transparent 100%)' }}>
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>Automated Findings</Typography>
                <Typography variant="caption" color="text.secondary">AI Confidence: 98.5%</Typography>
            </Box>
            
            <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>Particle Breakdown</Typography>
                <TableContainer>
                <Table size="small">
                    <TableBody>
                    {rows.map((row, index) => (
                        <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell sx={{ pl: 0, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: row.color, mr: 2, boxShadow: `0 0 8px ${row.color}` }} />
                                <Typography variant="body1" fontWeight="500">{row.particle}</Typography>
                            </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: 'text.secondary' }}>
                                {row.count}
                            </Typography>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </TableContainer>
            </Box>
            
            <Box sx={{ p: 3, bgcolor: 'rgba(255, 145, 0, 0.05)', mt: 'auto' }}>
                <Typography variant="subtitle2" sx={{ color: 'warning.main', mb: 1 }}>Analysis Note</Typography>
                <Typography variant="body2" color="text.secondary">
                    High concentration of Calcium Oxalate crystals detected. Recommended for clinical verification.
                </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalysisView;
