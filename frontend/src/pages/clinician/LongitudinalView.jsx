import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { date: '2023-01', wbc: 2, rbc: 1, risk: 10 },
  { date: '2023-03', wbc: 5, rbc: 2, risk: 25 },
  { date: '2023-06', wbc: 8, rbc: 4, risk: 45 },
  { date: '2023-09', wbc: 12, rbc: 6, risk: 60 },
  { date: '2023-10', wbc: 10, rbc: 5, risk: 55 },
];

const LongitudinalView = () => {
  return (
    <Paper sx={{ p: 3, height: 400, mt: 3 }}>
      <Typography variant="h6" gutterBottom>Patient History & Trends</Typography>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="date" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#132f4c', border: 'none', borderRadius: 8 }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend />
          <Line type="monotone" dataKey="risk" stroke="#ff9100" name="Risk Score (%)" strokeWidth={2} />
          <Line type="monotone" dataKey="wbc" stroke="#00e5ff" name="WBC Count" />
          <Line type="monotone" dataKey="rbc" stroke="#ff1744" name="RBC Count" />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default LongitudinalView;
