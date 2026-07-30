import { getUserByEmail } from '../utils/db.js';
import { verifyPassword, createSessionToken } from '../utils/crypto.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    // Retrieve user details
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    // Verify Password Hash
    const passwordMatch = verifyPassword(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    // Create session token
    const token = createSessionToken({ userId: user.id, email: user.email });

    // Set secure HTTP-Only cookie
    res.setHeader(
      'Set-Cookie',
      `session_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`
    );

    return res.status(200).json({
      success: true,
      user: { email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
}
