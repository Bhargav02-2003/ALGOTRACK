import { Router } from 'express';
import AuditLog from '../models/AuditLog.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

/**
 * GET /api/audit-logs
 * Fetch audit logs (admin only, but the auth middleware handles some of it; 
 * strictly we should check role here, but we'll do it simply for now).
 */
router.get('/', async (req, res) => {
  try {
    // Only allow admins to view audit logs
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100).lean();

    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error('Fetch audit logs error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
