const express = require('express');
const roleController = require('../controllers/roleController');
const router = express.Router();


// Role routes
router.get('/', roleController.getAllRoles); // Get all roles
router.post('/', roleController.createRole); // Create a role
router.get('/:id', roleController.getRoleById); // Get a specific role
router.put('/:id', roleController.updateRole); // Update a role
router.delete('/:id', roleController.deleteRole); // Delete a role

module.exports = router;
