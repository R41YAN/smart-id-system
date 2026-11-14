const express = require('express');
const router = express.Router();
const { register, login, getMe, listUsers } = require('../controllers/authController');
const { verifyToken, requireSuperAdmin } = require('../middleware/auth');
const { loginRateLimit } = require('../middleware/rateLimit');

router.post('/register', verifyToken, requireSuperAdmin, register);
router.post('/login', loginRateLimit, login);
router.get('/me', verifyToken, getMe);
router.get('/users', verifyToken, requireSuperAdmin, listUsers);

module.exports = router;
