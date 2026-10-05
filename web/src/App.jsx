import React, { useState, useEffect } from 'react';
import { INITIAL_SERVICES, INITIAL_STAFF, TIME_SLOTS } from './data';
import {
  IconSparkles,
  IconBottle,
  IconPalette,
  IconDiamond,
  IconFlower,
  IconClock,
  IconCalendar,
  IconUser,
  IconPhone,
  IconNotes,
  IconCheck,
  IconSun,
  IconMoon,
  IconStar,
  IconTicket,
  IconPrinter,
  IconTrash,
  IconClose,
  IconArrowRight,
  IconArrowLeft,
  IconCloud,
  IconShield,
  IconSettings,
  IconBrandLogo
} from './Icons';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export default function App() {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [staffList, setStaffList] = useState(INITIAL_STAFF);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState('checking'); // 'connected' | 'fallback' | 'checking'
  const [dbError, setDbError] = useState(null);
  const [showBanner, setShowBanner] = useState(true);

  // Booking selections
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedService, setSelectedService] = useState(INITIAL_SERVICES[0]);
  const [selectedStaff, setSelectedStaff] = useState(INITIAL_STAFF[0]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  // UI States
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [lastBooking, setLastBooking] = useState(null);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState(() => localStorage.getItem('GLAMOUR_CUSTOM_API') || '');
  const [toast, setToast] = useState(null);

  const activeApiBase = customApiUrl.trim() || API_BASE;

  // Show Toast
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Helper date calculations & Thai date formatters
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfterTomorrowStr = new Date(Date.now() + 172800000).toISOString().split('T')[0];

  const THAI_MONTHS = [
    { val: '01', name: 'มกราคม', short: 'ม.ค.' },
    { val: '02', name: 'กุมภาพันธ์', short: 'ก.พ.' },
    { val: '03', name: 'มีนาคม', short: 'มี.ค.' },
    { val: '04', name: 'เมษายน', short: 'เม.ย.' },
    { val: '05', name: 'พฤษภาคม', short: 'พ.ค.' },
    { val: '06', name: 'มิถุนายน', short: 'มิ.ย.' },
    { val: '07', name: 'กรกฎาคม', short: 'ก.ค.' },
    { val: '08', name: 'สิงหาคม', short: 'ส.ค.' },
    { val: '09', name: 'กันยายน', short: 'ก.ย.' },
    { val: '10', name: 'ตุลาคม', short: 'ต.ค.' },
    { val: '11', name: 'พฤศจิกายน', short: 'พ.ย.' },
    { val: '12', name: 'ธันวาคม', short: 'ธ.ค.' }
  ];

  const formatDmy = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const formatThaiDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    const mObj = THAI_MONTHS.find(item => item.val === m);
    const thaiYear = parseInt(y, 10) + 543;
    return `${parseInt(d, 10)} ${mObj ? mObj.name : m} ${thaiYear}`;
  };

  // Helper icon for services
  const getServiceIcon = (type) => {
    switch (type) {
      case 'gel': return <IconBottle className="w-5 h-5 text-rose-600" />;
      case 'art': return <IconPalette className="w-5 h-5 text-amber-600" />;
      case 'extension': return <IconDiamond className="w-5 h-5 text-purple-600" />;
      case 'spa': return <IconFlower className="w-5 h-5 text-emerald-600" />;
      default: return <IconSparkles className="w-5 h-5 text-rose-600" />;
    }
  };

  // Load Data from API
  const loadData = async () => {
    setLoading(true);
    setDbError(null);
    try {
      const [sRes, stRes, bRes] = await Promise.allSettled([
        fetch(`${activeApiBase}/services`),
        fetch(`${activeApiBase}/staff`),
        fetch(`${activeApiBase}/bookings`)
      ]);

      let isConnected = true;

      if (sRes.status === 'fulfilled' && sRes.value.ok) {
        const sData = await sRes.value.json();
        if (Array.isArray(sData) && sData.length > 0) {
          setServices(sData);
          setSelectedService(prev => sData.find(s => s.id === prev?.id) || sData[0]);
        }
      } else {
        isConnected = false;
        if (sRes.status === 'fulfilled' && sRes.value.status === 503) {
          setDbError('ยังไม่ได้ตั้งค่า AZURE_SQL_CONNECTION_STRING ใน server/.env');
        }
      }

      if (stRes.status === 'fulfilled' && stRes.value.ok) {
        const stData = await stRes.value.json();
        if (Array.isArray(stData) && stData.length > 0) {
          setStaffList(stData);
          setSelectedStaff(prev => stData.find(st => st.id === prev?.id) || stData[0]);
        }
      }

      if (bRes.status === 'fulfilled' && bRes.value.ok) {
        const bData = await bRes.value.json();
        if (Array.isArray(bData)) {
          setBookings(bData);
        }
      }

      setDbStatus(isConnected ? 'connected' : 'fallback');
    } catch (err) {
      console.warn('API Fetch error:', err);
      setDbStatus('fallback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeApiBase]);

  // Filter Services
  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(s => s.category === selectedCategory);

  const morningSlots = TIME_SLOTS.filter(s => s.period === 'morning');
  const afternoonSlots = TIME_SLOTS.filter(s => s.period !== 'morning');

  // Handle Phone Number Input: Numeric only, max 10 digits, formatted as 0XX-XXX-XXXX
  const handlePhoneChange = (e) => {
    const rawDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
    let formatted = rawDigits;
    if (rawDigits.length > 6) {
      formatted = `${rawDigits.slice(0, 3)}-${rawDigits.slice(3, 6)}-${rawDigits.slice(6)}`;
    } else if (rawDigits.length > 3) {
      formatted = `${rawDigits.slice(0, 3)}-${rawDigits.slice(3)}`;
    }
    setCustomerPhone(formatted);
  };

  const handlePhoneKeyDown = (e) => {
    // Allow keyboard navigation, backspace, delete, tab, enter, arrows, select all, copy, paste
    if (
      ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key) ||
      (e.ctrlKey || e.metaKey)
    ) {
      return;
    }
    // Block any non-digit character
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const rawPhoneDigits = customerPhone.replace(/\D/g, '');
  const isPhoneValid = rawPhoneDigits.length === 10 && rawPhoneDigits.startsWith('0');
  const isStep3Valid = customerName.trim().length > 0 && isPhoneValid;

  // Submit Booking
  const handleBookingSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedService || !selectedStaff || !selectedDate || !selectedSlot) {
      showToast('กรุณาเลือกบริการ ช่าง วันและเวลาให้ครบถ้วน', 'warning');
      return;
    }
    if (!customerName.trim()) {
      showToast('กรุณากรอกชื่อผู้ติดต่อ', 'warning');
      return;
    }
    if (rawPhoneDigits.length !== 10) {
      showToast('กรุณากรอกเบอร์โทรศัพท์มือถือให้ครบ 10 หลัก', 'warning');
      return;
    }
    if (!rawPhoneDigits.startsWith('0')) {
      showToast('เบอร์โทรศัพท์มือถือต้องขึ้นต้นด้วยเลข 0 (เช่น 08X, 09X, 06X)', 'warning');
      return;
    }

    setSubmitting(true);
    const bookingPayload = {
      service_id: selectedService.id,
      staff_id: selectedStaff.id,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      booking_date: selectedDate,
      booking_slot: selectedSlot,
      total_price: selectedService.price,
      notes: customerNotes.trim()
    };

    try {
      const response = await fetch(`${activeApiBase}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });

      if (response.ok) {
        const created = await response.json();
        const fullBooking = {
          ...bookingPayload,
          id: created.id || Date.now(),
          service_title: selectedService.title,
          service_duration: selectedService.duration,
          staff_name: selectedStaff.name,
          staff_nickname: selectedStaff.nickname
        };
        setLastBooking(fullBooking);
        setBookings(prev => [fullBooking, ...prev]);
        setStep(4);
        showToast('จองคิวสำเร็จ บันทึกลง Azure SQL เรียบร้อย', 'success');
      } else {
        throw new Error(`Server returned ${response.status}`);
      }
    } catch (err) {
      console.warn('Backend sync failed, storing locally:', err);
      const offlineBooking = {
        ...bookingPayload,
        id: 'L-' + Math.floor(1000 + Math.random() * 9000),
        service_title: selectedService.title,
        service_duration: selectedService.duration,
        staff_name: selectedStaff.name,
        staff_nickname: selectedStaff.nickname,
        status: 'offline_saved'
      };
      setLastBooking(offlineBooking);
      setBookings(prev => [offlineBooking, ...prev]);
      setStep(4);
      showToast('บันทึกคิวสำเร็จ (โหมดสาธิตออฟไลน์)', 'info');
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel Booking
  const handleCancelBooking = async (id) => {
    if (!window.confirm('คุณต้องการยกเลิกการจองคิวนี้ใช่หรือไม่?')) return;
    setCancellingId(id);
    try {
      const res = await fetch(`${activeApiBase}/bookings/${id}`, { method: 'DELETE' });
      if (res.ok || res.status === 404) {
        setBookings(prev => prev.filter(b => b.id !== id));
        showToast('ยกเลิกรายการจองเรียบร้อย', 'info');
      } else {
        throw new Error('Cancel failed');
      }
    } catch (err) {
      setBookings(prev => prev.filter(b => b.id !== id));
      showToast('ลบรายการในหน้าเว็บเรียบร้อย', 'info');
    } finally {
      setCancellingId(null);
    }
  };

  // Reset Booking Flow
  const handleReset = () => {
    setStep(1);
    setSelectedSlot('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerNotes('');
    setLastBooking(null);
  };

  return (
    <div className="app-viewport-screen min-h-screen bg-[#faf8f9] text-stone-800 flex flex-col font-sans">
      {/* 1. COMPACT HEADER (No shadows, clean 1px border) */}
      <header className="h-14 bg-white border-b border-stone-200 shrink-0 z-40 px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setStep(1)}>
          <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center">
            <IconBrandLogo className="w-4 h-4" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="font-bold text-base tracking-tight text-stone-900">
              จองคิวร้านทำเล็บ
            </span>
          </div>
        </div>

        {/* Stepper Navigation (Integrated cleanly in header for desktop) */}
        <div className="hidden md:flex items-center space-x-1.5 text-xs">
          {[
            { num: 1, label: 'เลือกบริการ' },
            { num: 2, label: 'ช่าง & เวลา' },
            { num: 3, label: 'ข้อมูลผู้จอง' },
            { num: 4, label: 'บัตรนัด' }
          ].map((s, idx) => {
            const isActive = step === s.num;
            const isDone = step > s.num;
            return (
              <React.Fragment key={s.num}>
                <button
                  type="button"
                  onClick={() => s.num < step && setStep(s.num)}
                  disabled={s.num > step}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition-colors ${
                    isActive
                      ? 'bg-rose-50 text-rose-600 font-semibold border border-rose-200'
                      : isDone
                      ? 'text-stone-600 hover:bg-stone-50 cursor-pointer font-medium'
                      : 'text-stone-400 cursor-not-allowed'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive ? 'bg-rose-600 text-white' : isDone ? 'bg-stone-200 text-stone-700' : 'bg-stone-100 text-stone-400'
                  }`}>
                    {isDone ? '✓' : s.num}
                  </span>
                  <span>{s.label}</span>
                </button>
                {idx < 3 && <span className="text-stone-300 text-xs">/</span>}
              </React.Fragment>
            );
          })}
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center space-x-2">
          {/* Bookings Drawer Button */}
          <button
            type="button"
            onClick={() => setShowBookingsModal(true)}
            className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 flex items-center gap-1.5"
          >
            <IconTicket className="w-3.5 h-3.5 text-stone-500" />
            <span>คิวทั้งหมด</span>
            <span className="px-1.5 py-0.2 bg-stone-100 text-stone-700 text-[10px] font-bold rounded">
              {bookings.length}
            </span>
          </button>
        </div>
      </header>

      {/* 3. MAIN FULLSCREEN CONTENT AREA (Desktop Fits In 100vh) */}
      <main className="app-main-content flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl mx-auto w-full">
        {/* ========================================================================= */}
        {/* STEP 1: SELECT SERVICE (Fits 100vh on PC) */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="flex flex-col justify-between space-y-4 h-full">
            {/* Header Title */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-2.5 shrink-0">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-stone-900">เลือกบริการที่คุณต้องการ</h2>
                <p className="text-xs text-stone-500">แตะหรือคลิกเพื่อเลือกแพ็กเกจบริการทำเล็บหรือสปาที่ต้องการจองคิว</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-stone-100 text-stone-600 border border-stone-200">
                {services.length} บริการ
              </span>
            </div>

            {/* 4 Clean Flat Cards Grid (4 columns across on desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 items-stretch overflow-y-auto pr-0.5">
              {services.map(service => {
                const isSelected = selectedService?.id === service.id;
                return (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`flat-card p-5 rounded-2xl cursor-pointer flex flex-col justify-between transition-all ${
                      isSelected ? 'active ring-1 ring-rose-500' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center shrink-0">
                          {getServiceIcon(service.category || service.iconType)}
                        </div>
                        <span className="font-extrabold text-lg text-rose-600">
                          ฿{Number(service.price).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mb-1">
                        <h3 className="font-bold text-sm text-stone-900">{service.title}</h3>
                        {service.badge && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${service.badgeColor || 'bg-stone-100 text-stone-600'}`}>
                            {service.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-400 font-medium mb-2">{service.subtitle}</p>
                      <p className="text-xs text-stone-500 line-clamp-3 leading-relaxed">
                        {service.description}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(service.highlights || []).map((h, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-stone-50 text-stone-600 border border-stone-200 flex items-center gap-1">
                            <IconCheck className="w-2.5 h-2.5 text-rose-500" />
                            <span>{h}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                      <span className="text-stone-400 flex items-center gap-1 text-[11px]">
                        <IconClock className="w-3.5 h-3.5 text-stone-400" />
                        <span>~{service.duration} นาที</span>
                      </span>
                      <span className={`text-xs font-semibold flex items-center gap-1 ${isSelected ? 'text-rose-600' : 'text-stone-400'}`}>
                        <span>{isSelected ? 'เลือกแล้ว' : 'แตะเพื่อเลือก'}</span>
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                          isSelected ? 'bg-rose-500 text-white border-rose-500' : 'border-stone-300'
                        }`}>
                          {isSelected ? '✓' : ''}
                        </span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Row */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-200 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400">บริการที่เลือก:</span>
                <span className="text-xs font-bold text-stone-900">{selectedService?.title}</span>
                <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  ฿{Number(selectedService?.price || 0).toLocaleString()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white font-medium text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <span>ถัดไป: เลือกช่างและเวลา</span>
                <IconArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SELECT STAFF & TIME (Fits 100vh on PC) */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="flex flex-col justify-between space-y-3 h-full">
            {/* Header Title */}
            <div className="border-b border-stone-200 pb-2 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-base font-bold text-stone-900">เลือกช่างทำเล็บและรอบเวลา</h2>
                <p className="text-xs text-stone-500">เลือกช่างประจำร้านที่คุณมั่นใจ พร้อมระบุวันและรอบเวลา</p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1"
              >
                <IconArrowLeft className="w-3 h-3" />
                <span>เปลี่ยนบริการ</span>
              </button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-0.5">
              {/* 1. Staff Row */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-2 flex items-center gap-1.5">
                  <IconUser className="w-3.5 h-3.5 text-stone-500" />
                  <span>ช่างประจำร้าน</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {staffList.map(st => {
                    const isSelected = selectedStaff?.id === st.id;
                    const thaiName = (st.name || '').replace(/\s*\([A-Za-z0-9\s&]+\)/g, '').trim();
                    const thaiTitle = (st.title || st.nickname || '').replace(/\s*\([A-Za-z0-9\s&]+\)/g, '').trim();
                    const thaiInitials = (st.nickname || thaiName.replace('ช่าง', '')).slice(0, 2);
                    return (
                      <div
                        key={st.id}
                        onClick={() => setSelectedStaff({ ...st, name: thaiName, title: thaiTitle })}
                        className={`flat-card p-3.5 rounded-xl cursor-pointer text-center flex flex-col items-center justify-between ${
                          isSelected ? 'active ring-1 ring-rose-500' : ''
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs mb-2 ${
                          st.avatarBg || 'bg-stone-100 text-stone-700 border border-stone-200'
                        }`}>
                          {thaiInitials}
                        </div>
                        <h4 className="font-bold text-xs text-stone-800">{thaiName}</h4>
                        <p className="text-[11px] text-rose-600 font-medium">{thaiTitle}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Date Selection (วัน / เดือน / ปี) */}
              <div className="p-3.5 bg-white border border-stone-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                    <IconCalendar className="w-3.5 h-3.5 text-stone-500" />
                    <span>วันที่นัดหมาย (วัน / เดือน / ปี)</span>
                  </label>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                    {formatDmy(selectedDate)} — {formatThaiDate(selectedDate)}
                  </span>
                </div>

                {/* Quick Selection Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { label: 'วันนี้', dateVal: todayStr },
                    { label: 'พรุ่งนี้', dateVal: tomorrowStr },
                    { label: 'มะรืนนี้', dateVal: dayAfterTomorrowStr }
                  ].map(q => (
                    <button
                      key={q.label}
                      type="button"
                      onClick={() => setSelectedDate(q.dateVal)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedDate === q.dateVal
                          ? 'bg-rose-500 text-white font-semibold'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200'
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>

                {/* 3 Dropdown Selectors: วัน (Day) / เดือน (Month) / ปี (Year) */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">วัน (Day)</label>
                    <select
                      value={selectedDate.split('-')[2] || '01'}
                      onChange={e => {
                        const parts = selectedDate.split('-');
                        setSelectedDate(`${parts[0]}-${parts[1]}-${e.target.value}`);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-medium text-stone-800 focus:border-rose-500 focus:outline-none"
                    >
                      {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map(d => (
                        <option key={d} value={d}>วันที่ {Number(d)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">เดือน (Month)</label>
                    <select
                      value={selectedDate.split('-')[1] || '01'}
                      onChange={e => {
                        const parts = selectedDate.split('-');
                        setSelectedDate(`${parts[0]}-${e.target.value}-${parts[2]}`);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-medium text-stone-800 focus:border-rose-500 focus:outline-none"
                    >
                      {THAI_MONTHS.map(m => (
                        <option key={m.val} value={m.val}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">ปี (Year)</label>
                    <select
                      value={selectedDate.split('-')[0] || '2026'}
                      onChange={e => {
                        const parts = selectedDate.split('-');
                        setSelectedDate(`${e.target.value}-${parts[1]}-${parts[2]}`);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-medium text-stone-800 focus:border-rose-500 focus:outline-none"
                    >
                      <option value="2026">2569 (2026)</option>
                      <option value="2027">2570 (2027)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Time Slots */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                  <IconClock className="w-3.5 h-3.5 text-stone-500" />
                  <span>รอบเวลาที่สะดวก (Time Slot)</span>
                </label>

                {/* Morning */}
                <div>
                  <span className="text-[11px] font-medium text-amber-700 flex items-center gap-1 mb-1.5">
                    <IconSun className="w-3 h-3 text-amber-500" />
                    <span>รอบเช้า</span>
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {morningSlots.map(slot => {
                      const isSelected = selectedSlot === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => setSelectedSlot(slot.time)}
                          className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors border ${
                            isSelected
                              ? 'bg-rose-500 text-white border-rose-500 font-semibold'
                              : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
                          }`}
                        >
                          {slot.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Afternoon */}
                <div>
                  <span className="text-[11px] font-medium text-stone-600 flex items-center gap-1 mb-1.5">
                    <IconMoon className="w-3 h-3 text-stone-500" />
                    <span>รอบบ่ายและค่ำ</span>
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {afternoonSlots.map(slot => {
                      const isSelected = selectedSlot === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => setSelectedSlot(slot.time)}
                          className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors border ${
                            isSelected
                              ? 'bg-rose-500 text-white border-rose-500 font-semibold'
                              : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
                          }`}
                        >
                          {slot.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Nav */}
            <div className="flex justify-between items-center pt-3 border-t border-stone-200 shrink-0">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-xl flex items-center gap-1"
              >
                <IconArrowLeft className="w-3 h-3" />
                <span>ย้อนกลับ</span>
              </button>
              <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500">
                <span>ช่าง: <strong className="text-stone-800">{selectedStaff?.name}</strong></span>
                <span>•</span>
                <span>วัน: <strong className="text-stone-800">{formatDmy(selectedDate)}</strong></span>
                {selectedSlot && (
                  <>
                    <span>•</span>
                    <span>เวลา: <strong className="text-rose-600">{selectedSlot} น.</strong></span>
                  </>
                )}
              </div>
              <button
                type="button"
                disabled={!selectedSlot}
                onClick={() => setStep(3)}
                className={`px-6 py-2.5 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors ${
                  selectedSlot
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                <span>ถัดไป: ข้อมูลผู้จอง</span>
                <IconArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: CUSTOMER FORM & CONFIRMATION (Fits 100vh on PC) */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full items-stretch">
            <div className="lg:col-span-8 flex flex-col justify-between space-y-3 h-full">
              <div className="border-b border-stone-200 pb-2 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-base font-bold text-stone-900">ข้อมูลผู้จองคิว</h2>
                  <p className="text-xs text-stone-500">กรอกชื่อและเบอร์โทรศัพท์สำหรับยืนยันสิทธิ์และส่งบัตรนัด</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1"
                >
                  <IconArrowLeft className="w-3 h-3" />
                  <span>แก้ไขเวลา</span>
                </button>
              </div>

              {/* Form Input Container */}
              <form onSubmit={handleBookingSubmit} className="space-y-4 flex-1 overflow-y-auto pr-0.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                      <IconUser className="w-3 h-3 text-stone-400" />
                      <span>ชื่อ-นามสกุล หรือชื่อเล่น *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="เช่น คุณณิชาภัทร"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:border-rose-500 focus:outline-none bg-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="customer-phone" className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                        <IconPhone className="w-3 h-3 text-stone-400" />
                        <span>เบอร์โทรศัพท์มือถือ (10 หลัก) *</span>
                      </label>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                        isPhoneValid
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold'
                          : rawPhoneDigits.length > 0
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-stone-50 text-stone-400 border-stone-200'
                      }`}>
                        {rawPhoneDigits.length}/10 หลัก
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        id="customer-phone"
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={12}
                        required
                        value={customerPhone}
                        onChange={handlePhoneChange}
                        onKeyDown={handlePhoneKeyDown}
                        placeholder="08X-XXX-XXXX"
                        className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none bg-white transition-colors font-mono tracking-wide ${
                          isPhoneValid
                            ? 'border-emerald-400 focus:border-emerald-500'
                            : rawPhoneDigits.length > 0 && (!rawPhoneDigits.startsWith('0') || rawPhoneDigits.length < 10)
                            ? 'border-amber-300 focus:border-amber-500'
                            : 'border-stone-200 focus:border-rose-500'
                        }`}
                      />
                      {isPhoneValid && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 flex items-center gap-1 text-[11px] font-semibold pointer-events-none">
                          <IconCheck className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    {/* Guidance / Status helper text */}
                    <div className="mt-1 text-[11px] min-h-[16px] leading-tight">
                      {rawPhoneDigits.length > 0 && !rawPhoneDigits.startsWith('0') ? (
                        <span className="text-rose-600 font-medium">
                          * เบอร์โทรศัพท์ต้องขึ้นต้นด้วยเลข 0 (เช่น 081-xxx-xxxx)
                        </span>
                      ) : rawPhoneDigits.length > 0 && rawPhoneDigits.length < 10 ? (
                        <span className="text-amber-600">
                          พิมพ์ได้เฉพาะตัวเลข (เหลืออีก {10 - rawPhoneDigits.length} หลัก)
                        </span>
                      ) : isPhoneValid ? (
                        <span className="text-emerald-600 font-medium">
                          ✓ เบอร์โทรศัพท์ถูกต้องครบ 10 หลัก
                        </span>
                      ) : (
                        <span className="text-stone-400">
                          พิมพ์เฉพาะตัวเลข 10 หลัก (ระบบใส่ขีดให้อัตโนมัติ)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                    <IconNotes className="w-3 h-3 text-stone-400" />
                    <span>หมายเหตุเพิ่มเติม / ความต้องการพิเศษ</span>
                  </label>
                  <textarea
                    rows={3}
                    value={customerNotes}
                    onChange={e => setCustomerNotes(e.target.value)}
                    placeholder="เช่น ต้องการถอดสีเจลเดิม, ขอโทนชมพูธรรมชาติ"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:border-rose-500 focus:outline-none bg-white"
                  ></textarea>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1 text-stone-600 text-xs">
                  <div className="flex items-center gap-1.5 text-stone-800 font-semibold text-[11px]">
                    <IconShield className="w-3.5 h-3.5 text-rose-500" />
                    <span>การรับประกันและการบริการ</span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    ฟรีรับประกันเคลมสีลอกภายใน 7 วัน และเครื่องมือทุกชิ้นผ่านการอบฆ่าเชื้อมาตรฐานคลินิก
                  </p>
                </div>
              </form>

              {/* Bottom Nav */}
              <div className="flex justify-between items-center pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-xl flex items-center gap-1"
                >
                  <IconArrowLeft className="w-3 h-3" />
                  <span>ย้อนกลับ</span>
                </button>
                <button
                  type="button"
                  disabled={submitting || !isStep3Valid}
                  onClick={handleBookingSubmit}
                  className={`px-6 py-2.5 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors ${
                    submitting || !isStep3Valid
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      : 'bg-rose-500 hover:bg-rose-600 text-white'
                  }`}
                >
                  <span>{submitting ? 'กำลังบันทึกคิว...' : 'ยืนยันการจองคิว'}</span>
                  <IconCheck className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right 4 Cols: Flat Summary */}
            <div className="lg:col-span-4 h-full flex flex-col">
              <FlatSummarySidebar
                service={selectedService}
                staff={selectedStaff}
                date={selectedDate}
                slot={selectedSlot}
                step={step}
                onNext={handleBookingSubmit}
                nextDisabled={submitting || !isStep3Valid}
                nextText={submitting ? 'กำลังบันทึก...' : 'ยืนยันการจองคิว'}
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: VIP PASS / E-TICKET (Flat clean minimal design) */}
        {/* ========================================================================= */}
        {step === 4 && lastBooking && (
          <div className="max-w-md mx-auto w-full py-4 flex flex-col justify-center h-full">
            <div className="text-center mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-2">
                <IconCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-stone-900">จองคิวสำเร็จเรียบร้อย</h2>
              <p className="text-xs text-stone-500">บันทึกข้อมูลและส่งต่อไปยังร้านเรียบร้อยแล้ว</p>
            </div>

            {/* Flat Clean Ticket */}
            <div className="flat-ticket p-5 bg-white border border-stone-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center">
                    <IconBrandLogo className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-stone-900">Glamour Nails Studio</h3>
                    <p className="text-[10px] text-stone-400">Appointment Pass</p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-stone-100 text-stone-700 border border-stone-200 rounded">
                  #{lastBooking.id}
                </span>
              </div>

              <div className="flat-ticket-divider"></div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-400">บริการ:</span>
                  <span className="font-semibold text-stone-900 text-right">{lastBooking.service_title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">ช่างประจำ:</span>
                  <span className="font-medium text-stone-800">{(lastBooking.staff_name || '').replace(/\s*\([A-Za-z0-9\s&]+\)/g, '').trim()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">วัน & เวลา:</span>
                  <span className="font-medium text-stone-800">{formatDmy(lastBooking.booking_date)} @ {lastBooking.booking_slot} น.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">ผู้จอง:</span>
                  <span className="font-medium text-stone-800">{lastBooking.customer_name} ({lastBooking.customer_phone})</span>
                </div>
                {lastBooking.notes && (
                  <div className="flex justify-between">
                    <span className="text-stone-400">หมายเหตุ:</span>
                    <span className="text-stone-600 italic text-right">{lastBooking.notes}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-stone-100 flex justify-between items-center text-sm">
                  <span className="font-bold text-stone-700">ยอดชำระ:</span>
                  <span className="font-extrabold text-base text-rose-600">
                    ฿{Number(lastBooking.total_price).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Barcode line mockup */}
              <div className="mt-4 pt-3 border-t border-dashed border-stone-200 text-center">
                <div className="font-mono text-sm tracking-widest text-stone-300 select-none">
                  ||||| ||| ||||||| |||| |||||
                </div>
                <p className="text-[10px] text-stone-400 mt-1">แสดงบัตรนี้เมื่อมาถึงหน้าร้าน</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2.5 mt-4">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-medium text-xs flex items-center justify-center gap-1.5"
              >
                <IconPrinter className="w-3.5 h-3.5" />
                <span>พิมพ์บัตรนัด</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>จองคิวใหม่</span>
                <IconArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 4. MODALS (Clean Flat Style with NO Shadows) */}
      {/* Bookings Modal */}
      {showBookingsModal && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 w-full max-w-lg rounded-2xl p-5 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <IconTicket className="w-4 h-4 text-stone-500" />
                <span>รายการคิวที่จอง ({bookings.length})</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowBookingsModal(false)}
                className="w-6 h-6 rounded-md hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 my-3 space-y-2 pr-1">
              {bookings.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs">
                  ยังไม่มีรายการจองคิวในระบบ
                </div>
              ) : (
                bookings.map(b => (
                  <div key={b.id} className="p-3 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center justify-between text-xs gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">#{b.id}</span>
                        <span className="font-medium text-rose-600">{b.service_title}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 border border-stone-200">
                          {formatDmy(b.booking_date)} @ {b.booking_slot} น.
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        ผู้จอง: <span className="font-medium text-stone-800">{b.customer_name}</span> ({b.customer_phone}) • ช่าง: {(b.staff_name || '').replace(/\s*\([A-Za-z0-9\s&]+\)/g, '').trim()}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={cancellingId === b.id}
                      onClick={() => handleCancelBooking(b.id)}
                      className="px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-medium shrink-0"
                    >
                      {cancellingId === b.id ? 'กำลังลบ...' : 'ยกเลิก'}
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-stone-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowBookingsModal(false)}
                className="px-4 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Azure Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 w-full max-w-md rounded-2xl p-5 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <IconCloud className="w-4 h-4 text-stone-600" />
                <span>การเชื่อมต่อ Azure Cloud</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="w-6 h-6 rounded-md hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-stone-600">
              <p>
                <strong>สถานะระบบ:</strong>{' '}
                <span className={dbStatus === 'connected' ? 'text-emerald-600 font-bold' : 'text-amber-700 font-bold'}>
                  {dbStatus === 'connected' ? 'Azure SQL Live' : 'Demo Mode (Offline Fallback)'}
                </span>
              </p>

              <div>
                <label className="block font-medium mb-1">API Base URL:</label>
                <input
                  type="text"
                  value={customApiUrl}
                  onChange={e => setCustomApiUrl(e.target.value)}
                  placeholder="https://app-clinicapp-api-xxxx.azurewebsites.net"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-[11px] space-y-1">
                <p className="font-bold text-stone-800">ขั้นตอนเชื่อมต่อ Azure SQL:</p>
                <p>1. รัน <code>db/schema.sql</code> และ <code>db/seed-data.sql</code> ใน Azure Portal</p>
                <p>2. วาง connection string ใน <code>server/.env</code></p>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('GLAMOUR_CUSTOM_API', customApiUrl);
                  setShowConfigModal(false);
                  loadData();
                }}
                className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-medium"
              >
                บันทึกการตั้งค่า
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification (Flat, Clean) */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-3.5 py-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
          toast.type === 'success'
            ? 'bg-emerald-600 text-white border-emerald-700'
            : toast.type === 'warning'
            ? 'bg-amber-600 text-white border-amber-700'
            : 'bg-stone-800 text-white border-stone-900'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FLAT MODERN SIDEBAR SUMMARY CARD (ZERO SHADOWS, CRISP BORDERS)
// ---------------------------------------------------------------------------
function FlatSummarySidebar({ service, staff, date, slot, step, onNext, nextDisabled, nextText }) {
  return (
    <div className="flat-card p-4 sm:p-5 rounded-xl h-full flex flex-col justify-between border border-stone-200 bg-white">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
          <div>
            <span className="text-[10px] font-semibold tracking-wider text-rose-500 uppercase">Summary</span>
            <h3 className="font-bold text-sm text-stone-900">สรุปการนัดหมาย</h3>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200 font-semibold">
            {service?.badge || 'พรีเมียม'}
          </span>
        </div>

        {/* Selected Service Detail */}
        <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
          <span className="text-[10px] font-semibold text-stone-400 uppercase">บริการที่เลือก</span>
          <div className="flex justify-between items-start">
            <span className="font-bold text-xs text-stone-900">{service?.title}</span>
            <span className="font-extrabold text-sm text-rose-600">฿{Number(service?.price || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-stone-500">
            <IconClock className="w-3 h-3 text-stone-400" />
            <span>~{service?.duration || 60} นาที</span>
          </div>
        </div>

        {/* Selected Staff (Rating Badge Removed, Pure Thai Name) */}
        <div className="flex items-center justify-between p-2.5 bg-white border border-stone-200 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-stone-100 text-stone-700 border border-stone-200 flex items-center justify-center font-bold text-[10px]">
              {((staff?.nickname || staff?.name || 'ช่าง').replace('ช่าง', '')).slice(0, 2)}
            </div>
            <div>
              <p className="font-semibold text-stone-800">{(staff?.name || '').replace(/\s*\([A-Za-z0-9\s&]+\)/g, '').trim()}</p>
              <p className="text-[10px] text-stone-400">{(staff?.title || staff?.nickname || 'ช่างประจำร้าน').replace(/\s*\([A-Za-z0-9\s&]+\)/g, '').trim()}</p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200 font-medium">
            ช่างที่เลือก
          </span>
        </div>

        {/* Selected Date & Time (วัน / เดือน / ปี) */}
        <div className="flex items-center justify-between p-2.5 bg-white border border-stone-200 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <IconCalendar className="w-4 h-4 text-stone-500" />
            <div>
              <p className="font-semibold text-stone-800">{formatDmy(date)} ({formatThaiDate(date)})</p>
              <p className="text-[10px] text-stone-400">{slot ? `เวลา ${slot} น.` : 'ยังไม่ระบุรอบเวลา'}</p>
            </div>
          </div>
          {slot ? (
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              พร้อมยืนยัน
            </span>
          ) : (
            <span className="text-[10px] text-stone-400">รอบที่ 2</span>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="pt-2 border-t border-stone-100 space-y-1 text-xs">
          <div className="flex justify-between text-stone-500 text-[11px]">
            <span>ราคาบริการ</span>
            <span>฿{Number(service?.price || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-stone-500 text-[11px]">
            <span>การรับประกันสีเจล 7 วัน</span>
            <span className="text-emerald-600 font-medium">ฟรี</span>
          </div>
          <div className="pt-2 border-t border-stone-100 flex justify-between items-baseline">
            <span className="font-bold text-xs text-stone-800">ยอดรวมทั้งสิ้น:</span>
            <span className="font-black text-lg text-rose-600">
              ฿{Number(service?.price || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Button & Guarantee */}
      <div className="pt-3 space-y-2">
        {step < 4 && (
          <button
            type="button"
            disabled={nextDisabled}
            onClick={onNext}
            className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors ${
              nextDisabled
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-rose-500 hover:bg-rose-600 text-white'
            }`}
          >
            <span>{nextText}</span>
            <IconArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
        <div className="text-[10px] text-stone-400 text-center flex items-center justify-center gap-1">
          <IconShield className="w-3 h-3 text-emerald-600" />
          <span>มาตรฐานสุขอนามัย ปลอดเชื้อ 100%</span>
        </div>
      </div>
    </div>
  );
}
