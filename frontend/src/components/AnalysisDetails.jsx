import React, { useRef, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Chip, LinearProgress, Tooltip, Divider } from '@mui/material';
import { alpha } from '@mui/material/styles';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
import SpeedIcon from '@mui/icons-material/Speed';
import VerifiedIcon from '@mui/icons-material/Verified';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SecurityIcon from '@mui/icons-material/Security';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';

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

// Group questions into categories for display
const QUESTION_CATEGORIES = {
    'Demographics': ['q1', 'q2', 'q3'],
    'Urinary Symptoms': ['q4', 'q5', 'q6', 'q7', 'q8', 'q9'],
    'Pain & Systemic': ['q10', 'q11', 'q12', 'q13', 'q14', 'q15', 'q16', 'q17'],
    'Medical History': ['q18', 'q19', 'q20', 'q21', 'q22', 'q23', 'q24'],
    'Medications': ['q25', 'q26', 'q27'],
    'Lifestyle': ['q28', 'q29', 'q30', 'q31', 'q32', 'q33'],
};

// ─── Particle color/icon mapping ──────────────────────────────────────────────
const PARTICLE_CONFIG = {
    rbc: { label: 'RBC', fullName: 'Red Blood Cells', unit: '/hpf', color: '#ef5350', gradient: 'linear-gradient(135deg, #ef5350, #c62828)', icon: <BloodtypeIcon />, normalMax: 3 },
    wbc: { label: 'WBC', fullName: 'White Blood Cells', unit: '/hpf', color: '#7c4dff', gradient: 'linear-gradient(135deg, #7c4dff, #651fff)', icon: <ShieldIcon />, normalMax: 5 },
    crystal: { label: 'Crystals', fullName: 'Crystal Formations', unit: '', color: '#ff9100', gradient: 'linear-gradient(135deg, #ff9100, #e65100)', icon: <DiamondIcon />, normalMax: 2 },
    cast: { label: 'Casts', fullName: 'Urinary Casts', unit: '', color: '#66bb6a', gradient: 'linear-gradient(135deg, #66bb6a, #43a047)', icon: <ScienceIcon />, normalMax: 0 },
    bacteria: { label: 'Bacteria', fullName: 'Bacterial Cells', unit: '', color: '#00bcd4', gradient: 'linear-gradient(135deg, #00bcd4, #0097a7)', icon: <BugReportIcon />, normalMax: 0 },
    yeast: { label: 'Yeast', fullName: 'Yeast Cells', unit: '', color: '#ff7043', gradient: 'linear-gradient(135deg, #ff7043, #e64a19)', icon: <SpaIcon />, normalMax: 0 },
};

const getRiskColor = (score) => {
    if (score >= 81) return { main: '#d32f2f', bg: '#d32f2f', label: 'Critical', gradient: 'linear-gradient(135deg, #d32f2f, #b71c1c)' };
    if (score >= 61) return { main: '#ef5350', bg: '#ef5350', label: 'High', gradient: 'linear-gradient(135deg, #ef5350, #c62828)' };
    if (score >= 41) return { main: '#ff9100', bg: '#ff9100', label: 'Moderate', gradient: 'linear-gradient(135deg, #ff9100, #e65100)' };
    if (score >= 21) return { main: '#66bb6a', bg: '#66bb6a', label: 'Low', gradient: 'linear-gradient(135deg, #66bb6a, #43a047)' };
    return { main: '#4caf50', bg: '#4caf50', label: 'Normal', gradient: 'linear-gradient(135deg, #4caf50, #2e7d32)' };
};

/* ── SVG Gauge Component ── */
const RiskGauge = ({ score, riskStyle, riskLevel }) => {
    const radius = 58;
    const stroke = 10;
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <Box sx={{ position: 'relative', width: 140, height: 140, mx: 'auto' }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
                {/* Background track */}
                <circle
                    cx="70" cy="70" r={normalizedRadius}
                    fill="none" stroke="rgba(255,255,255,0.08)"
                    strokeWidth={stroke}
                />
                {/* Score arc */}
                <circle
                    cx="70" cy="70" r={normalizedRadius}
                    fill="none" stroke={riskStyle.main}
                    strokeWidth={stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 70 70)"
                    style={{
                        transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)',
                        filter: `drop-shadow(0 0 8px ${alpha(riskStyle.main, 0.5)})`,
                    }}
                />
                {/* Glow effect */}
                <circle
                    cx="70" cy="70" r={normalizedRadius}
                    fill="none" stroke={riskStyle.main}
                    strokeWidth={2}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    opacity="0.3"
                    transform="rotate(-90 70 70)"
                    style={{ filter: 'blur(4px)' }}
                />
            </svg>
            <Box sx={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
            }}>
                <Typography variant="h3" fontWeight={900} sx={{ lineHeight: 1, color: 'white', letterSpacing: -1 }}>
                    {score}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.5, fontSize: '0.62rem', fontWeight: 600 }}>
                    / 100
                </Typography>
            </Box>
        </Box>
    );
};

/* ── Score Bar Component ── */
const ScoreBar = ({ label, score, maxScore, gradient, delay = '0s' }) => (
    <Box sx={{ mb: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
            <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 500, fontSize: '0.85rem' }}>{label}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.3 }}>
                <Typography variant="body2" fontWeight={800} sx={{ fontSize: '1rem' }}>{score}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.4, fontSize: '0.7rem' }}>/ {maxScore}</Typography>
            </Box>
        </Box>
        <Box sx={{
            height: 8, bgcolor: alpha('#fff', 0.06), borderRadius: 4,
            overflow: 'hidden', position: 'relative',
        }}>
            <Box sx={{
                height: '100%', borderRadius: 4,
                background: gradient,
                width: `${(score / maxScore) * 100}%`,
                transition: `width 1.2s cubic-bezier(0.4,0,0.2,1) ${delay}`,
                boxShadow: `0 0 12px ${alpha('#fff', 0.1)}`,
            }} />
        </Box>
    </Box>
);

/* ── Section Card Wrapper ── */
const SectionCard = ({ children, delay = '0s', sx = {} }) => (
    <Paper elevation={0} sx={{
        borderRadius: 3.5, border: '1px solid', borderColor: alpha('#e2e8f0', 0.8),
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        animation: `fadeSlideIn 0.5s ease-out ${delay} both`,
        '&:hover': {
            borderColor: alpha('#00bcd4', 0.2),
            boxShadow: `0 8px 30px ${alpha('#0f172a', 0.06)}`,
        },
        ...sx,
    }}>
        {children}
    </Paper>
);

/* ── Section Header ── */
const SectionHeader = ({ icon, title, subtitle, rightSlot, color = '#00bcd4', gradient }) => (
    <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 3, py: 2.5,
        borderBottom: '1px solid', borderColor: alpha('#e2e8f0', 0.6),
        bgcolor: alpha('#f8fafc', 0.4),
    }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
                p: 1, borderRadius: 2.5,
                background: gradient || `linear-gradient(135deg, ${color}, ${alpha(color, 0.7)})`,
                color: 'white', display: 'flex',
                boxShadow: `0 4px 12px ${alpha(color, 0.25)}`,
            }}>
                {React.cloneElement(icon, { sx: { fontSize: 20 } })}
            </Box>
            <Box>
                <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2, color: '#0f172a', letterSpacing: -0.2 }}>
                    {title}
                </Typography>
                {subtitle && (
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>
        </Box>
        {rightSlot}
    </Box>
);

/* ── Particle Card ── */
const ParticleCard = ({ particle }) => {
    const { label, fullName, count, unit, color, gradient, icon, isAbnormal, normalMax } = particle;
    return (
        <Tooltip
            title={
                <Box sx={{ p: 0.5 }}>
                    <Typography variant="body2" fontWeight={700}>{fullName}</Typography>
                    <Typography variant="caption">
                        Count: {count}{unit} {isAbnormal ? `(Above normal: >${normalMax})` : '(Normal range)'}
                    </Typography>
                </Box>
            }
            arrow
            placement="top"
        >
            <Paper elevation={0} sx={{
                p: 2.5, textAlign: 'center', borderRadius: 3,
                border: '2px solid',
                borderColor: isAbnormal ? alpha(color, 0.3) : alpha('#e2e8f0', 0.8),
                bgcolor: isAbnormal ? alpha(color, 0.04) : '#fff',
                position: 'relative', overflow: 'hidden',
                transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                cursor: 'default',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${alpha(color, 0.18)}`,
                    borderColor: alpha(color, 0.4),
                },
            }}>
                {/* Top accent for abnormal */}
                {isAbnormal && (
                    <Box sx={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                        background: gradient,
                    }} />
                )}

                <Box sx={{
                    width: 44, height: 44, borderRadius: 2.5, mx: 'auto', mb: 1.2,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isAbnormal ? gradient : alpha('#94a3b8', 0.08),
                    color: isAbnormal ? 'white' : '#94a3b8',
                    transition: 'all 0.2s',
                    boxShadow: isAbnormal ? `0 4px 14px ${alpha(color, 0.3)}` : 'none',
                }}>
                    {React.cloneElement(icon, { sx: { fontSize: 22 } })}
                </Box>

                <Typography variant="h4" fontWeight={900} sx={{
                    color: isAbnormal ? color : '#0f172a',
                    mb: 0.3, lineHeight: 1, letterSpacing: -0.5,
                }}>
                    {count}
                </Typography>
                <Typography variant="caption" sx={{
                    fontWeight: 600, color: '#64748b', fontSize: '0.75rem',
                }}>
                    {label}
                    {unit && <span style={{ opacity: 0.5, marginLeft: 3 }}>{unit}</span>}
                </Typography>
                {isAbnormal && (
                    <Box sx={{ mt: 0.8 }}>
                        <Chip
                            icon={<TrendingUpIcon sx={{ fontSize: '12px !important' }} />}
                            label="High"
                            size="small"
                            sx={{
                                height: 20, fontSize: '0.6rem', fontWeight: 800,
                                bgcolor: alpha(color, 0.12), color: color,
                                '& .MuiChip-icon': { color: color, ml: 0.3 },
                            }}
                        />
                    </Box>
                )}
            </Paper>
        </Tooltip>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const AnalysisDetails = ({ report }) => {
    const analysis = report?.analysis || {};
    const diagnosisData = analysis?.diagnosis?.diagnoses || [];
    const particleData = analysis?.particles || {};
    const riskPrediction = report?.riskPrediction;

    // ── Risk scores
    const combinedRisk = riskPrediction?.derivedRisks?.combinedRisk || {};
    const baseDiagnosisScore = combinedRisk.baseDiagnosisScore ?? riskPrediction?.baseDiagnosisScore ?? 0;
    const questionnaireScore = combinedRisk.questionnaireScore ?? riskPrediction?.questionnaireScore ?? 0;
    const finalRiskScore = combinedRisk.score ?? 0;
    const riskLevel = combinedRisk.riskLevel || getRiskColor(finalRiskScore).label;
    const riskStyle = getRiskColor(finalRiskScore);
    const riskSource = riskPrediction?.riskSource || null;
    const isUTIML = riskSource === 'UTI_ML';

    // ── Diagnoses
    const sortedDiagnoses = [...diagnosisData].sort((a, b) => {
        const val = { 'High': 3, 'Moderate': 2, 'Low': 1 };
        return (val[b.probability] || 0) - (val[a.probability] || 0);
    });
    const nonNormalDiagnoses = sortedDiagnoses.filter(d => d.name !== 'Normal Urine Sediment');
    const mainDiagnoses = nonNormalDiagnoses.length > 0
        ? nonNormalDiagnoses.filter(d => d.probability === nonNormalDiagnoses[0].probability)
        : [];
    const otherDiagnoses = nonNormalDiagnoses.filter(d => !mainDiagnoses.find(m => m.name === d.name));

    // ── Particles
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

    // ── Image
    const imageUrl = report?.imageUrl ? `http://localhost:5000${report.imageUrl}` : null;
    const imgRef = useRef(null);
    const canvasRef = useRef(null);

    // ── Draw bounding boxes on microscopy image
    const drawBoxes = () => {
        const img = imgRef.current;
        const canvas = canvasRef.current;
        if (!img || !canvas || !img.naturalWidth || !img.naturalHeight) return;

        const displayWidth = img.offsetWidth;
        const displayHeight = img.offsetHeight;
        canvas.width = displayWidth;
        canvas.height = displayHeight;

        const ctx = canvas.getContext('2d');
        const scaleX = displayWidth / img.naturalWidth;
        const scaleY = displayHeight / img.naturalHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const colorByType = {
            wbc: '#9c27b0', rbc: '#f44336', crystals: '#2196f3',
            crystal: '#2196f3', casts: '#4caf50', cast: '#4caf50',
            bacteria: '#00bcd4', yeast: '#ff9800',
        };

        Object.entries(particleData).forEach(([key, data]) => {
            const boxes = Array.isArray(data?.boxes) ? data.boxes : [];
            if (boxes.length === 0) return;
            const color = colorByType[key] || '#ffffff';
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = key === 'rbc' ? 1 : 2;
            ctx.font = 'bold 11px Inter, Arial';

            boxes.forEach((box) => {
                if (!Array.isArray(box?.bbox) || box.bbox.length < 4) return;
                const [rawX1, rawY1, rawX2, rawY2] = box.bbox;
                const x1 = rawX1 * scaleX;
                const y1 = rawY1 * scaleY;
                const x2 = rawX2 * scaleX;
                const y2 = rawY2 * scaleY;
                ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
                const label = box?.subtype ? `${key}: ${box.subtype}` : key;
                ctx.fillText(label, x1, Math.max(10, y1 - 4));
            });
        });
    };

    useEffect(() => {
        drawBoxes();
        const onResize = () => drawBoxes();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [report, imageUrl]);

    // ── Questionnaire
    const questionnaireMap = report?.clinicalData?.raw || {};
    const answeredQuestions = Object.entries(questionnaireMap).filter(([, val]) => val !== '' && val !== null && val !== undefined);

    // ── Explanations
    const riskExplanation = riskPrediction?.riskExplanation || {};
    const causes = riskExplanation.causes || [];
    const supportingFactors = riskExplanation.supportingFactors || [];
    const patientSymptoms = riskExplanation.patientSymptoms || [];
    const hasExplanations = causes.length > 0 || supportingFactors.length > 0 || patientSymptoms.length > 0;

    // ── Chip color
    const probChipColor = (prob) => {
        if (prob === 'High') return { bg: alpha('#ef5350', 0.12), color: '#ef5350', gradient: 'linear-gradient(135deg, #ef5350, #c62828)' };
        if (prob === 'Moderate') return { bg: alpha('#ff9100', 0.12), color: '#e65100', gradient: 'linear-gradient(135deg, #ff9100, #e65100)' };
        return { bg: alpha('#66bb6a', 0.12), color: '#2e7d32', gradient: 'linear-gradient(135deg, #66bb6a, #43a047)' };
    };

    return (
        <Box sx={{ mt: 2 }}>
            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <Grid container spacing={3}>

                {/* ═══════════ RISK SCORE HERO ═══════════ */}
                <Grid item xs={12}>
                    <SectionCard delay="0s" sx={{ border: 'none' }}>
                        <Box sx={{
                            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)',
                            color: 'white', position: 'relative', overflow: 'hidden',
                        }}>
                            {/* Decorative elements */}
                            <Box sx={{
                                position: 'absolute', top: -60, right: -60, width: 220, height: 220,
                                borderRadius: '50%', bgcolor: alpha('#00bcd4', 0.04),
                            }} />
                            <Box sx={{
                                position: 'absolute', bottom: -40, left: -40, width: 150, height: 150,
                                borderRadius: '50%', bgcolor: alpha('#7c4dff', 0.04),
                            }} />
                            <Box sx={{
                                position: 'absolute', top: 20, left: '50%', width: 100, height: 100,
                                borderRadius: '50%', bgcolor: alpha(riskStyle.main, 0.03),
                            }} />

                            <Box sx={{ position: 'relative', zIndex: 1, px: { xs: 3, md: 5 }, py: 4 }}>
                                {/* Section title */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                    <SpeedIcon sx={{ fontSize: 18, color: '#26c6da', opacity: 0.8 }} />
                                    <Typography variant="overline" sx={{
                                        opacity: 0.5, letterSpacing: 2, fontSize: '0.65rem', fontWeight: 700,
                                    }}>
                                        RISK SCORE ANALYSIS
                                    </Typography>
                                </Box>

                                <Grid container spacing={4} alignItems="center">
                                    {/* Gauge */}
                                    <Grid item xs={12} md={3}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <RiskGauge score={finalRiskScore} riskStyle={riskStyle} riskLevel={riskLevel} />
                                            <Chip
                                                icon={finalRiskScore >= 50
                                                    ? <WarningAmberIcon sx={{ fontSize: '14px !important', color: `${riskStyle.main} !important` }} />
                                                    : <CheckCircleIcon sx={{ fontSize: '14px !important', color: `${riskStyle.main} !important` }} />
                                                }
                                                label={`${riskLevel} Risk`}
                                                size="small"
                                                sx={{
                                                    mt: 2, fontWeight: 800, fontSize: '0.75rem',
                                                    bgcolor: alpha(riskStyle.main, 0.15), color: riskStyle.main,
                                                    border: '1px solid', borderColor: alpha(riskStyle.main, 0.3),
                                                    letterSpacing: 0.3,
                                                }}
                                            />
                                        </Box>
                                    </Grid>

                                    {/* Score Breakdown */}
                                    <Grid item xs={12} md={9}>
                                        <Box sx={{
                                            p: 3, borderRadius: 3,
                                            bgcolor: alpha('#fff', 0.03),
                                            border: '1px solid', borderColor: alpha('#fff', 0.06),
                                        }}>
                                            {isUTIML ? (
                                                /* ─── UTI ML PATHWAY ─── */
                                                <>
                                                    {/* ML Confidence Score — the unified score produced by the infection model */}
                                                    <ScoreBar
                                                        label="ML Confidence Score"
                                                        score={finalRiskScore}
                                                        maxScore={100}
                                                        gradient="linear-gradient(90deg, #9c27b0, #ce93d8)"
                                                        delay="0.3s"
                                                    />

                                                    {/* Image-based Diagnosis component */}
                                                    <Box sx={{ mb: 2.5 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                                                            <Typography variant="body2" sx={{ opacity: 0.65, fontWeight: 500, fontSize: '0.82rem' }}>
                                                                Image Diagnosis Contribution
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.3 }}>
                                                                <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.9rem', opacity: 0.7 }}>
                                                                    {baseDiagnosisScore}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ opacity: 0.3, fontSize: '0.7rem' }}>/ 75</Typography>
                                                            </Box>
                                                        </Box>
                                                        <Box sx={{
                                                            height: 5, bgcolor: alpha('#fff', 0.04), borderRadius: 4,
                                                            overflow: 'hidden',
                                                        }}>
                                                            <Box sx={{
                                                                height: '100%', borderRadius: 4,
                                                                background: 'linear-gradient(90deg, #00bcd4, #26c6da)',
                                                                width: `${(baseDiagnosisScore / 75) * 100}%`,
                                                                opacity: 0.6,
                                                            }} />
                                                        </Box>
                                                    </Box>

                                                    <Chip
                                                        icon={<AutoAwesomeIcon sx={{ fontSize: '13px !important', color: '#ce93d8 !important' }} />}
                                                        label="🧠 AI Infection Model Used"
                                                        size="small"
                                                        sx={{
                                                            mb: 1.5, fontWeight: 700, fontSize: '0.68rem',
                                                            bgcolor: alpha('#9c27b0', 0.12), color: '#ce93d8',
                                                            border: '1px solid', borderColor: alpha('#9c27b0', 0.25),
                                                            letterSpacing: 0.3,
                                                        }}
                                                    />
                                                </>
                                            ) : (
                                                /* ─── RULE ENGINE PATHWAY ─── */
                                                <>
                                                    <ScoreBar
                                                        label="AI Diagnosis Score"
                                                        score={baseDiagnosisScore}
                                                        maxScore={75}
                                                        gradient="linear-gradient(90deg, #00bcd4, #26c6da)"
                                                        delay="0.3s"
                                                    />
                                                    <ScoreBar
                                                        label="Questionnaire Score"
                                                        score={questionnaireScore}
                                                        maxScore={25}
                                                        gradient="linear-gradient(90deg, #66bb6a, #81c784)"
                                                        delay="0.5s"
                                                    />
                                                </>
                                            )}

                                            <Divider sx={{ borderColor: alpha('#fff', 0.08), my: 1.5 }} />

                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="body2" fontWeight={700} sx={{ opacity: 0.9 }}>
                                                        {isUTIML ? 'Final Risk Score' : 'Combined Final Score'}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="h5" fontWeight={900} sx={{ color: riskStyle.main }}>
                                                    {finalRiskScore}<span style={{ fontSize: '0.6em', opacity: 0.5 }}> / 100</span>
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                mt: 1, height: 12, bgcolor: alpha('#fff', 0.06),
                                                borderRadius: 6, overflow: 'hidden',
                                            }}>
                                                <Box sx={{
                                                    height: '100%', borderRadius: 6,
                                                    background: riskStyle.gradient,
                                                    width: `${finalRiskScore}%`,
                                                    transition: 'width 1.5s cubic-bezier(0.4,0,0.2,1) 0.7s',
                                                    boxShadow: `0 0 16px ${alpha(riskStyle.main, 0.4)}`,
                                                }} />
                                            </Box>

                                            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.4 }}>
                                                <InfoOutlinedIcon sx={{ fontSize: 13 }} />
                                                <Typography variant="caption" sx={{ fontSize: '0.66rem' }}>
                                                    {isUTIML
                                                        ? 'Score computed by the AI Infection (UTI) ML model using clinical data + questionnaire answers'
                                                        : 'Final Risk = Diagnosis Score (max 75) + Questionnaire Score (max 25)'
                                                    }
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Box>
                    </SectionCard>
                </Grid>

                {/* ═══════════ AI DIAGNOSES ═══════════ */}
                <Grid item xs={12} md={6}>
                    <SectionCard delay="0.1s" sx={{ height: '100%' }}>
                        <SectionHeader
                            icon={<SearchIcon />}
                            title="AI Diagnoses"
                            subtitle="Identified from urine microscopy analysis"
                            gradient="linear-gradient(135deg, #2196f3, #1565c0)"
                            color="#2196f3"
                        />
                        <Box sx={{ p: 3 }}>
                            {mainDiagnoses.length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    {mainDiagnoses.map((d, i) => {
                                        const chipStyle = probChipColor(d.probability);
                                        return (
                                            <Paper key={i} elevation={0} sx={{
                                                p: 2.5, borderRadius: 3,
                                                border: '2px solid', borderColor: alpha(chipStyle.color, 0.15),
                                                bgcolor: alpha(chipStyle.color, 0.03),
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    borderColor: alpha(chipStyle.color, 0.3),
                                                    bgcolor: alpha(chipStyle.color, 0.05),
                                                },
                                            }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Box sx={{
                                                        p: 0.8, borderRadius: 2,
                                                        background: chipStyle.gradient,
                                                        color: 'white', display: 'flex',
                                                    }}>
                                                        <FlagIcon sx={{ fontSize: 16 }} />
                                                    </Box>
                                                    <Typography variant="body1" fontWeight={700} sx={{ color: '#0f172a' }}>
                                                        {d.name}
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    label={d.probability}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 800, fontSize: '0.7rem',
                                                        bgcolor: chipStyle.bg, color: chipStyle.color,
                                                        border: '1px solid', borderColor: alpha(chipStyle.color, 0.2),
                                                    }}
                                                />
                                            </Paper>
                                        );
                                    })}
                                </Box>
                            ) : (
                                <Paper elevation={0} sx={{
                                    p: 4, textAlign: 'center', borderRadius: 3,
                                    bgcolor: alpha('#66bb6a', 0.04),
                                    border: '2px solid', borderColor: alpha('#66bb6a', 0.12),
                                }}>
                                    <Box sx={{
                                        width: 56, height: 56, borderRadius: '50%', mx: 'auto', mb: 1.5,
                                        bgcolor: alpha('#66bb6a', 0.1),
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <CheckCircleOutlineIcon sx={{ color: '#66bb6a', fontSize: 30 }} />
                                    </Box>
                                    <Typography variant="body1" fontWeight={700} color="text.secondary">
                                        Normal Urine Sediment
                                    </Typography>
                                    <Typography variant="caption" color="text.disabled">
                                        No significant abnormalities detected
                                    </Typography>
                                </Paper>
                            )}

                            {otherDiagnoses.length > 0 && (
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{
                                        textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.65rem',
                                    }}>
                                        Other Possible Diagnoses
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                        {otherDiagnoses.map((d, i) => {
                                            const chipStyle = probChipColor(d.probability);
                                            return (
                                                <Chip key={i} label={`${d.name} (${d.probability})`} size="small"
                                                    sx={{
                                                        fontWeight: 600, fontSize: '0.7rem',
                                                        bgcolor: chipStyle.bg, color: chipStyle.color,
                                                        border: '1px solid', borderColor: alpha(chipStyle.color, 0.15),
                                                    }}
                                                />
                                            );
                                        })}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </SectionCard>
                </Grid>

                {/* ═══════════ RISK FACTORS ═══════════ */}
                <Grid item xs={12} md={6}>
                    <SectionCard delay="0.15s" sx={{ height: '100%' }}>
                        <SectionHeader
                            icon={<HealthAndSafetyIcon />}
                            title="Risk Factors Detected"
                            subtitle="Contributing factors to clinical risk"
                            gradient="linear-gradient(135deg, #ef5350, #c62828)"
                            color="#ef5350"
                        />
                        <Box sx={{ p: 3 }}>
                            {hasExplanations ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    {/* Primary Causes */}
                                    {causes.length > 0 && (
                                        <Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                                                <Box sx={{
                                                    p: 0.5, borderRadius: 1.5,
                                                    bgcolor: alpha('#ef5350', 0.1),
                                                    color: '#ef5350', display: 'flex',
                                                }}>
                                                    <WarningAmberIcon sx={{ fontSize: 16 }} />
                                                </Box>
                                                <Typography variant="caption" fontWeight={800} sx={{
                                                    color: '#ef5350', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.65rem',
                                                }}>
                                                    Primary Causes
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                {causes.map((c, i) => (
                                                    <Box key={i} sx={{
                                                        display: 'flex', alignItems: 'flex-start', gap: 1.2,
                                                        p: 1.5, borderRadius: 2,
                                                        bgcolor: alpha('#ef5350', 0.03),
                                                        border: '1px solid', borderColor: alpha('#ef5350', 0.08),
                                                    }}>
                                                        <Box sx={{
                                                            width: 8, height: 8, borderRadius: '50%',
                                                            bgcolor: '#ef5350', mt: 0.7, flexShrink: 0,
                                                        }} />
                                                        <Typography variant="body2" sx={{ lineHeight: 1.5 }}>{c}</Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Supporting Evidence */}
                                    {supportingFactors.length > 0 && (
                                        <Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                                                <Box sx={{
                                                    p: 0.5, borderRadius: 1.5,
                                                    bgcolor: alpha('#ff9100', 0.1),
                                                    color: '#ff9100', display: 'flex',
                                                }}>
                                                    <BiotechIcon sx={{ fontSize: 16 }} />
                                                </Box>
                                                <Typography variant="caption" fontWeight={800} sx={{
                                                    color: '#e65100', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.65rem',
                                                }}>
                                                    Supporting Evidence
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                                                {supportingFactors.map((s, i) => (
                                                    <Chip key={i} label={s} size="small" variant="outlined"
                                                        sx={{
                                                            fontWeight: 600, fontSize: '0.72rem',
                                                            borderColor: alpha('#ff9100', 0.3), color: '#e65100',
                                                            borderRadius: 2.5,
                                                            '&:hover': { bgcolor: alpha('#ff9100', 0.05) },
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Patient Symptoms */}
                                    {patientSymptoms.length > 0 && (
                                        <Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                                                <Box sx={{
                                                    p: 0.5, borderRadius: 1.5,
                                                    bgcolor: alpha('#7c4dff', 0.1),
                                                    color: '#7c4dff', display: 'flex',
                                                }}>
                                                    <LocalHospitalIcon sx={{ fontSize: 16 }} />
                                                </Box>
                                                <Typography variant="caption" fontWeight={800} sx={{
                                                    color: '#7c4dff', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.65rem',
                                                }}>
                                                    Patient-Reported Symptoms
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                                                {patientSymptoms.map((s, i) => (
                                                    <Chip key={i} label={s} size="small"
                                                        sx={{
                                                            fontWeight: 600, fontSize: '0.72rem',
                                                            bgcolor: alpha('#7c4dff', 0.08), color: '#7c4dff',
                                                            borderRadius: 2.5,
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            ) : (
                                <Box sx={{ py: 5, textAlign: 'center' }}>
                                    <Box sx={{
                                        width: 56, height: 56, borderRadius: '50%', mx: 'auto', mb: 1.5,
                                        bgcolor: alpha('#94a3b8', 0.08),
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <CheckCircleOutlineIcon sx={{ fontSize: 30, color: '#94a3b8' }} />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                        No significant risk factors detected
                                    </Typography>
                                    <Typography variant="caption" color="text.disabled">
                                        Complete the questionnaire for a detailed risk breakdown
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </SectionCard>
                </Grid>

                {/* ═══════════ DETECTED PARTICLES ═══════════ */}
                <Grid item xs={12} md={7}>
                    <SectionCard delay="0.2s" sx={{ height: '100%' }}>
                        <SectionHeader
                            icon={<BiotechIcon />}
                            title="Detected Urine Particles"
                            subtitle={`${totalObjects} total objects detected across all types`}
                            gradient="linear-gradient(135deg, #00bcd4, #0097a7)"
                            color="#00bcd4"
                            rightSlot={
                                abnormalCount > 0 && (
                                    <Chip
                                        icon={<WarningAmberIcon sx={{ fontSize: '14px !important' }} />}
                                        label={`${abnormalCount} abnormal`}
                                        size="small"
                                        sx={{
                                            fontWeight: 700, fontSize: '0.7rem',
                                            bgcolor: alpha('#ef5350', 0.1), color: '#ef5350',
                                            border: '1px solid', borderColor: alpha('#ef5350', 0.2),
                                            '& .MuiChip-icon': { color: '#ef5350' },
                                        }}
                                    />
                                )
                            }
                        />
                        <Box sx={{ p: 3 }}>
                            <Grid container spacing={2}>
                                {particlesList.map((p) => (
                                    <Grid item xs={6} sm={4} key={p.key}>
                                        <ParticleCard particle={p} />
                                    </Grid>
                                ))}
                            </Grid>

                            {/* RBC Subtypes */}
                            {particleData.rbc?.subtype_summary && (
                                <Paper elevation={0} sx={{
                                    mt: 2.5, p: 2.5, borderRadius: 3,
                                    bgcolor: alpha('#ef5350', 0.03),
                                    border: '2px solid', borderColor: alpha('#ef5350', 0.1),
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                                        <BloodtypeIcon sx={{ fontSize: 16, color: '#ef5350' }} />
                                        <Typography variant="caption" fontWeight={800} sx={{
                                            color: '#ef5350', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.65rem',
                                        }}>
                                            RBC Morphology Subtypes
                                        </Typography>
                                    </Box>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Box sx={{
                                                display: 'flex', alignItems: 'center', gap: 1.2,
                                                p: 1.5, borderRadius: 2, bgcolor: alpha('#ef5350', 0.04),
                                            }}>
                                                <Box sx={{
                                                    width: 10, height: 10, borderRadius: '50%',
                                                    bgcolor: '#ef5350', flexShrink: 0,
                                                }} />
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                                        Dysmorphic
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight={800}>
                                                        {particleData.rbc.subtype_summary.dysmorphic || 0}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Box sx={{
                                                display: 'flex', alignItems: 'center', gap: 1.2,
                                                p: 1.5, borderRadius: 2, bgcolor: alpha('#ff7043', 0.04),
                                            }}>
                                                <Box sx={{
                                                    width: 10, height: 10, borderRadius: '50%',
                                                    bgcolor: '#ff7043', flexShrink: 0,
                                                }} />
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                                        Isomorphic
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight={800}>
                                                        {particleData.rbc.subtype_summary.isomorphic || 0}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            )}
                        </Box>
                    </SectionCard>
                </Grid>

                {/* ═══════════ MICROSCOPY IMAGE ═══════════ */}
                <Grid item xs={12} md={5}>
                    <SectionCard delay="0.25s" sx={{ height: '100%' }}>
                        <SectionHeader
                            icon={<CameraAltIcon />}
                            title="Microscopy Detection"
                            subtitle="AI-annotated microscopy image with bounding boxes"
                            gradient="linear-gradient(135deg, #7c4dff, #651fff)"
                            color="#7c4dff"
                        />
                        <Box sx={{ p: 3 }}>
                            {imageUrl ? (
                                <Box sx={{ mb: 2 }}>
                                    <Box sx={{
                                        borderRadius: 3, overflow: 'hidden', bgcolor: '#0a0a0a',
                                        border: '2px solid', borderColor: alpha('#7c4dff', 0.15),
                                        position: 'relative', display: 'inline-block', width: '100%',
                                    }}>
                                        <img
                                            ref={imgRef}
                                            src={imageUrl}
                                            alt="Microscopy"
                                            onLoad={drawBoxes}
                                            style={{
                                                width: '100%', maxHeight: 320,
                                                objectFit: 'contain', display: 'block',
                                            }}
                                        />
                                        <canvas
                                            ref={canvasRef}
                                            style={{
                                                position: 'absolute', top: 0, left: 0,
                                                pointerEvents: 'none',
                                            }}
                                        />
                                    </Box>
                                </Box>
                            ) : (
                                <Box sx={{
                                    py: 6, textAlign: 'center', borderRadius: 3,
                                    bgcolor: alpha('#f8fafc', 0.5),
                                    border: '2px dashed', borderColor: alpha('#94a3b8', 0.2),
                                }}>
                                    <CameraAltIcon sx={{ fontSize: 44, color: '#cbd5e1', mb: 1 }} />
                                    <Typography variant="body2" color="text.disabled" fontWeight={500}>
                                        No microscopy image available
                                    </Typography>
                                </Box>
                            )}

                            {/* Detection Legend */}
                            <Box sx={{
                                p: 2, borderRadius: 2.5,
                                bgcolor: alpha('#f8fafc', 0.6),
                                border: '1px solid', borderColor: alpha('#e2e8f0', 0.8),
                            }}>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2, mb: 1.5 }}>
                                    {[
                                        { label: 'WBC', color: '#9c27b0' },
                                        { label: 'RBC', color: '#f44336' },
                                        { label: 'Crystal', color: '#2196f3' },
                                        { label: 'Cast', color: '#4caf50' },
                                        { label: 'Bacteria', color: '#00bcd4' },
                                        { label: 'Yeast', color: '#ff9800' },
                                    ].map((item) => (
                                        <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Box sx={{
                                                width: 10, height: 10, borderRadius: 1.5,
                                                bgcolor: item.color,
                                                boxShadow: `0 2px 6px ${alpha(item.color, 0.3)}`,
                                            }} />
                                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.7rem' }}>
                                                {item.label}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                                <Divider sx={{ mb: 1.5 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="caption" fontWeight={600} sx={{ color: '#64748b' }}>
                                        Total Objects Detected
                                    </Typography>
                                    <Chip
                                        label={`${totalObjects} objects`}
                                        size="small"
                                        sx={{
                                            fontWeight: 800, fontSize: '0.72rem',
                                            bgcolor: alpha('#7c4dff', 0.08), color: '#7c4dff',
                                            border: '1px solid', borderColor: alpha('#7c4dff', 0.15),
                                        }}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </SectionCard>
                </Grid>

                {/* ═══════════ QUESTIONNAIRE RESPONSES ═══════════ */}
                {answeredQuestions.length > 0 && (
                    <Grid item xs={12}>
                        <SectionCard delay="0.3s">
                            <SectionHeader
                                icon={<AssignmentIcon />}
                                title="Patient Questionnaire Responses"
                                subtitle={`${answeredQuestions.length} questions answered`}
                                gradient="linear-gradient(135deg, #ff9100, #e65100)"
                                color="#ff9100"
                                rightSlot={
                                    <Chip
                                        icon={<VerifiedIcon sx={{ fontSize: '14px !important' }} />}
                                        label="Patient Verified"
                                        size="small"
                                        sx={{
                                            fontWeight: 700, fontSize: '0.68rem',
                                            bgcolor: alpha('#66bb6a', 0.08), color: '#43a047',
                                            border: '1px solid', borderColor: alpha('#66bb6a', 0.2),
                                            '& .MuiChip-icon': { color: '#43a047' },
                                        }}
                                    />
                                }
                            />
                            <Box sx={{ p: 3 }}>
                                {Object.entries(QUESTION_CATEGORIES).map(([category, keys]) => {
                                    const categoryAnswers = answeredQuestions.filter(([key]) => keys.includes(key));
                                    if (categoryAnswers.length === 0) return null;

                                    return (
                                        <Box key={category} sx={{ mb: 3, '&:last-child': { mb: 0 } }}>
                                            <Typography variant="caption" fontWeight={800} sx={{
                                                textTransform: 'uppercase', letterSpacing: 1.5,
                                                color: '#94a3b8', fontSize: '0.62rem', mb: 1.5, display: 'block',
                                            }}>
                                                {category}
                                            </Typography>
                                            <Grid container spacing={1.5}>
                                                {categoryAnswers.map(([key, val]) => {
                                                    const label = QUESTION_LABELS[key] || key.toUpperCase();
                                                    const isPositive = val === 'Yes';
                                                    const isNegative = val === 'No';
                                                    return (
                                                        <Grid item xs={12} sm={6} md={4} key={key}>
                                                            <Paper elevation={0} sx={{
                                                                p: 2, borderRadius: 2.5,
                                                                border: '1.5px solid',
                                                                borderColor: isPositive ? alpha('#ef5350', 0.2) : alpha('#e2e8f0', 0.8),
                                                                bgcolor: isPositive ? alpha('#ef5350', 0.02) : '#fff',
                                                                display: 'flex', justifyContent: 'space-between',
                                                                alignItems: 'center', gap: 1,
                                                                transition: 'all 0.2s',
                                                                '&:hover': {
                                                                    borderColor: isPositive ? alpha('#ef5350', 0.35) : alpha('#00bcd4', 0.2),
                                                                    boxShadow: `0 2px 8px ${alpha('#0f172a', 0.04)}`,
                                                                },
                                                            }}>
                                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                    <Typography variant="body2" fontWeight={600} sx={{
                                                                        lineHeight: 1.3, color: '#334155',
                                                                        fontSize: '0.82rem',
                                                                    }} noWrap title={label}>
                                                                        {label}
                                                                    </Typography>
                                                                </Box>
                                                                <Chip
                                                                    label={val || 'N/A'}
                                                                    size="small"
                                                                    sx={{
                                                                        ml: 0.5, fontWeight: 800, fontSize: '0.7rem',
                                                                        minWidth: 50, borderRadius: 2,
                                                                        bgcolor: isPositive
                                                                            ? alpha('#ef5350', 0.1)
                                                                            : isNegative
                                                                                ? alpha('#66bb6a', 0.08)
                                                                                : alpha('#64748b', 0.08),
                                                                        color: isPositive
                                                                            ? '#ef5350'
                                                                            : isNegative
                                                                                ? '#2e7d32'
                                                                                : '#64748b',
                                                                    }}
                                                                />
                                                            </Paper>
                                                        </Grid>
                                                    );
                                                })}
                                            </Grid>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </SectionCard>
                    </Grid>
                )}

            </Grid>
        </Box>
    );
};

export default AnalysisDetails;
