import nodemailer from 'nodemailer';
import { buildUrineReportPdf } from './reportPdfService.js';

/**
 * Creates a Nodemailer transport.
 * In dev, uses Ethereal (free test SMTP) and logs preview URL.
 */
const createTransport = async () => {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    });
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

const buildClinicalSummaryHtml = (patient, report) => {
    const reportDate = formatDateTime(report?.createdAt);
    const riskLevel = report?.analysis?.risk_level || patient?.riskAssessment || 'Pending';

    return `
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-top: 18px;">
            <tr>
                <td style="padding: 10px 12px; background: #f8fafc; border-bottom: 1px solid #e5e7eb; font-size: 12px; font-weight: 700; color: #0f172a;">Clinical Summary</td>
                <td style="padding: 10px 12px; background: #f8fafc; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 12px; color: #334155;">Urine Routine / Microscopy &amp; Chemical Analysis</td>
            </tr>
            <tr>
                <td style="padding: 10px 12px; font-size: 12px; color: #334155; width: 50%;">Patient: <strong>${patient.name}</strong><br/>Patient ID: <strong>${patient.patientId}</strong></td>
                <td style="padding: 10px 12px; font-size: 12px; color: #334155; width: 50%;">Report Date: <strong>${reportDate}</strong><br/>Specimen Type: <strong>Urine</strong></td>
            </tr>
            <tr>
                <td colspan="2" style="padding: 10px 12px; font-size: 12px; color: #334155; border-top: 1px solid #e5e7eb;">
                    Overall Impression: <strong>${riskLevel}</strong> risk pattern based on available urine findings.
                </td>
            </tr>
        </table>
    `;
};

/**
 * Sends a secure access link to the patient's email.
 * Adds a clinical summary and attaches a urine report PDF when report data is available.
 * @param {Object} patient - Patient document from MongoDB
 * @param {string} token - Raw access token (before hashing)
 * @param {Object|null} report - Latest report document
 */
export const sendAccessEmail = async (patient, token, report = null) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const link = `${frontendUrl}/patient-verify?token=${token}`;

    const transporter = await createTransport();
    const reportDateStamp = report?.createdAt
        ? new Date(report.createdAt).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);

    const attachments = [];
    if (report) {
        const pdfBuffer = buildUrineReportPdf(patient, report);
        attachments.push({
            filename: `Urine_Full_Report_${patient.patientId || 'Patient'}_${reportDateStamp}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
        });
    }

    const clinicalSummaryHtml = buildClinicalSummaryHtml(patient, report);

    const mailOptions = {
        from: `"UroAI Lab System" <${process.env.SMTP_USER || 'noreply@uroai.com'}>`,
        to: patient.email,
        subject: 'Urine Full Report Ready - UroAI Secure Access',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 640px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #0f172a, #1e3a5f); padding: 28px 32px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 22px; letter-spacing: -0.3px;">UroAI Diagnostics Portal</h1>
                    <p style="color: rgba(255,255,255,0.72); margin: 6px 0 0; font-size: 13px;">Secure Patient Notification</p>
                </div>
                <div style="padding: 28px 32px;">
                    <p style="color: #333; font-size: 15px;">Dear <strong>${patient.name}</strong>,</p>
                    <p style="color: #475569; font-size: 14px; line-height: 1.65; margin: 0;">
                        Your urine full laboratory report is ready. A PDF copy is attached to this email for your records.
                        You can also securely access your report details through the patient portal using the link below.
                    </p>

                    ${clinicalSummaryHtml}

                    <div style="text-align: center; margin: 26px 0 22px;">
                        <a href="${link}" style="background: linear-gradient(135deg, #0f172a, #1e3a5f); color: #fff; text-decoration: none; padding: 14px 34px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
                            Access My Results Securely
                        </a>
                    </div>

                    <p style="color: #64748b; font-size: 12px; line-height: 1.65; margin: 0 0 10px 0;">
                        Security note: You will verify your Patient ID and mobile number, then enter a one-time password (OTP). This secure link expires in <strong>1 hour</strong>.
                    </p>
                    <p style="color: #64748b; font-size: 12px; line-height: 1.65; margin: 0;">
                        Medical disclaimer: This report is for clinical support and should be interpreted by a qualified healthcare professional in correlation with your clinical history.
                    </p>
                </div>
                <div style="background: #f8fafc; padding: 14px 28px; border-top: 1px solid #e0e0e0; text-align: center;">
                    <p style="color: #94a3b8; font-size: 11px; margin: 0;">Confidential Medical Information - UroAI Diagnostics Platform</p>
                </div>
            </div>
        `,
        attachments
    };

    const info = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV !== 'production') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('\n========================================');
        console.log('PATIENT EMAIL SENT');
        console.log(`    To: ${patient.email}`);
        console.log(`    Patient: ${patient.name} [${patient.patientId}]`);
        console.log(`    Attachment: ${attachments.length > 0 ? 'Urine report PDF' : 'None (no report found)'}`);
        if (previewUrl) {
            console.log(`    Preview URL: ${previewUrl}`);
        } else {
            console.log('    (Sent via configured SMTP provider)');
        }
        console.log('========================================\n');
    }

    return info;
};

export const sendOtpEmail = async (email, patientName, otp) => {
    const transporter = await createTransport();
    const mailOptions = {
        from: `"UroAI Lab System" <${process.env.SMTP_USER || 'noreply@uroai.com'}>`,
        to: email,
        subject: 'Your UroAI Verification Code',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 640px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #0f172a, #1e3a5f); padding: 28px 32px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 22px;">UroAI Diagnostics</h1>
                </div>
                <div style="padding: 28px 32px;">
                    <p style="color: #333; font-size: 15px;">Dear <strong>${patientName}</strong>,</p>
                    <p style="color: #475569; font-size: 14px;">Your One-Time Password (OTP) for verifying your identity is:</p>
                    <div style="text-align: center; margin: 26px 0;">
                        <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #00bcd4; background: #f8fafc; padding: 10px 20px; border-radius: 6px; border: 1px dashed #00bcd4;">${otp}</span>
                    </div>
                    <p style="color: #64748b; font-size: 12px;">This code is valid for 10 minutes. Do not share it with anyone.</p>
                </div>
            </div>
        `
    };
    const info = await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV !== 'production') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('\\n========================================');
        console.log('OTP EMAIL SENT');
        console.log(`    To: ${email}`);
        console.log(`    OTP: ${otp}`);
        if (previewUrl) console.log(`    Preview URL: ${previewUrl}`);
        console.log('========================================\\n');
    }
    return info;
};
