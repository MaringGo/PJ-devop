const express = require('express');
const router = express.Router();
const expenseTypeController = require('../controllers/expenseTypeController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', expenseTypeController.getAllExpenseTypes);
router.get('/:id', expenseTypeController.getExpenseTypeById);
router.post('/', expenseTypeController.createExpenseType);
router.put('/:id', expenseTypeController.updateExpenseType);
router.delete('/:id', expenseTypeController.deleteExpenseType);

module.exports = router;
