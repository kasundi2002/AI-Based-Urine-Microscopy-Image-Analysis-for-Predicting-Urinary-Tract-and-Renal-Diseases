import React from 'react';
import { Box, Typography, Paper, Grid, Chip, LinearProgress, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BiotechIcon from '@mui/icons-material/Biotech';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SearchIcon from '@mui/icons-material/Search';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ShieldIcon from '@mui/icons-material/Shield';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import DiamondIcon from '@mui/icons-material/Diamond';
import BugReportIcon from '@mui/icons-material/BugReport';
import SpaIcon from '@mui/icons-material/Spa';
import ScienceIcon from '@mui/icons-material/Science';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import FlagIcon from '@mui/icons-material/Flag';

// ─── Question label mapping ──────────────────────────────────────────────────
const QUESTION_LABELS = {
    q1: 'Age',
    q2: 'Biological Sex',
    q3: 'Menstruation status',
    q4: 'Pain/burning during urination',
    q5: 'Frequent urination',
    q6: 'Urinary urgency',
    q7: 'Visible blood in urine',
    q8: 'Dark/cola-colored urine',
    q9: 'Reduced urine output',
    q10: 'Lower abdominal pain',
    q11: 'Flank/side/lower back pain',
    q12: 'Kidney area pain',
    q13: 'Nausea or vomiting',
    q14: 'Fever or chills',
    q15: 'Abdominal/back pain with fever',
    q16: 'Swelling (feet/ankles/face)',
    q17: 'Fatigue or weakness',
    q18: 'Recent UTI history',
    q19: 'Kidney infection history',
    q20: 'Diagnosed kidney disease',
    q21: 'Hypertension',
    q22: 'Diabetes',
    q23: 'Other long-term conditions',
    q24: 'Family history (kidney/cancer)',
    q25: 'NSAID painkiller use',
    q26: 'Antibiotics/antifungal use',
    q27: 'Kidney-affecting medications',
    q28: 'Daily water intake',
    q29: 'High-salt diet',
    q30: 'Oxalate-rich foods',
    q31: 'High-protein/red meat diet',
    q32: 'Smoking history',
    q33: 'Alcohol consumption',
};

// ─── Particle color/icon mapping ──────────────────────────────────────────────
const PARTICLE_CONFIG = {
    rbc: { label: 'RBC', unit: '/hpf', color: '#ef5350', icon: <BloodtypeIcon />, normalMax: 3 },
    wbc: { label: 'WBC', unit: '/hpf', color: '#7c4dff', icon: <ShieldIcon />, normalMax: 5 },
    crystal: { label: 'Crystals', unit: '', color: '#ff9100', icon: <DiamondIcon />, normalMax: 2 },
    cast: { label: 'Casts', unit: '', color: '#66bb6a', icon: <ScienceIcon />, normalMax: 0 },
    bacteria: { label: 'Bacteria', unit: '', color: '#00bcd4', icon: <BugReportIcon />, normalMax: 0 },
    yeast: { label: 'Yeast', unit: '', color: '#ff7043', icon: <SpaIcon />, normalMax: 0 },
};

const getRiskColor = (score) => {
    if (score >= 81) return { main: '#d32f2f', bg: '#d32f2f', label: 'Critical' };
    if (score >= 61) return { main: '#ef5350', bg: '#ef5350', label: 'High' };
    if (score >= 41) return { main: '#ff9100', bg: '#ff9100', label: 'Moderate' };
    if (score >= 21) return { main: '#66bb6a', bg: '#66bb6a', label: 'Low' };
    return { main: '#4caf50', bg: '#4caf50', label: 'Normal' };
};

const AnalysisDetails = ({ report }) => {
    const analysis = report?.analysis || {};
    const diagnosisData = analysis?.diagnosis?.diagnoses || [];
    const particleData = analysis?.particles || {};
    const riskPrediction = report?.riskPrediction;

    // ── Risk scores ──────────────────────────────────────────────────────────
    const combinedRisk = riskPrediction?.derivedRisks?.combinedRisk || {};
    const baseDiagnosisScore = combinedRisk.baseDiagnosisScore ?? riskPrediction?.baseDiagnosisScore ?? 0;
    const questionnaireScore = combinedRisk.questionnaireScore ?? riskPrediction?.questionnaireScore ?? 0;
    const finalRiskScore = combinedRisk.score ?? 0;
    const riskLevel = combinedRisk.riskLevel || getRiskColor(finalRiskScore).label;
    const riskStyle = getRiskColor(finalRiskScore);

    // ── Diagnoses ────────────────────────────────────────────────────────────
    const sortedDiagnoses = [...diagnosisData].sort((a, b) => {
        const val = { 'High': 3, 'Moderate': 2, 'Low': 1 };
        return (val[b.probability] || 0) - (val[a.probability] || 0);
    });
    const nonNormalDiagnoses = sortedDiagnoses.filter(d => d.name !== 'Normal Urine Sediment');
    const mainDiagnoses = nonNormalDiagnoses.length > 0
        ? nonNormalDiagnoses.filter(d => d.probability === nonNormalDiagnoses[0].probability)
        : [];
    const otherDiagnoses = nonNormalDiagnoses.filter(d => !mainDiagnoses.find(m => m.name === d.name));

    // ── Particles ────────────────────────────────────────────────────────────
    const getCount = (data) => {
        if (!data || typeof data !== 'object') return 0;
        if (Number.isFinite(Number(data.total_count))) return Number(data.total_count);
        if (Number.isFinite(Number(data.count))) return Number(data.count);
        if (Array.isArray(data.boxes)) return data.boxes.length;
        return 0;
    };

    const particlesList = Object.entries(PARTICLE_CONFIG).map(([key, config]) => {
        const rawData = particleData[key] || particleData[key + 's'] || {};
        const count = getCount(rawData);
        const isAbnormal = count > config.normalMax;
        return { ...config, key, count, isAbnormal, rawData };
    });
    const totalObjects = particlesList.reduce((sum, p) => sum + p.count, 0);
    const abnormalCount = particlesList.filter(p => p.isAbnormal).length;

    // ── Image ────────────────────────────────────────────────────────────────
    const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const imageUrl = report?.imageUrl ? `${API_BASE}${report.imageUrl}` : null;

    // ── Questionnaire ────────────────────────────────────────────────────────
    const questionnaireMap = report?.clinicalData?.raw || {};
    const answeredQuestions = Object.entries(questionnaireMap).filter(([, val]) => val !== '' && val !== null && val !== undefined);

    // ── Explanations ─────────────────────────────────────────────────────────
    const riskExplanation = riskPrediction?.riskExplanation || {};
    const causes = riskExplanation.causes || [];
    const supportingFactors = riskExplanation.supportingFactors || [];
    const patientSymptoms = riskExplanation.patientSymptoms || [];
    const hasExplanations = causes.length > 0 || supportingFactors.length > 0 || patientSymptoms.length > 0;

    // ── Chip color ───────────────────────────────────────────────────────────
    const probChipColor = (prob) => {
        if (prob === 'High') return { bg: alpha('#ef5350', 0.12), color: '#ef5350' };
        if (prob === 'Moderate') return { bg: alpha('#ff9100', 0.12), color: '#e65100' };
        return { bg: alpha('#66bb6a', 0.12), color: '#2e7d32' };
    };

    // ── Section header helper ────────────────────────────────────────────────
    const SectionHeader = ({ icon, title, subtitle, rightSlot }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha('#00bcd4', 0.08), color: '#0097a7', display: 'flex' }}>
                    {React.cloneElement(icon, { sx: { fontSize: 20 } })}
                </Box>
                <Box>
                    <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2 }}>{title}</Typography>
                    {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
                </Box>
            </Box>
            {rightSlot}
        </Box>
    );

    return (
        <Box sx={{ mt: 3 }}>
            <style>{`
                @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes progressFill { from { width: 0; } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
            `}</style>

            <Grid container spacing={3}>

                {/* ═══════════ RISK SCORE HERO ═══════════ */}
                <Grid item xs={12}>
                    <Paper elevation={0} sx={{
                        borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider',
                        animation: 'fadeSlideIn 0.4s ease-out',
                    }}>
                        <Box sx={{
                            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
                            color: 'white', px: 4, py: 3.5,
                        }}>
                            <Grid container spacing={3} alignItems="center">
                                {/* Score Circle */}
                                <Grid item xs={12} md={3}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Box sx={{
                                            width: 120, height: 120, borderRadius: '50%', mx: 'auto',
                                            background: `conic-gradient(${riskStyle.main} ${(finalRiskScore / 100) * 360}deg, ${alpha('#fff', 0.1)} 0deg)`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: `0 0 30px ${alpha(riskStyle.main, 0.3)}`,
                                        }}>
                                            <Box sx={{
                                                width: 96, height: 96, borderRadius: '50%',
                                                bgcolor: '#0f172a', display: 'flex', flexDirection: 'column',
                                                alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <Typography variant="h3" fontWeight={900} sx={{ lineHeight: 1 }}>{finalRiskScore}</Typography>
                                                <Typography variant="caption" sx={{ opacity: 0.6, fontSize: '0.65rem' }}>/ 100</Typography>
                                            </Box>
                                        </Box>
                                        <Chip
                                            label={`${riskLevel} Risk`}
                                            size="small"
                                            sx={{
                                                mt: 1.5, fontWeight: 700, fontSize: '0.72rem',
                                                bgcolor: alpha(riskStyle.main, 0.2), color: riskStyle.main,
                                                border: '1px solid', borderColor: alpha(riskStyle.main, 0.3),
                                            }}
                                        />
                                    </Box>
                                </Grid>

                                {/* Score Breakdown */}
                                <Grid item xs={12} md={9}>
                                    <Typography variant="overline" sx={{ opacity: 0.5, letterSpacing: 1.5, fontSize: '0.65rem' }}>RISK SCORE BREAKDOWN</Typography>

                                    {/* Diagnosis Score Bar */}
                                    <Box sx={{ mt: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="body2" sx={{ opacity: 0.8 }}>Diagnosis Score (AI Analysis)</Typography>
                                            <Typography variant="body2" fontWeight={700}>{baseDiagnosisScore} / 75</Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={(baseDiagnosisScore / 75) * 100}
                                            sx={{
                                                height: 8, borderRadius: 4, bgcolor: alpha('#fff', 0.08),
                                                '& .MuiLinearProgress-bar': {
                                                    borderRadius: 4,
                                                    background: 'linear-gradient(90deg, #00bcd4, #0097a7)',
                                                    animation: 'progressFill 1s ease-out',
                                                },
                                            }}
                                        />
                                    </Box>

                                    {/* Questionnaire Score Bar */}
                                    <Box sx={{ mt: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="body2" sx={{ opacity: 0.8 }}>Questionnaire Score (Patient Reported)</Typography>
                                            <Typography variant="body2" fontWeight={700}>{questionnaireScore} / 25</Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={(questionnaireScore / 25) * 100}
                                            sx={{
                                                height: 8, borderRadius: 4, bgcolor: alpha('#fff', 0.08),
                                                '& .MuiLinearProgress-bar': {
                                                    borderRadius: 4,
                                                    background: 'linear-gradient(90deg, #66bb6a, #43a047)',
                                                    animation: 'progressFill 1.2s ease-out',
                                                },
                                            }}
                                        />
                                    </Box>

                                    {/* Combined */}
                                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: alpha('#fff', 0.1) }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="body2" fontWeight={700} sx={{ opacity: 0.9 }}>Combined Final Score</Typography>
                                            <Typography variant="body2" fontWeight={800} sx={{ color: riskStyle.main }}>{finalRiskScore} / 100</Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={finalRiskScore}
                                            sx={{
                                                height: 10, borderRadius: 5, bgcolor: alpha('#fff', 0.08),
                                                '& .MuiLinearProgress-bar': {
                                                    borderRadius: 5,
                                                    background: `linear-gradient(90deg, ${riskStyle.main}, ${alpha(riskStyle.main, 0.7)})`,
                                                    animation: 'progressFill 1.5s ease-out',
                                                },
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.5 }}>
                                        <InfoOutlinedIcon sx={{ fontSize: 13 }} />
                                        <Typography variant="caption" sx={{ fontSize: '0.68rem' }}>
                                            Final Risk = Diagnosis Score (max 75) + Questionnaire Score (max 25)
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </Grid>

                {/* ═══════════ MAIN DIAGNOSES ═══════════ */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{
                        p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider',
                        height: '100%', animation: 'fadeSlideIn 0.5s ease-out',
                    }}>
                        <SectionHeader icon={<SearchIcon />} title="AI Diagnoses" subtitle="Identified from urine microscopy analysis" />

                        {mainDiagnoses.length > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {mainDiagnoses.map((d, i) => {
                                    const chipStyle = probChipColor(d.probability);
                                    return (
                                        <Paper key={i} elevation={0} sx={{
                                            p: 2, borderRadius: 2.5,
                                            border: '1px solid', borderColor: alpha(chipStyle.color, 0.2),
                                            bgcolor: alpha(chipStyle.color, 0.03),
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <FlagIcon sx={{ color: chipStyle.color, fontSize: 18 }} />
                                                <Typography variant="body1" fontWeight={700}>{d.name}</Typography>
                                            </Box>
                                            <Chip
                                                label={d.probability}
                                                size="small"
                                                sx={{
                                                    fontWeight: 700, fontSize: '0.7rem',
                                                    bgcolor: chipStyle.bg, color: chipStyle.color,
                                                }}
                                            />
                                        </Paper>
                                    );
                                })}
                            </Box>
                        ) : (
                            <Paper elevation={0} sx={{ p: 3, textAlign: 'center', borderRadius: 2, bgcolor: alpha('#66bb6a', 0.04), border: '1px solid', borderColor: alpha('#66bb6a', 0.12) }}>
                                <CheckCircleOutlineIcon sx={{ color: '#66bb6a', fontSize: 32, mb: 1 }} />
                                <Typography variant="body1" fontWeight={700} color="text.secondary">Normal Urine Sediment</Typography>
                                <Typography variant="caption" color="text.disabled">No significant abnormalities detected</Typography>
                            </Paper>
                        )}

                        {otherDiagnoses.length > 0 && (
                            <Box sx={{ mt: 2.5 }}>
                                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Other Possible Diagnoses
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                    {otherDiagnoses.map((d, i) => {
                                        const chipStyle = probChipColor(d.probability);
                                        return (
                                            <Chip key={i} label={`${d.name} (${d.probability})`} size="small"
                                                sx={{ fontWeight: 600, fontSize: '0.7rem', bgcolor: chipStyle.bg, color: chipStyle.color }}
                                            />
                                        );
                                    })}
                                </Box>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* ═══════════ PARTICLE ANALYSIS ═══════════ */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{
                        p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider',
                        height: '100%', animation: 'fadeSlideIn 0.55s ease-out',
                    }}>
                        <SectionHeader
                            icon={<BiotechIcon />}
                            title="Detected Urine Particles"
                            subtitle={`${totalObjects} total objects detected`}
                            rightSlot={
                                abnormalCount > 0 && (
                                    <Chip label={`${abnormalCount} abnormal`} size="small"
                                        sx={{ fontWeight: 700, fontSize: '0.68rem', bgcolor: alpha('#ef5350', 0.1), color: '#ef5350' }}
                                    />
                                )
                            }
                        />
                        <Grid container spacing={1.5}>
                            {particlesList.map((p) => (
                                <Grid item xs={6} sm={4} key={p.key}>
                                    <Tooltip title={p.isAbnormal ? `Above normal range (>${p.normalMax})` : 'Within normal range'} arrow>
                                        <Paper elevation={0} sx={{
                                            p: 2, textAlign: 'center', borderRadius: 2.5,
                                            bgcolor: p.isAbnormal ? alpha(p.color, 0.06) : alpha('#f5f5f5', 0.5),
                                            border: '1px solid',
                                            borderColor: p.isAbnormal ? alpha(p.color, 0.25) : 'divider',
                                            transition: 'all 0.2s',
                                            '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${alpha(p.color, 0.15)}` },
                                        }}>
                                            <Box sx={{ color: p.isAbnormal ? p.color : 'text.disabled', mb: 0.5 }}>
                                                {React.cloneElement(p.icon, { sx: { fontSize: 20 } })}
                                            </Box>
                                            <Typography variant="h5" fontWeight={800} sx={{ color: p.isAbnormal ? p.color : 'text.primary' }}>
                                                {p.count}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                {p.label} {p.unit && <span style={{ opacity: 0.6 }}>{p.unit}</span>}
                                            </Typography>
                                            {p.isAbnormal && (
                                                <Box sx={{ mt: 0.5 }}>
                                                    <Chip label="↑ High" size="small" sx={{
                                                        height: 16, fontSize: '0.58rem', fontWeight: 700,
                                                        bgcolor: alpha(p.color, 0.12), color: p.color,
                                                    }} />
                                                </Box>
                                            )}
                                        </Paper>
                                    </Tooltip>
                                </Grid>
                            ))}
                        </Grid>

                        {/* RBC Subtypes */}
                        {particleData.rbc?.subtype_summary && (
                            <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: alpha('#ef5350', 0.04), border: '1px solid', borderColor: alpha('#ef5350', 0.12) }}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: '#ef5350', textTransform: 'uppercase', letterSpacing: 0.5 }}>RBC Subtypes</Typography>
                                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                                    <Grid item xs={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ef5350' }} />
                                            <Typography variant="body2">Dysmorphic: <strong>{particleData.rbc.subtype_summary.dysmorphic || 0}</strong></Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ff7043' }} />
                                            <Typography variant="body2">Isomorphic: <strong>{particleData.rbc.subtype_summary.isomorphic || 0}</strong></Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* ═══════════ MICROSCOPY IMAGE ═══════════ */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{
                        p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider',
                        height: '100%', animation: 'fadeSlideIn 0.6s ease-out',
                    }}>
                        <SectionHeader icon={<CameraAltIcon />} title="Microscopy Detection" subtitle="AI-annotated microscopy image" />
                        {imageUrl ? (
                            <Box sx={{ textAlign: 'center', mb: 2 }}>
                                <Box sx={{
                                    borderRadius: 2.5, overflow: 'hidden', bgcolor: '#000',
                                    display: 'inline-block', border: '2px solid', borderColor: alpha('#00bcd4', 0.2),
                                }}>
                                    <img src={imageUrl} alt="Microscopy" style={{ maxWidth: '100%', maxHeight: 260, objectFit: 'contain', display: 'block' }} />
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{ py: 5, textAlign: 'center', borderRadius: 2, bgcolor: alpha('#f5f5f5', 0.5), border: '1px dashed', borderColor: 'divider' }}>
                                <CameraAltIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                                <Typography variant="body2" color="text.disabled">No microscopy image available</Typography>
                            </Box>
                        )}
                        <Paper elevation={0} sx={{
                            p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            borderRadius: 2, bgcolor: alpha('#00bcd4', 0.04), border: '1px solid', borderColor: alpha('#00bcd4', 0.12),
                        }}>
                            <Typography variant="body2" fontWeight={600}>Total Objects Detected</Typography>
                            <Chip label={`${totalObjects} objects`} size="small"
                                sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: alpha('#00bcd4', 0.1), color: '#0097a7' }}
                            />
                        </Paper>
                    </Paper>
                </Grid>

                {/* ═══════════ RISK FACTORS ═══════════ */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{
                        p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider',
                        height: '100%', animation: 'fadeSlideIn 0.65s ease-out',
                    }}>
                        <SectionHeader icon={<TrendingUpIcon />} title="Risk Factors Detected" subtitle="Contributing factors to clinical risk" />

                        {hasExplanations ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                {/* Primary Causes */}
                                {causes.length > 0 && (
                                    <Box>
                                        <Typography variant="caption" fontWeight={700} sx={{ color: '#ef5350', textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <WarningAmberIcon sx={{ fontSize: 14 }} /> Primary Causes
                                        </Typography>
                                        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                                            {causes.map((c, i) => (
                                                <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ef5350', mt: 0.9, flexShrink: 0 }} />
                                                    <Typography variant="body2">{c}</Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                {/* Supporting Evidence */}
                                {supportingFactors.length > 0 && (
                                    <Box>
                                        <Typography variant="caption" fontWeight={700} sx={{ color: '#ff9100', textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <BiotechIcon sx={{ fontSize: 14 }} /> Supporting Evidence
                                        </Typography>
                                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                                            {supportingFactors.map((s, i) => (
                                                <Chip key={i} label={s} size="small" variant="outlined"
                                                    sx={{ fontWeight: 600, fontSize: '0.7rem', borderColor: alpha('#ff9100', 0.3), color: '#e65100' }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                {/* Patient Symptoms */}
                                {patientSymptoms.length > 0 && (
                                    <Box>
                                        <Typography variant="caption" fontWeight={700} sx={{ color: '#7c4dff', textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <LocalHospitalIcon sx={{ fontSize: 14 }} /> Patient-Reported Symptoms
                                        </Typography>
                                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                                            {patientSymptoms.map((s, i) => (
                                                <Chip key={i} label={s} size="small"
                                                    sx={{ fontWeight: 600, fontSize: '0.7rem', bgcolor: alpha('#7c4dff', 0.08), color: '#7c4dff' }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        ) : (
                            <Box sx={{ py: 4, textAlign: 'center' }}>
                                <CheckCircleOutlineIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
                                <Typography variant="body2" color="text.secondary">No significant risk factors detected</Typography>
                                <Typography variant="caption" color="text.disabled">Complete the questionnaire for a detailed risk breakdown</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* ═══════════ QUESTIONNAIRE RESPONSES ═══════════ */}
                {answeredQuestions.length > 0 && (
                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{
                            p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider',
                            animation: 'fadeSlideIn 0.7s ease-out',
                        }}>
                            <SectionHeader
                                icon={<AssignmentIcon />}
                                title="Patient Questionnaire Responses"
                                subtitle={`${answeredQuestions.length} questions answered`}
                            />
                            <Grid container spacing={1.5}>
                                {answeredQuestions.map(([key, val]) => {
                                    const label = QUESTION_LABELS[key] || key.toUpperCase();
                                    const isPositive = val === 'Yes';
                                    const isNegative = val === 'No';
                                    return (
                                        <Grid item xs={12} sm={6} md={4} key={key}>
                                            <Paper elevation={0} sx={{
                                                p: 1.8, borderRadius: 2,
                                                border: '1px solid',
                                                borderColor: isPositive ? alpha('#ef5350', 0.15) : 'divider',
                                                bgcolor: isPositive ? alpha('#ef5350', 0.02) : 'transparent',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            }}>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
                                                        {key.toUpperCase()}
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }} noWrap title={label}>
                                                        {label}
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    label={val || 'N/A'}
                                                    size="small"
                                                    sx={{
                                                        ml: 1, fontWeight: 700, fontSize: '0.68rem', minWidth: 50,
                                                        bgcolor: isPositive ? alpha('#ef5350', 0.1) : isNegative ? alpha('#66bb6a', 0.08) : alpha('#90a4ae', 0.1),
                                                        color: isPositive ? '#ef5350' : isNegative ? '#2e7d32' : 'text.secondary',
                                                    }}
                                                />
                                            </Paper>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Paper>
                    </Grid>
                )}

            </Grid>
        </Box>
    );
};

export default AnalysisDetails;
