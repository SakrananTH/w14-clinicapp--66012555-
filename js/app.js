/**
 * ==============================================================================
 * Glamour Nails Studio - Main Application Logic
 * ==============================================================================
 * จัดการ State การทำงานของระบบจองคิว, การตรวจสอบความถูกต้อง (Validation),
 * การทำงานของ UI, การเชื่อมต่อ LocalStorage และ Azure Cloud API
 */

// Global Application State
const state = {
  currentStep: 1,
  selectedCategory: 'all',
  selectedService: SERVICES_DATA[0],
  selectedStaff: STAFF_DATA[0],
  selectedDate: '',
  selectedSlot: '',
  lastConfirmedBooking: null,
};

// ==============================================================================
// 1. Lifecycle & Initialization
// ==============================================================================
window.addEventListener('DOMContentLoaded', () => {
  initDateDefaults();
  renderCategoryTabs();
  renderServices();
  renderStaff();
  updateSlots();
  updateProgressBar();
  loadSavedAzureConfig();
  updateHeaderBookingCount();
});

/**
 * ตั้งค่าวันที่เริ่มต้นเป็นวันปัจจุบันและจำกัดไม่ให้เลือกย้อนหลัง
 */
function initDateDefaults() {
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('booking-date');
  if (dateInput) {
    dateInput.min = today;
    dateInput.value = today;
    state.selectedDate = today;
  }
}

/**
 * โหลดการตั้งค่า Azure Endpoint จาก LocalStorage
 */
function loadSavedAzureConfig() {
  const savedEndpoint = localStorage.getItem(STORAGE_KEY_AZURE);
  const inputEl = document.getElementById('azure-api-url');
  const badgeEl = document.getElementById('azure-status-badge');
  if (savedEndpoint && inputEl) {
    inputEl.value = savedEndpoint;
    if (badgeEl) {
      badgeEl.classList.remove('hidden');
    }
  }
}

// ==============================================================================
// 2. Render Functions (UI Components)
// ==============================================================================

/**
 * แสดงแท็บหมวดหมู่ของบริการ (Category Filter)
 */
function renderCategoryTabs() {
  const container = document.getElementById('category-filter-tabs');
  if (!container) return;

  const categories = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'gel', label: 'สีเจล' },
    { id: 'art', label: 'เพ้นท์ลาย' },
    { id: 'extension', label: 'ต่อเล็บ' },
    { id: 'spa', label: 'สปาบำรุง' }
  ];

  container.innerHTML = categories.map(cat => {
    const isActive = state.selectedCategory === cat.id;
    return `
      <button type="button" 
              onclick="filterByCategory('${cat.id}')"
              class="px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-200 scale-105'
                  : 'bg-white text-stone-600 hover:bg-rose-50 border border-rose-100 hover:border-pink-300'
              }">
        ${cat.label}
      </button>
    `;
  }).join('');
}

function filterByCategory(categoryId) {
  state.selectedCategory = categoryId;
  renderCategoryTabs();
  renderServices();
}

/**
 * แสดงการ์ดบริการทำเล็บทั้งหมด
 */
function renderServices() {
  const container = document.getElementById('services-grid');
  if (!container) return;

  const filteredServices = state.selectedCategory === 'all'
    ? SERVICES_DATA
    : SERVICES_DATA.filter(s => s.category === state.selectedCategory);

  container.innerHTML = filteredServices.map(service => {
    const isSelected = state.selectedService?.id === service.id;
    return `
      <div onclick="selectService('${service.id}')" 
           class="glass-card cursor-pointer p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between ${
             isSelected ? 'active ring-2 ring-pink-500' : ''
           }">
        <!-- Top Row: Icon, Badges & Price -->
        <div>
          <div class="flex items-start justify-between gap-2 mb-3">
            <div class="flex items-center gap-2.5">
              <span class="text-3xl p-2 rounded-2xl bg-rose-50 border border-rose-100">${service.icon}</span>
              <div>
                <span class="text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shimmer-badge ${service.badgeColor}">
                  ${service.badge}
                </span>
                <p class="text-[11px] text-stone-400 font-medium mt-0.5">${service.subtitle}</p>
              </div>
            </div>
            <div class="text-right">
              <span class="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
                ฿${service.price.toLocaleString()}
              </span>
            </div>
          </div>

          <h3 class="font-bold text-stone-800 text-base leading-snug">${service.title}</h3>
          <p class="text-xs text-stone-500 mt-1.5 leading-relaxed">${service.description}</p>
          
          <!-- Highlights Tags -->
          <div class="mt-3 flex flex-wrap gap-1.5">
            ${service.highlights.map(h => `
              <span class="text-[10px] px-2 py-0.5 rounded-lg bg-pink-50/80 text-rose-700 font-medium border border-rose-100">
                ✓ ${h}
              </span>
            `).join('')}
          </div>
        </div>

        <!-- Bottom Row: Duration & Selection Indicator -->
        <div class="mt-4 pt-3 border-t border-rose-100/70 flex items-center justify-between text-xs">
          <div class="flex items-center text-stone-400 gap-1 font-medium">
            <svg class="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>เวลาประมาณ ${service.duration} นาที</span>
          </div>
          
          <div class="flex items-center gap-1.5 font-semibold ${isSelected ? 'text-pink-600 font-bold' : 'text-stone-400'}">
            <span>${isSelected ? 'เลือกรายการนี้แล้ว' : 'แตะเพื่อเลือก'}</span>
            <div class="w-5 h-5 rounded-full flex items-center justify-center ${isSelected ? 'bg-pink-500 text-white' : 'border border-stone-300 text-transparent'}">
              ✓
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function selectService(id) {
  state.selectedService = SERVICES_DATA.find(s => s.id === id);
  renderServices();
  updateLiveSummary();
}

/**
 * แสดงการ์ดช่างทำเล็บ
 */
function renderStaff() {
  const container = document.getElementById('staff-grid');
  if (!container) return;

  container.innerHTML = STAFF_DATA.map(staff => {
    const isSelected = state.selectedStaff?.id === staff.id;
    return `
      <div onclick="selectStaff('${staff.id}')"
           class="glass-card cursor-pointer p-4 rounded-3xl text-center relative ${
             isSelected ? 'active ring-2 ring-pink-500' : ''
           }">
        ${isSelected ? '<span class="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-pink-500 ring-4 ring-pink-100"></span>' : ''}
        <div class="text-3xl mb-1.5 transform hover:scale-110 transition-transform">${staff.avatar}</div>
        <h4 class="font-bold text-xs sm:text-sm text-stone-800">${staff.name}</h4>
        <p class="text-[11px] text-pink-600 font-medium">${staff.title}</p>
        <p class="text-[10px] text-stone-400 mt-1 line-clamp-1">${staff.experience}</p>
        
        <div class="mt-2.5 flex items-center justify-center gap-1 text-[11px] font-semibold text-amber-500 bg-amber-50 rounded-xl py-0.5">
          <span>★ ${staff.rating}</span>
          <span class="text-stone-400 font-normal">(${staff.reviewCount})</span>
        </div>
      </div>
    `;
  }).join('');
}

function selectStaff(id) {
  state.selectedStaff = STAFF_DATA.find(s => s.id === id);
  renderStaff();
  updateSlots();
  updateLiveSummary();
}

/**
 * ทางลัดเลือกวันที่ (วันนี้, พรุ่งนี้, มะรืนนี้)
 */
function setDateQuick(daysFromNow) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  const formatted = date.toISOString().split('T')[0];
  const dateInput = document.getElementById('booking-date');
  if (dateInput) {
    dateInput.value = formatted;
  }
  state.selectedDate = formatted;
  state.selectedSlot = '';
  updateSlots();
  updateLiveSummary();
}

function handleDateChange() {
  const dateInput = document.getElementById('booking-date');
  if (dateInput) {
    state.selectedDate = dateInput.value;
  }
  state.selectedSlot = '';
  updateSlots();
  updateLiveSummary();
}

/**
 * ดึงรายการคิวที่จองแล้วจาก LocalStorage
 */
function getExistingBookings() {
  try {
    const data = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to parse bookings:', e);
    return [];
  }
}

/**
 * เรนเดอร์รอบเวลาว่างในแต่ละวัน (แบ่งรอบเช้าและรอบบ่าย)
 */
function updateSlots() {
  const morningContainer = document.getElementById('morning-slots-grid');
  const afternoonContainer = document.getElementById('afternoon-slots-grid');
  const noSlotsMsg = document.getElementById('no-slots-msg');
  const durationBadge = document.getElementById('duration-badge');

  if (durationBadge && state.selectedService) {
    durationBadge.innerText = `ใช้เวลาประมาณ ${state.selectedService.duration} นาที`;
  }

  const existing = getExistingBookings();

  // ตรวจสอบคิวที่ชนกับวันและช่างที่เลือก
  const bookedSlots = existing
    .filter(b => b.date === state.selectedDate && (b.staffId === state.selectedStaff.id || state.selectedStaff.id === 'any' || b.staffId === 'any'))
    .map(b => b.slot);

  let totalAvailable = 0;

  const renderSlotButton = (slotObj) => {
    const slot = slotObj.time;
    const isBooked = bookedSlots.includes(slot);
    const isSelected = state.selectedSlot === slot;
    if (!isBooked) totalAvailable++;

    return `
      <button type="button" 
              onclick="${isBooked ? '' : `chooseSlot('${slot}')`}"
              class="py-3 px-2 rounded-2xl text-xs font-semibold transition-all duration-200 flex flex-col items-center justify-center relative ${
                isBooked 
                  ? 'bg-stone-100 text-stone-300 cursor-not-allowed border border-stone-200 line-through'
                  : isSelected
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rose-glow scale-105 border border-pink-400 font-bold'
                    : 'bg-white text-stone-700 border border-rose-100 hover:border-pink-300 hover:bg-pink-50/50 shadow-sm'
              }"
              ${isBooked ? 'disabled' : ''}>
        <span class="text-sm tracking-tight">${slot} น.</span>
        <span class="text-[10px] mt-0.5 font-medium ${isBooked ? 'text-stone-300' : isSelected ? 'text-pink-100' : 'text-pink-600'}">
          ${isBooked ? 'คิวเต็ม' : 'ว่าง'}
        </span>
      </button>
    `;
  };

  if (morningContainer) {
    morningContainer.innerHTML = TIME_SLOTS.morning.map(renderSlotButton).join('');
  }
  if (afternoonContainer) {
    afternoonContainer.innerHTML = TIME_SLOTS.afternoon.map(renderSlotButton).join('');
  }

  if (noSlotsMsg) {
    if (totalAvailable === 0) {
      noSlotsMsg.classList.remove('hidden');
    } else {
      noSlotsMsg.classList.add('hidden');
    }
  }
}

function chooseSlot(slot) {
  state.selectedSlot = slot;
  updateSlots();
  updateLiveSummary();
}

/**
 * อัปเดตแถบสรุปข้อมูลระหว่างขั้นตอน (Live Summary)
 */
function updateLiveSummary() {
  const summaryService = document.getElementById('summary-service-title');
  const summaryStaff = document.getElementById('summary-staff-name');
  const summaryDateTime = document.getElementById('summary-datetime');
  const summaryPrice = document.getElementById('summary-price');

  if (summaryService && state.selectedService) {
    summaryService.innerText = state.selectedService.title;
  }
  if (summaryStaff && state.selectedStaff) {
    summaryStaff.innerText = state.selectedStaff.name;
  }
  if (summaryDateTime) {
    if (state.selectedDate && state.selectedSlot) {
      summaryDateTime.innerText = `${formatThaiDate(state.selectedDate)} • ${state.selectedSlot} น.`;
    } else if (state.selectedDate) {
      summaryDateTime.innerText = `${formatThaiDate(state.selectedDate)} • (ยังไม่เลือกรอบเวลา)`;
    } else {
      summaryDateTime.innerText = 'ยังไม่ระบุวันเวลา';
    }
  }
  if (summaryPrice && state.selectedService) {
    summaryPrice.innerText = `฿${state.selectedService.price.toLocaleString()}`;
  }
}

/**
 * จัดรูปแบบวันที่ให้เป็นภาษาไทยแบบสวยงาม
 */
function formatThaiDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const thaiYear = parseInt(year, 10) + 543;
  return `${parseInt(day, 10)} ${thaiMonths[parseInt(month, 10) - 1]} ${thaiYear}`;
}

// ==============================================================================
// 3. Step Control & Progress Logic
// ==============================================================================
function goToStep(step) {
  state.currentStep = step;

  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`step-${i}`);
    if (el) {
      if (i === step) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  }

  updateProgressBar();
  updateLiveSummary();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgressBar() {
  const progressBar = document.getElementById('progressBar');
  const stepCountBadge = document.getElementById('step-count-badge');
  const percentages = [0, 0, 33, 66, 100];
  
  if (progressBar) {
    progressBar.style.width = `${percentages[state.currentStep]}%`;
  }
  if (stepCountBadge) {
    stepCountBadge.innerText = `Step ${state.currentStep} of 4`;
  }

  for (let i = 1; i <= 4; i++) {
    const node = document.getElementById(`step-node-${i}`);
    if (!node) continue;

    if (i < state.currentStep) {
      node.className = "w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm step-node completed";
      node.innerHTML = `✓`;
    } else if (i === state.currentStep) {
      node.className = "w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm step-node current";
      node.innerText = i;
    } else {
      node.className = "w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm step-node pending";
      node.innerText = i;
    }
  }
}

function validateStep1() {
  if (!state.selectedService) {
    showToast('กรุณาเลือกบริการทำเล็บก่อนนะคะ 💅', 'error');
    return;
  }
  goToStep(2);
}

function validateStep2() {
  if (!state.selectedDate) {
    showToast('กรุณาเลือกวันที่ต้องการเข้ารับบริการ 📅', 'error');
    return;
  }
  if (!state.selectedSlot) {
    showToast('กรุณาเลือกรอบเวลาที่สะดวกค่ะ ⏰', 'error');
    return;
  }
  goToStep(3);
}

// Auto-format Thai Phone Number while typing (e.g. 081-234-5678)
function formatPhoneInput(input) {
  let val = input.value.replace(/\D/g, '');
  if (val.length > 10) val = val.substring(0, 10);
  if (val.length > 6) {
    input.value = `${val.substring(0, 3)}-${val.substring(3, 6)}-${val.substring(6)}`;
  } else if (val.length > 3) {
    input.value = `${val.substring(0, 3)}-${val.substring(3)}`;
  } else {
    input.value = val;
  }
}

// ==============================================================================
// 4. Booking Submission & Azure Sync
// ==============================================================================
async function submitBooking() {
  const nameInput = document.getElementById('cust-name');
  const phoneInput = document.getElementById('cust-phone');
  const lineInput = document.getElementById('cust-line');
  const notesInput = document.getElementById('cust-notes');

  const name = nameInput ? nameInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const line = lineInput ? lineInput.value.trim() : '';
  const notes = notesInput ? notesInput.value.trim() : '';

  if (!name) {
    showToast('กรุณากรอกชื่อของคุณลูกค้าด้วยค่ะ ✨', 'error');
    if (nameInput) nameInput.focus();
    return;
  }

  const rawPhone = phone.replace(/\D/g, '');
  if (!rawPhone || rawPhone.length < 9) {
    showToast('กรุณากรอกเบอร์โทรศัพท์ติดต่อให้ครบถ้วนค่ะ 📱', 'error');
    if (phoneInput) phoneInput.focus();
    return;
  }

  const bookingPayload = {
    bookingId: 'GLAM-' + Math.floor(100000 + Math.random() * 900000),
    serviceId: state.selectedService.id,
    serviceTitle: state.selectedService.title,
    serviceSubtitle: state.selectedService.subtitle,
    price: state.selectedService.price,
    duration: state.selectedService.duration,
    staffId: state.selectedStaff.id,
    staffName: state.selectedStaff.name,
    staffAvatar: state.selectedStaff.avatar,
    date: state.selectedDate,
    slot: state.selectedSlot,
    customerName: name,
    customerPhone: phone,
    customerLine: line,
    notes: notes,
    createdAt: new Date().toISOString()
  };

  const btn = document.getElementById('submit-booking-btn');
  const btnText = document.getElementById('btn-submit-text');
  const spinner = document.getElementById('btn-submit-spinner');
  
  if (btn) btn.disabled = true;
  if (btnText) btnText.innerText = 'กำลังยืนยันคิว...';
  if (spinner) spinner.classList.remove('hidden');

  const azureApiUrl = localStorage.getItem(STORAGE_KEY_AZURE);

  try {
    if (azureApiUrl && azureApiUrl.startsWith('http')) {
      // ส่งข้อมูลไปยัง Azure API (App Service / Azure Functions)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 sec timeout

      const response = await fetch(`${azureApiUrl.replace(/\/+$/, '')}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Azure Server Error: ${response.status}`);
      }
      showToast('ซิงค์ข้อมูลไปยัง Azure Cloud สำเร็จ! ☁️', 'success');
    } else {
      // จำลอง Network Delay 500ms
      await new Promise(res => setTimeout(res, 500));
    }

    // บันทึกลง LocalStorage
    saveBookingLocally(bookingPayload);

    state.lastConfirmedBooking = bookingPayload;
    renderTicket(bookingPayload);
    goToStep(4);
    triggerConfetti();
    updateHeaderBookingCount();
    showToast('จองคิวสำเร็จเรียบร้อยค่ะ ยินดีต้อนรับนะคะ! 💖', 'success');
  } catch (err) {
    console.warn('Azure sync note:', err.message);
    // กรณี Azure มีปัญหาหรือไม่ตอบสนอง ให้บันทึกลงเครื่องอัตโนมัติ
    saveBookingLocally(bookingPayload);

    state.lastConfirmedBooking = bookingPayload;
    renderTicket(bookingPayload);
    goToStep(4);
    triggerConfetti();
    updateHeaderBookingCount();
    showToast('บันทึกคิวในระบบเรียบร้อย (ออฟไลน์โหมด) 🎉', 'info');
  } finally {
    if (btn) btn.disabled = false;
    if (btnText) btnText.innerText = 'ยืนยันการจองคิว';
    if (spinner) spinner.classList.add('hidden');
  }
}

function saveBookingLocally(bookingPayload) {
  const currentBookings = getExistingBookings();
  currentBookings.unshift(bookingPayload);
  localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(currentBookings));
}

/**
 * เรนเดอร์บัตรนัดหมายสุดหรู (VIP Booking Pass) ใน Step 4
 */
function renderTicket(b) {
  const elements = {
    id: document.getElementById('ticket-id'),
    service: document.getElementById('ticket-service'),
    staff: document.getElementById('ticket-staff'),
    date: document.getElementById('ticket-date'),
    time: document.getElementById('ticket-time'),
    name: document.getElementById('ticket-name'),
    phone: document.getElementById('ticket-phone'),
    price: document.getElementById('ticket-price'),
    duration: document.getElementById('ticket-duration'),
    notes: document.getElementById('ticket-notes'),
    notesRow: document.getElementById('ticket-notes-row')
  };

  if (elements.id) elements.id.innerText = '#' + b.bookingId;
  if (elements.service) elements.service.innerText = b.serviceTitle;
  if (elements.staff) elements.staff.innerText = b.staffName;
  if (elements.date) elements.date.innerText = formatThaiDate(b.date);
  if (elements.time) elements.time.innerText = b.slot + ' น.';
  if (elements.name) elements.name.innerText = b.customerName;
  if (elements.phone) elements.phone.innerText = b.customerPhone;
  if (elements.price) elements.price.innerText = '฿' + b.price.toLocaleString();
  if (elements.duration) elements.duration.innerText = `~${b.duration || 60} นาที`;

  if (elements.notesRow) {
    if (b.notes) {
      elements.notesRow.classList.remove('hidden');
      if (elements.notes) elements.notes.innerText = b.notes;
    } else {
      elements.notesRow.classList.add('hidden');
    }
  }
}

/**
 * คัดลอกรายละเอียดคิวไปยังคลิปบอร์ด
 */
function copyBookingRef() {
  if (!state.lastConfirmedBooking) return;
  const b = state.lastConfirmedBooking;
  const text = `💅 บัตรนัดหมาย Glamour Nails Studio\nรหัสคิว: #${b.bookingId}\nบริการ: ${b.serviceTitle}\nช่าง: ${b.staffName}\nวันเวลา: ${formatThaiDate(b.date)} เวลา ${b.slot} น.\nชื่อผู้จอง: ${b.customerName} (${b.customerPhone})\nยอดชำระ: ฿${b.price.toLocaleString()}`;

  navigator.clipboard.writeText(text).then(() => {
    showToast('คัดลอกรายละเอียดคิวเรียบร้อยแล้วค่ะ 📋', 'success');
  }).catch(() => {
    const dummy = document.createElement('textarea');
    dummy.value = text;
    document.body.appendChild(dummy);
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    showToast('คัดลอกรายละเอียดคิวเรียบร้อยแล้วค่ะ 📋', 'success');
  });
}

/**
 * สั่งพิมพ์ / บันทึกบัตรคิวเป็น PDF
 */
function printTicket() {
  window.print();
}

/**
 * รีเซ็ตฟอร์มเพื่อจองคิวใหม่
 */
function resetBookingFlow() {
  state.selectedSlot = '';
  const fields = ['cust-name', 'cust-phone', 'cust-line', 'cust-notes'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  updateSlots();
  goToStep(1);
}

// ==============================================================================
// 5. Celebration Effects (Confetti Burst)
// ==============================================================================
function triggerConfetti() {
  const colors = ['#f43f5e', '#fb7185', '#fda4af', '#fcd34d', '#34d399', '#60a5fa'];
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width = `${Math.random() * 8 + 6}px`;
    piece.style.height = `${Math.random() * 10 + 6}px`;
    piece.style.animationDuration = `${Math.random() * 2 + 2}s`;
    piece.style.animationDelay = `${Math.random() * 0.4}s`;
    document.body.appendChild(piece);

    setTimeout(() => piece.remove(), 4000);
  }
}

// ==============================================================================
// 6. Modals & Azure Config Management
// ==============================================================================
function updateHeaderBookingCount() {
  const countEl = document.getElementById('header-bookings-badge');
  if (countEl) {
    const total = getExistingBookings().length;
    countEl.innerText = total;
    countEl.classList.toggle('hidden', total === 0);
  }
}

function openBookingsListModal() {
  const modal = document.getElementById('bookings-modal');
  const list = document.getElementById('bookings-list-content');
  const countEl = document.getElementById('total-bookings-count');
  const bookings = getExistingBookings();

  if (countEl) countEl.innerText = `${bookings.length} รายการ`;

  if (list) {
    if (bookings.length === 0) {
      list.innerHTML = `
        <div class="text-center py-12 text-stone-400 text-sm">
          <span class="text-4xl block mb-2">💅</span>
          ยังไม่มีรายการจองคิวในขณะนี้<br>
          <span class="text-xs text-stone-400">จองคิวแรกของคุณได้เลยวันนี้ค่ะ</span>
        </div>
      `;
    } else {
      list.innerHTML = bookings.map((b, index) => `
        <div class="p-4 rounded-2xl border border-rose-100 bg-rose-50/40 hover:bg-rose-50/80 transition flex justify-between items-start text-xs group">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="font-bold font-mono text-pink-700 bg-pink-100 px-2 py-0.5 rounded-lg">#${b.bookingId}</span>
              <span class="font-semibold text-stone-800 text-sm">${b.customerName}</span>
              <span class="text-stone-400 font-mono text-[11px]">${b.customerPhone}</span>
            </div>
            <p class="text-stone-600 font-medium">${b.serviceTitle} • <span class="text-pink-600">ช่าง: ${b.staffName}</span></p>
            <p class="text-stone-500 font-medium text-[11px]">🗓 ${formatThaiDate(b.date)} เวลา <span class="font-bold text-pink-600">${b.slot} น.</span></p>
            ${b.notes ? `<p class="text-[10px] text-stone-400 italic">“${b.notes}”</p>` : ''}
          </div>
          <div class="flex flex-col items-end gap-2">
            <span class="font-bold text-pink-600 text-sm">฿${b.price.toLocaleString()}</span>
            <button onclick="deleteBookingByIndex(${index})" class="text-rose-400 hover:text-rose-600 opacity-60 hover:opacity-100 transition p-1" title="ลบรายการนี้">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      `).join('');
    }
  }

  if (modal) modal.classList.remove('hidden');
}

function closeBookingsModal() {
  const modal = document.getElementById('bookings-modal');
  if (modal) modal.classList.add('hidden');
}

function deleteBookingByIndex(index) {
  const bookings = getExistingBookings();
  bookings.splice(index, 1);
  localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
  openBookingsListModal();
  updateSlots();
  updateHeaderBookingCount();
  showToast('ลบรายการจองเรียบร้อยแล้วค่ะ', 'info');
}

function clearAllBookings() {
  if (confirm('คุณต้องการล้างข้อมูลคิวทั้งหมดใช่หรือไม่?')) {
    localStorage.removeItem(STORAGE_KEY_BOOKINGS);
    openBookingsListModal();
    updateSlots();
    updateHeaderBookingCount();
    showToast('ล้างข้อมูลคิวทดสอบทั้งหมดแล้ว ✨', 'info');
  }
}

function openConfigModal() {
  const modal = document.getElementById('config-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeConfigModal() {
  const modal = document.getElementById('config-modal');
  if (modal) modal.classList.add('hidden');
}

function saveAzureConfig() {
  const inputEl = document.getElementById('azure-api-url');
  const url = inputEl ? inputEl.value.trim() : '';
  const badgeEl = document.getElementById('azure-status-badge');

  if (url) {
    localStorage.setItem(STORAGE_KEY_AZURE, url);
    if (badgeEl) badgeEl.classList.remove('hidden');
    showToast('บันทึก URL Azure API เรียบร้อยแล้ว ☁️', 'success');
  } else {
    localStorage.removeItem(STORAGE_KEY_AZURE);
    if (badgeEl) badgeEl.classList.add('hidden');
    showToast('กลับสู่โหมดจำลอง (LocalStorage) ✨', 'info');
  }
  closeConfigModal();
}

/**
 * ทดสอบยิง Ping ไปยัง Azure Endpoint
 */
async function testAzureConnection() {
  const inputEl = document.getElementById('azure-api-url');
  const testBtn = document.getElementById('test-azure-btn');
  const url = inputEl ? inputEl.value.trim() : '';

  if (!url || !url.startsWith('http')) {
    showToast('กรุณากรอก URL ที่ขึ้นต้นด้วย http:// หรือ https://', 'error');
    return;
  }

  if (testBtn) {
    testBtn.innerText = 'กำลังทดสอบ...';
    testBtn.disabled = true;
  }

  try {
    const res = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    showToast('สามารถเชื่อมต่อไปยัง Host ได้สำเร็จ! 🌐', 'success');
  } catch (err) {
    showToast('ไม่สามารถเชื่อมต่อไปยัง URL ได้ ตรวจสอบ CORS หรือ URL อีกครั้ง', 'error');
  } finally {
    if (testBtn) {
      testBtn.innerText = 'ทดสอบการเชื่อมต่อ';
      testBtn.disabled = false;
    }
  }
}

// ==============================================================================
// 7. Toast Notification Utility
// ==============================================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  
  const styles = {
    success: 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-rose-300/50',
    error: 'bg-stone-900 text-rose-300 border border-rose-800 shadow-stone-800/50',
    info: 'bg-white text-stone-800 border border-pink-200 shadow-pink-200/50'
  };

  const icons = {
    success: '💖',
    error: '⚠️',
    info: '✨'
  };

  toast.className = `px-5 py-3.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2.5 transform transition-all duration-300 translate-y-4 opacity-0 pointer-events-auto border ${styles[type] || styles.info}`;
  toast.innerHTML = `<span class="text-base">${icons[type] || '✨'}</span><span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-x-4');
    setTimeout(() => toast.remove(), 350);
  }, 3500);
}
