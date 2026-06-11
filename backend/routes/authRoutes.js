const express = require('express');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.getProfile);
router.put('/me', auth, authController.updateProfile);
router.put('/password', auth, authController.updatePassword);

module.exports = router;
