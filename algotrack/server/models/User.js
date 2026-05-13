import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Keeping string ID for frontend compatibility
  email: { type: String, required: true, unique: true },
  display_name: { type: String, default: null },
  photo_url: { type: String, default: null },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  status: { type: String, enum: ['active', 'inactive', 'deleted'], default: 'active' },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
