import { Readable } from 'node:stream';

const ALLOWED_HOST = 'tmpfiles.org';
const ALLOWED_PATH_PREFIX = '/dl/';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', ['GET', 'HEAD']);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }

  let mediaUrl;

  try {
    mediaUrl = new URL(req.query.url);
  } catch (error) {
    return res.status(400).json({ success: false, error: 'A valid media URL is required.' });
  }

  if (
    mediaUrl.protocol !== 'https:' ||
    mediaUrl.hostname !== ALLOWED_HOST ||
    !mediaUrl.pathname.startsWith(ALLOWED_PATH_PREFIX)
  ) {
    return res.status(400).json({ success: false, error: 'Unsupported media URL.' });
  }

  try {
    const upstreamHeaders = {};
    if (req.headers.range) upstreamHeaders.Range = req.headers.range;

    const upstream = await fetch(mediaUrl, {
      method: req.method,
      headers: upstreamHeaders,
      redirect: 'manual'
    });

    const contentType = upstream.headers.get('content-type') || '';
    const isMedia = contentType.startsWith('video/') || contentType === 'application/octet-stream';

    if (!upstream.ok || !isMedia) {
      return res.status(502).json({
        success: false,
        error: 'The temporary video is unavailable or has expired.'
      });
    }

    for (const header of ['accept-ranges', 'content-length', 'content-range', 'content-type']) {
      const value = upstream.headers.get(header);
      if (value) res.setHeader(header, value);
    }
    res.setHeader('Cache-Control', 'private, max-age=300');
    res.status(upstream.status);

    if (req.method === 'HEAD' || !upstream.body) return res.end();

    Readable.fromWeb(upstream.body).pipe(res);
  } catch (error) {
    console.error('Media proxy failed:', error);
    return res.status(502).json({
      success: false,
      error: 'Unable to retrieve the temporary video.'
    });
  }
}
