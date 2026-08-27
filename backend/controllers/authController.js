const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = async (req, res) => {
  const { username, password, full_name, email, department } = req.body;
  try {
    const [existing] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await db.query(
      'INSERT INTO users (username, password_hash, full_name, email, department) VALUES (?, ?, ?, ?, ?)',
      [username, password_hash, full_name || '', email || '', department || 'สำนักงาน']
    );
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const userData = {
      id: user.id,
      username: user.username,
      full_name: user.full_name || user.username,
      email: user.email || '',
      phone: user.phone || '',
      department: user.department || 'สำนักงาน',
      role: user.role || 'ผู้ใช้งานทั่วไป',
      avatar_color: user.avatar_color || '#6366f1',
      bio: user.bio || ''
    };

    const payload = { user: userData };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: userData });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [users] = await db.query(
      'SELECT id, username, full_name, email, phone, department, role, avatar_color, bio, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Get user stats (total transactions and total amount recorded by this user)
    const [stats] = await db.query(
      'SELECT COUNT(*) as tx_count, COALESCE(SUM(amount), 0) as tx_total FROM transactions WHERE created_by = ?',
      [userId]
    );

    // Get recent 5 transactions created by this user
    const [recentTransactions] = await db.query(
      `SELECT t.id, t.amount, t.date, t.description, 
              e.name as expense_type_name, b.name as budget_category_name
       FROM transactions t
       LEFT JOIN expense_types e ON t.expense_type_id = e.id
       LEFT JOIN budget_categories b ON t.budget_category_id = b.id
       WHERE t.created_by = ?
       ORDER BY t.date DESC, t.id DESC
       LIMIT 5`,
      [userId]
    );

    res.json({
      user,
      stats: {
        tx_count: stats[0].tx_count || 0,
        tx_total: parseFloat(stats[0].tx_total || 0)
      },
      recent_transactions: recentTransactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { full_name, email, phone, department, avatar_color, bio } = req.body;

  try {
    await db.query(
      `UPDATE users 
       SET full_name = ?, email = ?, phone = ?, department = ?, avatar_color = ?, bio = ? 
       WHERE id = ?`,
      [
        full_name || '',
        email || '',
        phone || '',
        department || 'สำนักงาน',
        avatar_color || '#6366f1',
        bio || '',
        userId
      ]
    );

    const [users] = await db.query(
      'SELECT id, username, full_name, email, phone, department, role, avatar_color, bio, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      message: 'อัปเดตโปรไฟล์เรียบร้อยแล้ว',
      user: users[0]
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  const userId = req.user.id;
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ message: 'กรุณาระบุรหัสผ่านปัจจุบันและรหัสผ่านใหม่' });
  }

  if (new_password.length < 6) {
    return res.status(400).json({ message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร' });
  }

  try {
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(new_password, salt);

    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, userId]);

    res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

