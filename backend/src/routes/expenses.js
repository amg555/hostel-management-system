// src/routes/expenses.js
const router = require('express').Router();
const expenseController = require('../controllers/expenseController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', authenticate, authorize(['admin']), expenseController.getAllExpenses.bind(expenseController));
router.get('/report', authenticate, authorize(['admin']), expenseController.getExpenseReport.bind(expenseController));
router.get('/recurring', authenticate, authorize(['admin']), expenseController.getRecurringExpenses.bind(expenseController));
router.get('/:id', authenticate, authorize(['admin']), expenseController.getExpenseById.bind(expenseController));
router.post('/', authenticate, authorize(['admin']), expenseController.createExpense.bind(expenseController));
router.put('/:id', authenticate, authorize(['admin']), expenseController.updateExpense.bind(expenseController));
router.delete('/:id', authenticate, authorize(['admin']), expenseController.deleteExpense.bind(expenseController));

module.exports = router;