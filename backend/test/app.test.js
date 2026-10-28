import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

test('public API contract and unconfigured inquiry safety', async t => {
  const server = createApp().listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}/api`;

  await t.test('health is JSON with security headers', async () => {
    const response = await fetch(`${base}/health`);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).status, 'ok');
    assert.ok(response.headers.get('x-content-type-options'));
    assert.equal(response.headers.get('x-powered-by'), null);
  });
  await t.test('all nine formats are exposed', async () => {
    const response = await fetch(`${base}/capabilities`);
    const body = await response.json();
    assert.equal(body.formats.length, 9);
    for (const name of ['Gummies', 'Granules', 'Drops']) assert.ok(body.formats.includes(name));
  });
  await t.test('inquiries are never falsely accepted', async () => {
    const response = await fetch(`${base}/inquiries`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Test' }) });
    assert.equal(response.status, 503);
    assert.equal((await response.json()).error, 'INQUIRY_SERVICE_NOT_CONFIGURED');
  });
  await t.test('malformed bodies and unknown routes are handled', async () => {
    const invalid = await fetch(`${base}/inquiries`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{broken' });
    assert.equal(invalid.status, 400);
    assert.equal((await invalid.json()).error, 'INVALID_JSON');
    assert.equal((await fetch(`${base}/missing`)).status, 404);
  });
  await t.test('CORS permits configured origins and rejects other origins', async () => {
    const allowed = await fetch(`${base}/health`, { headers: { Origin: 'http://localhost:5173' } });
    assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    const blocked = await fetch(`${base}/health`, { headers: { Origin: 'https://unrelated.example' } });
    assert.equal(blocked.status, 403);
  });
});
