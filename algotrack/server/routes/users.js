import { Router } from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// ── Protect all user routes ──
router.use(authenticate);

/**
 * GET /api/users/:id
 * Get a specific user profile
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id, status: 'active' });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if user is requesting their own profile
    if (req.user.id !== user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this profile' });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        photo_url: user.photo_url,
        role: user.role,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error('Fetch user error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * PUT /api/users/:id
 * Update user profile
 */
router.put('/:id', async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
    }

    const { display_name, photo_url } = req.body;
    
    const updateData = {};
    if (display_name !== undefined) updateData.display_name = display_name;
    if (photo_url !== undefined) updateData.photo_url = photo_url;

    const user = await User.findOneAndUpdate(
      { id: req.params.id, status: 'active' },
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        photo_url: user.photo_url,
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
