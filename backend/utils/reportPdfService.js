const PDF_PAGE_WIDTH = 595;
const PDF_PAGE_HEIGHT = 842;
const MAX_CHARS = 96;
const MAX_LINES_PER_PAGE = 52;

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

const collectMicroscopySummary = (report) => {
    const counts = { wbc: 0, rbc: 0, crystals: 0, bacteria: 0 };
    const detections = Array.isArray(report?.analysis?.detections)
        ? report.analysis.detections
        : [];

    detections.forEach((item) => {
        const rawClass = item?.class_name || item?.class || '';
        const cls = String(rawClass).toLowerCase();
        if (cls.includes('wbc') || cls.includes('leuko')) counts.wbc += 1;
        if (cls.includes('rbc') || cls.includes('eryth')) counts.rbc += 1;
        if (cls.includes('crystal') || cls.includes('cryst')) counts.crystals += 1;
        if (cls.includes('bacteria') || cls.includes('bacter') || cls.includes('bacilli') || cls.includes('cocci')) counts.bacteria += 1;
    });

    return counts;
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

const createPagedLines = (allLines) => {
    const pages = [];
    let current = [];

    allLines.forEach((line) => {
        if (current.length >= MAX_LINES_PER_PAGE) {
            pages.push(current);
            current = [];
        }
        current.push(line);
    });

    if (current.length > 0) pages.push(current);
    return pages;
};

const buildContentStreamForPage = (lines) => {
    const startX = 42;
    const startY = PDF_PAGE_HEIGHT - 44;
    const lineHeight = 14;

    const streamLines = [
        'BT',
        '/F1 10 Tf',
        `${startX} ${startY} Td`,
        `${lineHeight} TL`
    ];

    lines.forEach((line, index) => {
        const safe = escapePdfText(line);
        if (index === 0) {
            streamLines.push(`(${safe}) Tj`);
        } else {
            streamLines.push('T*');
            streamLines.push(`(${safe}) Tj`);
        }
    });

    streamLines.push('ET');
    return streamLines.join('\n');
};

const buildPdf = (pages) => {
    const objects = [];
    const totalPages = pages.length;

    // 1 Catalog, 2 Pages root
    objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

    const pageObjectIds = [];
    const fontObjectId = 3 + totalPages * 2; // after page + content pairs
    for (let i = 0; i < totalPages; i += 1) {
        pageObjectIds.push(3 + i * 2);
    }

    objects.push(`2 0 obj\n<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${totalPages} >>\nendobj\n`);

    for (let i = 0; i < totalPages; i += 1) {
        const pageId = 3 + i * 2;
        const contentId = pageId + 1;
        const contentStream = buildContentStreamForPage(pages[i]);

        objects.push(
            `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_PAGE_WIDTH} ${PDF_PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${contentId} 0 R >>\nendobj\n`
        );
        objects.push(
            `${contentId} 0 obj\n<< /Length ${Buffer.byteLength(contentStream, 'utf8')} >>\nstream\n${contentStream}\nendstream\nendobj\n`
        );
    }

    objects.push(`${fontObjectId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n`);

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

export const buildUrineReportPdf = (patient, report) => {
    const reportDate = formatDateTime(report?.createdAt);
    const generatedDate = formatDateTime(new Date());
    const riskLevel = normalizeText(report?.analysis?.risk_level || patient?.riskAssessment || 'Pending');
    const microscopy = collectMicroscopySummary(report);
    const chemicalRows = getChemicalRows(report?.chemicalParameters);

    const lines = [];
    lines.push('UROAI DIAGNOSTICS LABORATORY');
    lines.push('AI-ASSISTED URINE FULL REPORT (MICROSCOPY + CHEMICAL EXAMINATION)');
    lines.push('='.repeat(96));
    lines.push(buildTabularLine('Patient Name', patient?.name || 'N/A', 'Patient ID', patient?.patientId || 'N/A'));
    lines.push(buildTabularLine('Specimen Type', 'Urine', 'Report Date/Time', reportDate));
    lines.push(buildTabularLine('Generated Date/Time', generatedDate, 'Overall Risk Pattern', riskLevel));
    lines.push('-'.repeat(96));
    lines.push('');

    lines.push('MICROSCOPIC EXAMINATION');
    lines.push('-'.repeat(96));
    lines.push(buildTabularLine('Parameter', 'Result', 'Reference', 'Status'));
    lines.push('-'.repeat(96));
    lines.push(buildTabularLine('WBC', `${microscopy.wbc} /hpf`, '0 - 5 /hpf', microscopy.wbc > 5 ? 'Review' : 'Normal'));
    lines.push(buildTabularLine('RBC', `${microscopy.rbc} /hpf`, '0 - 3 /hpf', microscopy.rbc > 3 ? 'Review' : 'Normal'));
    lines.push(buildTabularLine('Crystals', `${microscopy.crystals}`, 'Absent / Few', microscopy.crystals > 0 ? 'Review' : 'Normal'));
    lines.push(buildTabularLine('Bacteria', `${microscopy.bacteria}`, 'Absent', microscopy.bacteria > 0 ? 'Review' : 'Normal'));
    lines.push('');

    lines.push('CHEMICAL EXAMINATION (FULL URINE REPORT)');
    lines.push('-'.repeat(96));
    lines.push(buildTabularLine('Parameter', 'Result', 'Reference', 'Status'));
    lines.push('-'.repeat(96));
    chemicalRows.forEach((row) => {
        lines.push(buildTabularLine(row.parameter, row.result, row.reference, row.status));
    });
    lines.push('');

    const abnormalChem = chemicalRows.filter((row) => row.status === 'Abnormal').map((row) => row.parameter);
    const microscopicFlags = [];
    if (microscopy.wbc > 5) microscopicFlags.push('Raised WBC');
    if (microscopy.rbc > 3) microscopicFlags.push('Raised RBC');
    if (microscopy.crystals > 0) microscopicFlags.push('Crystals present');
    if (microscopy.bacteria > 0) microscopicFlags.push('Bacteria present');
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

    lines.push('CLINICAL NOTE');
    lines.push('-'.repeat(96));
    pushWrapped(lines, 'This report includes AI-assisted microscopy output and entered chemical examination values.');
    pushWrapped(lines, 'Final diagnosis must be made by a qualified clinician after correlation with symptoms and history.');
    lines.push('');
    lines.push('Confidential medical information - UroAI Diagnostics');

    const pages = createPagedLines(lines);
    return buildPdf(pages);
};
