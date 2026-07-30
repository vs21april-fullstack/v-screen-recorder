import { createUser, getUserByEmail } from '../utils/db.js';
import { hashPassword, createSessionToken } from '../utils/crypto.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email address is required.' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'Email is already registered.' });
    }

    // Hash password and save user
    const passwordHash = hashPassword(password);
    const user = await createUser(email, passwordHash);

    // Create session token
    const token = createSessionToken({ userId: user.id, email: user.email });

    // Set secure HTTP-only cookie
    // Max-Age = 7 days
    res.setHeader(
      'Set-Cookie',
      `session_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`
    );

    return res.status(201).json({
      success: true,
      user: { email: user.email }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
}
