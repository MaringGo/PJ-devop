const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function seedDB() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'rootpassword',
      database: process.env.DB_NAME || 'utilities_db',
    });

    console.log('Connected to database. Seeding data...\n');

    // 1. Create sample users
    const salt = await bcrypt.genSalt(10);
    const hash1 = await bcrypt.hash('admin123', salt);
    const hash2 = await bcrypt.hash('user123', salt);

    await connection.query(`DELETE FROM transactions`);
    await connection.query(`DELETE FROM budget_categories`);
    await connection.query(`DELETE FROM expense_types`);
    await connection.query(`DELETE FROM users`);

    await connection.query(`INSERT INTO users (id, username, password_hash) VALUES 
      (1, 'admin', ?),
      (2, 'user01', ?)
    `, [hash1, hash2]);
    console.log('✅ Users created: admin / admin123, user01 / user123');

    // 2. Create Expense Types (ประเภทค่าใช้จ่าย)
    await connection.query(`INSERT INTO expense_types (id, name, description) VALUES 
      (1, 'ค่าไฟฟ้า', 'ค่าไฟฟ้าประจำเดือน'),
      (2, 'ค่าน้ำประปา', 'ค่าน้ำประปาประจำเดือน'),
      (3, 'ค่าอินเทอร์เน็ต', 'ค่าบริการอินเทอร์เน็ต/WiFi'),
      (4, 'ค่าโทรศัพท์', 'ค่าบริการโทรศัพท์สำนักงาน'),
      (5, 'ค่าเช่าสถานที่', 'ค่าเช่าอาคารสำนักงาน')
    `);
    console.log('✅ Expense Types created: 5 types');

    // 3. Create Budget Categories (หมวดเงินที่ใช้เบิกจ่าย)
    await connection.query(`INSERT INTO budget_categories (id, name, amount, month, year) VALUES 
      (1, 'งบสาธารณูปโภค Q3', 50000.00, 7, 2026),
      (2, 'งบสาธารณูปโภค Q3', 50000.00, 8, 2026),
      (3, 'งบสาธารณูปโภค Q3', 50000.00, 9, 2026),
      (4, 'งบสื่อสาร Q3', 15000.00, 7, 2026),
      (5, 'งบสื่อสาร Q3', 15000.00, 8, 2026),
      (6, 'งบเช่าสถานที่', 30000.00, 7, 2026),
      (7, 'งบเช่าสถานที่', 30000.00, 8, 2026)
    `);
    console.log('✅ Budget Categories created: 7 entries');

    // 4. Create Transactions (รายการค่าใช้จ่ายจริง)
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
    console.log('✅ Transactions created: 12 entries');

    await connection.end();
    console.log('\n🎉 Database seeding completed!');
    console.log('\n📋 Login credentials:');
    console.log('   Username: admin    Password: admin123');
    console.log('   Username: user01   Password: user123');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDB();
