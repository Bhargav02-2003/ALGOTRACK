import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import UserProgress from '../models/UserProgress.js';
import Problem from '../models/Problem.js';
import Chapter from '../models/Chapter.js';
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

    // Get all chapters
    const chapters = await Chapter.find({ status: 'active' }).lean();

    // Get all problems
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

    // Prepare byChapter map
    const chapterMap = {};
    for (const ch of chapters) {
      chapterMap[ch.id] = {
        chapter_id: ch.id,
        chapter_title: ch.title,
        completed: 0,
        total: 0,
        easy_completed: 0,
        easy_total: 0,
        medium_completed: 0,
        medium_total: 0,
        hard_completed: 0,
        hard_total: 0
      };
    }

    for (const p of problems) {
      const isCompleted = completedIds.has(p.id);
      
      // Update Chapter Stats
      if (chapterMap[p.chapter_id]) {
        chapterMap[p.chapter_id].total++;
        if (isCompleted) chapterMap[p.chapter_id].completed++;
        
        if (p.difficulty === 'Easy') {
          chapterMap[p.chapter_id].easy_total++;
          if (isCompleted) chapterMap[p.chapter_id].easy_completed++;
        } else if (p.difficulty === 'Medium') {
          chapterMap[p.chapter_id].medium_total++;
          if (isCompleted) chapterMap[p.chapter_id].medium_completed++;
        } else if (p.difficulty === 'Hard') {
          chapterMap[p.chapter_id].hard_total++;
          if (isCompleted) chapterMap[p.chapter_id].hard_completed++;
        }
      }

      // Update Overall Difficulty Stats
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

    const byDifficulty = [
      { difficulty: 'Easy', total: easyTotal, completed: easyCompleted },
      { difficulty: 'Medium', total: mediumTotal, completed: mediumCompleted },
      { difficulty: 'Hard', total: hardTotal, completed: hardCompleted }
    ];

    const byChapter = Object.values(chapterMap).filter(ch => ch.total > 0);

    return res.status(200).json({
      success: true,
      data: {
        totalProblems,
        totalCompleted,
        progressPercentage,
        byDifficulty,
        byChapter
      }
    });
  } catch (error) {
    console.error('Fetch progress stats error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

export default router;
