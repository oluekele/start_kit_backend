import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/me', protect, (req, res) => {
  res.json({ message: 'Protected route accessed', user: (req as any).user });
});

export default router;
