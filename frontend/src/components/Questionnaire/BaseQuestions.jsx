import React from 'react';
import { Box, Typography } from '@mui/material';
import { QuestionBlock, YES_NO } from './QuestionUtils';

const QUESTIONS = [
    { id: 1, text: 'Age', type: 'number' },
    {
        id: 2,
        text: 'Biological sex',
        type: 'radio',
        options: [
            { value: 'Male', label: 'Male' },
            { value: 'Female', label: 'Female' },
        ],
    },
    {
        id: 3,
        text: 'Are you currently menstruating or within 3 days of menstruation? (Female only)',
        type: 'radio',
        options: YES_NO,
        condition: (answers) => answers.q2 === 'Female',
    },
    { id: 23, text: 'Do you have any other long-term medical conditions?', type: 'radio', options: YES_NO },
    { id: 26, text: 'Are you currently taking antibiotics or antifungal medications?', type: 'radio', options: YES_NO },
];

export const BaseQuestions = ({ answers, handleAnswerChange, patientDetails }) => {
    return (
        <Box>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Basic Information</Typography>
            <QuestionBlock questions={QUESTIONS} answers={answers} handleAnswerChange={handleAnswerChange} patientDetails={patientDetails} />
        </Box>
    );
};
