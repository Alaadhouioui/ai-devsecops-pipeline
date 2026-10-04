import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'node:http';
import express from 'express';
import app, { errorHandler } from '../src/app.js';

test('version endpoint returns build metadata through the mounted API route', async (t) => {
  process.env.BUILD_NUMBER = '42';
  process.env.GIT_COMMIT = 'abcdef123456';
  const server = createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => server.close());

  const healthResponse = await fetch(`http://127.0.0.1:${server.address().port}/health`);
  assert.deepEqual(await healthResponse.json(), {
    status: 'healthy',
    service: 'aerosec-backend'
  });

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/version`);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(body, {
    version: '1.0.0',
    buildNumber: '42',
    commit: 'abcdef1',
    builtAt: body.builtAt
  });
  assert.ok(Number.isFinite(Date.parse(body.builtAt)));

  const errorApp = express();
  errorApp.get('/test-error', () => {
    throw new Error('expected test error');
  });
  errorApp.use(errorHandler);
  const errorServer = createServer(errorApp);
  await new Promise((resolve) => errorServer.listen(0, '127.0.0.1', resolve));
  t.after(() => errorServer.close());

  const originalConsoleError = console.error;
  console.error = () => {};
  try {
    const errorResponse = await fetch(`http://127.0.0.1:${errorServer.address().port}/test-error`);
    assert.equal(errorResponse.status, 500);
    assert.deepEqual(await errorResponse.json(), { message: 'Internal server error' });
  } finally {
    console.error = originalConsoleError;
  }
});
