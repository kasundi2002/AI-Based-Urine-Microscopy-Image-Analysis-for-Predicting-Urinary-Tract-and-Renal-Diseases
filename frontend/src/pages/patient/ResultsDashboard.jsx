import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

const ResultsDashboard = ({ report }) => {
  if (!report) return (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <Typography>No recent reports found.</Typography>
    </Paper>
  );

  const isHighRisk = report.riskScore > 50;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Your Latest Results</Typography>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Date: {report.date || 'Oct 26, 2023'}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: isHighRisk ? 'rgba(255, 23, 68, 0.1)' : 'rgba(0, 230, 118, 0.1)' }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              {isHighRisk ? (
                <WarningIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
              ) : (
                <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              )}
              <Typography variant="h4" gutterBottom>
                {report.riskScore}% Risk
              </Typography>
              <Typography variant="h6" color={isHighRisk ? 'error' : 'success'}>
                {report.riskLabel || (isHighRisk ? 'High Risk Detected' : 'Low Risk')}
              </Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Based on your latest microscopy analysis and questionnaire data.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Doctor's Recommendations</Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" paragraph>
                <strong>Prescription:</strong> {report.prescription || 'Drink plenty of water. Follow up in 3 months.'}
              </Typography>
              <Typography variant="body1">
                <strong>Lifestyle:</strong>
              </Typography>
              <ul>
                <li>Increase daily water intake to 2.5L</li>
                <li>Reduce sodium intake</li>
                <li>Limit oxalate-rich foods (spinach, nuts)</li>
              </ul>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ResultsDashboard;
