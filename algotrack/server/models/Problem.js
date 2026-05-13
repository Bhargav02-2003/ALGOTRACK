import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  chapter_id: { type: String, required: true },
  slug: { type: String, required: true },
  title: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  youtube_url: { type: String, default: null },
  practice_url: { type: String, default: null },
  article_url: { type: String, default: null },
  sort_order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'deleted'], default: 'active' },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model('Problem', problemSchema);
