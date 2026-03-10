import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Grid,
  LinearProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PsychologyIcon from '@mui/icons-material/Psychology';

const YES_NO = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
];

const WATER_OPTIONS = [
  { value: 'Less than 1 liter', label: 'Less than 1 liter' },
  { value: '1-2 liters', label: '1-2 liters' },
  { value: 'More than 2 liters', label: 'More than 2 liters' },
];

const QUESTIONS = [
  { id: 1, section: 0, text: 'Age', type: 'number' },
  {
    id: 2,
    section: 0,
    text: 'Biological sex',
    type: 'radio',
    options: [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
    ],
  },
  {
    id: 3,
    section: 0,
    text: 'Are you currently menstruating or within 3 days of menstruation? (Female only)',
    type: 'radio',
    options: YES_NO,
    condition: (answers) => answers.q2 === 'Female',
  },
  { id: 4, section: 1, text: 'Do you have pain, burning, or discomfort while urinating?', type: 'radio', options: YES_NO },
  { id: 5, section: 1, text: 'Do you need to urinate more frequently than usual?', type: 'radio', options: YES_NO },
  { id: 6, section: 1, text: 'Do you feel a strong urge to urinate or difficulty holding urine?', type: 'radio', options: YES_NO },
  { id: 7, section: 1, text: 'Have you noticed visible blood in your urine recently?', type: 'radio', options: YES_NO },
  { id: 8, section: 1, text: 'Have you experienced dark or cola-colored urine recently?', type: 'radio', options: YES_NO },
  { id: 9, section: 1, text: 'Have you experienced reduced urine output recently?', type: 'radio', options: YES_NO },
  { id: 10, section: 2, text: 'Do you experience lower abdominal pain?', type: 'radio', options: YES_NO },
  { id: 11, section: 2, text: 'Do you experience flank pain or pain in the side/lower back?', type: 'radio', options: YES_NO },
  { id: 12, section: 2, text: 'Do you have pain in the kidney area or lower back?', type: 'radio', options: YES_NO },
  { id: 13, section: 2, text: 'Do you experience nausea or vomiting?', type: 'radio', options: YES_NO },
  { id: 14, section: 2, text: 'Have you had fever or chills recently?', type: 'radio', options: YES_NO },
  { id: 15, section: 2, text: 'Have you had lower abdominal or back pain together with fever?', type: 'radio', options: YES_NO },
  { id: 16, section: 3, text: 'Do you have swelling in your feet, ankles, or face?', type: 'radio', options: YES_NO },
  { id: 17, section: 3, text: 'Do you frequently feel unusual fatigue or weakness?', type: 'radio', options: YES_NO },
  { id: 18, section: 4, text: 'Have you had a urinary tract infection (UTI) in the past 6 months or recently?', type: 'radio', options: YES_NO },
  { id: 19, section: 4, text: 'Have you previously had kidney infections or pyelonephritis?', type: 'radio', options: YES_NO },
  { id: 20, section: 4, text: 'Have you ever been diagnosed with kidney disease?', type: 'radio', options: YES_NO },
  { id: 21, section: 4, text: 'Do you have high blood pressure (hypertension)?', type: 'radio', options: YES_NO },
  { id: 22, section: 4, text: 'Do you have diabetes?', type: 'radio', options: YES_NO },
  { id: 23, section: 4, text: 'Do you have any other long-term medical conditions?', type: 'radio', options: YES_NO },
  { id: 24, section: 4, text: 'Is there a family history of kidney disease or urinary tract cancer?', type: 'radio', options: YES_NO },
  { id: 25, section: 5, text: 'Do you regularly take painkillers (NSAIDs) such as ibuprofen or diclofenac?', type: 'radio', options: YES_NO },
  { id: 26, section: 5, text: 'Are you currently taking antibiotics or antifungal medications?', type: 'radio', options: YES_NO },
  { id: 27, section: 5, text: 'Have you recently taken medications that may affect kidney function?', type: 'radio', options: YES_NO },
  { id: 28, section: 6, text: 'How much water do you drink per day?', type: 'radio', options: WATER_OPTIONS },
  { id: 29, section: 6, text: 'Do you frequently consume high-salt foods?', type: 'radio', options: YES_NO },
  { id: 30, section: 6, text: 'Do you regularly eat oxalate-rich foods (such as spinach, nuts, chocolate)?', type: 'radio', options: YES_NO },
  { id: 31, section: 6, text: 'Do you frequently consume high-protein or red meat diets?', type: 'radio', options: YES_NO },
  { id: 32, section: 6, text: 'Do you smoke or have a history of smoking?', type: 'radio', options: YES_NO },
  { id: 33, section: 6, text: 'Do you frequently smoke or consume alcohol?', type: 'radio', options: YES_NO },
];

const SECTION_TITLES = [
  'Basic Information',
  'Urinary Symptoms',
  'Pain and Related Symptoms',
  'General Kidney Symptoms',
  'Medical and Infection History',
  'Medication History',
  'Hydration, Diet, Lifestyle',
];

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

const Questionnaire = ({ onComplete, patientDetails, reportId }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState(() => emptyAnswers(patientDetails));

  useEffect(() => {
    if (patientDetails) {
      setAnswers((prev) => {
        const changes = {};
        if (patientDetails.age && !prev.q1) changes.q1 = patientDetails.age;
        if (patientDetails.gender && !prev.q2) {
          const g = String(patientDetails.gender).toLowerCase();
          if (g === 'male' || g === 'm') changes.q2 = 'Male';
          else if (g === 'female' || g === 'f') changes.q2 = 'Female';
          else changes.q2 = patientDetails.gender;
        }
        return Object.keys(changes).length > 0 ? { ...prev, ...changes } : prev;
      });
    }
  }, [patientDetails]);

  const questionsBySection = useMemo(() => {
    return QUESTIONS.reduce((acc, question) => {
      if (!acc[question.section]) acc[question.section] = [];
      acc[question.section].push(question);
      return acc;
    }, {});
  }, []);

  useEffect(() => {
    if (answers.q2 !== 'Female' && answers.q3 !== 'No') {
      setAnswers((prev) => ({ ...prev, q3: 'No' }));
    }
  }, [answers.q2, answers.q3]);

  useEffect(() => {
    if (!submitting) return undefined;

    let cancelled = false;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 2;
        return next > 100 ? 100 : next;
      });
    }, 70);

    const submitAsync = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      try {
        if (reportId) {
          const token = localStorage.getItem('patientToken') || localStorage.getItem('token');
          await fetch(`http://localhost:5000/api/reports/${reportId}/submit-questionnaire`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(answers),
          });
        }
      } catch (err) {
        console.error('Questionnaire backend submission failed:', err);
      }

      if (!cancelled) {
        clearInterval(interval);
        setProgress(100);
        onComplete(answers);
      }
    };

    submitAsync();

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [submitting, onComplete, answers, reportId]);

  const visibleQuestions = (sectionIndex) => {
    return (questionsBySection[sectionIndex] || []).filter((q) => {
      if (!q.condition) return true;
      return q.condition(answers);
    });
  };

  const validateStep = () => {
    const missing = visibleQuestions(activeStep).filter((q) => {
      const key = `q${q.id}`;
      const value = answers[key];
      if (q.type === 'number') return value === '' || value === null;
      return !value;
    });

    if (missing.length > 0) {
      setError(`Please answer all questions in ${SECTION_TITLES[activeStep]}.`);
      return false;
    }

    if (activeStep === 0) {
      const age = parseInt(answers.q1, 10);
      if (Number.isNaN(age) || age <= 0 || age > 120) {
        setError('Please enter a valid age (1-120).');
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (activeStep === SECTION_TITLES.length - 1) {
      setSubmitting(true);
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prev) => prev - 1);
  };

  const handleAnswerChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [`q${id}`]: value }));
  };

  const renderQuestion = (q) => {
    const value = answers[`q${q.id}`];
    
    // Disable if automatically populated from patient details
    const isDisabled = Boolean((q.id === 1 && patientDetails?.age) || (q.id === 2 && patientDetails?.gender));

    if (q.type === 'number') {
      return (
        <TextField
          fullWidth
          type="number"
          label={`Q${q.id}`}
          value={value}
          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
          inputProps={{ min: 1, max: 120 }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          disabled={isDisabled}
        />
      );
    }

    return (
      <FormControl disabled={isDisabled}>
        <FormLabel sx={{ color: 'text.secondary', mb: 1 }}>Q{q.id}</FormLabel>
        <RadioGroup
          value={value}
          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
        >
          {q.options.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio size="small" />}
              label={option.label}
            />
          ))}
        </RadioGroup>
      </FormControl>
    );
  };

  if (submitting) {
    return (
      <Paper elevation={0} sx={{ maxWidth: 900, mx: 'auto', borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ px: 4, py: 8, textAlign: 'center', background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', color: 'white' }}>
          <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: '50%', bgcolor: alpha('#fff', 0.12), mb: 2 }}>
            <PsychologyIcon sx={{ fontSize: 36 }} />
          </Box>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>Processing Questionnaire</Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mb: 4 }}>
            Calculating disease risk components from your responses (Q1-Q33).
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
            <Typography variant="caption" sx={{ mt: 1.2, display: 'block', opacity: 0.8 }}>
              {progress}% complete
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ maxWidth: 900, mx: 'auto', borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ px: 4, py: 3, textAlign: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', color: 'white' }}>
        <Typography variant="h5" fontWeight={800}>Unified Patient Questionnaire</Typography>
        <Typography variant="body2" sx={{ opacity: 0.78, mt: 0.6 }}>
          33 structured questions for UTI, kidney stone, hematuria, and kidney disease risk scoring.
        </Typography>
      </Box>

      <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {SECTION_TITLES.map((label) => (
            <Step key={label}>
              <StepLabel>
                <Typography variant="caption" fontWeight={600}>{label}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Box sx={{ px: 4, py: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>{SECTION_TITLES[activeStep]}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Answer all questions in this section to continue.
        </Typography>

        <Grid container spacing={2.5}>
          {visibleQuestions(activeStep).map((q) => (
            <Grid key={q.id} size={{ xs: 12 }}>
              <Paper elevation={0} sx={{ p: 2.2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1.2 }}>
                  Q{q.id}. {q.text}
                </Typography>
                {renderQuestion(q)}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ px: 4, py: 2.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Chip
          label={`Section ${activeStep + 1} of ${SECTION_TITLES.length}`}
          size="small"
          sx={{ fontWeight: 600, fontSize: '0.72rem', bgcolor: alpha('#00bcd4', 0.08), color: '#0288d1' }}
        />

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {activeStep > 0 && (
            <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ textTransform: 'none', fontWeight: 600 }}>
              Back
            </Button>
          )}
          <Button
            variant="contained"
            endIcon={activeStep === SECTION_TITLES.length - 1 ? <SendIcon /> : <ArrowForwardIcon />}
            onClick={handleNext}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
            }}
          >
            {activeStep === SECTION_TITLES.length - 1 ? 'Submit Questionnaire' : 'Next Section'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Box sx={{ px: 4, pb: 2.5 }}>
          <Paper elevation={0} sx={{ p: 1.2, borderRadius: 1.5, border: '1px solid', borderColor: alpha('#ef5350', 0.4), bgcolor: alpha('#ef5350', 0.06), color: '#c62828' }}>
            <Typography variant="caption" fontWeight={700}>{error}</Typography>
          </Paper>
        </Box>
      )}

      <Box sx={{ px: 4, pb: 3, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
        <CheckCircleIcon sx={{ fontSize: 16 }} />
        <Typography variant="caption">Question set is aligned to Q1-Q33 disease mapping.</Typography>
      </Box>
    </Paper>
  );
};

export default Questionnaire;
