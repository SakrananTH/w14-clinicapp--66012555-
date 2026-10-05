export const INITIAL_SERVICES = [
  {
    id: 1,
    category: 'gel',
    title: 'ทาสีเจลพื้นฐาน (มือ)',
    subtitle: 'Classic Gel Manicure',
    description: 'ตัดแต่งทรงเล็บ เคลียร์หนังสะอาดหมดจด สีเจลพรีเมียมไม่จำกัดสี',
    duration: 45,
    price: 350,
    badge: 'ยอดนิยม',
    badgeColor: 'bg-rose-50 text-rose-600 border border-rose-200',
    iconType: 'gel',
    highlights: ['แถมฟรีกากเพชร 2 นิ้ว', 'รับประกันสีลอก 7 วัน', 'แถมบำรุงเซรั่มเล็บ']
  },
  {
    id: 2,
    category: 'art',
    title: 'เพ้นท์ลาย & ตกแต่งอะไหล่เกาหลี',
    subtitle: 'Korean Nail Art & Charms',
    description: 'งานลายอาร์ต, ไล่สี Ombre, ลายหินอ่อน, ฝังกลิตเตอร์ หรือติดชาร์มคริสตัล 2-4 นิ้ว',
    duration: 75,
    price: 650,
    badge: 'แนะนำ',
    badgeColor: 'bg-amber-50 text-amber-700 border border-amber-200',
    iconType: 'art',
    highlights: ['มีแบบให้เลือกกว่า 200+ ลาย', 'สามารถนำเรฟส่วนตัวมาให้ช่างดูได้', 'ติดอะไหล่แน่นทน']
  },
  {
    id: 3,
    category: 'extension',
    title: 'ต่อเล็บ PVC นุ่ม + ทาสีเจล',
    subtitle: 'Soft Gel Extension',
    description: 'ต่อความยาวทรงสวย แนบสนิทเนื้อเล็บ ทนทาน 3-4 สัปดาห์ พร้อมทำสีเจล',
    duration: 90,
    price: 890,
    badge: 'ขายดี',
    badgeColor: 'bg-purple-50 text-purple-700 border border-purple-200',
    iconType: 'extension',
    highlights: ['เลือกทรงเล็บได้ (Square/Almond)', 'เบาสบายไม่หนักหน้าเล็บ', 'ทนน้ำทนเหงื่อ']
  },
  {
    id: 4,
    category: 'spa',
    title: 'สปาดูแลผิวมือ & เล็บแบบองค์รวม',
    subtitle: 'Luxury Hand & Nail Spa',
    description: 'แช่อโรมา สครับผลัดเซลล์ผิว มาร์กคอลลาเจน นวดผ่อนคลาย เคลือบเคราติน',
    duration: 60,
    price: 500,
    badge: 'ผ่อนคลาย',
    badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    iconType: 'spa',
    highlights: ['ผลิตภัณฑ์ Organic เกรดพรีเมียม', 'ผิวนุ่มกระจ่างใสทันที', 'นวดผ่อนคลาย 20 นาที']
  }
];

export const INITIAL_STAFF = [
  {
    id: 1,
    name: 'ช่างจอย',
    fullName: 'ช่างจอย (Nail Master)',
    nickname: 'จอย',
    title: 'Senior Nail Artist',
    experience: 'ประสบการณ์ 6 ปี',
    rating: 5.0,
    reviewCount: 142,
    initials: 'JY',
    avatarBg: 'bg-rose-100 text-rose-700 border border-rose-200',
    specialties: 'ลายหินอ่อน, ต่อเล็บ PVC, สปาออร์แกนิก'
  },
  {
    id: 2,
    name: 'ช่างมิน',
    fullName: 'ช่างมิน (Korean Style)',
    nickname: 'มิน',
    title: 'Korean Gel Specialist',
    experience: 'ประสบการณ์ 4 ปี',
    rating: 4.9,
    reviewCount: 98,
    initials: 'MN',
    avatarBg: 'bg-pink-100 text-pink-700 border border-pink-200',
    specialties: 'งานมินิมอลเกาหลี, ติดชาร์มคริสตัล, ไล่สี Ombre'
  },
  {
    id: 3,
    name: 'ช่างแพรว',
    fullName: 'ช่างแพรว (Gel Extension Pro)',
    nickname: 'แพรว',
    title: 'Extension Expert',
    experience: 'ประสบการณ์ 5 ปี',
    rating: 4.9,
    reviewCount: 115,
    initials: 'PW',
    avatarBg: 'bg-purple-100 text-purple-700 border border-purple-200',
    specialties: 'ต่อเล็บโพลีเจล, ทรงคอฟฟิน, เพ้นท์การ์ตูน 3D'
  },
  {
    id: 4,
    name: 'ช่างพลอย',
    fullName: 'ช่างพลอย (Care & Spa)',
    nickname: 'พลอย',
    title: 'Hand & Foot Therapist',
    experience: 'ประสบการณ์ 3 ปี',
    rating: 4.8,
    reviewCount: 86,
    initials: 'PL',
    avatarBg: 'bg-amber-100 text-amber-700 border border-amber-200',
    specialties: 'เคลียร์หนังละเอียด, สปาผิวเนียนนุ่ม, ทาสีลูกแก้ว Cat Eye'
  }
];

export const TIME_SLOTS = [
  { time: '10:00', period: 'morning', label: '10:00 น.' },
  { time: '11:30', period: 'morning', label: '11:30 น.' },
  { time: '13:00', period: 'afternoon', label: '13:00 น.' },
  { time: '14:30', period: 'afternoon', label: '14:30 น.' },
  { time: '16:00', period: 'afternoon', label: '16:00 น.' },
  { time: '17:30', period: 'afternoon', label: '17:30 น.' },
  { time: '19:00', period: 'evening', label: '19:00 น.' }
];
