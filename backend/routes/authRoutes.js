const express = require('express');
const router = express.Router();
const { register, login, getMe, listUsers } = require('../controllers/authController');
const { verifyToken, requireSuperAdmin } = require('../middleware/auth');

router.post('/register', verifyToken, requireSuperAdmin, register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.get('/users', verifyToken, requireSuperAdmin, listUsers);

module.exports = router;
