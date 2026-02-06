const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');

// Update password dan catat log
router.post('/update', passwordController.updateAndLogPassword);

// Ambil semua log (Untuk Super Admin)
router.get('/logs', passwordController.getPasswordLogs);

module.exports = router;
