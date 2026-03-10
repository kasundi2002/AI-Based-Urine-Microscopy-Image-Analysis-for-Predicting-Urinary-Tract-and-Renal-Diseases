import React from 'react';
import {
    FormControl, RadioGroup, FormControlLabel, Radio,
    TextField, Paper, Typography, Grid, Box, Chip
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export const YES_NO = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
];

export const WATER_OPTIONS = [
    { value: 'Less than 1 liter', label: '< 1 liter' },
    { value: '1-2 liters', label: '1–2 liters' },
    { value: 'More than 2 liters', label: '> 2 liters' },
];

/* ── Pill-style option button ── */
const OptionPill = ({ option, selected, onChange, disabled }) => {
    const isSelected = selected === option.value;
    return (
        <Box
            onClick={() => !disabled && onChange(option.value)}
            sx={{
                px: 2.5, py: 1.2,
                borderRadius: 2.5,
                cursor: disabled ? 'default' : 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                textAlign: 'center',
                minWidth: 90,
                userSelect: 'none',
                transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                border: '2px solid',
                borderColor: isSelected ? '#00bcd4' : alpha('#94a3b8', 0.25),
                bgcolor: isSelected ? alpha('#00bcd4', 0.08) : 'transparent',
                color: isSelected ? '#0097a7' : 'text.secondary',
                opacity: disabled ? 0.55 : 1,
                ...(isSelected && {
                    boxShadow: `0 0 0 3px ${alpha('#00bcd4', 0.12)}`,
                }),
                ...(!disabled && {
                    '&:hover': {
                        borderColor: isSelected ? '#00bcd4' : alpha('#00bcd4', 0.5),
                        bgcolor: isSelected ? alpha('#00bcd4', 0.1) : alpha('#00bcd4', 0.03),
                        transform: 'translateY(-1px)',
                    },
                }),
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8 }}>
                {isSelected && <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#00bcd4' }} />}
                {option.label}
            </Box>
        </Box>
    );
};

/* ── Single question renderer ── */
export const renderQuestion = (q, answers, handleAnswerChange, patientDetails = null) => {
    const value = answers[`q${q.id}`] || '';
    const isDisabled = Boolean((q.id === 1 && patientDetails?.age) || (q.id === 2 && patientDetails?.gender));

    if (q.type === 'number') {
        return (
            <TextField
                fullWidth
                type="number"
                placeholder="Enter your age"
                value={value}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                inputProps={{ min: 1, max: 120 }}
                disabled={isDisabled}
                sx={{
                    mt: 1.5,
                    maxWidth: 200,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        bgcolor: alpha('#f8fafc', 0.6),
                        '& fieldset': { borderColor: alpha('#94a3b8', 0.25), borderWidth: 2 },
                        '&:hover fieldset': { borderColor: alpha('#00bcd4', 0.5) },
                        '&.Mui-focused fieldset': { borderColor: '#00bcd4' },
                    },
                }}
            />
        );
    }

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2, mt: 1.5 }}>
            {q.options.map((option) => (
                <OptionPill
                    key={option.value}
                    option={option}
                    selected={value}
                    onChange={(val) => handleAnswerChange(q.id, val)}
                    disabled={isDisabled}
                />
            ))}
        </Box>
    );
};

/* ── Question block (grid of question cards) ── */
export const QuestionBlock = ({ questions, answers, handleAnswerChange, patientDetails }) => {
    const visibleQuestions = questions.filter(q => !q.condition || q.condition(answers));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {visibleQuestions.map((q, index) => {
                const value = answers[`q${q.id}`] || '';
                const isAnswered = value !== '';

                return (
                    <Paper
                        key={q.id}
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            border: '2px solid',
                            borderColor: isAnswered ? alpha('#00bcd4', 0.25) : alpha('#e2e8f0', 0.8),
                            bgcolor: isAnswered ? alpha('#00bcd4', 0.02) : '#fff',
                            transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&:hover': {
                                borderColor: isAnswered ? alpha('#00bcd4', 0.35) : alpha('#00bcd4', 0.2),
                                boxShadow: `0 4px 20px ${alpha('#0f172a', 0.06)}`,
                            },
                        }}
                    >
                        {/* Subtle top accent line for answered questions */}
                        {isAnswered && (
                            <Box sx={{
                                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                                background: 'linear-gradient(90deg, #00bcd4, #26c6da)',
                            }} />
                        )}

                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            {/* Question number badge */}
                            <Box sx={{
                                minWidth: 36, height: 36,
                                borderRadius: 2,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                bgcolor: isAnswered ? alpha('#00bcd4', 0.1) : alpha('#64748b', 0.08),
                                color: isAnswered ? '#0097a7' : '#64748b',
                                fontWeight: 800,
                                fontSize: '0.8rem',
                                flexShrink: 0,
                                transition: 'all 0.2s',
                            }}>
                                {isAnswered ? (
                                    <CheckCircleOutlineIcon sx={{ fontSize: 20, color: '#00bcd4' }} />
                                ) : (
                                    `${index + 1}`
                                )}
                            </Box>

                            {/* Question content */}
                            <Box sx={{ flex: 1 }}>
                                <Typography
                                    variant="body1"
                                    fontWeight={600}
                                    sx={{
                                        color: isAnswered ? '#0f172a' : '#334155',
                                        lineHeight: 1.5,
                                        fontSize: '0.92rem',
                                    }}
                                >
                                    {q.text}
                                </Typography>
                                {renderQuestion(q, answers, handleAnswerChange, patientDetails)}
                            </Box>
                        </Box>
                    </Paper>
                );
            })}
        </Box>
    );
};
