const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes       = require('./routes/authRoutes');
const universityRoutes = require('./routes/universityRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const batchRoutes      = require('./routes/batchRoutes');
const studentRoutes    = require('./routes/studentRoutes');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());

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

// 404
app.use((req, res) =>
  res.status(404).json({ message: `${req.method} ${req.path} not found` })
);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Smart ID System API → http://localhost:${PORT}`);
});

module.exports = app;
