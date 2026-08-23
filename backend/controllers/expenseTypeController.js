const db = require('../config/db');

exports.getAllExpenseTypes = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM expense_types');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getExpenseTypeById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM expense_types WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createExpenseType = async (req, res) => {
  const { name, description } = req.body;
  try {
    const [result] = await db.query('INSERT INTO expense_types (name, description) VALUES (?, ?)', [name, description]);
    res.status(201).json({ id: result.insertId, name, description });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateExpenseType = async (req, res) => {
  const { name, description } = req.body;
  try {
    const [result] = await db.query('UPDATE expense_types SET name = ?, description = ? WHERE id = ?', [name, description, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteExpenseType = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM expense_types WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
