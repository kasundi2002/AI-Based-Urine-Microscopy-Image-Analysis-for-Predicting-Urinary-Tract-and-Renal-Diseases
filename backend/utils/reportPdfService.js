const PDF_PAGE_WIDTH = 595;
const PDF_PAGE_HEIGHT = 842;
const MAX_CHARS = 96;
const MARGIN_LEFT = 42;
const MARGIN_RIGHT = 42;
const HEADER_HEIGHT = 72;
const FOOTER_HEIGHT = 50;
const CONTENT_TOP = PDF_PAGE_HEIGHT - HEADER_HEIGHT - 18;
const CONTENT_BOTTOM = FOOTER_HEIGHT + 14;
const LINE_HEIGHT = 14;

// ─── Header/Footer colors ───────────────────────────────────────────────────
const HEADER_BG = { r: 0.059, g: 0.09, b: 0.165 };    // #0f172a
const HEADER_ACCENT = { r: 0, g: 0.737, b: 0.831 };    // #00bcd4
const FOOTER_BG = { r: 0.973, g: 0.98, b: 0.988 };     // #f8fafc
const TEXT_WHITE = { r: 1, g: 1, b: 1 };
const TEXT_DARK = { r: 0.2, g: 0.259, b: 0.341 };       // #334157
const TEXT_MUTED = { r: 0.58, g: 0.639, b: 0.722 };     // #94a3b8

const toAscii = (value) => {
    if (value === null || value === undefined) return '';
    return String(value).replace(/[^\x20-\x7E]/g, '');
};

const escapePdfText = (value) => {
    return toAscii(value)
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)');
};

const formatDateTime = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const wrapText = (text, maxChars = MAX_CHARS) => {
    const input = toAscii(text).trim();
    if (!input) return [''];
    const words = input.split(/\s+/);
    const lines = [];
    let current = '';

    words.forEach((word) => {
        const candidate = `${current} ${word}`.trim();
        if (candidate.length <= maxChars) {
            current = candidate;
        } else {
            if (current) lines.push(current);
            current = word;
        }
    });

    if (current) lines.push(current);
    return lines;
};

const pushWrapped = (lines, text, maxChars = MAX_CHARS) => {
    wrapText(text, maxChars).forEach((line) => lines.push(line));
};

const normalizeText = (value, fallback = 'N/A') => {
    if (value === undefined || value === null || value === '') return fallback;
    return String(value);
};

const isNilLike = (value) => {
    const normalized = String(value || '').trim().toLowerCase();
    return normalized === '' || normalized === 'nil' || normalized === 'negative' || normalized === 'none' || normalized === 'normal' || normalized === 'n/a';
};

// ─── Collect particle counts from report analysis ───────────────────────────
const collectParticleCounts = (report) => {
    const particles = report?.analysis?.particles || {};

    const getCount = (data) => {
        if (!data || typeof data !== 'object') return 0;
        if (Number.isFinite(Number(data.total_count))) return Number(data.total_count);
        if (Number.isFinite(Number(data.count))) return Number(data.count);
        if (Array.isArray(data.boxes)) return data.boxes.length;
        return 0;
    };

    return {
        wbc: getCount(particles.wbc),
        rbc: getCount(particles.rbc),
        crystals: getCount(particles.crystal || particles.crystals),
        casts: getCount(particles.cast || particles.casts),
        bacteria: getCount(particles.bacteria),
        yeast: getCount(particles.yeast),
    };
};

// ─── Collect diagnoses from report ──────────────────────────────────────────
const collectDiagnoses = (report) => {
    const diagnoses = report?.analysis?.diagnosis?.diagnoses || [];
    return diagnoses.map(d => ({
        name: d.name || 'Unknown',
        probability: d.probability || 'N/A',
    }));
};

const getChemicalRows = (chemicalParameters = {}) => {
    const chem = chemicalParameters || {};
    const rows = [
        {
            parameter: 'Colour',
            result: normalizeText(chem.colour),
            reference: 'Pale yellow to amber',
            status: 'Info'
        },
        {
            parameter: 'Appearance',
            result: normalizeText(chem.appearance),
            reference: 'Clear',
            status: ['clear', 'slightly clear', 'clear-ish'].includes(String(chem.appearance || '').toLowerCase()) ? 'Normal' : 'Review'
        },
        {
            parameter: 'Specific Gravity',
            result: normalizeText(chem.specificGravity),
            reference: '1.005 - 1.030',
            status: 'Info'
        },
        {
            parameter: 'pH',
            result: normalizeText(chem.pH),
            reference: '5.0 - 8.0',
            status: 'Info'
        },
        {
            parameter: 'Protein',
            result: normalizeText(chem.protein),
            reference: 'Negative / Nil',
            status: isNilLike(chem.protein) ? 'Normal' : 'Abnormal'
        },
        {
            parameter: 'Glucose',
            result: normalizeText(chem.glucose),
            reference: 'Negative / Nil',
            status: isNilLike(chem.glucose) ? 'Normal' : 'Abnormal'
        },
        {
            parameter: 'Ketone Bodies',
            result: normalizeText(chem.ketoneBodies),
            reference: 'Negative / Nil',
            status: isNilLike(chem.ketoneBodies) ? 'Normal' : 'Abnormal'
        },
        {
            parameter: 'Bilirubin',
            result: normalizeText(chem.bilirubin),
            reference: 'Negative / Nil',
            status: isNilLike(chem.bilirubin) ? 'Normal' : 'Abnormal'
        },
        {
            parameter: 'Nitrite',
            result: normalizeText(chem.nitrite),
            reference: 'Negative',
            status: String(chem.nitrite || '').toLowerCase() === 'positive' ? 'Abnormal' : 'Normal'
        },
        {
            parameter: 'Urobilinogen',
            result: normalizeText(chem.urobilinogen),
            reference: 'Normal trace',
            status: String(chem.urobilinogen || '').toLowerCase() === 'elevated' ? 'Abnormal' : 'Normal'
        },
        {
            parameter: 'Blood (Occult)',
            result: normalizeText(chem.blood),
            reference: 'Negative / Nil',
            status: isNilLike(chem.blood) ? 'Normal' : 'Abnormal'
        }
    ];
    return rows;
};

const buildTabularLine = (c1, c2, c3, c4) => {
    const col1 = toAscii(c1).slice(0, 28).padEnd(28, ' ');
    const col2 = toAscii(c2).slice(0, 20).padEnd(20, ' ');
    const col3 = toAscii(c3).slice(0, 26).padEnd(26, ' ');
    const col4 = toAscii(c4).slice(0, 10).padEnd(10, ' ');
    return `${col1} ${col2} ${col3} ${col4}`.slice(0, MAX_CHARS);
};

// ─── Graphics for header ────────────────────────────────────────────────────
const buildHeaderGraphics = () => {
    const cmds = [];

    // Dark background rectangle
    cmds.push(`${HEADER_BG.r} ${HEADER_BG.g} ${HEADER_BG.b} rg`);
    cmds.push(`0 ${PDF_PAGE_HEIGHT - HEADER_HEIGHT} ${PDF_PAGE_WIDTH} ${HEADER_HEIGHT} re f`);

    // Accent line at the bottom of header
    cmds.push(`${HEADER_ACCENT.r} ${HEADER_ACCENT.g} ${HEADER_ACCENT.b} rg`);
    cmds.push(`0 ${PDF_PAGE_HEIGHT - HEADER_HEIGHT} ${PDF_PAGE_WIDTH} 3 re f`);

    // Small accent square icon (left)
    cmds.push(`${HEADER_ACCENT.r} ${HEADER_ACCENT.g} ${HEADER_ACCENT.b} rg`);
    cmds.push(`${MARGIN_LEFT} ${PDF_PAGE_HEIGHT - HEADER_HEIGHT + 20} 28 28 re f`);

    return cmds.join('\n');
};

// ─── Graphics for footer ────────────────────────────────────────────────────
const buildFooterGraphics = (pageNum, totalPages) => {
    const cmds = [];

    // Light background rectangle
    cmds.push(`${FOOTER_BG.r} ${FOOTER_BG.g} ${FOOTER_BG.b} rg`);
    cmds.push(`0 0 ${PDF_PAGE_WIDTH} ${FOOTER_HEIGHT} re f`);

    // Top accent line
    cmds.push(`${HEADER_ACCENT.r} ${HEADER_ACCENT.g} ${HEADER_ACCENT.b} rg`);
    cmds.push(`0 ${FOOTER_HEIGHT} ${PDF_PAGE_WIDTH} 2 re f`);

    return cmds.join('\n');
};

// ─── Build header text ──────────────────────────────────────────────────────
const buildHeaderText = () => {
    const cmds = [];
    cmds.push('BT');
    // Title (white, bold simulated by using Helvetica-Bold)
    cmds.push('/F2 16 Tf');
    cmds.push(`${TEXT_WHITE.r} ${TEXT_WHITE.g} ${TEXT_WHITE.b} rg`);
    cmds.push(`${MARGIN_LEFT + 36} ${PDF_PAGE_HEIGHT - 35} Td`);
    cmds.push(`(${escapePdfText('UroAI Diagnostics')}) Tj`);
    // Subtitle
    cmds.push('/F1 9 Tf');
    cmds.push(`${HEADER_ACCENT.r} ${HEADER_ACCENT.g} ${HEADER_ACCENT.b} rg`);
    cmds.push(`0 -16 Td`);
    cmds.push(`(${escapePdfText('AI-Assisted Urine Full Report')}) Tj`);
    // Right side: Laboratory label
    cmds.push('/F1 8 Tf');
    cmds.push(`${TEXT_WHITE.r} ${TEXT_WHITE.g} ${TEXT_WHITE.b} rg`);
    const rightX = PDF_PAGE_WIDTH - MARGIN_RIGHT - 180;
    cmds.push(`${rightX - MARGIN_LEFT - 36} 16 Td`);
    cmds.push(`(${escapePdfText('Microscopy & Chemical Examination')}) Tj`);
    cmds.push('ET');
    return cmds.join('\n');
};

// ─── Build footer text ──────────────────────────────────────────────────────
const buildFooterText = (pageNum, totalPages) => {
    const cmds = [];
    cmds.push('BT');
    // Confidential label
    cmds.push('/F1 7 Tf');
    cmds.push(`${TEXT_MUTED.r} ${TEXT_MUTED.g} ${TEXT_MUTED.b} rg`);
    cmds.push(`${MARGIN_LEFT} 28 Td`);
    cmds.push(`(${escapePdfText('Confidential Medical Information - UroAI Diagnostics Platform')}) Tj`);
    // Disclaimer
    cmds.push(`0 -12 Td`);
    cmds.push(`(${escapePdfText('This report is for clinical support. Final diagnosis must be made by a qualified healthcare professional.')}) Tj`);
    // Page number
    cmds.push('/F2 8 Tf');
    cmds.push(`${TEXT_DARK.r} ${TEXT_DARK.g} ${TEXT_DARK.b} rg`);
    const pageText = `Page ${pageNum} of ${totalPages}`;
    // Approximate right alignment
    const pageNumX = PDF_PAGE_WIDTH - MARGIN_RIGHT - (pageText.length * 5);
    cmds.push(`${pageNumX - MARGIN_LEFT} 12 Td`);
    cmds.push(`(${escapePdfText(pageText)}) Tj`);
    cmds.push('ET');
    return cmds.join('\n');
};

// ─── Paginate content lines ─────────────────────────────────────────────────
const createPagedLines = (allLines) => {
    const usableHeight = CONTENT_TOP - CONTENT_BOTTOM;
    const maxLinesPerPage = Math.floor(usableHeight / LINE_HEIGHT);
    const pages = [];
    let current = [];

    allLines.forEach((line) => {
        if (current.length >= maxLinesPerPage) {
            pages.push(current);
            current = [];
        }
        current.push(line);
    });

    if (current.length > 0) pages.push(current);
    return pages;
};

// ─── Build content stream for a page (with header + footer graphics) ────────
const buildContentStreamForPage = (lines, pageNum, totalPages) => {
    const parts = [];

    // Save graphics state
    parts.push('q');

    // Header graphics
    parts.push(buildHeaderGraphics());

    // Footer graphics
    parts.push(buildFooterGraphics(pageNum, totalPages));

    // Restore graphics state
    parts.push('Q');

    // Header text
    parts.push(buildHeaderText());

    // Footer text
    parts.push(buildFooterText(pageNum, totalPages));

    // Main body text
    const startX = MARGIN_LEFT;
    const startY = CONTENT_TOP;

    const bodyLines = [
        'BT',
        '/F1 10 Tf',
        `${TEXT_DARK.r} ${TEXT_DARK.g} ${TEXT_DARK.b} rg`,
        `${startX} ${startY} Td`,
        `${LINE_HEIGHT} TL`
    ];

    lines.forEach((line, index) => {
        const safe = escapePdfText(line);
        if (index === 0) {
            bodyLines.push(`(${safe}) Tj`);
        } else {
            bodyLines.push('T*');
            bodyLines.push(`(${safe}) Tj`);
        }
    });

    bodyLines.push('ET');
    parts.push(bodyLines.join('\n'));

    return parts.join('\n');
};

// ─── Build multi-page PDF with fonts ────────────────────────────────────────
const buildPdf = (pages) => {
    const objects = [];
    const totalPages = pages.length;

    // 1 Catalog, 2 Pages root
    objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

    const pageObjectIds = [];
    // After page + content pairs: fontObj1 (Courier), fontObj2 (Helvetica-Bold)
    const fontObjectId1 = 3 + totalPages * 2;
    const fontObjectId2 = fontObjectId1 + 1;

    for (let i = 0; i < totalPages; i += 1) {
        pageObjectIds.push(3 + i * 2);
    }

    objects.push(`2 0 obj\n<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${totalPages} >>\nendobj\n`);

    for (let i = 0; i < totalPages; i += 1) {
        const pageId = 3 + i * 2;
        const contentId = pageId + 1;
        const contentStream = buildContentStreamForPage(pages[i], i + 1, totalPages);

        objects.push(
            `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_PAGE_WIDTH} ${PDF_PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontObjectId1} 0 R /F2 ${fontObjectId2} 0 R >> >> /Contents ${contentId} 0 R >>\nendobj\n`
        );
        objects.push(
            `${contentId} 0 obj\n<< /Length ${Buffer.byteLength(contentStream, 'utf8')} >>\nstream\n${contentStream}\nendstream\nendobj\n`
        );
    }

    // Font objects
    objects.push(`${fontObjectId1} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n`);
    objects.push(`${fontObjectId2} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`);

    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    objects.forEach((obj) => {
        offsets.push(Buffer.byteLength(pdf, 'utf8'));
        pdf += obj;
    });

    const xrefStart = Buffer.byteLength(pdf, 'utf8');
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    for (let i = 1; i <= objects.length; i += 1) {
        pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
    return Buffer.from(pdf, 'utf8');
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const buildUrineReportPdf = (patient, report) => {
    const reportDate = formatDateTime(report?.createdAt);
    const generatedDate = formatDateTime(new Date());
    const riskLevel = normalizeText(report?.analysis?.risk_level || patient?.riskAssessment || 'Pending');
    const particles = collectParticleCounts(report);
    const diagnoses = collectDiagnoses(report);
    const chemicalRows = getChemicalRows(report?.chemicalParameters);

    const lines = [];

    // ── Patient Information ──────────────────────────────────────────────────
    lines.push('PATIENT INFORMATION');
    lines.push('='.repeat(96));
    lines.push(buildTabularLine('Patient Name', patient?.name || 'N/A', 'Patient ID', patient?.patientId || 'N/A'));
    lines.push(buildTabularLine('Age', normalizeText(patient?.age), 'Specimen Type', 'Urine'));
    lines.push(buildTabularLine('Report Date/Time', reportDate, 'Generated', generatedDate));
    lines.push(buildTabularLine('Overall Risk Pattern', riskLevel, '', ''));
    lines.push('-'.repeat(96));
    lines.push('');

    // ── Microscopic Examination (ALL 6 particles) ────────────────────────────
    lines.push('MICROSCOPIC EXAMINATION (AI-DETECTED PARTICLES)');
    lines.push('-'.repeat(96));
    lines.push(buildTabularLine('Parameter', 'Result', 'Reference', 'Status'));
    lines.push('-'.repeat(96));
    lines.push(buildTabularLine('RBC', `${particles.rbc} /hpf`, '0 - 3 /hpf', particles.rbc > 3 ? 'Review' : 'Normal'));
    lines.push(buildTabularLine('WBC', `${particles.wbc} /hpf`, '0 - 5 /hpf', particles.wbc > 5 ? 'Review' : 'Normal'));
    lines.push(buildTabularLine('Crystals', `${particles.crystals}`, 'Absent / Few', particles.crystals > 2 ? 'Review' : 'Normal'));
    lines.push(buildTabularLine('Casts', `${particles.casts}`, 'Absent', particles.casts > 0 ? 'Review' : 'Normal'));
    lines.push(buildTabularLine('Bacteria', `${particles.bacteria}`, 'Absent', particles.bacteria > 0 ? 'Review' : 'Normal'));
    lines.push(buildTabularLine('Yeast', `${particles.yeast}`, 'Absent', particles.yeast > 0 ? 'Review' : 'Normal'));
    lines.push('');



    // ── Chemical Examination ─────────────────────────────────────────────────
    lines.push('CHEMICAL EXAMINATION');
    lines.push('-'.repeat(96));
    lines.push(buildTabularLine('Parameter', 'Result', 'Reference', 'Status'));
    lines.push('-'.repeat(96));
    chemicalRows.forEach((row) => {
        lines.push(buildTabularLine(row.parameter, row.result, row.reference, row.status));
    });
    lines.push('');

    // ── Risk Score Summary ───────────────────────────────────────────────────
    const riskPrediction = report?.riskPrediction;
    if (riskPrediction) {
        const combinedRisk = riskPrediction?.derivedRisks?.combinedRisk || {};
        const finalScore = combinedRisk.score ?? riskPrediction.finalRiskScore ?? 0;
        const baseDiag = combinedRisk.baseDiagnosisScore ?? riskPrediction.baseDiagnosisScore ?? 0;
        const qScore = combinedRisk.questionnaireScore ?? riskPrediction.questionnaireScore ?? null;
        const riskSource = riskPrediction.riskSource || 'N/A';
        const rLevel = combinedRisk.riskLevel ?? riskPrediction.riskLevel ?? 'N/A';

        lines.push('RISK SCORE SUMMARY');
        lines.push('-'.repeat(96));
        lines.push(buildTabularLine('Final Risk Score', `${finalScore} / 100`, 'Risk Level', rLevel));
        lines.push(buildTabularLine('AI Diagnosis Score', `${baseDiag} / 75`, 'Risk Source', riskSource === 'UTI_ML' ? 'AI ML Model (UTI)' : 'Rule Engine'));
        if (qScore !== null && riskSource !== 'UTI_ML') {
            lines.push(buildTabularLine('Questionnaire Score', `${qScore} / 25`, '', ''));
        }
        if (riskSource === 'UTI_ML') {
            lines.push('  * Score computed by the AI Infection (UTI) ML model');
        }
        lines.push('');
    }

    // ── Impression ───────────────────────────────────────────────────────────
    const abnormalChem = chemicalRows.filter((row) => row.status === 'Abnormal').map((row) => row.parameter);
    const microscopicFlags = [];
    if (particles.rbc > 3) microscopicFlags.push('Raised RBC');
    if (particles.wbc > 5) microscopicFlags.push('Raised WBC');
    if (particles.crystals > 2) microscopicFlags.push('Crystals present');
    if (particles.casts > 0) microscopicFlags.push('Casts present');
    if (particles.bacteria > 0) microscopicFlags.push('Bacteria present');
    if (particles.yeast > 0) microscopicFlags.push('Yeast present');
    const combinedFlags = [...microscopicFlags, ...abnormalChem];

    lines.push('IMPRESSION');
    lines.push('-'.repeat(96));
    if (combinedFlags.length === 0) {
        pushWrapped(lines, 'No major abnormal chemical or microscopic findings identified in this sample.');
    } else {
        pushWrapped(lines, `Key findings requiring clinical correlation: ${combinedFlags.join(', ')}.`);
    }
    pushWrapped(lines, `Overall risk pattern from AI-assisted workflow: ${riskLevel}.`);
    lines.push('');

    // ── Clinical Note ────────────────────────────────────────────────────────
    lines.push('CLINICAL NOTE');
    lines.push('-'.repeat(96));
    pushWrapped(lines, 'This report includes AI-assisted microscopy output and entered chemical examination values.');
    pushWrapped(lines, 'All 6 particle types (RBC, WBC, Crystals, Casts, Bacteria, Yeast) are analyzed by the AI model.');
    pushWrapped(lines, 'Final diagnosis must be made by a qualified clinician after correlation with symptoms and history.');

    const pages = createPagedLines(lines);
    return buildPdf(pages);
};
