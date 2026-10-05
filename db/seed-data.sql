-- ==============================================================================
-- Glamour Nails Studio & Clinic App - Seed Data for Azure SQL
-- Run this script in Azure Portal Query Editor after schema.sql
-- ==============================================================================

-- 1. เพิ่มข้อมูลบริการทำเล็บ (Services)
INSERT INTO services (category, title, subtitle, description, duration, price, badge, badge_color, icon, highlights)
VALUES 
(
  N'gel', 
  N'ทาสีเจลพื้นฐาน (มือ)', 
  N'Classic Gel Manicure', 
  N'ตัดแต่งทรงเล็บ + เคลียร์หนังสะอาดหมดจด + สีเจลพรีเมียมไม่จำกัดสี', 
  45, 
  350.00, 
  N'ยอดนิยม 🔥', 
  N'bg-rose-500 text-white', 
  N'💅', 
  N'แถมฟรีกากเพชร 2 นิ้ว,รับประกันสีลอก 7 วัน,แถมบำรุงเซรั่มเล็บ'
),
(
  N'art', 
  N'เพ้นท์ลาย & ตกแต่งอะไหล่เกาหลี', 
  N'Korean Nail Art & Charms', 
  N'งานลายอาร์ต, ไล่สี Ombre, ลายหินอ่อน, ฝังกลิตเตอร์ หรือติดชาร์มคริสตัล 2-4 นิ้ว', 
  75, 
  650.00, 
  N'แนะนำ ✨', 
  N'bg-gradient-to-r from-amber-500 to-pink-500 text-white', 
  N'🎨', 
  N'มีแบบให้เลือกกว่า 200+ ลาย,นำเรฟส่วนตัวมาให้ช่างดูได้,ติดอะไหล่แน่นทน'
),
(
  N'extension', 
  N'ต่อเล็บ PVC นุ่ม + ทาสีเจล', 
  N'Soft Gel Extension', 
  N'ต่อความยาวทรงสวย ไม่หลอกตา แนบสนิทเนื้อเล็บ ทนทาน 3-4 สัปดาห์ พร้อมทำสีเจล', 
  90, 
  890.00, 
  N'ขายดี 👑', 
  N'bg-purple-600 text-white', 
  N'💎', 
  N'เลือกทรงเล็บได้ (Square/Almond/Coffin),เบาสบายไม่หนักหน้าเล็บ,ทนน้ำทนเหงื่อ'
),
(
  N'spa', 
  N'สปาดูแลผิวมือ & เล็บแบบองค์รวม', 
  N'Luxury Hand & Nail Spa', 
  N'แช่อโรมา สครับผลัดเซลล์ผิว มาร์กคอลลาเจน นวดผ่อนคลาย และเคลือบเคราตินบำรุงล้ำลึก', 
  60, 
  500.00, 
  N'ผ่อนคลาย 🌸', 
  N'bg-emerald-600 text-white', 
  N'🧴', 
  N'ผลิตภัณฑ์ Organic เกรดพรีเมียม,ผิวนุ่มกระจ่างใสทันที,นวดผ่อนคลาย 20 นาที'
);

-- 2. เพิ่มข้อมูลช่างประจำร้าน (Staff)
INSERT INTO staff (name, nickname, title, experience, rating, review_count, avatar, specialties)
VALUES
(N'ช่างจอย (Nail Master)', N'จอย', N'Senior Nail Artist & Spa Specialist', N'ประสบการณ์ 6 ปี', 5.0, 142, N'👩🏻‍🎨', N'ลายหินอ่อน, ต่อเล็บ PVC, สปาออร์แกนิก'),
(N'ช่างมิน (Korean Style)', N'มิน', N'Korean Gel Art Specialist', N'ประสบการณ์ 4 ปี', 4.9, 98, N'👱🏻‍♀️', N'งานมินิมอลเกาหลี, ติดชาร์มคริสตัล, ไล่สี Ombre'),
(N'ช่างแพรว (Gel Extension Pro)', N'แพรว', N'Extension & Sculpting Expert', N'ประสบการณ์ 5 ปี', 4.9, 115, N'👩🏼‍🦰', N'ต่อเล็บโพลีเจล, ทรงคอฟฟิน, เพ้นท์การ์ตูน 3D'),
(N'ช่างพลอย (Care & Spa)', N'พลอย', N'Hand & Foot Spa Therapist', N'ประสบการณ์ 3 ปี', 4.8, 86, N'👩🏻', N'เคลียร์หนังละเอียด, สปาผิวเนียนนุ่ม, ทาสีลูกแก้ว Cat Eye');

-- 3. เพิ่มข้อมูลแพทย์ตัวอย่าง (Doctors) — รองรับ Rubric W13
INSERT INTO doctors (name, specialty)
VALUES
(N'นพ. ธีรภัทร วัฒนพาณิชย์', N'อายุรกรรมทั่วไป (Internal Medicine)'),
(N'พญ. นภัสสร จิตติโภคิน', N'ผิวหนังและความงาม (Dermatology & Aesthetics)'),
(N'นพ. กฤษดา เมธาพิริยะ', N'กระดูกและข้อ (Orthopedics)'),
(N'พญ. ธนพร ศุภลักษณ์', N'เวชศาสตร์ชะลอวัย (Anti-Aging & Wellness)'),
(N'นพ. ปวริศ เกียรติสกุล', N'ศัลยกรรมตกแต่ง (Plastic Surgery)');

-- 4. เพิ่มการนัดหมายตัวอย่าง (Sample Appointments / Bookings)
INSERT INTO appointments (doctor_id, patient_name, slot)
VALUES
(2, N'คุณสุดา สุวรรณมาศ', DATEADD(hour, 14, CAST(CAST(GETDATE() AS DATE) AS DATETIME2))),
(1, N'คุณวีระชัย วงศ์สวัสดิ์', DATEADD(hour, 10, CAST(CAST(DATEADD(day, 1, GETDATE()) AS DATE) AS DATETIME2)));

INSERT INTO bookings (service_id, staff_id, customer_name, customer_phone, booking_date, booking_slot, total_price, notes)
VALUES
(1, 1, N'คุณมนัสวี อัครเดช', N'081-234-5678', CAST(GETDATE() AS DATE), N'14:00', 350.00, N'ขอโทนสีชมพูไซรัปสุขภาพดี'),
(2, 2, N'คุณกนกวรรณ ศรีสุข', N'089-876-5432', CAST(DATEADD(day, 1, GETDATE()) AS DATE), N'15:30', 650.00, N'ต้องการติดชาร์มโบว์และหัวใจคริสตัล');
