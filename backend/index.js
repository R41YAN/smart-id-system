const express = require('express');
const cors = require('cors');
require('./config'); // loads backend/.env and validates secrets

const authRoutes       = require('./routes/authRoutes');
const universityRoutes = require('./routes/universityRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const batchRoutes      = require('./routes/batchRoutes');
const studentRoutes    = require('./routes/studentRoutes');
const trashRoutes      = require('./routes/trashRoutes');

const app = express();

app.disable('x-powered-by');

// Basic security headers (no extra dependency needed)
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Cross-Origin-Resource-Policy': 'same-site',
  });
  next();
});

// Allowed frontend origins: CORS_ORIGINS=https://a.com,https://b.com (defaults to local dev)
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Photos/logos are resized in the browser before upload, so 3 MB is plenty
app.use(express.json({ limit: '3mb' }));
app.use(express.urlencoded({ extended: true, limit: '3mb' }));

// Health check
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// Routes
app.use('/api/auth',         authRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/departments',  departmentRoutes);
app.use('/api/batches',      batchRoutes);
app.use('/api/students',     studentRoutes);
app.use('/api/trash',        trashRoutes);

// 404
app.use((req, res) =>
  res.status(404).json({ message: `${req.method} ${req.path} not found` })
);

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large')
    return res.status(413).json({ message: 'Upload is too large (max 3 MB). Please use a smaller image.' });
  if (err.type === 'entity.parse.failed')
    return res.status(400).json({ message: 'Invalid JSON body' });
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

// An uncaught exception leaves the process in an unknown state: log it and exit,
// so nodemon / the hosting platform restarts a clean server.
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception — shutting down:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('⚠️ Unhandled Rejection:', reason);
});

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Smart ID System API → http://localhost:${PORT}`);
  });
}

module.exports = app;
