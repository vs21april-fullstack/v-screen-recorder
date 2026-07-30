import { Readable } from 'node:stream';

const ALLOWED_HOST = 'tmpfiles.org';
const ALLOWED_PATH_PREFIX = '/dl/';

function validateTmpfilesUrl(value, requireDirectPath = true) {
  const url = new URL(value);
  if (
    url.protocol !== 'https:' ||
    url.hostname !== ALLOWED_HOST ||
    (requireDirectPath && !url.pathname.startsWith(ALLOWED_PATH_PREFIX))
  ) {
    throw new Error('Unsupported media URL.');
  }
  return url;
}

async function resolveLegacyDirectUrl(mediaUrl) {
  const pathParts = mediaUrl.pathname.split('/').filter(Boolean);
  if (pathParts.length >= 4) return mediaUrl;

  const landingUrl = new URL(mediaUrl);
  landingUrl.pathname = `/${pathParts.slice(1).join('/')}`;

  const landingResponse = await fetch(landingUrl);
  if (!landingResponse.ok) throw new Error('Temporary video landing page is unavailable.');

  const html = await landingResponse.text();
  const match = html.match(/<a[^>]+class=["']download["'][^>]+href=["']([^"']+)["']/i);
  if (!match) throw new Error('Temporary video download link was not found.');

  return validateTmpfilesUrl(new URL(match[1], landingUrl));
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', ['GET', 'HEAD']);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }

  let mediaUrl;

  try {
    mediaUrl = validateTmpfilesUrl(req.query.url);
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message || 'A valid media URL is required.' });
  }

  try {
    mediaUrl = await resolveLegacyDirectUrl(mediaUrl);

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
