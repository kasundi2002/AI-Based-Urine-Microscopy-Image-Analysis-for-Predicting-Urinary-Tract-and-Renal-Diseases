import React from 'react';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import BugReportIcon from '@mui/icons-material/BugReport';
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Box sx={{
                    p: 1, borderRadius: 2,
                    background: 'linear-gradient(135deg, #ef5350, #c62828)',
                    color: 'white', display: 'flex',
                }}>
                    <BugReportIcon sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                    <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2, color: '#0f172a' }}>
                        Infection Assessment
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Urinary tract infection symptoms and history
                    </Typography>
                </Box>
            </Box>
            <QuestionBlock questions={QUESTIONS} answers={answers} handleAnswerChange={handleAnswerChange} />
        </Box>
    );
};
