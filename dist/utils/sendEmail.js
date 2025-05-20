"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTPEmail = void 0;
const resend_1 = require("resend");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
const sendOTPEmail = async (to, otp) => {
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
    }
    catch (err) {
        console.error('Email sending failed:', err);
        throw err;
    }
};
exports.sendOTPEmail = sendOTPEmail;
