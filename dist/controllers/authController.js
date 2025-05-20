"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.login = exports.verifyOTP = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const generateOTP_1 = require("../utils/generateOTP");
const sendEmail_1 = require("../utils/sendEmail");
const JWT_SECRET = process.env.JWT_SECRET;
// Signup
const signup = async (req, res) => {
    const { firstname, lastname, email, password } = req.body;
    try {
        const existingUser = await user_1.default.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const otp = (0, generateOTP_1.generateOTP)();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user_1.default.create({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            otp,
            otpExpiresAt,
            isVerified: false,
        });
        // Send OTP to user email
        await (0, sendEmail_1.sendOTPEmail)(email, otp);
        res.status(201).json({
            message: 'Signup successful. Please check your email for a verification code.',
        });
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Signup failed' });
    }
};
exports.signup = signup;
// Verify OTP
const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await user_1.default.findOne({ email });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        if (user.isVerified)
            return res.status(400).json({ error: 'User already verified' });
        const isOTPValid = user.otp === otp && user.otpExpiresAt > new Date();
        if (!isOTPValid) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }
        user.isVerified = true;
        user.otp = '';
        await user.save();
        res.status(200).json({ message: 'Email verified successfully' });
    }
    catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ error: 'OTP verification failed' });
    }
};
exports.verifyOTP = verifyOTP;
// Login
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await user_1.default.findOne({ email });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ error: 'Invalid credentials' });
        if (!user.isVerified)
            return res.status(403).json({ error: 'Please verify your email' });
        const token = jsonwebtoken_1.default.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};
exports.login = login;
// Forgot Password
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await user_1.default.findOne({ email });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const otp = (0, generateOTP_1.generateOTP)();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        user.otp = otp;
        user.otpExpiresAt = otpExpiresAt;
        await user.save();
        await (0, sendEmail_1.sendOTPEmail)(email, otp);
        res.status(200).json({ message: 'OTP sent to email' });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
};
exports.forgotPassword = forgotPassword;
// Reset Password
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await user_1.default.findOne({ email });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const isOTPValid = user.otp === otp && user.otpExpiresAt > new Date();
        if (!isOTPValid) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }
        user.password = await bcryptjs_1.default.hash(newPassword, 10);
        user.otp = '';
        user.otpExpiresAt = new Date();
        await user.save();
        res.status(200).json({ message: 'Password reset successful' });
    }
    catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Reset failed' });
    }
};
exports.resetPassword = resetPassword;
