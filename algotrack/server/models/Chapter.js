import mongoose from 'mongoose';

const chapterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  sort_order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'deleted'], default: 'active' },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model('Chapter', chapterSchema);
