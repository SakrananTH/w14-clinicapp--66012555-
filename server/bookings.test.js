import { test } from 'node:test';
import assert from 'node:assert/strict';
import app from './index.js';

async function withServer(fn) {
  const server = await new Promise(resolve => {
    const instance = app.listen(0, () => resolve(instance));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    await fn(base);
  } finally {
    await new Promise((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
    });
  }
}

test('GET / returns service status ok', async () => {
  await withServer(async base => {
    const response = await fetch(`${base}/`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.ok, true);
    assert.equal(body.service, 'glamour-nails-api');
  });
});

test('DELETE /bookings/:id rejects non-numeric id (400)', async () => {
  await withServer(async base => {
    const response = await fetch(`${base}/bookings/abc`, { method: 'DELETE' });
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error, 'invalid_id');
  });
});

test('DELETE /bookings/:id rejects zero and negative id (400)', async () => {
  await withServer(async base => {
    for (const bad of ['0', '-10']) {
      const response = await fetch(`${base}/bookings/${bad}`, { method: 'DELETE' });
      assert.equal(response.status, 400, `expected 400 for id=${bad}`);
    }
  });
});

test('POST /bookings rejects missing required payload (400)', async () => {
  await withServer(async base => {
    const response = await fetch(`${base}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_name: 'Test' })
    });
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error, 'validation_failed');
  });
});

test('POST /bookings rejects invalid or non-10 digit customer_phone (400)', async () => {
  await withServer(async base => {
    const badPayload = {
      service_id: 1,
      staff_id: 1,
      customer_name: 'ณิชา',
      customer_phone: '12345',
      booking_date: '2026-10-10',
      booking_slot: '10:00'
    };
    const response = await fetch(`${base}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(badPayload)
    });
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error, 'validation_failed');
  });
});

test('DELETE /appointments/:id rejects non-numeric id (400)', async () => {
  await withServer(async base => {
    const response = await fetch(`${base}/appointments/xyz`, { method: 'DELETE' });
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error, 'invalid_id');
  });
});

test('POST /appointments rejects incomplete fields (400)', async () => {
  await withServer(async base => {
    const response = await fetch(`${base}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctor_id: 1 })
    });
    assert.equal(response.status, 400);
  });
});

test('GET /services returns 503 without DB connection string', async () => {
  await withServer(async base => {
    const response = await fetch(`${base}/services`);
    assert.equal(response.status, 503);
    const body = await response.json();
    assert.equal(body.error, 'database_not_configured');
  });
});
