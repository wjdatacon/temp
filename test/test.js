const assert = require('assert');
const { startServer } = require('../server');

(async () => {
  const server = await startServer(0); // random port
  const port = server.address().port;
  const base = `http://localhost:${port}`;

  let res = await fetch(base + '/api/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'A', email: 'a@example.com', phone: '123', resume: 'hi' })
  });
  assert.strictEqual(res.status, 200);
  const { id } = await res.json();

  res = await fetch(base + '/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  assert.strictEqual(res.status, 200);

  res = await fetch(base + '/api/schedule', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, interviewDate: '2025-01-01 10:00' })
  });
  assert.strictEqual(res.status, 200);

  res = await fetch(base + '/api/result', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, result: '합격' })
  });
  assert.strictEqual(res.status, 200);

  res = await fetch(base + '/api/applications');
  const apps = await res.json();
  assert.strictEqual(apps[0].result, '합격');

  server.close();
  console.log('All tests passed');
})();
