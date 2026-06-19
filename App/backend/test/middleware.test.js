import assert from 'node:assert/strict';
import test from 'node:test';
import jwt from 'jsonwebtoken';
import { requireAuth, requireRole } from '../src/middleware/auth.js';
import { validateLogin } from '../src/middleware/validate.js';

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

test('validateLogin rejects missing credentials', () => {
  const req = { body: { email: 'admin@aerosec.local' } };
  const res = createResponse();
  let nextCalled = false;

  validateLogin(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { message: 'Email and password are required' });
  assert.equal(nextCalled, false);
});

test('validateLogin accepts string email and password', () => {
  const req = { body: { email: 'admin@aerosec.local', password: 'Admin123!' } };
  const res = createResponse();
  let nextCalled = false;

  validateLogin(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 200);
  assert.equal(nextCalled, true);
});

test('requireAuth rejects requests without bearer token', () => {
  const req = { headers: {} };
  const res = createResponse();
  let nextCalled = false;

  requireAuth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { message: 'Authentication token required' });
  assert.equal(nextCalled, false);
});

test('requireAuth verifies valid JWT and attaches user', () => {
  process.env.JWT_SECRET = 'test-secret';
  const token = jwt.sign({ id: 'user-1', email: 'admin@aerosec.local', role: 'Admin' }, process.env.JWT_SECRET);
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = createResponse();
  let nextCalled = false;

  requireAuth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 200);
  assert.equal(nextCalled, true);
  assert.equal(req.user.email, 'admin@aerosec.local');
  assert.equal(req.user.role, 'Admin');
});

test('requireRole rejects users outside allowed roles', () => {
  const req = { user: { role: 'Operator' } };
  const res = createResponse();
  let nextCalled = false;

  requireRole('Admin', 'Engineer')(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, { message: 'Insufficient privileges' });
  assert.equal(nextCalled, false);
});

test('requireRole allows users with an allowed role', () => {
  const req = { user: { role: 'Engineer' } };
  const res = createResponse();
  let nextCalled = false;

  requireRole('Admin', 'Engineer')(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 200);
  assert.equal(nextCalled, true);
});
