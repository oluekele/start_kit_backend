import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY!);

export const sendOTPEmail = async (to: string, otp: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Replace with your verified domain later
      to,
      subject: 'Verify your email',
      html: `<p>Your verification code is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error('Failed to send OTP email');
    }

    return data;
  } catch (err) {
    console.error('Email sending failed:', err);
    throw err;
  }
};
