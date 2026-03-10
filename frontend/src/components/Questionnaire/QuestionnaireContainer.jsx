import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Paper, Typography, Button, LinearProgress, Alert, Chip,
    Stepper, Step, StepLabel, StepConnector
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import BugReportIcon from '@mui/icons-material/BugReport';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import ScienceIcon from '@mui/icons-material/Science';
import LockIcon from '@mui/icons-material/Lock';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import { BaseQuestions } from './BaseQuestions';
import { StoneQuestions } from './StoneQuestions';
import { HematuriaQuestions } from './HematuriaQuestions';
import { RenalQuestions } from './RenalQuestions';
import { InfectionQuestions } from './InfectionQuestions';

/* ── Config for each block ── */
const BLOCK_CONFIG = {
    BaseQuestions: {
        label: 'Basic Info',
        icon: <PersonIcon />,
        color: '#00bcd4',
        component: BaseQuestions,
    },
    StoneQuestions: {
        label: 'Kidney Stone',
        icon: <LocalHospitalIcon />,
        color: '#ff9100',
        component: StoneQuestions,
    },
    InfectionQuestions: {
        label: 'Infection',
        icon: <BugReportIcon />,
        color: '#ef5350',
        component: InfectionQuestions,
    },
    HematuriaQuestions: {
        label: 'Hematuria',
        icon: <BloodtypeIcon />,
        color: '#e91e63',
        component: HematuriaQuestions,
    },
    RenalQuestions: {
        label: 'Renal',
        icon: <ScienceIcon />,
        color: '#7c4dff',
        component: RenalQuestions,
    },
};

/* ── Custom stepper connector ── */
const CustomConnector = styled(StepConnector)(({ theme }) => ({
    '& .MuiStepConnector-line': {
        borderColor: alpha('#94a3b8', 0.2),
        borderTopWidth: 3,
        borderRadius: 2,
    },
    '&.Mui-active .MuiStepConnector-line': {
        borderColor: '#00bcd4',
    },
    '&.Mui-completed .MuiStepConnector-line': {
        borderColor: '#00bcd4',
    },
}));

/* ── Custom step icon ── */
const CustomStepIcon = ({ active, completed, icon, blockKey }) => {
    const config = blockKey ? BLOCK_CONFIG[blockKey] : null;
    const color = config?.color || '#64748b';

    return (
        <Box sx={{
            width: 40, height: 40,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
            ...(completed ? {
                background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.8)})`,
                color: 'white',
                boxShadow: `0 4px 14px ${alpha(color, 0.35)}`,
            } : active ? {
                background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.8)})`,
                color: 'white',
                boxShadow: `0 4px 14px ${alpha(color, 0.35)}`,
                transform: 'scale(1.1)',
            } : {
                bgcolor: alpha('#94a3b8', 0.1),
                color: '#94a3b8',
                border: '2px solid',
                borderColor: alpha('#94a3b8', 0.2),
            }),
        }}>
            {completed ? (
                <CheckCircleIcon sx={{ fontSize: 22 }} />
            ) : config?.icon ? (
                React.cloneElement(config.icon, { sx: { fontSize: 20 } })
            ) : (
                <Typography fontWeight={700} fontSize="0.85rem">{icon}</Typography>
            )}
        </Box>
    );
};

/* ── Empty answers initializer ── */
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
    const [activeStep, setActiveStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [answers, setAnswers] = useState(() => emptyAnswers(patientDetails));

    // Determine which blocks to show
    const activeBlocks = useMemo(() => {
        const blocks = routing?.blocks?.length > 0 ? routing.blocks : ["BaseQuestions"];
        return blocks.filter(b => BLOCK_CONFIG[b]);
    }, [routing]);

    const handleAnswerChange = (id, value) => {
        setAnswers((prev) => ({ ...prev, [`q${id}`]: value }));
        setError('');
    };

    const validate = () => {
        if (!answers.q1 || !answers.q2) {
            setError("Please fill out the basic information (Age, Sex).");
            return false;
        }
        setError('');
        return true;
    };

    const handleNext = () => {
        if (activeStep >= activeBlocks.length - 1) {
            // Final step — submit
            if (!validate()) return;
            setSubmitting(true);
        } else {
            setActiveStep((prev) => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBack = () => {
        setError('');
        setActiveStep((prev) => prev - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                        onComplete(data.report || {});
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

    /* ── Submitting / Processing View ── */
    if (submitting) {
        return (
            <Paper elevation={0} sx={{
                maxWidth: 800, mx: 'auto', borderRadius: 4, overflow: 'hidden',
                border: '1px solid', borderColor: alpha('#0f172a', 0.08),
                boxShadow: '0 20px 60px rgba(15,23,42,0.12)',
            }}>
                <Box sx={{
                    px: 4, py: 10, textAlign: 'center',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
                    color: 'white', position: 'relative', overflow: 'hidden',
                }}>
                    {/* Animated background circles */}
                    <Box sx={{
                        position: 'absolute', top: -80, right: -80, width: 250, height: 250,
                        borderRadius: '50%', bgcolor: alpha('#00bcd4', 0.06),
                    }} />
                    <Box sx={{
                        position: 'absolute', bottom: -60, left: -60, width: 200, height: 200,
                        borderRadius: '50%', bgcolor: alpha('#7c4dff', 0.06),
                    }} />

                    <Box sx={{
                        display: 'inline-flex', p: 2.5, borderRadius: '50%',
                        bgcolor: alpha('#00bcd4', 0.15), mb: 3,
                        boxShadow: `0 0 40px ${alpha('#00bcd4', 0.2)}`,
                        position: 'relative', zIndex: 1,
                    }}>
                        <PsychologyIcon sx={{ fontSize: 44 }} />
                    </Box>
                    <Typography variant="h4" fontWeight={900} sx={{ mb: 1, position: 'relative', zIndex: 1, letterSpacing: -0.5 }}>
                        Analyzing Clinical Risks
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.7, mb: 5, maxWidth: 400, mx: 'auto', position: 'relative', zIndex: 1 }}>
                        Integrating microscopy findings with your clinical history for personalized risk scoring...
                    </Typography>
                    <Box sx={{ maxWidth: 420, mx: 'auto', position: 'relative', zIndex: 1 }}>
                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                                height: 10,
                                borderRadius: 5,
                                bgcolor: alpha('#fff', 0.1),
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 5,
                                    background: 'linear-gradient(90deg, #00bcd4, #26c6da, #66bb6a)',
                                    transition: 'transform 0.3s ease',
                                },
                            }}
                        />
                        <Typography variant="body2" sx={{ mt: 2, opacity: 0.6, fontWeight: 600, letterSpacing: 0.5 }}>
                            {progress}% complete
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        );
    }

    /* ── Main Questionnaire View ── */
    const currentBlockKey = activeBlocks[activeStep];
    const CurrentComponent = BLOCK_CONFIG[currentBlockKey]?.component;
    const currentConfig = BLOCK_CONFIG[currentBlockKey];
    const isLastStep = activeStep >= activeBlocks.length - 1;

    return (
        <Paper elevation={0} sx={{
            maxWidth: 900, mx: 'auto', borderRadius: 4, overflow: 'hidden',
            border: '1px solid', borderColor: alpha('#0f172a', 0.06),
            boxShadow: '0 8px 40px rgba(15,23,42,0.08)',
        }}>
            {/* ── Header ── */}
            <Box sx={{
                px: 4, py: 3.5, textAlign: 'center',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0f172a 100%)',
                color: 'white', position: 'relative', overflow: 'hidden',
            }}>
                <Box sx={{
                    position: 'absolute', top: -40, right: -40, width: 160, height: 160,
                    borderRadius: '50%', bgcolor: alpha('#00bcd4', 0.06),
                }} />
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{
                        display: 'inline-flex', p: 1, borderRadius: 2,
                        bgcolor: alpha('#00bcd4', 0.12), mb: 1.5,
                    }}>
                        <AutoAwesomeIcon sx={{ fontSize: 20, color: '#26c6da' }} />
                    </Box>
                    <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: -0.3 }}>
                        Health Questionnaire
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.65, mt: 0.5, maxWidth: 480, mx: 'auto' }}>
                        Answer targeted questions to enhance your AI-powered diagnosis with clinical data
                    </Typography>
                </Box>
            </Box>

            {/* ── Stepper ── */}
            {activeBlocks.length > 1 && (
                <Box sx={{
                    px: 3, py: 2.5,
                    borderBottom: '1px solid',
                    borderColor: alpha('#e2e8f0', 0.8),
                    bgcolor: alpha('#f8fafc', 0.5),
                }}>
                    <Stepper
                        activeStep={activeStep}
                        alternativeLabel
                        connector={<CustomConnector />}
                    >
                        {activeBlocks.map((blockKey, index) => {
                            const config = BLOCK_CONFIG[blockKey];
                            return (
                                <Step key={blockKey} completed={index < activeStep}>
                                    <StepLabel
                                        StepIconComponent={(props) => (
                                            <CustomStepIcon {...props} blockKey={blockKey} />
                                        )}
                                    >
                                        <Typography
                                            variant="caption"
                                            fontWeight={index === activeStep ? 700 : 500}
                                            sx={{
                                                color: index <= activeStep ? '#0f172a' : '#94a3b8',
                                                fontSize: '0.72rem',
                                                letterSpacing: 0.2,
                                            }}
                                        >
                                            {config?.label || blockKey}
                                        </Typography>
                                    </StepLabel>
                                </Step>
                            );
                        })}
                    </Stepper>
                </Box>
            )}

            {/* ── Progress bar ── */}
            <Box sx={{ px: 0 }}>
                <LinearProgress
                    variant="determinate"
                    value={((activeStep + 1) / activeBlocks.length) * 100}
                    sx={{
                        height: 3,
                        bgcolor: alpha('#e2e8f0', 0.5),
                        '& .MuiLinearProgress-bar': {
                            background: `linear-gradient(90deg, ${currentConfig?.color || '#00bcd4'}, ${alpha(currentConfig?.color || '#00bcd4', 0.6)})`,
                            transition: 'transform 0.5s ease',
                        },
                    }}
                />
            </Box>

            {/* ── Error Alert ── */}
            {error && (
                <Box sx={{ px: 4, pt: 3 }}>
                    <Alert
                        severity="error"
                        variant="outlined"
                        sx={{
                            borderRadius: 2.5,
                            fontWeight: 600,
                            '& .MuiAlert-message': { fontWeight: 600 },
                        }}
                    >
                        {error}
                    </Alert>
                </Box>
            )}

            {/* ── Questions Content ── */}
            <Box sx={{ px: 4, py: 3.5 }}>
                {CurrentComponent && (
                    <CurrentComponent
                        answers={answers}
                        handleAnswerChange={handleAnswerChange}
                        patientDetails={patientDetails}
                    />
                )}
            </Box>

            {/* ── Footer Navigation ── */}
            <Box sx={{
                px: 4, py: 2.5,
                borderTop: '1px solid',
                borderColor: alpha('#e2e8f0', 0.8),
                bgcolor: alpha('#f8fafc', 0.5),
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Chip
                        label={`Step ${activeStep + 1} of ${activeBlocks.length}`}
                        size="small"
                        sx={{
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            bgcolor: alpha(currentConfig?.color || '#00bcd4', 0.08),
                            color: currentConfig?.color || '#00bcd4',
                            border: '1px solid',
                            borderColor: alpha(currentConfig?.color || '#00bcd4', 0.2),
                        }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#94a3b8' }}>
                        <LockIcon sx={{ fontSize: 13 }} />
                        <Typography variant="caption" sx={{ fontSize: '0.68rem' }}>
                            Your responses are encrypted and secure
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    {activeStep > 0 && (
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={handleBack}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: 2.5,
                                px: 2.5,
                                color: '#64748b',
                                '&:hover': {
                                    bgcolor: alpha('#64748b', 0.06),
                                },
                            }}
                        >
                            Back
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        endIcon={isLastStep ? <SendIcon /> : <ArrowForwardIcon />}
                        onClick={handleNext}
                        size="large"
                        sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 4,
                            borderRadius: 2.5,
                            background: isLastStep
                                ? 'linear-gradient(135deg, #00bcd4, #0097a7)'
                                : 'linear-gradient(135deg, #0f172a, #1e3a5f)',
                            boxShadow: isLastStep
                                ? '0 4px 20px rgba(0,188,212,0.3)'
                                : '0 4px 20px rgba(15,23,42,0.2)',
                            transition: 'all 0.3s',
                            '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: isLastStep
                                    ? '0 8px 30px rgba(0,188,212,0.4)'
                                    : '0 8px 30px rgba(15,23,42,0.3)',
                            },
                        }}
                    >
                        {isLastStep ? 'Submit & Analyze' : 'Continue'}
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
};

export default QuestionnaireContainer;
