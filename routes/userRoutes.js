const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

// User routes
router.get('/get-all-users', userController.getAllUsers); // Get all users
router.post('/', userController.createUser); // Create a user
router.get('/:id', userController.getUserById); // Get a specific user
router.put('/:id', userController.updateUser); // Update a user
router.delete('/:id', userController.deleteUserByUserId); // Delete a user

module.exports = router;
