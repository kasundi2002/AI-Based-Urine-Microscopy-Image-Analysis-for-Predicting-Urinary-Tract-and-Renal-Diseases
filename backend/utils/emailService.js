import nodemailer from 'nodemailer';

/**
 * Creates a Nodemailer transport.
 * In dev, uses Ethereal (free test SMTP) — preview URL is logged.
 * In production, replace with real SMTP credentials via env vars.
 */
const createTransport = async () => {
    // Standard SMTP or Gmail via env vars
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // Dev: auto-create an Ethereal test account if no credentials are provided
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
};

/**
 * Sends a secure access link to the patient's email.
 * @param {Object} patient - Patient document from MongoDB
 * @param {string} token   - The raw access token (before hashing)
 */
export const sendAccessEmail = async (patient, token) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const link = `${frontendUrl}/patient-verify?token=${token}`;

    const transporter = await createTransport();

    const mailOptions = {
        from: `"UroAI Lab System" <${process.env.SMTP_USER || 'noreply@uroai.com'}>`,
        to: patient.email,
        subject: 'Access Your Lab Results — UroAI Secure Portal',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #0f172a, #1e3a5f); padding: 28px 32px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 22px; letter-spacing: -0.5px;">UroAI Diagnostics Portal</h1>
                    <p style="color: rgba(255,255,255,0.6); margin: 6px 0 0; font-size: 13px;">Secure Patient Access</p>
                </div>
                <div style="padding: 32px;">
                    <p style="color: #333; font-size: 15px;">Dear <strong>${patient.name}</strong>,</p>
                    <p style="color: #555; font-size: 14px; line-height: 1.6;">
                        Your laboratory analysis results are ready. Please click the button below to securely access your personalised kidney stone risk report.
                    </p>
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${link}" style="
                            background: linear-gradient(135deg, #0f172a, #1e3a5f);
                            color: white; text-decoration: none; padding: 14px 36px;
                            border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block;
                        ">View My Results</a>
                    </div>
                    <p style="color: #888; font-size: 12px; line-height: 1.6;">
                        <strong>Note:</strong> You will be asked to verify your Patient ID and registered mobile number, then enter a One-Time Password (OTP) sent to your phone. This link expires in <strong>1 hour</strong>.
                    </p>
                    <p style="color: #aaa; font-size: 11px; margin-top: 24px;">
                        If you did not request this, please ignore this email or contact your laboratory.
                    </p>
                </div>
                <div style="background: #f8fafc; padding: 16px 32px; border-top: 1px solid #e0e0e0; text-align: center;">
                    <p style="color: #aaa; font-size: 11px; margin: 0;">UroAI Diagnostics Platform — Confidential Medical Information</p>
                </div>
            </div>
        `,
    };

    const info = await transporter.sendMail(mailOptions);

    // In development, log the email action
    if (process.env.NODE_ENV !== 'production') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('\n========================================');
        console.log('📧  PATIENT EMAIL SENT');
        console.log(`    To: ${patient.email}`);
        console.log(`    Patient: ${patient.name} [${patient.patientId}]`);
        if (previewUrl) {
            console.log(`    Preview URL: ${previewUrl}`);
        } else {
            console.log('    (Sent via configured SMTP provider)');
        }
        console.log('========================================\n');
    }

    return info;
};
