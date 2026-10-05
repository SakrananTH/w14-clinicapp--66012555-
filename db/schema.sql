-- ==============================================================================
-- Glamour Nails Studio & Clinic App - Azure SQL Database Schema
-- Run this script against your Azure SQL Database in Azure Portal Query Editor
-- Compatible with Azure SQL (IDENTITY, NVARCHAR, DATETIME2)
-- ==============================================================================

IF OBJECT_ID('bookings', 'U') IS NOT NULL DROP TABLE bookings;
IF OBJECT_ID('appointments', 'U') IS NOT NULL DROP TABLE appointments;
IF OBJECT_ID('services', 'U') IS NOT NULL DROP TABLE services;
IF OBJECT_ID('staff', 'U') IS NOT NULL DROP TABLE staff;
IF OBJECT_ID('doctors', 'U') IS NOT NULL DROP TABLE doctors;

-- 1. ตารางบริการทำเล็บ & บิวตี้ (Services)
CREATE TABLE services (
  id           INT             IDENTITY(1,1) PRIMARY KEY,
  category     NVARCHAR(50)    NOT NULL,
  title        NVARCHAR(150)   NOT NULL,
  subtitle     NVARCHAR(150)   NULL,
  description  NVARCHAR(500)   NULL,
  duration     INT             NOT NULL DEFAULT 60,
  price        DECIMAL(10,2)   NOT NULL,
  badge        NVARCHAR(50)    NULL,
  badge_color  NVARCHAR(100)   NULL,
  icon         NVARCHAR(50)    NULL,
  highlights   NVARCHAR(500)   NULL,
  created      DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME()
);

-- 2. ตารางช่างผู้เชี่ยวชาญประจำร้าน (Staff)
CREATE TABLE staff (
  id           INT             IDENTITY(1,1) PRIMARY KEY,
  name         NVARCHAR(100)   NOT NULL,
  nickname     NVARCHAR(50)    NOT NULL,
  title        NVARCHAR(100)   NOT NULL,
  experience   NVARCHAR(50)    NULL,
  rating       DECIMAL(2,1)    NOT NULL DEFAULT 5.0,
  review_count INT             NOT NULL DEFAULT 0,
  avatar       NVARCHAR(50)    NULL,
  specialties  NVARCHAR(255)   NULL,
  created      DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME()
);

-- 3. ตารางการจองคิวทำเล็บ (Bookings)
CREATE TABLE bookings (
  id             INT             IDENTITY(1,1) PRIMARY KEY,
  service_id     INT             NOT NULL,
  staff_id       INT             NOT NULL,
  customer_name  NVARCHAR(200)   NOT NULL,
  customer_phone NVARCHAR(50)    NOT NULL,
  booking_date   DATE            NOT NULL,
  booking_slot   NVARCHAR(50)    NOT NULL,
  total_price    DECIMAL(10,2)   NOT NULL,
  notes          NVARCHAR(500)   NULL,
  status         NVARCHAR(50)    NOT NULL DEFAULT 'confirmed',
  created        DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT fk_bookings_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_staff FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);

CREATE INDEX ix_bookings_date_slot ON bookings (booking_date, booking_slot);

-- 4. ตารางแพทย์และนัดหมาย (Doctors & Appointments) — รองรับ W13 Clinic Lab Rubric 100%
CREATE TABLE doctors (
  id        INT             IDENTITY(1,1) PRIMARY KEY,
  name      NVARCHAR(100)   NOT NULL,
  specialty NVARCHAR(100)   NOT NULL,
  created   DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE appointments (
  id           INT            IDENTITY(1,1) PRIMARY KEY,
  doctor_id    INT            NOT NULL,
  patient_name NVARCHAR(200)  NOT NULL,
  slot         DATETIME2      NOT NULL,
  created      DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT fk_appointments_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE INDEX ix_appointments_slot ON appointments (slot);
