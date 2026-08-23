const db = require('../config/db');

exports.getAllTransactions = async (req, res) => {
  try {
    const query = `
      SELECT t.*, e.name as expense_type_name, b.name as budget_category_name 
      FROM transactions t
      LEFT JOIN expense_types e ON t.expense_type_id = e.id
      LEFT JOIN budget_categories b ON t.budget_category_id = b.id
      ORDER BY t.date DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const query = `
      SELECT t.*, e.name as expense_type_name, b.name as budget_category_name 
      FROM transactions t
      LEFT JOIN expense_types e ON t.expense_type_id = e.id
      LEFT JOIN budget_categories b ON t.budget_category_id = b.id
      WHERE t.id = ?
    `;
    const [rows] = await db.query(query, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createTransaction = async (req, res) => {
  const { expense_type_id, budget_category_id, amount, date, description } = req.body;
  const created_by = req.user.id;
  try {
    const [result] = await db.query(
      'INSERT INTO transactions (expense_type_id, budget_category_id, amount, date, description, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [expense_type_id, budget_category_id, amount, date, description, created_by]
    );
    res.status(201).json({ id: result.insertId, message: 'Transaction created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  const { expense_type_id, budget_category_id, amount, date, description } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE transactions SET expense_type_id = ?, budget_category_id = ?, amount = ?, date = ?, description = ? WHERE id = ?',
      [expense_type_id, budget_category_id, amount, date, description, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM transactions WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
