import { Router } from 'express';
import Chapter from '../models/Chapter.js';
import Problem from '../models/Problem.js';

const router = Router();

/**
 * GET /api/chapters
 * Fetch all active chapters with their associated problems.
 */
router.get('/', async (req, res) => {
  try {
    const chapters = await Chapter.find({ status: 'active' }).sort({ sort_order: 1 }).lean();
    const chapterIds = chapters.map(c => c.id);

    const problems = await Problem.find({ 
      chapter_id: { $in: chapterIds }, 
      status: 'active' 
    }).sort({ sort_order: 1 }).lean();

    // Group problems by chapter
    const problemsByChapter = problems.reduce((acc, prob) => {
      if (!acc[prob.chapter_id]) acc[prob.chapter_id] = [];
      acc[prob.chapter_id].push(prob);
      return acc;
    }, {});

    // Attach problems to chapters
    const chaptersWithProblems = chapters.map(ch => ({
      ...ch,
      problems: problemsByChapter[ch.id] || []
    }));

    return res.status(200).json({ success: true, data: chaptersWithProblems });
  } catch (error) {
    console.error('Fetch chapters error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

export default router;
