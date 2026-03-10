import React from 'react';
import { Box, Typography } from '@mui/material';
import { QuestionBlock, YES_NO } from './QuestionUtils';

const QUESTIONS = [
    { id: 4, text: 'Do you have pain, burning, or discomfort while urinating?', type: 'radio', options: YES_NO },
    { id: 5, text: 'Do you need to urinate more frequently than usual?', type: 'radio', options: YES_NO },
    { id: 6, text: 'Do you feel a strong urge to urinate or difficulty holding urine?', type: 'radio', options: YES_NO },
    { id: 10, text: 'Do you experience lower abdominal pain?', type: 'radio', options: YES_NO },
    { id: 14, text: 'Have you had fever or chills recently?', type: 'radio', options: YES_NO },
    { id: 15, text: 'Have you had lower abdominal or back pain together with fever?', type: 'radio', options: YES_NO },
    { id: 18, text: 'Have you had a urinary tract infection (UTI) in the past 6 months or recently?', type: 'radio', options: YES_NO },
    { id: 19, text: 'Have you previously had kidney infections or pyelonephritis?', type: 'radio', options: YES_NO },
];

export const InfectionQuestions = ({ answers, handleAnswerChange }) => {
    return (
        <Box>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Infection Assessment</Typography>
            <QuestionBlock questions={QUESTIONS} answers={answers} handleAnswerChange={handleAnswerChange} />
        </Box>
    );
};
