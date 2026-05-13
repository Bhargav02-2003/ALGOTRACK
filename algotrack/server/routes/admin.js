import { Router } from 'express';
import User from '../models/User.js';
import Problem from '../models/Problem.js';
import Chapter from '../models/Chapter.js';
import UserProgress from '../models/UserProgress.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Middleware to verify admin role
const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ id: req.user.id, status: 'active' });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    }
    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

router.use(authenticate);
router.use(requireAdmin);

// ── Admin: Get all students and their progress summary ──
router.get('/students', async (req, res) => {
  try {
    const students = await User.find({ role: 'student', status: 'active' })
      .select('id email display_name createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const totalProblems = await Problem.countDocuments({ status: 'active' });

    // For each student, get their completed count
    const studentsWithProgress = await Promise.all(students.map(async (student) => {
      const completedCount = await UserProgress.countDocuments({
        user_id: student.id,
        status: 'active',
        completed: true
      });
      return {
        ...student,
        completed_count: completedCount,
        total_problems: totalProblems
      };
    }));

    return res.status(200).json({ success: true, data: studentsWithProgress });
  } catch (error) {
    console.error('Get students error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ── Admin: Update Problem (Topic/Link) ──
router.put('/problems/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, difficulty, youtube_url, practice_url, article_url } = req.body;
    
    await Problem.findOneAndUpdate(
      { id },
      { title, difficulty, youtube_url, practice_url, article_url }
    );
    
    return res.status(200).json({ success: true, message: 'Problem updated successfully.' });
  } catch (error) {
    console.error('Update problem error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ── Admin: Create Problem (Topic) ──
router.post('/problems', async (req, res) => {
  try {
    const { chapter_id, title, difficulty, youtube_url, practice_url, article_url, sort_order } = req.body;
    
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const { v4: uuidv4 } = await import('uuid');
    const id = uuidv4();

    await Problem.create({
      id, chapter_id, slug, title, difficulty: difficulty || 'Easy', youtube_url, practice_url, article_url, sort_order: sort_order || 0
    });
    
    return res.status(201).json({ success: true, message: 'Problem created successfully.', data: { id } });
  } catch (error) {
    console.error('Create problem error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ── Admin: Create Chapter ──
router.post('/chapters', async (req, res) => {
  try {
    const { title, sort_order } = req.body;
    
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const { v4: uuidv4 } = await import('uuid');
    const id = uuidv4();

    await Chapter.create({
      id, slug, title, sort_order: sort_order || 0
    });
    
    return res.status(201).json({ success: true, message: 'Chapter created successfully.', data: { id } });
  } catch (error) {
    console.error('Create chapter error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ── Admin: Get full progress of a specific student ──
router.get('/students/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;
    
    const progressList = await UserProgress.find({ user_id: id, status: 'active', completed: true })
      .sort({ completed_at: -1 })
      .lean();

    // Map problem and chapter details
    const problemIds = progressList.map(p => p.problem_id);
    const problems = await Problem.find({ id: { $in: problemIds } }).lean();
    const chapterIds = problems.map(p => p.chapter_id);
    const chapters = await Chapter.find({ id: { $in: chapterIds } }).lean();

    const result = progressList.map(prog => {
      const prob = problems.find(p => p.id === prog.problem_id);
      const chap = prob ? chapters.find(c => c.id === prob.chapter_id) : null;

      return {
        ...prog,
        problem_title: prob ? prob.title : 'Unknown',
        difficulty: prob ? prob.difficulty : 'Unknown',
        chapter_title: chap ? chap.title : 'Unknown'
      };
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Get student progress error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

export default router;
