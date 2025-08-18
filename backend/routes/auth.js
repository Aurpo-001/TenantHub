const express = require('express');
const {
    register,
    login,
    getMe,
    updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes (NO protect middleware)
router.post('/register', register);
router.post('/login', login);

// Private routes (WITH protect middleware)
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;