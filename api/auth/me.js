import { verifySessionToken } from '../utils/crypto.js';

// Parse raw cookie headers helper
function getCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key.trim() === name) {
      return value ? decodeURIComponent(value.trim()) : null;
    }
  }
  return null;
}

export default async function handler(req, res) {
  try {
    const token = getCookie(req.headers.cookie, 'session_token');
    
    if (!token) {
      return res.status(200).json({ success: false, authenticated: false });
    }

    const payload = verifySessionToken(token);
    
    if (!payload) {
      // Clear invalid/expired cookie
      res.setHeader(
        'Set-Cookie',
        'session_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'
      );
      return res.status(200).json({ success: false, authenticated: false, message: 'Session expired.' });
    }

    // Session is valid
    return res.status(200).json({
      success: true,
      authenticated: true,
      user: {
        id: payload.userId,
        email: payload.email
      }
    });
  } catch (error) {
    console.error('Session me query error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
