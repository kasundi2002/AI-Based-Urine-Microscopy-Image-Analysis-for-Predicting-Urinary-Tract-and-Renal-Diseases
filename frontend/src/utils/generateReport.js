import { jsPDF } from 'jspdf';

/**
 * Generates and downloads a professional PDF medical report.
 * @param {Object} report - The report data from ResultsDashboard
 * @param {string} patientName - The patient's display name
 */
const generateReport = (report, patientName = 'John Doe') => {
  if (!report) return;

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  // ── Colors ──
  const navy = [15, 23, 42];
  const cyan = [0, 188, 212];
  const white = [255, 255, 255];
  const gray = [120, 120, 120];
  const darkText = [30, 30, 30];
  const lightBg = [245, 247, 250];

  // ── Risk colors ──
  const riskScore = report.questionnaireCompleted
    ? (report.enhancedRiskScore || report.riskScore)
    : report.riskScore;
  const isHighRisk = riskScore > 50;
  const isMedRisk = riskScore > 30;
  const riskColor = isHighRisk ? [239, 83, 80] : isMedRisk ? [255, 145, 0] : [102, 187, 106];

  const riskLabel = report.questionnaireCompleted
    ? (report.enhancedRiskLabel || report.riskLabel || (isHighRisk ? 'High Risk' : 'Low Risk'))
    : (report.riskLabel || (isHighRisk ? 'High Risk' : 'Low Risk'));

  // ════════════════════════════════════════════════
  //  HEADER BAR
  // ════════════════════════════════════════════════
  doc.setFillColor(...navy);
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Accent bar
  doc.setFillColor(...cyan);
  doc.rect(0, 38, pageWidth, 1.5, 'F');

  // Title
  doc.setTextColor(...white);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Uro.AI', margin, 17);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 210, 230);
  doc.text('DIAGNOSTICS', margin + 29, 17);

  // Subtitle
  doc.setFontSize(10);
  doc.setTextColor(200, 210, 220);
  doc.text('AI-Powered Urine Microscopy Analysis Report', margin, 28);

  // Date on right
  doc.setFontSize(9);
  doc.setTextColor(...white);
  doc.text(`Report Date: ${report.date || 'N/A'}`, pageWidth - margin, 17, { align: 'right' });
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth - margin, 24, { align: 'right' });

  y = 50;

  // ════════════════════════════════════════════════
  //  PATIENT INFO BAR
  // ════════════════════════════════════════════════
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, y, contentWidth, 18, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkText);
  doc.text('Patient Information', margin + 6, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  doc.text(`Name: ${patientName}`, margin + 6, y + 13);
  doc.text('ID: PAT-2023-001', margin + 70, y + 13);
  doc.text(`Analysis Date: ${report.date || 'N/A'}`, margin + 130, y + 13);

  y += 26;

  // ════════════════════════════════════════════════
  //  RISK ASSESSMENT
  // ════════════════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...navy);
  doc.text('Risk Assessment', margin, y);
  y += 4;

  // Risk card
  doc.setFillColor(...riskColor);
  doc.roundedRect(margin, y, contentWidth, 30, 3, 3, 'F');

  // Score
  doc.setTextColor(...white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text(`${riskScore}%`, margin + 12, y + 18);

  // Label
  doc.setFontSize(14);
  doc.text(riskLabel, margin + 45, y + 14);

  // Description
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255, 200);
  const riskDesc = report.questionnaireCompleted
    ? 'Enhanced prediction combining lab analysis + health questionnaire data.'
    : 'Based on AI analysis of urine microscopy sample.';
  doc.text(riskDesc, margin + 45, y + 23);

  // Enhanced badge
  if (report.questionnaireCompleted) {
    doc.setFillColor(255, 255, 255, 50);
    doc.roundedRect(pageWidth - margin - 45, y + 8, 40, 7, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setTextColor(...white);
    doc.setFont('helvetica', 'bold');
    doc.text('AI + QUESTIONNAIRE', pageWidth - margin - 43, y + 13);
  }

  y += 40;

  // ════════════════════════════════════════════════
  //  URINE SEDIMENTS TABLE
  // ════════════════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...navy);
  doc.text('Urine Sediment Analysis', margin, y);
  y += 6;

  const colWidths = [contentWidth * 0.35, contentWidth * 0.35, contentWidth * 0.30];
  const tableX = margin;

  // Table header
  doc.setFillColor(...navy);
  doc.roundedRect(tableX, y, contentWidth, 10, 2, 2, 'F');
  doc.setTextColor(...white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Parameter', tableX + 6, y + 7);
  doc.text('Value', tableX + colWidths[0] + 6, y + 7);
  doc.text('Reference Range', tableX + colWidths[0] + colWidths[1] + 6, y + 7);
  y += 10;

  const sediments = [
    { param: 'WBC (White Blood Cells)', value: `${report.wbc || '0-2'} /hpf`, ref: '0-5 /hpf' },
    { param: 'RBC (Red Blood Cells)', value: `${report.rbc || '0-1'} /hpf`, ref: '0-3 /hpf' },
    { param: 'Crystals', value: report.crystals || 'None', ref: 'None / Absent' },
    { param: 'Bacteria', value: report.bacteria || 'None', ref: 'None / Absent' },
  ];

  sediments.forEach((row, i) => {
    const fillColor = i % 2 === 0 ? [250, 251, 253] : [255, 255, 255];
    doc.setFillColor(...fillColor);
    doc.rect(tableX, y, contentWidth, 10, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...darkText);
    doc.text(row.param, tableX + 6, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.text(row.value, tableX + colWidths[0] + 6, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...gray);
    doc.text(row.ref, tableX + colWidths[0] + colWidths[1] + 6, y + 7);
    y += 10;
  });

  // Table border
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.roundedRect(tableX, y - 40, contentWidth, 40, 2, 2, 'S');

  y += 10;

  // ════════════════════════════════════════════════
  //  CHEMICAL ANALYSIS TABLE
  // ════════════════════════════════════════════════
  if (report.chemicalParameters) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...navy);
    doc.text('Chemical Analysis (Urine Full Report)', margin, y);
    y += 6;

    // Table header
    doc.setFillColor(...navy);
    doc.roundedRect(tableX, y, contentWidth, 10, 2, 2, 'F');
    doc.setTextColor(...white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Parameter', tableX + 6, y + 7);
    doc.text('Result', tableX + colWidths[0] + 6, y + 7);
    doc.text('Status', tableX + colWidths[0] + colWidths[1] + 6, y + 7);
    y += 10;

    const chem = report.chemicalParameters;
    const chemRows = [
      { param: 'Colour', value: chem.colour || '—' },
      { param: 'Appearance', value: chem.appearance || '—' },
      { param: 'S.G. (Refractometer)', value: chem.specificGravity ? String(chem.specificGravity) : '—' },
      { param: 'pH', value: chem.pH ? String(chem.pH) : '—' },
      { param: 'Protein', value: chem.protein || '—' },
      { param: 'Glucose', value: chem.glucose || '—' },
      { param: 'Ketone Bodies', value: chem.ketoneBodies || '—' },
      { param: 'Bilirubin', value: chem.bilirubin || '—' },
      { param: 'Nitrite', value: chem.nitrite || '—' },
      { param: 'Urobilinogen', value: chem.urobilinogen || '—' },
      { param: 'Blood (Occult)', value: chem.blood || '—' },
    ];

    const isAbnormal = (param, val) => {
      if (['Protein', 'Glucose', 'Ketone Bodies', 'Bilirubin', 'Blood (Occult)'].includes(param)) return val !== 'Nil' && val !== '—';
      if (param === 'Nitrite') return val === 'Positive';
      if (param === 'Urobilinogen') return val === 'Elevated';
      return false;
    };

    const chemTableStartY = y;
    chemRows.forEach((row, i) => {
      // Check if we need a new page
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const fillColor = i % 2 === 0 ? [250, 251, 253] : [255, 255, 255];
      doc.setFillColor(...fillColor);
      doc.rect(tableX, y, contentWidth, 10, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...darkText);
      doc.text(row.param, tableX + 6, y + 7);

      const abnormal = isAbnormal(row.param, row.value);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(abnormal ? 239 : darkText[0], abnormal ? 83 : darkText[1], abnormal ? 80 : darkText[2]);
      doc.text(row.value, tableX + colWidths[0] + 6, y + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(abnormal ? 239 : 102, abnormal ? 83 : 187, abnormal ? 80 : 106);
      doc.text(abnormal ? 'Abnormal' : 'Normal', tableX + colWidths[0] + colWidths[1] + 6, y + 7);
      y += 10;
    });

    // Table border
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    const chemTableHeight = y - chemTableStartY;
    doc.roundedRect(tableX, chemTableStartY, contentWidth, chemTableHeight, 2, 2, 'S');

    y += 10;
  }

  // ════════════════════════════════════════════════
  //  DOCTOR'S RECOMMENDATIONS
  // ════════════════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...navy);
  doc.text("Doctor's Recommendations", margin, y);
  y += 6;

  // Prescription box
  doc.setFillColor(237, 246, 255);
  doc.roundedRect(margin, y, contentWidth, 28, 3, 3, 'F');
  doc.setDrawColor(187, 222, 251);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 28, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(25, 118, 210);
  doc.text('PRESCRIPTION & NOTES', margin + 6, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...darkText);
  const prescription = report.prescription || 'Drink plenty of water. Follow up in 3 months.';
  const splitPrescription = doc.splitTextToSize(prescription, contentWidth - 12);
  doc.text(splitPrescription, margin + 6, y + 14);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  doc.text(report.doctorNote || '- Dr. Smith (Urologist)', margin + 6, y + 23);

  y += 36;

  // Lifestyle recommendations
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text('LIFESTYLE ADJUSTMENTS', margin, y);
  y += 6;

  const lifestyle = [
    { text: 'Increase daily water intake to 2.5L', icon: '💧' },
    { text: 'Reduce sodium intake (salt)', icon: '🍽️' },
    { text: 'Limit oxalate-rich foods', icon: '🏋️' },
  ];

  lifestyle.forEach((item) => {
    doc.setFillColor(...lightBg);
    doc.roundedRect(margin, y, contentWidth, 9, 2, 2, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...darkText);
    doc.text(`•  ${item.text}`, margin + 6, y + 6.5);
    y += 11;
  });

  y += 6;

  // ════════════════════════════════════════════════
  //  FOOTER
  // ════════════════════════════════════════════════
  // Divider
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text(
    'Disclaimer: This report is generated by Uro.AI Diagnostics using AI-powered urine microscopy analysis.',
    margin,
    y
  );
  doc.text(
    'This report is for informational purposes only and should not replace professional medical advice.',
    margin,
    y + 4
  );
  doc.text(
    `© ${new Date().getFullYear()} Uro.AI Diagnostics  |  Confidential Patient Report`,
    margin,
    y + 10
  );

  // ── Save ──
  const dateStr = (report.date || 'report').replace(/[\s,]+/g, '_');
  doc.save(`Uro_AI_Report_${dateStr}.pdf`);
};

export default generateReport;
