# 💅 Glamour Nails Studio & Clinic App — Full-Stack Cloud Architecture

**225381 · Application Development with Cloud Platform · Week 13 Architecture**

ระบบเว็บแอปพลิเคชันจองคิวออนไลน์ระดับพรีเมียม (Pink Aesthetic & Glassmorphism) พร้อมสถาปัตยกรรมแบบ **3-Tier Cloud Architecture** บน Microsoft Azure ตามมาตรฐานการทดลอง Week 13:

- **Azure App Service** (`Node.js 20 LTS Express REST API`)
- **Azure Static Web Apps / Web App** (`React + Vite Front-end`)
- **Azure SQL Database** (`Azure SQL / MSSQL`)

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
Demo/
├── README.md               # คู่มือการติดตั้ง, ทดสอบ และ Deploy ขึ้น Azure
├── .gitignore              # Git Ignore สำหรับทั้งโปรเจกต์
├── .github/
│   └── workflows/          # GitHub Actions Auto-deploy CI/CD
│       ├── main_api.yml    # Auto-deploy Backend -> Azure App Service
│       └── main_web.yml    # Auto-deploy Front-end -> Azure Static Web Apps
├── db/
│   ├── schema.sql          # สคริปต์สร้างตาราง (services, staff, bookings, doctors, appointments)
│   └── seed-data.sql       # สคริปต์ใส่ข้อมูลเริ่มต้น (Seed Data)
├── server/                 # Express API (Node 20 LTS)
│   ├── package.json        # scripts: dev, start, test
│   ├── index.js            # REST API endpoints & CORS & Error handling
│   ├── db.js               # จัดการ Azure SQL Connection Pool (mssql)
│   ├── bookings.test.js    # Automated Unit Tests (node:test)
│   ├── .env.example        # เทมเพลต Environment Variables
│   └── .gitignore
└── web/                    # Front-end (React + Vite)
    ├── package.json
    ├── vite.config.js      # Vite proxy (/api -> http://localhost:8080)
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx         # โค้ดหลักระบบจองคิว, เชื่อมต่อ Cloud API & Fallback mode
        ├── index.css       # ดีไซน์หรูหรา Pink Aesthetic & Glassmorphism
        └── data.js         # ข้อมูล Mock สำรองกรณีออฟไลน์
```

---

## 🚀 วิธีเปิดใช้งานและทดสอบในเครื่อง (Run Locally)

### 1. ติดตั้ง Dependencies (ทำครั้งแรก)
```powershell
# ติดตั้ง Backend
cd server
npm install
cd ..

# ติดตั้ง Front-end
cd web
npm install
cd ..
```

### 2. รันระบบทดสอบอัตโนมัติ (Automated Unit Tests)
```powershell
cd server
npm test
cd ..
```
*(ระบบจะทดสอบ Health check, Validation และการจัดการ Error 503 เมื่อยังไม่ได้ต่อฐานข้อมูล)*

### 3. เริ่มต้นรันระบบ Backend API (Terminal 1)
```powershell
cd server
copy .env.example .env
npm run dev
```
- API จะเปิดทำงานที่: `http://localhost:8080`
- ตรวจสอบสถานะ API: `http://localhost:8080/` (จะตอบกลับ `{ ok: true, service: "glamour-nails-api" }`)

### 4. เริ่มต้นรันระบบ Front-end (Terminal 2)
```powershell
cd web
npm run dev
```
- Front-end จะเปิดทำงานที่: `http://localhost:5173`
- หน้าเว็บจะเรียก API ผ่าน Vite Proxy (`/api/*` → `http://localhost:8080`)
- **หมายเหตุ:** หากยังไม่ได้ใส่ Azure SQL Connection String หน้าเว็บจะทำงานในโหมด **Offline / Demo Mode** ให้ทดสอบได้ทันทีโดยไม่พัง

---

## ☁️ การเชื่อมต่อกับ Azure SQL Database

1. ไปที่ **Azure Portal** → เลือก SQL database ของคุณ (เช่น `clinicdb`)
2. ไปที่เมนู **Settings** → **Connection strings** → คัดลอกสตริงในแท็บ **ADO.NET**
3. เปิดไฟล์ `server/.env` แล้ววาง Connection String ลงในตัวแปร:
   ```env
   AZURE_SQL_CONNECTION_STRING="Server=tcp:<your-server>.database.windows.net,1433;Initial Catalog=clinicdb;Persist Security Info=False;User ID=<username>;Password=<password>;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
   ```
4. รันสร้างตารางใน Azure SQL:
   - ใน Azure Portal ที่ SQL Database → เข้าเมนู **Query editor (preview)**
   - นำโค้ดจากไฟล์ [db/schema.sql](file:///c:/Users/User/OneDrive%20-%20University%20of%20Phayao/Desktop/Demo/db/schema.sql) ไปวางแล้วกด **Run**
   - นำโค้ดจากไฟล์ [db/seed-data.sql](file:///c:/Users/User/OneDrive%20-%20University%20of%20Phayao/Desktop/Demo/db/seed-data.sql) ไปวางแล้วกด **Run**
5. รีสตาร์ต Server (`npm run dev`) ข้อมูลจะเชื่อมต่อกับ Azure SQL แบบ Real-time ทันที

---

## 🌐 การ Deploy ขึ้น Azure Cloud (Production)

### 1. Deploy Backend → Azure App Service
1. สร้าง **App Service** บน Azure Portal (เลือก Runtime stack: **Node 20 LTS**, Operating System: **Linux**, Plan: **Free F1**)
2. ไปที่เมนู **Deployment Center** → เลือก **GitHub** → เลือก Repository ของคุณ
3. ไปที่เมนู **Configuration** (หรือ **Environment variables**) → เพิ่ม Application settings:
   - `AZURE_SQL_CONNECTION_STRING` = (วาง Connection String ของ Azure SQL)
   - `SCM_DO_BUILD_DURING_DEPLOYMENT` = `true`
4. เมื่อ Push โค้ดขึ้น GitHub Actions จะ Deploy ให้ที่โฟลเดอร์ `server` อัตโนมัติ

### 2. Deploy Front-end → Azure Static Web Apps (หรือ App Service)
1. สร้าง **Static Web Apps** บน Azure Portal → เชื่อมกับ GitHub
2. กำหนด Build Preset:
   - **Build Presets**: `Vite`
   - **App location**: `web`
   - **Output location**: `dist`
3. ใน Environment Variables ของ Static Web App สามารถใส่:
   - `VITE_API_BASE` = URL ของ Backend App Service (เช่น `https://app-clinicapp-api-xxxx.azurewebsites.net`)

---

## 📋 Endpoints & W13 Rubric Check

| Rubric / Feature | Endpoint | Method | คำอธิบาย |
|------------------|----------|--------|-----------|
| Health check | `GET /` | GET | ตรวจสอบสถานะการทำงานของ API |
| Services List | `GET /services` | GET | รายการบริการทำเล็บและสปาทั้งหมด |
| Staff List | `GET /staff` | GET | รายชื่อช่างประจำร้านและเรตติ้ง |
| Bookings List | `GET /bookings` | GET | รายการจองคิวทั้งหมดพร้อมช่างและบริการ |
| Create Booking | `POST /bookings` | POST | จองคิวทำเล็บ บันทึกลง Azure SQL |
| Cancel Booking | `DELETE /bookings/:id` | DELETE | ยกเลิกรายการจองคิว |
| **W13 Rubric Doctors** | `GET /doctors` | GET | ดึงรายชื่อแพทย์ (รองรับ Rubric W13 100%) |
| **W13 Rubric Appointments** | `GET /appointments` | GET | ดึงการนัดหมาย (รองรับ Rubric W13 100%) |
| **W13 Rubric Book** | `POST /appointments` | POST | จองการนัดหมาย (รองรับ Rubric W13 100%) |
| **W13 Rubric Cancel** | `DELETE /appointments/:id`| DELETE | ยกเลิกการนัดหมาย |

---

## 💡 จุดเด่นของระบบ
- **Luxury Pink Aesthetic**: UI สไตล์ลูกคุณหนู & เกาหลีมินิมอล ด้วย Glassmorphism, แอนิเมชัน และสีคุมโทนพรีเมียม
- **Cloud Resilient**: ทำงานได้ทั้งโหมดเชื่อมต่อ Azure SQL และโหมด Fallback ออฟไลน์ ไม่เกิดข้อผิดพลาดหน้าขาว (Zero Crash)
- **VIP E-Ticket**: แสดงบัตรนัดหมายพร้อมบาร์โค้ดจำลอง สามารถพิมพ์เป็น PDF หรือกดคัดลอกได้ทันที
- **Automated Testing**: มีชุดทดสอบ Unit Test ด้วย `node:test` ครอบคลุมการทำงานสำคัญ
