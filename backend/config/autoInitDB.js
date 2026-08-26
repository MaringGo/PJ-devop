const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function autoInitAndSeed(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Connecting to database (Attempt ${i + 1}/${retries})...`);
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'db',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'rootpassword',
      });

      // 1. Create database if not exists
      const dbName = process.env.DB_NAME || 'utilities_db';
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
      await connection.query(`USE \`${dbName}\``);

      // 2. Create tables
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS expense_types (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT
        )
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS budget_categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          month INT NOT NULL,
          year INT NOT NULL
        )
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS transactions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          expense_type_id INT,
          budget_category_id INT,
          amount DECIMAL(10, 2) NOT NULL,
          date DATE NOT NULL,
          description TEXT,
          created_by INT,
          FOREIGN KEY (expense_type_id) REFERENCES expense_types(id) ON DELETE SET NULL,
          FOREIGN KEY (budget_category_id) REFERENCES budget_categories(id) ON DELETE SET NULL,
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
        )
      `);

      // 3. Check if users table is empty -> If empty, seed initial data
      const [users] = await connection.query(`SELECT COUNT(*) as count FROM users`);
      if (users[0].count === 0) {
        console.log('Database tables ready but empty. Seeding initial data...');

        const salt = await bcrypt.genSalt(10);
        const hash1 = await bcrypt.hash('admin123', salt);
        const hash2 = await bcrypt.hash('user123', salt);

        await connection.query(`INSERT INTO users (id, username, password_hash) VALUES 
          (1, 'admin', ?),
          (2, 'user01', ?)
        `, [hash1, hash2]);

        await connection.query(`INSERT INTO expense_types (id, name, description) VALUES 
          (1, 'ค่าไฟฟ้า', 'ค่าไฟฟ้าประจำเดือน'),
          (2, 'ค่าน้ำประปา', 'ค่าน้ำประปาประจำเดือน'),
          (3, 'ค่าอินเทอร์เน็ต', 'ค่าบริการอินเทอร์เน็ต/WiFi'),
          (4, 'ค่าโทรศัพท์', 'ค่าบริการโทรศัพท์สำนักงาน'),
          (5, 'ค่าเช่าสถานที่', 'ค่าเช่าอาคารสำนักงาน')
        `);

        await connection.query(`INSERT INTO budget_categories (id, name, amount, month, year) VALUES 
          (1, 'งบสาธารณูปโภค Q3', 50000.00, 7, 2026),
          (2, 'งบสาธารณูปโภค Q3', 50000.00, 8, 2026),
          (3, 'งบสาธารณูปโภค Q3', 50000.00, 9, 2026),
          (4, 'งบสื่อสาร Q3', 15000.00, 7, 2026),
          (5, 'งบสื่อสาร Q3', 15000.00, 8, 2026),
          (6, 'งบเช่าสถานที่', 30000.00, 7, 2026),
          (7, 'งบเช่าสถานที่', 30000.00, 8, 2026)
        `);

        await connection.query(`INSERT INTO transactions (expense_type_id, budget_category_id, amount, date, description, created_by) VALUES 
          (1, 1, 8500.00,  '2026-07-05', 'ค่าไฟฟ้า เดือน มิ.ย. 2026', 1),
          (2, 1, 2300.00,  '2026-07-05', 'ค่าน้ำประปา เดือน มิ.ย. 2026', 1),
          (3, 4, 1200.00,  '2026-07-10', 'ค่าอินเทอร์เน็ต เดือน ก.ค. 2026', 1),
          (4, 4, 800.00,   '2026-07-10', 'ค่าโทรศัพท์ เดือน ก.ค. 2026', 1),
          (5, 6, 25000.00, '2026-07-01', 'ค่าเช่าสำนักงาน เดือน ก.ค. 2026', 1),
          (1, 2, 9200.00,  '2026-08-05', 'ค่าไฟฟ้า เดือน ก.ค. 2026', 1),
          (2, 2, 2100.00,  '2026-08-05', 'ค่าน้ำประปา เดือน ก.ค. 2026', 1),
          (3, 5, 1200.00,  '2026-08-10', 'ค่าอินเทอร์เน็ต เดือน ส.ค. 2026', 2),
          (4, 5, 950.00,   '2026-08-10', 'ค่าโทรศัพท์ เดือน ส.ค. 2026', 2),
          (5, 7, 25000.00, '2026-08-01', 'ค่าเช่าสำนักงาน เดือน ส.ค. 2026', 1),
          (1, 2, 7800.00,  '2026-08-20', 'ค่าไฟฟ้า (ส่วนเพิ่มเติม OT)', 2),
          (2, 2, 1500.00,  '2026-08-22', 'ค่าน้ำประปา (ค่าซ่อมท่อ)', 1)
        `);
        console.log('✅ Initial database seed completed successfully!');
      } else {
        console.log('✅ Database tables and data already exist.');
      }

      await connection.end();
      return true;
    } catch (err) {
      console.log(`Database connection not ready yet: ${err.message}. Retrying in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  console.error('❌ Could not initialize database after maximum retries.');
}

module.exports = autoInitAndSeed;
