/**
 * ==============================================================================
 * Glamour Nails Studio - Data Source & Initial Constants
 * ==============================================================================
 * ไฟล์นี้เก็บข้อมูลบริการ (Services), ช่างทำเล็บ (Staff), และรอบเวลา (Time Slots)
 * สามารถเพิ่มหรือแก้ไขรายการบริการและราคาได้จากที่นี่โดยตรง
 */

// หมวดหมู่และรายการบริการทั้งหมด
const SERVICES_DATA = [
  {
    id: 's1',
    category: 'gel',
    title: 'ทาสีเจลพื้นฐาน (มือ)',
    subtitle: 'Classic Gel Manicure',
    description: 'ตัดแต่งทรงเล็บ + เคลียร์หนังสะอาดหมดจด + สีเจลพรีเมียมไม่จำกัดสี',
    duration: 45,
    price: 350,
    badge: 'ยอดนิยม 🔥',
    badgeColor: 'bg-rose-500 text-white',
    icon: '💅',
    highlights: ['แถมฟรีกากเพชร 2 นิ้ว', 'รับประกันสีลอก 7 วัน', 'แถมบำรุงเซรั่มเล็บ']
  },
  {
    id: 's2',
    category: 'art',
    title: 'เพ้นท์ลาย & ตกแต่งอะไหล่เกาหลี',
    subtitle: 'Korean Nail Art & Charms',
    description: 'งานลายอาร์ต, ไล่สี Ombre, ลายหินอ่อน, ฝังกลิตเตอร์ หรือติดชาร์มคริสตัล 2-4 นิ้ว',
    duration: 75,
    price: 650,
    badge: 'แนะนำ ✨',
    badgeColor: 'bg-gradient-to-r from-amber-500 to-pink-500 text-white',
    icon: '🎨',
    highlights: ['มีแบบให้เลือกกว่า 200+ ลาย', 'สามารถนำเรฟส่วนตัวมาให้ช่างดูได้', 'ติดอะไหล่แน่นทน']
  },
  {
    id: 's3',
    category: 'extension',
    title: 'ต่อเล็บ PVC นุ่ม + ทาสีเจล',
    subtitle: 'Soft Gel Extension',
    description: 'ต่อความยาวทรงสวย ไม่หลอกตา แนบสนิทเนื้อเล็บ ทนทาน 3-4 สัปดาห์ พร้อมทำสีเจล',
    duration: 90,
    price: 890,
    badge: 'ขายดี 👑',
    badgeColor: 'bg-purple-600 text-white',
    icon: '💎',
    highlights: ['เลือกทรงเล็บได้ (Square/Almond/Coffin)', 'เบาสบายไม่หนักหน้าเล็บ', 'ทนน้ำทนเหงื่อ']
  },
  {
    id: 's4',
    category: 'spa',
    title: 'สปาดูแลผิวมือ & เล็บแบบองค์รวม',
    subtitle: 'Luxury Hand & Nail Spa',
    description: 'แช่อโรมา สครับผลัดเซลล์ผิว มาร์กคอลลาเจน นวดผ่อนคลาย และเคลือบเคราตินบำรุงล้ำลึก',
    duration: 60,
    price: 500,
    badge: 'ผ่อนคลาย 🌸',
    badgeColor: 'bg-emerald-600 text-white',
    icon: '🧴',
    highlights: ['สครับกลิ่นกุหลาบออร์แกนิก', 'ผิวมือนุ่มกระจ่างใสทันที', 'นวดกดจุดคลายกล้ามเนื้อมือ']
  },
  {
    id: 's5',
    category: 'art',
    title: 'ต่อเล็บโพลีเจล + ฝังลายออมเบร',
    subtitle: 'Polygel Master Art',
    description: 'ต่อเล็บเทคนิคโพลีเจล เบาสบายแข็งแรงที่สุด ไล่เฉดสีนุ่มละมุน สไตล์ลูกคุณหนู',
    duration: 105,
    price: 1190,
    badge: 'พรีเมียม 🌟',
    badgeColor: 'bg-amber-600 text-white',
    icon: '✨',
    highlights: ['ความทนทาน 4-6 สัปดาห์', 'ไม่ทำร้ายหน้าเล็บจริง', 'แถมฟรีบำรุงเคลือบเงาระดับ HD']
  },
  {
    id: 's6',
    category: 'care',
    title: 'ถอดเล็บเจลเดิม + บำรุงหน้าเล็บ',
    subtitle: 'Gel Removal & Repair',
    description: 'ถอดสีเจลหรือเล็บต่ออย่างทะนุถนอมด้วยเครื่องเจียรพิเศษ หน้าเล็บไม่บาง พร้อมทรีตเมนต์เคราติน',
    duration: 35,
    price: 200,
    badge: 'ทะนุถนอม 🌿',
    badgeColor: 'bg-teal-600 text-white',
    icon: '🫧',
    highlights: ['เครื่องเจียรหัวเซรามิกไม่ร้อนเล็บ', 'ฟื้นฟูเล็บบางเล็บฉีก', 'ตะไบทรงเล็บใหม่ฟรี']
  }
];

// ข้อมูลช่างทำเล็บ (Staff Members)
const STAFF_DATA = [
  {
    id: 'any',
    name: 'ช่างคนใดก็ได้',
    title: 'Fastest Available Slot',
    experience: 'คิวเร็วที่สุด / ระบบจัดช่างที่มีความพร้อมให้',
    avatar: '✨',
    rating: '5.0',
    reviewCount: '1.2k+',
    skills: ['คิวเร็ว', 'ทุกสไตล์']
  },
  {
    id: 'st1',
    name: 'ช่างแนน (Master Stylist)',
    title: 'Head Technician',
    experience: 'ประสบการณ์ 6 ปี เชี่ยวชาญงานต่อทรงและงานเจลพรีเมียม',
    avatar: '💅',
    rating: '4.9',
    reviewCount: '480+',
    skills: ['ต่อเล็บ PVC', 'งานทรงหรู']
  },
  {
    id: 'st2',
    name: 'ช่างมายด์ (Nail Artist)',
    title: 'Senior Nail Artist',
    experience: 'ประสบการณ์ 4 ปี เชี่ยวชาญงานเพ้นท์เกาหลี ลายหินอ่อน มินิมอล',
    avatar: '🎨',
    rating: '5.0',
    reviewCount: '390+',
    skills: ['งานเพ้นท์', 'Ombre เกาหลี']
  },
  {
    id: 'st3',
    name: 'ช่างแพรว (Spa & Treatment)',
    title: 'Care & Spa Specialist',
    experience: 'ประสบการณ์ 5 ปี เชี่ยวชาญงานสปามือเท้า นวดผ่อนคลายและดูแลเล็บฉีก',
    avatar: '🌸',
    rating: '4.8',
    reviewCount: '260+',
    skills: ['สปามือ', 'ฟื้นฟูเล็บ']
  }
];

// รอบเวลามาตรฐานในแต่ละวัน แบ่งตามช่วงเวลา
const TIME_SLOTS = {
  morning: [
    { time: '10:00', label: 'เช้า' },
    { time: '11:15', label: 'เช้า' },
    { time: '12:30', label: 'บ่าย' }
  ],
  afternoon: [
    { time: '13:45', label: 'บ่าย' },
    { time: '15:00', label: 'บ่าย' },
    { time: '16:15', label: 'เย็น' },
    { time: '17:30', label: 'เย็น' },
    { time: '18:45', label: 'ค่ำ' }
  ]
};

// รวมรอบเวลาทั้งหมดเป็น Array
const ALL_SLOTS = [
  ...TIME_SLOTS.morning.map(s => s.time),
  ...TIME_SLOTS.afternoon.map(s => s.time)
];

// Storage Keys สำหรับบันทึกใน Browser
const STORAGE_KEY_BOOKINGS = 'glamour_nail_bookings_v2';
const STORAGE_KEY_AZURE = 'glamour_nail_azure_api_url';
