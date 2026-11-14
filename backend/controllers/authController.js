const pool = require('../db/connection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config');
const { serverError } = require('../utils/http');

// POST /api/auth/register  — Super Admin creates new user accounts
const register = async (req, res) => {
  const { name, email, password, role, university_id } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'name, email and password are required' });
  if (typeof password !== 'string' || password.length < 8)
    return res.status(400).json({ message: 'password must be at least 8 characters' });
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ message: 'email is not valid' });
  const userRole = role || 'client_admin';
  if (!['super_admin', 'client_admin'].includes(userRole))
    return res.status(400).json({ message: 'role must be super_admin or client_admin' });
  if (userRole === 'client_admin' && !university_id)
    return res.status(400).json({ message: 'university_id is required for a client_admin' });

  try {
    const exists = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (exists.rows.length > 0)
      return res.status(409).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, university_id)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, name, email, role, university_id, created_at`,
      [name, email.toLowerCase().trim(), hash, userRole, userRole === 'client_admin' ? university_id : null]
    );
    res.status(201).json({ message: 'User created', user: result.rows[0] });
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ message: 'University not found' });
    return serverError(res, err, 'Register error');
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'email and password are required' });

  try {
    const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [String(email).trim()]);
    if (result.rows.length === 0)
      return res.status(401).json({ message: 'Invalid credentials' });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, university_id: user.university_id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Fetch rich user profile including university branding
    const profile = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.university_id, 
              un.name AS university_name, un.logo_url AS university_logo, un.type AS university_type
       FROM users u
       LEFT JOIN universities un ON u.university_id = un.id
       WHERE u.id = $1`,
      [user.id]
    );

    res.json({
      message: 'Login successful',
      token,
      user: profile.rows[0] || { id: user.id, name: user.name, email: user.email, role: user.role, university_id: user.university_id },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    const isConnError = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN', '28P01'].includes(err.code)
      || (err.message && (err.message.includes('connect') || err.message.includes('timeout') || err.message.includes('SSL')));

    if (isConnError) {
      return res.status(503).json({
        message: 'Database connection failed. Please ensure your computer is connected to the internet to reach the Cloud Supabase database.'
      });
    }
    return serverError(res, err, 'Login error');
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.university_id, u.created_at,
              un.name AS university_name, un.logo_url AS university_logo, un.type AS university_type
       FROM users u
       LEFT JOIN universities un ON u.university_id = un.id
       WHERE u.id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    return serverError(res, err, 'Auth error');
  }
};

// GET /api/auth/users  — Super Admin lists all users
const listUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.university_id, 
              un.name AS university_name, un.logo_url AS university_logo, un.type AS university_type, u.created_at
       FROM users u LEFT JOIN universities un ON u.university_id = un.id
       ORDER BY u.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    return serverError(res, err, 'Auth error');
  }
};

module.exports = { register, login, getMe, listUsers };
