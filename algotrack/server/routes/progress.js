import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import UserProgress from '../models/UserProgress.js';
import Problem from '../models/Problem.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

/**
 * GET /api/progress
 * Get all completed problems for the current user
 */
router.get('/', async (req, res) => {
  try {
    const progress = await UserProgress.find({ 
      user_id: req.user.id, 
      status: 'active',
      completed: true 
    }).lean();
    
    // Return just the array of problem IDs
    const completedProblemIds = progress.map(p => p.problem_id);
    return res.status(200).json({ success: true, data: completedProblemIds });
  } catch (error) {
    console.error('Fetch progress error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

/**
 * POST /api/progress/toggle
 * Toggle completion status of a problem
 */
router.post('/toggle', async (req, res) => {
  try {
    const { problemId, completed } = req.body;
    const userId = req.user.id;

    if (!problemId) {
      return res.status(400).json({ success: false, message: 'Problem ID is required.' });
    }

    let progress = await UserProgress.findOne({ user_id: userId, problem_id: problemId });

    if (progress) {
      progress.completed = completed;
      progress.completed_at = completed ? new Date() : null;
      progress.status = 'active';
      await progress.save();
    } else {
      progress = await UserProgress.create({
        id: uuidv4(),
        user_id: userId,
        problem_id: problemId,
        completed,
        completed_at: completed ? new Date() : null
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: completed ? 'Problem marked as completed.' : 'Problem marked as incomplete.' 
    });
  } catch (error) {
    console.error('Toggle progress error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

/**
 * GET /api/progress/stats
 * Get detailed progress statistics for the current user
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total active problems
    const totalProblems = await Problem.countDocuments({ status: 'active' });
    
    // Get total completed by user
    const totalCompleted = await UserProgress.countDocuments({
      user_id: userId,
      status: 'active',
      completed: true
    });

    const progressPercentage = totalProblems > 0 
      ? Math.round((totalCompleted / totalProblems) * 100) 
      : 0;

    // Get all problems to calculate difficulty breakdown
    const problems = await Problem.find({ status: 'active' }).lean();
    
    // Get all completed progress for the user
    const userProgress = await UserProgress.find({
      user_id: userId,
      status: 'active',
      completed: true
    }).lean();
    
    const completedIds = new Set(userProgress.map(p => p.problem_id));

    let easyTotal = 0, easyCompleted = 0;
    let mediumTotal = 0, mediumCompleted = 0;
    let hardTotal = 0, hardCompleted = 0;

    for (const p of problems) {
      const isCompleted = completedIds.has(p.id);
      if (p.difficulty === 'Easy') {
        easyTotal++;
        if (isCompleted) easyCompleted++;
      } else if (p.difficulty === 'Medium') {
        mediumTotal++;
        if (isCompleted) mediumCompleted++;
      } else if (p.difficulty === 'Hard') {
        hardTotal++;
        if (isCompleted) hardCompleted++;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        totalProblems,
        totalCompleted,
        progressPercentage,
        difficultyStats: {
          easy: { total: easyTotal, completed: easyCompleted },
          medium: { total: mediumTotal, completed: mediumCompleted },
          hard: { total: hardTotal, completed: hardCompleted },
        }
      }
    });
  } catch (error) {
    console.error('Fetch progress stats error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

export default router;
