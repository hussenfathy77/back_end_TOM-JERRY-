const express = require('express');
const router = express.Router();
const { login, register, getMe, teacherLogin } = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');

// Parent / All-roles login
router.post('/login', login);

// Teacher Portal specific login (only allows TEACHER / ADMIN roles)
// Accepts: { username, password, rememberMe }
router.post('/teacher-login', teacherLogin);

// Parent Registration
router.post('/register', register);

// Get current user profile
router.get('/me', authenticateToken, getMe);

module.exports = router;

