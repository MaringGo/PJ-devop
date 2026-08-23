# แผนการทำงานระบบควบคุมและติดตามค่าสาธารณูปโภค (e-utilities-cost)

ระบบนี้จะถูกพัฒนาเป็น Web Application โดยมีเป้าหมายหลักในการจัดการและติดตามค่าสาธารณูปโภคต่างๆ แบ่งแผนการทำงานออกเป็นระยะ (Phases) ดังนี้:

## Technology Stack (เทคโนโลยีที่ใช้)
- **Frontend**: React.js / Vite + TailwindCSS (แนะนำสำหรับการออกแบบ Responsive)
- **Backend**: Node.js + Express.js
- **Database**: MariaDB
- **Database Management**: phpMyAdmin
- **Authentication & Security**: JWT (JSON Web Token) + bcrypt
- **Infrastructure / Deployment**: Docker & Docker Compose

## Phase 1: การออกแบบและวางโครงสร้าง (Architecture & Design)
- **Database Design**: ออกแบบตารางข้อมูลหลัก ได้แก่
  - `Users` (ข้อมูลผู้ใช้งาน, รหัสผ่านที่เข้ารหัสแล้ว)
  - `Expense_Types` (ประเภทค่าใช้จ่าย เช่น ค่าน้ำ, ค่าไฟ)
  - `Budget_Categories` (หมวดเงินที่ใช้เบิกจ่าย)
  - `Transactions` (รายการค่าใช้จ่ายจริง พร้อม Foreign keys เชื่อมประเภทและหมวดเงิน)
- **System Architecture**: กำหนด Tech Stack (เช่น Node.js/Express สำหรับ Backend, React/Vue สำหรับ Frontend, PostgreSQL/MySQL สำหรับ Database)
- **UI/UX Design**: ออกแบบ Wireframe เบื้องต้น เน้นการแสดงผลแบบ Responsive ให้รองรับทั้ง Desktop และ Mobile

## Phase 2: พัฒนาระบบหลังบ้าน (Backend API Development)
- **Authentication**: 
  - สร้าง API สำหรับ Register, Login, และ Logout
  - ใช้ `bcrypt` ในการ Hash รหัสผ่านก่อนบันทึกลงฐานข้อมูล
  - ใช้ `JWT` (JSON Web Token) สำหรับยืนยันตัวตนใน API อื่นๆ
- **Master Data CRUD**:
  - API สำหรับจัดการประเภทค่าใช้จ่าย (Create, Read, Update, Delete)
  - API สำหรับจัดการหมวดเงินที่ใช้เบิกจ่าย
- **Transaction API**:
  - API สำหรับบันทึก แก้ไข ลบ และดึงข้อมูลรายการค่าใช้จ่ายจริงแต่ละเดือน

## Phase 3: พัฒนาระบบหน้าบ้าน (Frontend Development)
- **Setup & Layout**: โครงสร้างโปรเจค และ Layout หลัก (Sidebar, Navbar)
- **Authentication UI**: หน้า Login/Register พร้อมระบบจัดเก็บ JWT Token
- **Master Data UI**: หน้าจัดการประเภทค่าใช้จ่าย และหมวดเงินเบิกจ่าย (Form & Table)
- **Transaction UI**: ฟอร์มบันทึกค่าใช้จ่ายจริง พร้อมรองรับการแสดงผลตารางรายการย้อนหลัง
- **Responsive Design**: ปรับแต่ง CSS/Tailwind ให้แสดงผลได้ดีในทุกขนาดหน้าจอ

## Phase 4: การแสดงผลและรายงาน (Dashboard & Reporting)
- **Dashboard**:
  - สร้างหน้า Dashboard สรุปภาพรวมยอดรวมรายเดือน
  - ติดตั้ง Library กราฟ (เช่น Chart.js หรือ Recharts) เพื่อแสดงสัดส่วนค่าใช้จ่าย 
- **Reporting**:
  - สร้างหน้ารายงานย้อนหลัง สามารถ Filter เลือกช่วงเดือน/ปี ได้
  - สร้างกราฟแท่ง/เส้น เพื่อเปรียบเทียบค่าใช้จ่ายระหว่างเดือน

## Phase 5: การนำขึ้นระบบและการจัดการ (Deployment & Docker)
- **Dockerization**:
  - เขียน `Dockerfile` สำหรับ Backend
  - เขียน `Dockerfile` สำหรับ Frontend (กรณีแยก Container)
  - เขียน `docker-compose.yml` สำหรับเชื่อมต่อ Service ทั้งหมดเข้าด้วยกัน (รวม Database)
- **CI/CD Pipeline (ตัวเลือกเสริม)**:
  - ตั้งค่า GitHub Actions (หรือ GitLab CI) เพื่อทำการ Build Image อัตโนมัติเมื่อมีการ Push Code
- **Docker Hub**:
  - Build Image (`docker build -t e-utilities-cost-app .`)
  - Push Image ขึ้น Docker Hub (`docker push <username>/e-utilities-cost-app:latest`)
- **Testing & QA**: ทดสอบระบบทั้งหมดเพื่อให้มั่นใจว่าพร้อมใช้งาน

---

## รายละเอียดการดำเนินงาน (Implementation Details)

### 1. ฐานข้อมูลและเครื่องมือ (Database & Tools)
- **Docker Compose (`docker-compose.yml`)**:
  - **MariaDB**: เป็น Database หลักสำหรับจัดเก็บข้อมูลทั้งหมด
  - **phpMyAdmin**: สำหรับจัดการ Database ผ่าน Web UI 

### 2. โครงสร้าง Database (MariaDB)
ออกแบบตารางพื้นฐานดังนี้:
- `users`: `id`, `username`, `password_hash`, `created_at`
- `expense_types`: `id`, `name`, `description`
- `budget_categories`: `id`, `name`, `amount`, `month`, `year`
- `transactions`: `id`, `expense_type_id`, `budget_category_id`, `amount`, `date`, `description`, `created_by`

### 3. โครงสร้าง Backend (Node.js/Express)
- **Initialization**: `npm init -y` และติดตั้ง Dependencies (`express`, `mysql2`, `bcrypt`, `jsonwebtoken`, `dotenv`, `cors`)
- **Server Setup**: ไฟล์ `server.js` สำหรับตั้งค่า Express, CORS และเชื่อมต่อกับ MariaDB Database

### 4. ระบบ Authentication
- **Controllers (`authController.js`)**:
  - **Login**: รับ username/password, ตรวจสอบความถูกต้อง (เปรียบเทียบ Hash ผ่าน `bcrypt`), และสร้าง `JWT` ส่งกลับให้ Client
  - **Logout**: ฝั่ง Frontend รับหน้าที่เคลียร์ Token ทิ้ง (หรืออาจทำ Blacklist ฝั่ง Backend หากจำเป็น)
- **Middleware (`authMiddleware.js`)**:
  - ใช้สำหรับดึง Token จาก Headers (Bearer Token), Verify ด้วย `jsonwebtoken`, และดึงข้อมูล User ไปใช้งานต่อ
  - นำไปครอบ Route อื่นๆ เพื่อป้องกันการเข้าถึงจากผู้ที่ยังไม่ล็อกอิน
- **Routes (`authRoutes.js`)**: กำหนด Endpoint `/api/auth/login` และ `/api/auth/logout`
