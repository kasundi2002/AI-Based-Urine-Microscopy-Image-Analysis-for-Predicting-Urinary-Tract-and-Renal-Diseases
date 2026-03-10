import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, LinearProgress, Alert } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SendIcon from '@mui/icons-material/Send';
import PsychologyIcon from '@mui/icons-material/Psychology';

import { BaseQuestions } from './BaseQuestions';
import { StoneQuestions } from './StoneQuestions';
import { HematuriaQuestions } from './HematuriaQuestions';
import { RenalQuestions } from './RenalQuestions';
import { InfectionQuestions } from './InfectionQuestions';

const emptyAnswers = (patientDetails) => {
    const answers = {};
    for (let i = 1; i <= 33; i += 1) answers[`q${i}`] = '';
    if (patientDetails) {
        if (patientDetails.age) answers.q1 = patientDetails.age;
        if (patientDetails.gender) {
            const g = String(patientDetails.gender).toLowerCase();
            if (g === 'male' || g === 'm') answers.q2 = 'Male';
            else if (g === 'female' || g === 'f') answers.q2 = 'Female';
            else answers.q2 = patientDetails.gender;
        }
    }
    return answers;
};

export const QuestionnaireContainer = ({ reportId, onComplete, patientDetails, routing }) => {
    const [submitting, setSubmitting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [answers, setAnswers] = useState(() => emptyAnswers(patientDetails));

    // Determine which blocks to show based on routing
    // Default to BaseQuestions if routing is missing or no blocks are defined
    const activeBlocks = routing?.blocks?.length > 0 ? routing.blocks : ["BaseQuestions"];

    const handleAnswerChange = (id, value) => {
        setAnswers((prev) => ({ ...prev, [`q${id}`]: value }));
    };

    const validate = () => {
        // Basic validation depending on fields required
        if (!answers.q1 || !answers.q2) {
            setError("Please fill out the basic information (Age, Sex).");
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        setSubmitting(true);
    };

    useEffect(() => {
        if (!submitting) return undefined;

        let cancelled = false;
        setProgress(0);
        const interval = setInterval(() => {
            setProgress((prev) => {
                const next = prev + 5;
                return next > 100 ? 100 : next;
            });
        }, 70);

        const submitAsync = async () => {
            await new Promise((resolve) => setTimeout(resolve, 1500));

            try {
                if (reportId) {
                    const token = localStorage.getItem('patientToken') || localStorage.getItem('token');
                    const res = await fetch(`http://localhost:5000/api/reports/${reportId}/submit-questionnaire`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        body: JSON.stringify(answers),
                    });
                    const data = await res.json();
                    if (!cancelled) {
                        onComplete(data.report || {}); // Passing back the generated risk prediction object
                    }
                }
            } catch (err) {
                console.error('Questionnaire backend submission failed:', err);
            }

            if (!cancelled) {
                clearInterval(interval);
                setProgress(100);
            }
        };

        submitAsync();

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [submitting, onComplete, answers, reportId]);

    if (submitting) {
        return (
            <Paper elevation={0} sx={{ maxWidth: 800, mx: 'auto', borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ px: 4, py: 8, textAlign: 'center', background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', color: 'white' }}>
                    <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: '50%', bgcolor: alpha('#fff', 0.12), mb: 2 }}>
                        <PsychologyIcon sx={{ fontSize: 36 }} />
                    </Box>
                    <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>Analyzing Clinical Risks</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 4 }}>
                        Integrating microscopy findings with your clinical history...
                    </Typography>
                    <Box sx={{ maxWidth: 420, mx: 'auto' }}>
                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: alpha('#fff', 0.15),
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 4,
                                    background: 'linear-gradient(90deg, #00bcd4, #66bb6a)',
                                },
                            }}
                        />
                    </Box>
                </Box>
            </Paper>
        );
    }

    return (
        <Paper elevation={0} sx={{ maxWidth: 900, mx: 'auto', borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ px: 4, py: 3, textAlign: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', color: 'white' }}>
                <Typography variant="h5" fontWeight={800}>Targeted Patient Questionnaire</Typography>
                <Typography variant="body2" sx={{ opacity: 0.78, mt: 0.6 }}>
                    Please answer these specific questions targeted automatically to clarify your diagnosis.
                </Typography>
            </Box>

            <Box sx={{ p: 4 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {activeBlocks.includes("BaseQuestions") && (
                        <BaseQuestions answers={answers} handleAnswerChange={handleAnswerChange} patientDetails={patientDetails} />
                    )}
                    {activeBlocks.includes("StoneQuestions") && (
                        <StoneQuestions answers={answers} handleAnswerChange={handleAnswerChange} />
                    )}
                    {activeBlocks.includes("HematuriaQuestions") && (
                        <HematuriaQuestions answers={answers} handleAnswerChange={handleAnswerChange} />
                    )}
                    {activeBlocks.includes("RenalQuestions") && (
                        <RenalQuestions answers={answers} handleAnswerChange={handleAnswerChange} />
                    )}
                    {activeBlocks.includes("InfectionQuestions") && (
                        <InfectionQuestions answers={answers} handleAnswerChange={handleAnswerChange} />
                    )}
                </Box>

                <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid', borderColor: 'divider', pt: 3 }}>
                    <Button
                        variant="contained"
                        endIcon={<SendIcon />}
                        onClick={handleSubmit}
                        size="large"
                        sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 4,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
                        }}
                    >
                        Submit Questionnaire
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
};

export default QuestionnaireContainer;
