import React from 'react';
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, TextField, Paper, Typography, Grid } from '@mui/material';

export const YES_NO = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
];

export const WATER_OPTIONS = [
    { value: 'Less than 1 liter', label: 'Less than 1 liter' },
    { value: '1-2 liters', label: '1-2 liters' },
    { value: 'More than 2 liters', label: 'More than 2 liters' },
];

export const renderQuestion = (q, answers, handleAnswerChange, patientDetails = null) => {
    const value = answers[`q${q.id}`] || '';

    const isDisabled = Boolean((q.id === 1 && patientDetails?.age) || (q.id === 2 && patientDetails?.gender));

    if (q.type === 'number') {
        return (
            <TextField
                fullWidth
                type="number"
                label={`Q${q.id}`}
                value={value}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                inputProps={{ min: 1, max: 120 }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, mt: 2 }}
                disabled={isDisabled}
            />
        );
    }

    return (
        <FormControl disabled={isDisabled} sx={{ mt: 2 }}>
            <RadioGroup
                value={value}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
            >
                {q.options.map((option) => (
                    <FormControlLabel
                        key={option.value}
                        value={option.value}
                        control={<Radio size="small" />}
                        label={option.label}
                    />
                ))}
            </RadioGroup>
        </FormControl>
    );
};

export const QuestionBlock = ({ questions, answers, handleAnswerChange, patientDetails }) => {
    return (
        <Grid container spacing={2.5}>
            {questions.map((q) => {
                if (q.condition && !q.condition(answers)) return null;
                return (
                    <Grid key={q.id} item xs={12}>
                        <Paper elevation={0} sx={{ p: 2.2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="body2" fontWeight={600} sx={{ mb: 1.2 }}>
                                Q{q.id}. {q.text}
                            </Typography>
                            {renderQuestion(q, answers, handleAnswerChange, patientDetails)}
                        </Paper>
                    </Grid>
                )
            })}
        </Grid>
    );
};
