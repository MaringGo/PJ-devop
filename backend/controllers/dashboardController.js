const db = require('../config/db');

exports.getSummary = async (req, res) => {
  try {
    // Total spending this month
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const [monthlyTotal] = await db.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE MONTH(date) = ? AND YEAR(date) = ?',
      [month, year]
    );

    // Total budget this month
    const [monthlyBudget] = await db.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM budget_categories WHERE month = ? AND year = ?',
      [month, year]
    );

    // Count transactions this month
    const [txCount] = await db.query(
      'SELECT COUNT(*) as count FROM transactions WHERE MONTH(date) = ? AND YEAR(date) = ?',
      [month, year]
    );

    // Spending by expense type (current month)
    const [byType] = await db.query(`
      SELECT e.name, COALESCE(SUM(t.amount), 0) as total 
      FROM transactions t 
      JOIN expense_types e ON t.expense_type_id = e.id 
      WHERE MONTH(t.date) = ? AND YEAR(t.date) = ?
      GROUP BY e.name
    `, [month, year]);

    // Monthly spending trend (last 6 months)
    const [trend] = await db.query(`
      SELECT MONTH(date) as month, YEAR(date) as year, COALESCE(SUM(amount), 0) as total
      FROM transactions 
      WHERE date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY YEAR(date), MONTH(date)
      ORDER BY YEAR(date), MONTH(date)
    `);

    // Recent transactions
    const [recent] = await db.query(`
      SELECT t.*, e.name as expense_type_name 
      FROM transactions t 
      LEFT JOIN expense_types e ON t.expense_type_id = e.id 
      ORDER BY t.date DESC LIMIT 5
    `);

    res.json({
      monthlySpending: parseFloat(monthlyTotal[0].total),
      monthlyBudget: parseFloat(monthlyBudget[0].total),
      transactionCount: txCount[0].count,
      byType,
      trend,
      recent
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getReport = async (req, res) => {
  try {
    const { startMonth, startYear, endMonth, endYear } = req.query;

    // Monthly breakdown
    const [monthly] = await db.query(`
      SELECT MONTH(t.date) as month, YEAR(t.date) as year, 
             e.name as expense_type, COALESCE(SUM(t.amount), 0) as total
      FROM transactions t
      JOIN expense_types e ON t.expense_type_id = e.id
      WHERE (YEAR(t.date) > ? OR (YEAR(t.date) = ? AND MONTH(t.date) >= ?))
        AND (YEAR(t.date) < ? OR (YEAR(t.date) = ? AND MONTH(t.date) <= ?))
      GROUP BY YEAR(t.date), MONTH(t.date), e.name
      ORDER BY YEAR(t.date), MONTH(t.date)
    `, [startYear, startYear, startMonth, endYear, endYear, endMonth]);

    // Budget vs Actual
    const [budgetVsActual] = await db.query(`
      SELECT b.month, b.year, b.name as budget_name, b.amount as budget_amount,
             COALESCE(SUM(t.amount), 0) as actual_amount
      FROM budget_categories b
      LEFT JOIN transactions t ON t.budget_category_id = b.id
      WHERE (b.year > ? OR (b.year = ? AND b.month >= ?))
        AND (b.year < ? OR (b.year = ? AND b.month <= ?))
      GROUP BY b.id, b.month, b.year, b.name, b.amount
      ORDER BY b.year, b.month
    `, [startYear, startYear, startMonth, endYear, endYear, endMonth]);

    res.json({ monthly, budgetVsActual });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
