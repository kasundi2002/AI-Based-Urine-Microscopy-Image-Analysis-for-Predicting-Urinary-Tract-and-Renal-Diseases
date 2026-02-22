import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ScienceIcon from '@mui/icons-material/Science';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SummarizeIcon from '@mui/icons-material/Summarize';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useDropzone } from 'react-dropzone';
import { rbcApi } from '../../services/api';

const steps = ['Upload Image', 'RBC Analysis', 'Questionnaire', 'Final Report'];

const RBCHematuriaWorkflow = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedPreview, setUploadedPreview] = useState(null);
  const [rbcResult, setRbcResult] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [finalReport, setFinalReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      setUploadedPreview(URL.createObjectURL(file));
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/tiff': [] },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    if (!uploadedFile) return;
    setLoading(true);
    setError(null);
    try {
      const result = await rbcApi.analyze(uploadedFile);
      setRbcResult(result);
      setActiveStep(1);
    } catch (err) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuestionnaire = async () => {
    setLoading(true);
    setError(null);
    try {
      const { questions: qs } = await rbcApi.getQuestionnaire();
      setQuestions(qs);
      setAnswers({});
      setActiveStep(2);
    } catch (err) {
      setError(err.message || 'Failed to load questionnaire');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [String(questionId)]: value }));
  };

  const handleMultiSelectChange = (questionId, option, checked) => {
    setAnswers((prev) => {
      const current = prev[String(questionId)] || [];
      const arr = Array.isArray(current) ? [...current] : [current];
      if (checked) {
        arr.push(option);
      } else {
        arr.splice(arr.indexOf(option), 1);
      }
      return { ...prev, [String(questionId)]: arr };
    });
  };

  const handleSubmitQuestionnaire = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await rbcApi.submitQuestionnaire(answers);
      if (result.error) {
        setError(result.error);
      } else {
        setFinalReport(result);
        setActiveStep(3);
      }
    } catch (err) {
      setError(err.message || 'Submit failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setUploadedFile(null);
    setUploadedPreview(null);
    setRbcResult(null);
    setQuestions([]);
    setAnswers({});
    setFinalReport(null);
    setError(null);
  };

  const shouldShowQuestion = (q) => {
    if (!q.condition) return true;
    const { field, value } = q.condition;
    const matched = questions.find((x) => x.question === field);
    if (!matched) return true;
    return answers[String(matched.id)] === value;
  };

  const getRiskColor = (level) => {
    if (level === 'High') return 'error';
    if (level === 'Moderate') return 'warning';
    return 'success';
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        RBC Hematuria Analysis
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {activeStep === 0 && (
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <ScienceIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">
              Step 1: Upload Urine Microscopy Image
            </Typography>
          </Box>

          {uploadedFile ? (
            <Box>
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  bgcolor: 'action.hover',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                {uploadedPreview && (
                  <Box
                    component="img"
                    src={uploadedPreview}
                    alt="Preview"
                    sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 1 }}
                  />
                )}
                <Box>
                  <Typography variant="body1">{uploadedFile.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setUploadedFile(null);
                    setUploadedPreview(null);
                  }}
                >
                  Remove
                </Button>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ScienceIcon />}
                onClick={handleAnalyze}
                disabled={loading}
              >
                {loading ? 'Analyzing...' : 'Analyze Image'}
              </Button>
            </Box>
          ) : (
            <Paper
              {...getRootProps()}
              sx={{
                p: 6,
                textAlign: 'center',
                cursor: 'pointer',
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.700',
                bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
              }}
            >
              <input {...getInputProps()} />
              <CloudUploadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6">
                {isDragActive ? 'Drop image here' : 'Drag & drop urine microscopy image'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                JPEG, PNG, TIFF
              </Typography>
            </Paper>
          )}
        </Paper>
      )}

      {activeStep === 1 && rbcResult && (
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <SummarizeIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">
              RBC Analysis Results
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main">
                  {rbcResult.detected_rbc}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  RBCs Detected
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {rbcResult.iso_count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Isomorphic
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {rbcResult.dys_count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dysmorphic
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Chip
                  label={rbcResult.hematuria_origin}
                  color={rbcResult.hematuria_origin === 'Glomerular' ? 'warning' : 'default'}
                  sx={{ mb: 0.5 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Origin • {rbcResult.dys_percentage}% dysmorphic
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={() => setActiveStep(0)}>
              Back
            </Button>
            <Button variant="contained" onClick={handleStartQuestionnaire} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Continue to Questionnaire'}
            </Button>
          </Box>
        </Paper>
      )}

      {activeStep === 2 && questions.length > 0 && (
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <AssignmentIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">
              Clinical Questionnaire
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {questions
              .filter(shouldShowQuestion)
              .map((q) => (
                <FormControl key={q.id} component="fieldset" fullWidth>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                    {q.question}
                  </Typography>
                  {q.type === 'yes_no' && (
                    <RadioGroup
                      row
                      value={answers[String(q.id)] || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    >
                      <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                      <FormControlLabel value="No" control={<Radio />} label="No" />
                    </RadioGroup>
                  )}
                  {q.type === 'select' && q.options && (
                    <RadioGroup
                      value={answers[String(q.id)] || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    >
                      {q.options.map((opt) => (
                        <FormControlLabel
                          key={opt}
                          value={opt}
                          control={<Radio />}
                          label={opt}
                        />
                      ))}
                    </RadioGroup>
                  )}
                  {q.type === 'multi_select' && q.options && (
                    <Box>
                      {q.options.map((opt) => (
                        <FormControlLabel
                          key={opt}
                          control={
                            <Checkbox
                              checked={(answers[String(q.id)] || []).includes(opt)}
                              onChange={(e) =>
                                handleMultiSelectChange(q.id, opt, e.target.checked)
                              }
                            />
                          }
                          label={opt}
                        />
                      ))}
                    </Box>
                  )}
                </FormControl>
              ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button variant="outlined" onClick={() => setActiveStep(1)}>
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmitQuestionnaire}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit & Generate Report'}
            </Button>
          </Box>
        </Paper>
      )}

      {activeStep === 3 && finalReport && (
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <CheckCircleIcon sx={{ mr: 2, color: 'success.main' }} />
            <Typography variant="h6" fontWeight="bold">
              Final Report
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Chip
              icon={<WarningAmberIcon />}
              label={`Risk Level: ${finalReport.final_report.risk_level}`}
              color={getRiskColor(finalReport.final_report.risk_level)}
              sx={{ fontSize: '1rem', py: 1.5 }}
            />
            <Typography variant="h6" sx={{ mt: 2 }}>
              {finalReport.final_report.final_prediction}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" color="primary.main" gutterBottom>
            Clinical Reasons
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2, mb: 2 }}>
            {finalReport.final_report.clinical_reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </Box>

          {finalReport.final_report.warnings?.length > 0 && (
            <>
              <Typography variant="subtitle2" color="warning.main" gutterBottom>
                Warnings
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2, mb: 2 }}>
                {finalReport.final_report.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </Box>
            </>
          )}

          <Typography variant="subtitle2" color="success.main" gutterBottom>
            Suggestions
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            {finalReport.final_report.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </Box>

          <Button variant="contained" onClick={handleReset} sx={{ mt: 4 }}>
            New Analysis
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default RBCHematuriaWorkflow;
