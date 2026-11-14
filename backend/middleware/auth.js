const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const requireSuperAdmin = (req, res, next) => {
  if (req.user?.role !== 'super_admin')
    return res.status(403).json({ message: 'Super Admin access required' });
  next();
};

const requireClientAdmin = (req, res, next) => {
  if (req.user?.role !== 'client_admin')
    return res.status(403).json({ message: 'Client Admin access required' });
  next();
};

const requireAnyAdmin = (req, res, next) => {
  if (!['super_admin', 'client_admin'].includes(req.user?.role))
    return res.status(403).json({ message: 'Admin access required' });
  next();
};

module.exports = { verifyToken, requireSuperAdmin, requireClientAdmin, requireAnyAdmin };
