import { verifySessionToken } from './utils/crypto.js';
import { 
  getUserRecordings, 
  createRecording, 
  deleteUserRecording, 
  renameUserRecording 
} from './utils/db.js';

// Helper to get session user
function getSessionUser(req) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  
  const pairs = cookieHeader.split(';');
  let token = null;
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key.trim() === 'session_token') {
      token = value ? decodeURIComponent(value.trim()) : null;
      break;
    }
  }

  if (!token) return null;
  return verifySessionToken(token);
}

export default async function handler(req, res) {
  // 1. Authenticate user
  const sessionUser = getSessionUser(req);
  if (!sessionUser) {
    return res.status(401).json({ success: false, error: 'Unauthorized. Please sign in.' });
  }

  const userId = sessionUser.userId;

  try {
    // 2. Route based on HTTP Method
    switch (req.method) {
      case 'GET': {
        // Query paginated and filtered recordings
        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = parseInt(req.query.pageSize, 10) || 5;
        const searchQuery = req.query.searchQuery || '';
        const startDate = req.query.startDate || '';
        const endDate = req.query.endDate || '';

        const data = await getUserRecordings(userId, {
          page,
          pageSize,
          searchQuery,
          startDate,
          endDate
        });

        return res.status(200).json({ success: true, ...data });
      }

      case 'POST': {
        // Add new cloud recording record
        const { id, title, mode, duration, videoUrl } = req.body;

        if (!id || !title || !mode || duration === undefined || !videoUrl) {
          return res.status(400).json({ success: false, error: 'Missing required recording fields.' });
        }

        const item = await createRecording({
          id,
          userId,
          title,
          mode,
          duration,
          videoUrl
        });

        return res.status(201).json({ success: true, item });
      }

      case 'PATCH': {
        // Rename recording
        const { id, title } = req.body;

        if (!id || !title || !title.trim()) {
          return res.status(400).json({ success: false, error: 'Recording ID and new title are required.' });
        }

        await renameUserRecording(userId, id, title.trim());
        return res.status(200).json({ success: true });
      }

      case 'DELETE': {
        // Delete recording
        const { id } = req.query;

        if (!id) {
          return res.status(400).json({ success: false, error: 'Recording ID is required.' });
        }

        await deleteUserRecording(userId, id);
        return res.status(200).json({ success: true });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
        return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error(`Recordings API [${req.method}] failed:`, error);
    return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
}
