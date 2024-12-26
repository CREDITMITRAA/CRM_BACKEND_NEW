const express = require('express');
const router = express.Router();
const LoginController = require('./../controllers/authController')

router.post('/login',LoginController.login)
// router.post('/refresh',LoginController.refresh)

module.exports = router