import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { signToken } from '../utils/jwt.js';

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function register(req, res) {
  const { name, email, password, confirmPassword } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  if (confirmPassword && confirmPassword !== password) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const hash = await hashPassword(password);
  await query(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name, email, hash, 'student']
  );

  const token = signToken({ id: null, role: 'student' });
  res.status(201).json({ message: 'Account created', token });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const [user] = await query('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (user.status === 'inactive') {
    return res.status(403).json({ message: 'Account is deactivated' });
  }

  const token = signToken({ id: user.id, role: user.role });
  res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, role: user.role } });
}

export async function me(req, res) {
  const [user] = await query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const [student] = await query('SELECT * FROM students WHERE user_id = ?', [user.id]);
  const profile = { ...user };
  if (student) profile.student = student;

  res.json({ user: profile });
}
