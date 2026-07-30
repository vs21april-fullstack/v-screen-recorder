// Cryptographic and Session Token Utilities using native Node.js Crypto API
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'v-screen-recorder-fallback-dev-secret-key-54321';

/**
 * Hashes a plaintext password using PBKDF2-SHA512 with a random salt.
 * @param {string} password
 * @returns {string} Combined salt and hash "salt:hash"
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a plaintext password against a stored "salt:hash" string.
 * @param {string} password
 * @param {string} storedPasswordHash
 * @returns {boolean} True if matched
 */
export function verifyPassword(password, storedPasswordHash) {
  if (!storedPasswordHash || !storedPasswordHash.includes(':')) return false;
  const [salt, originalHash] = storedPasswordHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

/**
 * Generates a signed, URL-safe session token containing a payload.
 * @param {Object} payload - User object/metadata to store
 * @param {number} [expiresInDays=7]
 * @returns {string} The signed session token (HS256 JWT format)
 */
export function createSessionToken(payload, expiresInDays = 7) {
  const expiry = Date.now() + (expiresInDays * 24 * 60 * 60 * 1000);
  const data = JSON.stringify({ ...payload, exp: expiry });
  
  const header = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
  
  const base64Header = Buffer.from(header).toString('base64url');
  const base64Data = Buffer.from(data).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${base64Header}.${base64Data}`)
    .digest('base64url');
    
  return `${base64Header}.${base64Data}.${signature}`;
}

/**
 * Decodes and verifies a signed session token.
 * Returns the payload if valid, or null if expired or tampered.
 * @param {string} token
 * @returns {Object|null} Payload or null
 */
export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  
  const [header, payload, signature] = parts;
  
  // Re-verify signature
  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');
    
  if (signature !== expectedSignature) {
    return null; // Tampered token
  }
  
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    
    // Check expiration
    if (data.exp && Date.now() > data.exp) {
      return null; // Expired token
    }
    
    return data;
  } catch (e) {
    return null;
  }
}
