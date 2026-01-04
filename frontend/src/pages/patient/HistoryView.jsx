import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { date: 'Jan', risk: 10 },
  { date: 'Mar', risk: 25 },
  { date: 'Jun', risk: 45 },
  { date: 'Sep', risk: 60 },
  { date: 'Oct', risk: 55 },
];

const HistoryView = () => {
  return (
    <Paper sx={{ p: 3, height: 400 }}>
      <Typography variant="h6" gutterBottom>My Health Trends</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Tracking your kidney stone risk probability over time.
      </Typography>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="date" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#132f4c', border: 'none', borderRadius: 8 }}
            itemStyle={{ color: '#fff' }}
          />
          <Line type="monotone" dataKey="risk" stroke="#00e5ff" strokeWidth={3} name="Risk Score (%)" />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default HistoryView;
