import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, default: null },
  action: { type: String, required: true },
  entity_type: { type: String, required: true },
  entity_id: { type: String, default: null },
  details: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true });

export default mongoose.model('AuditLog', auditLogSchema);
