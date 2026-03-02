import crypto from 'crypto';

/**
 * Generates a cryptographically random 6-digit OTP.
 */
export const generateOTP = () => {
    // Random integer 100000–999999
    const otp = crypto.randomInt(100000, 999999).toString();
    return otp;
};

/**
 * Mock SMS sender — logs OTP to console.
 * Replace this function body with a Twilio/AWS SNS call in production.
 * @param {string} mobile - Patient's mobile number
 * @param {string} otp    - The 6-digit OTP
 */
export const sendOTP = async (mobile, otp) => {
    console.log('\n========================================');
    console.log('📱  OTP SMS SENT (MOCK / DEV MODE)');
    console.log(`    To: ${mobile}`);
    console.log(`    OTP: ${otp}`);
    console.log(`    Expires in: ${process.env.OTP_EXPIRE_MINUTES || 10} minutes`);
    console.log('========================================\n');

    // To integrate Twilio, uncomment and configure:
    // const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //     body: `Your UroAI verification code is: ${otp}. Valid for ${process.env.OTP_EXPIRE_MINUTES || 10} minutes.`,
    //     from: process.env.TWILIO_FROM,
    //     to: mobile,
    // });
};
