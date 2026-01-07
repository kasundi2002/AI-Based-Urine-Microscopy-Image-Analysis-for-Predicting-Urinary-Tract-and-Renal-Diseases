import React from 'react';
import { Box, Typography, Paper, Grid, Divider, List, ListItem, ListItemText } from '@mui/material';

const DiagnosticView = ({ report }) => {
  if (!report) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>Diagnostic Review: {report.patientName}</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>Microscopy Image</Typography>
            <Box 
              sx={{ 
                width: '100%', 
                height: 300, 
                bgcolor: '#000', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: 1
              }}
            >
              <img 
                src={report.image || 'https://via.placeholder.com/400x300?text=Microscopy+Image'} 
                alt="Microscopy" 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>AI Analysis Report</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Risk Assessment" 
                  secondary={
                    <Typography color={report.riskScore > 70 ? 'error' : 'text.secondary'} variant="body2">
                      {report.riskLabel} ({report.riskScore}%)
                    </Typography>
                  } 
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="WBC Count" secondary={`${report.findings.wbc} / HPF`} />
              </ListItem>
              <ListItem>
                <ListItemText primary="RBC Count" secondary={`${report.findings.rbc} / HPF`} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Crystals" secondary={report.findings.crystals} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Bacteria" secondary={report.findings.bacteria} />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DiagnosticView;
