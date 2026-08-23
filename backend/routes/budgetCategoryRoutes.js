const express = require('express');
const router = express.Router();
const budgetCategoryController = require('../controllers/budgetCategoryController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', budgetCategoryController.getAllBudgetCategories);
router.get('/:id', budgetCategoryController.getBudgetCategoryById);
router.post('/', budgetCategoryController.createBudgetCategory);
router.put('/:id', budgetCategoryController.updateBudgetCategory);
router.delete('/:id', budgetCategoryController.deleteBudgetCategory);

module.exports = router;
