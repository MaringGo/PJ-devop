const db = require('../config/db');

exports.getAllBudgetCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM budget_categories');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getBudgetCategoryById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM budget_categories WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createBudgetCategory = async (req, res) => {
  const { name, amount, month, year } = req.body;
  try {
    const [result] = await db.query('INSERT INTO budget_categories (name, amount, month, year) VALUES (?, ?, ?, ?)', [name, amount, month, year]);
    res.status(201).json({ id: result.insertId, name, amount, month, year });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateBudgetCategory = async (req, res) => {
  const { name, amount, month, year } = req.body;
  try {
    const [result] = await db.query('UPDATE budget_categories SET name = ?, amount = ?, month = ?, year = ? WHERE id = ?', [name, amount, month, year, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteBudgetCategory = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM budget_categories WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
