import React from 'react';
import { Box, Typography } from '@mui/material';
import { QuestionBlock, YES_NO } from './QuestionUtils';

const QUESTIONS = [
    { id: 4, text: 'Do you have pain, burning, or discomfort while urinating?', type: 'radio', options: YES_NO },
    { id: 7, text: 'Have you noticed visible blood in your urine recently?', type: 'radio', options: YES_NO },
    { id: 8, text: 'Have you experienced dark or cola-colored urine recently?', type: 'radio', options: YES_NO },
    { id: 10, text: 'Do you experience lower abdominal pain?', type: 'radio', options: YES_NO },
    { id: 24, text: 'Is there a family history of kidney disease or urinary tract cancer?', type: 'radio', options: YES_NO },
    { id: 25, text: 'Do you regularly take painkillers (NSAIDs) such as ibuprofen or diclofenac?', type: 'radio', options: YES_NO },
    { id: 32, text: 'Do you smoke or have a history of smoking?', type: 'radio', options: YES_NO },
    { id: 33, text: 'Do you frequently smoke or consume alcohol?', type: 'radio', options: YES_NO },
];

export const HematuriaQuestions = ({ answers, handleAnswerChange }) => {
    return (
        <Box>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Hematuria Risk Assessment</Typography>
            <QuestionBlock questions={QUESTIONS} answers={answers} handleAnswerChange={handleAnswerChange} />
        </Box>
    );
};
