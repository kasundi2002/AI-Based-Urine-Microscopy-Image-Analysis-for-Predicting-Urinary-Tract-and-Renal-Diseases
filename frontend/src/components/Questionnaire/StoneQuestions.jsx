import React from 'react';
import { Box, Typography } from '@mui/material';
import { QuestionBlock, YES_NO, WATER_OPTIONS } from './QuestionUtils';

const QUESTIONS = [
    { id: 10, text: 'Do you experience lower abdominal pain?', type: 'radio', options: YES_NO },
    { id: 11, text: 'Do you experience flank pain or pain in the side/lower back?', type: 'radio', options: YES_NO },
    { id: 12, text: 'Do you have pain in the kidney area or lower back?', type: 'radio', options: YES_NO },
    { id: 13, text: 'Do you experience nausea or vomiting?', type: 'radio', options: YES_NO },
    { id: 24, text: 'Is there a family history of kidney disease or urinary tract cancer?', type: 'radio', options: YES_NO },
    { id: 28, text: 'How much water do you drink per day?', type: 'radio', options: WATER_OPTIONS },
    { id: 29, text: 'Do you frequently consume high-salt foods?', type: 'radio', options: YES_NO },
    { id: 30, text: 'Do you regularly eat oxalate-rich foods (such as spinach, nuts, chocolate)?', type: 'radio', options: YES_NO },
    { id: 31, text: 'Do you frequently consume high-protein or red meat diets?', type: 'radio', options: YES_NO },
];

export const StoneQuestions = ({ answers, handleAnswerChange }) => {
    return (
        <Box>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Kidney Stone Assessment</Typography>
            <QuestionBlock questions={QUESTIONS} answers={answers} handleAnswerChange={handleAnswerChange} />
        </Box>
    );
};
