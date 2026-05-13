import { Router } from 'express';
import Problem from '../models/Problem.js';

const router = Router();

/**
 * GET /api/problems/:id
 * Fetch a specific problem by ID.
 */
router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findOne({ id: req.params.id, status: 'active' }).lean();
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found.' });
    }
    return res.status(200).json({ success: true, data: problem });
  } catch (error) {
    console.error('Fetch problem error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

export default router;
