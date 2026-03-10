import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Box sx={{
                    p: 1, borderRadius: 2,
                    background: 'linear-gradient(135deg, #00bcd4, #0097a7)',
                    color: 'white', display: 'flex',
                }}>
                    <PersonIcon sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                    <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2, color: '#0f172a' }}>
                        Basic Information
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Your demographic details and general health
                    </Typography>
                </Box>
            </Box>
            <QuestionBlock questions={QUESTIONS} answers={answers} handleAnswerChange={handleAnswerChange} patientDetails={patientDetails} />
        </Box>
    );
};
