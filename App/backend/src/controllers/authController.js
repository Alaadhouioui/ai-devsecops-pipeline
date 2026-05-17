import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

export async function login(req, res) {
  const { email, password } = req.body;
  const result = await query('SELECT id, name, email, password_hash, role FROM users WHERE email = $1', [email.toLowerCase()]);
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    await query('INSERT INTO logs (source, level, message) VALUES ($1, $2, $3)', ['AUTH', 'warning', `Failed login attempt for ${email}`]);
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  await query('INSERT INTO audit_events (user_email, action, ip_address) VALUES ($1, $2, $3)', [
    user.email,
    'User logged in',
    req.ip
  ]);

  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
}

export function me(req, res) {
  return res.json({ user: req.user });
}

