import express from 'express';
import cors from 'cors';
import { initDatabase, seedDatabase } from './config/initDatabase.js';
import { auditLogger } from './middleware/auditLogger.js';
import { optionalAuth } from './middleware/auth.js';

// Route imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import chapterRoutes from './routes/chapters.js';
import problemRoutes from './routes/problems.js';
import progressRoutes from './routes/progress.js';
import auditLogRoutes from './routes/auditLogs.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

// ── Core Middleware ──
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests from localhost, or the deployed APP_URL
    const allowedAppUrl = process.env.APP_URL;
    if (
      !origin || 
      /^http:\/\/localhost(:\d+)?$/.test(origin) || 
      (allowedAppUrl && origin === allowedAppUrl)
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Audit Logger (logs every API call to audit_logs table) ──
app.use('/api', optionalAuth, auditLogger);

// ── API Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/admin', adminRoutes);

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'AlgoTrack API is running!', timestamp: new Date().toISOString() });
});

// ── 404 Handler ──
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found.` });
});

// ── Start Server ──
async function startServer() {
  try {
    await initDatabase();
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 AlgoTrack API Server running on http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
