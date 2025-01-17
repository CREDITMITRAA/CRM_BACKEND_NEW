const express = require("express");
const router = express.Router();

// Import route files
const userRoutes = require("./userRoutes");
const roleRoutes = require("./roleRoutes");
const authRoutes = require("./authRoutes");
const leadRoutes = require("./leadRoutes");
const leadAssignmentRoutes = require('./leadAssignmentRoutes')
const activityRoutes = require('./activityRoutes')
const companyCategoryRoutes = require('./companyCategoryRoutes')
const loanReportsRoutes = require('./loanReportRoutes')
const creditReportRoutes = require('./creditReportRoutes')
const dashboardRoutes = require('./dashboardRoutes')
const walkInRoutes = require('./walkInRoutes')
const filesUploadRoutes = require('./filesUploadRoutes')
const leadDocumentRoutes = require('./leadDocumentRoutes')
// Add more routes as needed...

// Set up routes
router.use("/users", userRoutes); // User-related routes
router.use("/roles", roleRoutes); // Role-related routes
router.use("/auth", authRoutes);
router.use("/leads", leadRoutes);
router.use('/lead-assignments', leadAssignmentRoutes)
router.use('/activities', activityRoutes)
router.use('/company-categories', companyCategoryRoutes)
router.use('/loan-reports', loanReportsRoutes)
router.use('/credit-reports', creditReportRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/walk-ins', walkInRoutes)
router.use('/uploads', filesUploadRoutes)
router.use('/lead-documents', leadDocumentRoutes)
// Add more routes with appropriate paths...

// Export the router
module.exports = router;
