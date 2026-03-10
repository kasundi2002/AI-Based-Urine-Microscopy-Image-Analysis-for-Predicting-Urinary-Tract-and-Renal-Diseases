import React from 'react';
import { Box, Typography } from '@mui/material';
import { QuestionBlock, YES_NO } from './QuestionUtils';

const QUESTIONS = [
    { id: 9, text: 'Have you experienced reduced urine output recently?', type: 'radio', options: YES_NO },
    { id: 16, text: 'Do you have swelling in your feet, ankles, or face?', type: 'radio', options: YES_NO },
    { id: 17, text: 'Do you frequently feel unusual fatigue or weakness?', type: 'radio', options: YES_NO },
    { id: 20, text: 'Have you ever been diagnosed with kidney disease?', type: 'radio', options: YES_NO },
    { id: 21, text: 'Do you have high blood pressure (hypertension)?', type: 'radio', options: YES_NO },
    { id: 22, text: 'Do you have diabetes?', type: 'radio', options: YES_NO },
    { id: 25, text: 'Do you regularly take painkillers (NSAIDs) such as ibuprofen or diclofenac?', type: 'radio', options: YES_NO },
    { id: 27, text: 'Have you recently taken medications that may affect kidney function?', type: 'radio', options: YES_NO },
];

export const RenalQuestions = ({ answers, handleAnswerChange }) => {
    return (
        <Box>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Renal Disease Assessment</Typography>
            <QuestionBlock questions={QUESTIONS} answers={answers} handleAnswerChange={handleAnswerChange} />
        </Box>
    );
};
