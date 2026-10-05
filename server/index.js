import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import sql from 'mssql';
import { getSqlPool } from './db.js';

const app = express();
const PORT = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// 1. API Router (Mounted at both /api and /)
// ---------------------------------------------------------------------------
const apiRouter = express.Router();

// GET /services - List all nail salon services
apiRouter.get('/services', async (_req, res, next) => {
  try {
    const pool = await getSqlPool();
    const result = await pool.request().query(`
      SELECT id, category, title, subtitle, description, duration, price, 
             badge, badge_color AS badgeColor, icon, highlights 
      FROM services 
      ORDER BY id
    `);

    // Format highlights to array if string
    const services = result.recordset.map(s => ({
      ...s,
      highlights: typeof s.highlights === 'string' ? s.highlights.split(',').map(h => h.trim()) : (s.highlights || [])
    }));

    res.json(services);
  } catch (e) { next(e); }
});

// GET /staff - List all salon staff (Pure Thai names & titles, no English)
apiRouter.get('/staff', async (_req, res, next) => {
  try {
    const pool = await getSqlPool();
    const result = await pool.request().query(`
      SELECT id, name, nickname, title, experience, rating, review_count AS reviewCount, 
             avatar, specialties 
      FROM staff 
      ORDER BY id
    `);

    // Clean data to pure Thai names (strip English in parentheses, no expertise)
    const staffList = result.recordset.map(st => {
      const thaiName = (st.name || '').replace(/\s*\([A-Za-z0-9\s&]+\)/g, '').trim();
      const nick = st.nickname || thaiName.replace('ช่าง', '').trim();

      return {
        ...st,
        name: thaiName,
        nickname: nick,
        title: 'ช่างประจำร้าน',
        initials: nick.slice(0, 2)
      };
    });

    res.json(staffList);
  } catch (e) { next(e); }
});

// GET /bookings - List all nail salon bookings
apiRouter.get('/bookings', async (_req, res, next) => {
  try {
    const pool = await getSqlPool();
    const result = await pool.request().query(`
      SELECT 
        b.id, 
        b.service_id, 
        b.staff_id, 
        b.customer_name, 
        b.customer_phone, 
        FORMAT(b.booking_date, 'yyyy-MM-dd') AS booking_date, 
        b.booking_slot, 
        b.total_price, 
        b.notes, 
        b.status, 
        b.created, 
        s.title AS service_title, 
        s.duration AS service_duration, 
        st.name AS staff_name, 
        st.avatar AS staff_avatar
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN staff st ON b.staff_id = st.id
      ORDER BY b.booking_date DESC, b.booking_slot ASC
    `);

    const cleanedBookings = result.recordset.map(b => ({
      ...b,
      staff_name: (b.staff_name || '').replace(/\s*\([A-Za-z0-9\s&]+\)/g, '').trim()
    }));

    res.json(cleanedBookings);
  } catch (e) { next(e); }
});

// POST /bookings - Create a new nail booking
apiRouter.post('/bookings', async (req, res, next) => {
  const {
    service_id,
    staff_id,
    customer_name,
    customer_phone,
    booking_date,
    booking_slot,
    total_price,
    notes
  } = req.body || {};

  if (!service_id || !staff_id || !customer_name || !customer_phone || !booking_date || !booking_slot) {
    return res.status(400).json({ 
      error: 'validation_failed', 
      message: 'service_id, staff_id, customer_name, customer_phone, booking_date, and booking_slot are required' 
    });
  }

  const digitsOnly = String(customer_phone || '').replace(/\D/g, '');
  if (digitsOnly.length !== 10 || !digitsOnly.startsWith('0')) {
    return res.status(400).json({
      error: 'validation_failed',
      message: 'customer_phone must be a 10-digit number starting with 0'
    });
  }

  try {
    const pool = await getSqlPool();
    const result = await pool.request()
      .input('service_id', sql.Int, Number(service_id))
      .input('staff_id', sql.Int, Number(staff_id))
      .input('customer_name', sql.NVarChar(200), String(customer_name).trim())
      .input('customer_phone', sql.NVarChar(50), String(customer_phone).trim())
      .input('booking_date', sql.Date, new Date(booking_date))
      .input('booking_slot', sql.NVarChar(50), String(booking_slot).trim())
      .input('total_price', sql.Decimal(10, 2), Number(total_price || 0))
      .input('notes', sql.NVarChar(500), notes ? String(notes).trim() : null)
      .query(`
        INSERT INTO bookings (service_id, staff_id, customer_name, customer_phone, booking_date, booking_slot, total_price, notes)
        OUTPUT INSERTED.id, INSERTED.service_id, INSERTED.staff_id, INSERTED.customer_name, 
               INSERTED.customer_phone, FORMAT(INSERTED.booking_date, 'yyyy-MM-dd') AS booking_date, 
               INSERTED.booking_slot, INSERTED.total_price, INSERTED.notes, INSERTED.status, INSERTED.created
        VALUES (@service_id, @staff_id, @customer_name, @customer_phone, @booking_date, @booking_slot, @total_price, @notes)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (e) { next(e); }
});

// DELETE /bookings/:id - Cancel/delete a booking
apiRouter.delete('/bookings/:id', async (req, res, next) => {
  const bookingId = Number(req.params.id);
  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    return res.status(400).json({ error: 'invalid_id', message: 'Booking ID must be a positive integer' });
  }

  try {
    const pool = await getSqlPool();
    const result = await pool.request()
      .input('id', sql.Int, bookingId)
      .query('DELETE FROM bookings WHERE id = @id');

    if (!result.rowsAffected[0]) {
      return res.status(404).json({ error: 'booking_not_found', message: 'No booking found with this ID' });
    }
    res.status(204).end();
  } catch (e) { next(e); }
});

// ---------------------------------------------------------------------------
// 2. W13 Clinic Lab Rubric Compatibility Endpoints (/doctors & /appointments)
// ---------------------------------------------------------------------------

// GET /doctors
apiRouter.get('/doctors', async (_req, res, next) => {
  try {
    const pool = await getSqlPool();
    const r = await pool.request().query('SELECT id, name, specialty FROM doctors ORDER BY name');
    res.json(r.recordset);
  } catch (e) { next(e); }
});

// GET /appointments
apiRouter.get('/appointments', async (_req, res, next) => {
  try {
    const pool = await getSqlPool();
    const r = await pool.request().query(`
      SELECT a.id, a.patient_name, a.slot, d.name AS doctor_name, d.specialty
      FROM appointments a JOIN doctors d ON a.doctor_id = d.id
      ORDER BY a.slot
    `);
    res.json(r.recordset);
  } catch (e) { next(e); }
});

// POST /appointments
apiRouter.post('/appointments', async (req, res, next) => {
  const { doctor_id, patient_name, slot } = req.body || {};
  if (!doctor_id || !patient_name || !slot) {
    return res.status(400).json({ error: 'doctor_id, patient_name, slot are required' });
  }
  try {
    const pool = await getSqlPool();
    const r = await pool.request()
      .input('doctor_id', sql.Int, Number(doctor_id))
      .input('patient_name', sql.NVarChar(200), String(patient_name))
      .input('slot', sql.DateTime2, new Date(slot))
      .query(`
        INSERT INTO appointments (doctor_id, patient_name, slot)
        OUTPUT INSERTED.id, INSERTED.doctor_id, INSERTED.patient_name, INSERTED.slot
        VALUES (@doctor_id, @patient_name, @slot)
      `);
    res.status(201).json(r.recordset[0]);
  } catch (e) { next(e); }
});

// DELETE /appointments/:id
apiRouter.delete('/appointments/:id', async (req, res, next) => {
  const appointmentId = Number(req.params.id);
  if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
    return res.status(400).json({ error: 'invalid_id' });
  }
  try {
    const pool = await getSqlPool();
    const r = await pool.request()
      .input('id', sql.Int, appointmentId)
      .query('DELETE FROM appointments WHERE id = @id');
    if (!r.rowsAffected[0]) {
      return res.status(404).json({ error: 'appointment_not_found' });
    }
    res.status(204).end();
  } catch (e) { next(e); }
});

// ---------------------------------------------------------------------------
// 3. Mount Routes & Static Frontend UI
// ---------------------------------------------------------------------------

// Mount API routes under /api and root
app.use('/api', apiRouter);

// Health check / root handler
app.get(['/', '/health', '/api/health'], (req, res, next) => {
  const acceptsHtml = req.accepts('html');
  const acceptsJson = req.accepts('json');
  const isHealth = req.path === '/health' || req.path === '/api/health';
  
  if (isHealth || !acceptsHtml || (acceptsJson && !req.headers.accept?.includes('text/html'))) {
    return res.json({ ok: true, service: 'glamour-nails-api' });
  }
  const indexPath = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.json({ ok: true, service: 'glamour-nails-api' });
});

// Mount endpoints at root level as well for compatibility
app.use('/', apiRouter);

// Serve static frontend build assets (JS, CSS, SVGs)
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

// Fallback for SPA HTML5 client-side navigation
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.headers.accept?.includes('application/json')) {
    return next();
  }
  const indexPath = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  next();
});

// ---------------------------------------------------------------------------
// 4. Centralized Error Handling
// ---------------------------------------------------------------------------
app.use((err, _req, res, _next) => {
  if (err.code === 'NO_DB_CONFIG') {
    return res.status(503).json({
      error: 'database_not_configured',
      hint: 'Set AZURE_SQL_CONNECTION_STRING environment variable in server/.env or Azure App Service Application Settings'
    });
  }
  console.error('API Error:', err);
  res.status(500).json({ error: 'internal_error', message: err.message });
});

// Start server if run directly
const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectRun) {
  app.listen(PORT, () => {
    console.log(`Glamour Nails & Clinic API listening on port ${PORT}`);
  });
}

export default app;
