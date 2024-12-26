const express = require('express')
const router = express.Router()
const CompanyCategoryController = require('../controllers/companyCategoryController')

router.get('/get-all-company-categories', CompanyCategoryController.getAllCompanyCategories)
router.post('/add-company-category', CompanyCategoryController.addCategory)
router.delete('/delete-company-category/:categoryId', CompanyCategoryController.deleteCategory)
router.put('/update-company-category/:categoryId', CompanyCategoryController.updateCategory)

module.exports = router