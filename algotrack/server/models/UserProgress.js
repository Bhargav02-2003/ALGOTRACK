import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  problem_id: { type: String, required: true },
  completed: { type: Boolean, default: false },
  notes: { type: String, default: null },
  time_spent_seconds: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'deleted'], default: 'active' },
  completed_at: { type: Date, default: null },
}, { timestamps: true });

// Create unique compound index for fast lookups
userProgressSchema.index({ user_id: 1, problem_id: 1 }, { unique: true });

export default mongoose.model('UserProgress', userProgressSchema);
