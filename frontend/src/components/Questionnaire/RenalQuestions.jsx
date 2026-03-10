import React from 'react';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ScienceIcon from '@mui/icons-material/Science';
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Box sx={{
                    p: 1, borderRadius: 2,
                    background: 'linear-gradient(135deg, #7c4dff, #651fff)',
                    color: 'white', display: 'flex',
                }}>
                    <ScienceIcon sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                    <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2, color: '#0f172a' }}>
                        Renal Disease Assessment
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Kidney function symptoms and medical history
                    </Typography>
                </Box>
            </Box>
            <QuestionBlock questions={QUESTIONS} answers={answers} handleAnswerChange={handleAnswerChange} />
        </Box>
    );
};
