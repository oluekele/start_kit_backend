
import {
  forgotPassword,
  login,
  resetPassword,
  signup,
  verifyOTP,
} from '../controllers/authController';

import express from 'express';
const router = express.Router();

router.post('/signup', signup);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
