# e-Utilities Cost Management System

ระบบจัดการค่าสาธารณูปโภค พัฒนาด้วย React + Node.js + MariaDB บน Docker

---

## 📋 สารบัญ

- [ฟีเจอร์ระบบ](#ฟีเจอร์ระบบ)
- [Tech Stack](#tech-stack)
- [โครงสร้างโปรเจกต์](#โครงสร้างโปรเจกต์)
- [การติดตั้งและรันระบบ](#การติดตั้งและรันระบบ)
- [Docker Hub](#docker-hub)
- [API Endpoints](#api-endpoints)
- [ข้อมูลตัวอย่าง](#ข้อมูลตัวอย่าง)

---

## ✅ ฟีเจอร์ระบบ

| # | ฟีเจอร์ | สถานะ |
|---|---|---|
| 1 | ออกแบบฐานข้อมูล + Docker Compose (MariaDB + phpMyAdmin) | ✅ |
| 2 | ระบบ Authentication (JWT login/register/logout) | ✅ |
| 3 | CRUD ประเภทค่าใช้จ่าย + หมวดงบประมาณ | ✅ |
| 4 | CRUD รายการค่าใช้จ่าย (ฟอร์ม + ตารางแสดงผล) | ✅ |
| 5 | Dashboard สรุปยอดรายเดือน + กราฟ | ✅ |
| 6 | หน้ารายงานย้อนหลัง/เปรียบเทียบ + Responsive (มือถือ/แท็บเล็ต) | ✅ |
| 7 | Export รายงาน PDF และ Excel (ภาษาไทย) | ✅ |
| 8 | Build Docker image + Push Docker Hub + เอกสาร | ✅ |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite, TailwindCSS v4, Axios, React Router v6, Lucide Icons |
| **Backend** | Node.js 18, Express.js, JWT Authentication |
| **Database** | MariaDB 10.11 |
| **Admin UI** | phpMyAdmin |
| **Export** | PDFKit (Thai font: Sarabun), ExcelJS |
| **Container** | Docker, Docker Compose |

---

## 📁 โครงสร้างโปรเจกต์

```
PJ-devop/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Business logic
│   │   ├── authController.js
│   │   ├── transactionController.js
│   │   ├── expenseTypeController.js
│   │   ├── budgetCategoryController.js
│   │   ├── dashboardController.js
│   │   └── exportController.js
│   ├── middleware/      # JWT auth middleware
│   ├── routes/          # Express routes
│   ├── scripts/         # DB seed script
│   ├── fonts/           # Thai fonts (Sarabun) for PDF
│   ├── server.js
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/  # Layout, ExportButtons, BarChart
│   │   ├── context/     # AuthContext
│   │   └── pages/       # Dashboard, Transactions, Reports, etc.
│   └── Dockerfile
└── docker-compose.yml
```

---

## 🚀 การติดตั้งและรันระบบ

### ความต้องการเบื้องต้น
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Docker Compose v2+

### รันระบบ

```bash
# 1. Clone repository
git clone https://github.com/<your-username>/e-utilities.git
cd e-utilities

# 2. Build และ Start ทุก container
docker-compose up --build -d

# 3. Seed ข้อมูลตัวอย่าง (ครั้งแรก)
docker exec e_utilities_backend node scripts/seedDB.js
```

### URLs

| Service | URL | Credential |
|---|---|---|
| **Frontend** | http://localhost:5173 | - |
| **Backend API** | http://localhost:5000 | - |
| **phpMyAdmin** | http://localhost:8080 | root / rootpassword |

### Login เริ่มต้น

```
Username: admin
Password: admin123
```

---

## 🐳 Docker Hub

Image ทั้งหมดถูก build และ push ขึ้น Docker Hub ภายใต้บัญชี **`chalit06`**:
- **Backend Image:** `chalit06/pj-backend:latest`
- **Frontend Image:** `chalit06/pj-frontend:latest`

### วิธีดึง Image มารัน (Pull & Run):

```bash
# 1. ดึง images ล่าสุดทั้งหมดลงมา
docker compose pull

# 2. รัน container ทั้งหมดในพื้นหลัง (ไม่ต้อง build ใหม่)
docker compose up -d
```

### การ Build & Push เมื่อแก้ไขโค้ด:

```bash
# 1. Login Docker Hub
docker login

# 2. Build images
docker compose build

# 3. Push ขึ้น Docker Hub
docker compose push
```

---

## 📡 API Endpoints

> ⚠️ ทุก endpoint (ยกเว้น /auth) ต้องส่ง Header: `Authorization: Bearer <token>`

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | สมัครสมาชิก |
| POST | `/api/auth/login` | เข้าสู่ระบบ (รับ JWT) |

### Transactions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/transactions` | รายการทั้งหมด |
| POST | `/api/transactions` | เพิ่มรายการ |
| PUT | `/api/transactions/:id` | แก้ไข |
| DELETE | `/api/transactions/:id` | ลบ |

### Dashboard & Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/summary` | สรุปรายเดือน |
| GET | `/api/dashboard/report` | รายงานย้อนหลัง |

### Export
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/export/pdf` | Export PDF ภาษาไทย |
| GET | `/api/export/excel` | Export Excel ภาษาไทย |

Query params: `startMonth`, `startYear`, `endMonth`, `endYear`

---

## 🗄️ Database Schema

```sql
users              -- ผู้ใช้งาน (id, username, password_hash)
expense_types      -- ประเภทค่าใช้จ่าย (id, name, description)
budget_categories  -- หมวดงบประมาณ (id, name, amount, month, year)
transactions       -- รายการ (id, expense_type_id, budget_category_id, amount, date, description)
```

---

## 🌱 ข้อมูลตัวอย่าง

```bash
docker exec e_utilities_backend node scripts/seedDB.js
```

ข้อมูลที่จะถูกเพิ่ม:
- ประเภทค่าใช้จ่าย 5 ประเภท (น้ำประปา, อินเทอร์เน็ต, เช่าสถานที่, โทรศัพท์, ไฟฟ้า)
- หมวดงบประมาณ 3 หมวด
- รายการค่าใช้จ่าย 7 รายการ

---

พัฒนาเพื่อการเรียนรู้ **DevOps & Containerization** | Stack: React + Express + MariaDB + Docker | 2026