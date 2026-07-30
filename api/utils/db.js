import fs from 'fs';
import path from 'path';
import pg from 'pg';

const usePostgres = !!process.env.DATABASE_URL;
let pool = null;

// JSON File Database configuration (local fallback)
const JSON_DB_PATH = path.join('/tmp', 'v_screen_recorder_db.json');

// Initialize database connection/schema
async function initDB() {
  if (usePostgres) {
    if (!pool) {
      pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
      });

      // Create Tables automatically if they don't exist
      const client = await pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS v_users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS v_recordings (
            id VARCHAR(255) PRIMARY KEY,
            user_id INTEGER REFERENCES v_users(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            mode VARCHAR(50) NOT NULL,
            duration INTEGER NOT NULL,
            video_url VARCHAR(2048) NOT NULL,
            timestamp BIGINT NOT NULL
          );
        `);
      } finally {
        client.release();
      }
    }
  } else {
    // Local JSON File DB initialization
    if (!fs.existsSync(JSON_DB_PATH)) {
      fs.writeFileSync(JSON_DB_PATH, JSON.stringify({ users: [], recordings: [] }, null, 2));
      console.log('Local fallback JSON database initialized at:', JSON_DB_PATH);
    }
  }
}

// Read JSON database file helper
function readJsonDB() {
  try {
    if (!fs.existsSync(JSON_DB_PATH)) {
      return { users: [], recordings: [] };
    }
    const data = fs.readFileSync(JSON_DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading JSON DB, returning empty schema:', e);
    return { users: [], recordings: [] };
  }
}

// Write JSON database file helper
function writeJsonDB(data) {
  try {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error writing JSON DB:', e);
  }
}

/**
 * Creates a new user record.
 */
export async function createUser(email, passwordHash) {
  await initDB();
  const lowerEmail = email.toLowerCase().trim();

  if (usePostgres) {
    const res = await pool.query(
      'INSERT INTO v_users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [lowerEmail, passwordHash]
    );
    return res.rows[0];
  } else {
    const db = readJsonDB();
    if (db.users.find(u => u.email === lowerEmail)) {
      throw new Error('User already exists');
    }
    const id = db.users.length + 1;
    const user = { id, email: lowerEmail, password_hash: passwordHash, created_at: new Date().toISOString() };
    db.users.push(user);
    writeJsonDB(db);
    return { id, email: lowerEmail };
  }
}

/**
 * Retrieves a user record by email.
 */
export async function getUserByEmail(email) {
  await initDB();
  const lowerEmail = email.toLowerCase().trim();

  if (usePostgres) {
    const res = await pool.query('SELECT * FROM v_users WHERE email = $1', [lowerEmail]);
    return res.rows[0] || null;
  } else {
    const db = readJsonDB();
    const user = db.users.find(u => u.email === lowerEmail);
    return user || null;
  }
}

/**
 * Creates a new cloud recording record.
 */
export async function createRecording({ id, userId, title, mode, duration, videoUrl }) {
  await initDB();
  const timestamp = Date.now();

  if (usePostgres) {
    await pool.query(
      'INSERT INTO v_recordings (id, user_id, title, mode, duration, video_url, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, userId, title, mode, duration, videoUrl, timestamp]
    );
    return { id, userId, title, mode, duration, videoUrl, timestamp };
  } else {
    const db = readJsonDB();
    const recording = { id, user_id: userId, title, mode, duration, video_url: videoUrl, timestamp };
    db.recordings.push(recording);
    writeJsonDB(db);
    return recording;
  }
}

/**
 * Queries user-specific recordings with pagination, search query, and date range filters.
 */
export async function getUserRecordings(userId, { page = 1, pageSize = 5, searchQuery = '', startDate = '', endDate = '' }) {
  await initDB();
  
  if (usePostgres) {
    let query = 'SELECT * FROM v_recordings WHERE user_id = $1';
    const params = [userId];
    let paramIndex = 2;

    if (searchQuery) {
      query += ` AND LOWER(title) LIKE $${paramIndex}`;
      params.push(`%${searchQuery.toLowerCase()}%`);
      paramIndex++;
    }

    if (startDate) {
      const startMs = new Date(startDate + 'T00:00:00').getTime();
      query += ` AND timestamp >= $${paramIndex}`;
      params.push(startMs);
      paramIndex++;
    }

    if (endDate) {
      const endMs = new Date(endDate + 'T23:59:59').getTime();
      query += ` AND timestamp <= $${paramIndex}`;
      params.push(endMs);
      paramIndex++;
    }

    // Get Total Count
    const countRes = await pool.query(
      query.replace('SELECT *', 'SELECT COUNT(*) as total'),
      params
    );
    const total = parseInt(countRes.rows[0].total, 10);

    // Get Paginated records
    query += ` ORDER BY timestamp DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(pageSize, (page - 1) * pageSize);

    const recordsRes = await pool.query(query, params);
    
    // Map database snake_case fields to frontend camelCase formats
    const items = recordsRes.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      mode: row.mode,
      duration: row.duration,
      videoUrl: row.video_url,
      timestamp: Number(row.timestamp)
    }));

    return { items, total };
  } else {
    const db = readJsonDB();
    
    // Filter records
    let filtered = db.recordings.filter(r => Number(r.user_id) === Number(userId));

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => item.title.toLowerCase().includes(query));
    }

    if (startDate) {
      const startMs = new Date(startDate + 'T00:00:00').getTime();
      filtered = filtered.filter(item => item.timestamp >= startMs);
    }

    if (endDate) {
      const endMs = new Date(endDate + 'T23:59:59').getTime();
      filtered = filtered.filter(item => item.timestamp <= endMs);
    }

    // Sort descending by timestamp
    filtered.sort((a, b) => b.timestamp - a.timestamp);

    const total = filtered.length;

    // Paginate
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = filtered.slice(startIndex, startIndex + pageSize).map(row => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      mode: row.mode,
      duration: row.duration,
      videoUrl: row.video_url,
      timestamp: row.timestamp
    }));

    return { items: paginatedItems, total };
  }
}

/**
 * Deletes a user recording record.
 */
export async function deleteUserRecording(userId, id) {
  await initDB();

  if (usePostgres) {
    await pool.query('DELETE FROM v_recordings WHERE user_id = $1 AND id = $2', [userId, id]);
  } else {
    const db = readJsonDB();
    db.recordings = db.recordings.filter(r => !(Number(r.user_id) === Number(userId) && r.id === id));
    writeJsonDB(db);
  }
}

/**
 * Renames a user recording record.
 */
export async function renameUserRecording(userId, id, newTitle) {
  await initDB();

  if (usePostgres) {
    await pool.query(
      'UPDATE v_recordings SET title = $1 WHERE user_id = $2 AND id = $3',
      [newTitle, userId, id]
    );
  } else {
    const db = readJsonDB();
    const item = db.recordings.find(r => Number(r.user_id) === Number(userId) && r.id === id);
    if (item) {
      item.title = newTitle;
      writeJsonDB(db);
    } else {
      throw new Error('Recording not found');
    }
  }
}
