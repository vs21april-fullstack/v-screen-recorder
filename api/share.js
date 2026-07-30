// Vercel Serverless Function: Proxy for uploading video files
// This keeps third-party storage endpoints and credentials hidden from the client browser.

export const config = {
  api: {
    bodyParser: false, // Disable automatic body parsing to handle raw binary streams
  },
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }

  try {
    // 1. Read the raw request body stream into a single buffer
    const chunks = [];
    let size = 0;
    
    for await (const chunk of req) {
      chunks.push(chunk);
      size += chunk.length;
      
      // Limit file size to 50MB in free tier to prevent memory issues
      if (size > 50 * 1024 * 1024) {
        return res.status(413).json({ success: false, error: 'File size exceeds 50MB limit' });
      }
    }
    
    const buffer = Buffer.concat(chunks);
    if (buffer.length === 0) {
      return res.status(400).json({ success: false, error: 'No video data received' });
    }

    // Get filename or generate a default one
    const filename = req.headers['x-filename'] || `v_recording_${Date.now()}.webm`;
    const mimeType = req.headers['content-type'] || 'video/webm';

    // 2. Prepare Form Data for the storage API
    // Node.js 18+ supports global FormData, File, and Blob out of the box
    const formData = new FormData();
    const file = new File([buffer], filename, { type: mimeType });
    formData.append('file', file);

    // 3. Forward the request to the storage provider (tmpfiles.org)
    // You can replace this with your Vercel Blob or Supabase storage credentials in production.
    const uploadUrl = process.env.STORAGE_API_URL || 'https://tmpfiles.org/api/v1/upload';
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Provider upload error:', errorText);
      return res.status(response.status).json({ 
        success: false, 
        error: 'Failed to upload to storage provider.' 
      });
    }

    const result = await response.json();

    if (result.status === 'success' && result.data && result.data.url) {
      // tmpfiles.org URLs look like: https://tmpfiles.org/12345/filename
      // The direct play link (with raw media headers) is: https://tmpfiles.org/dl/12345/filename
      const rawUrl = result.data.url;
      const directUrl = rawUrl.replace('tmpfiles.org/', 'tmpfiles.org/dl/');

      return res.status(200).json({
        success: true,
        url: directUrl, // Provide the direct video URL for inline video players
        viewUrl: rawUrl, // Provide the landing page URL
        filename
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        error: 'Invalid response format from storage provider.' 
      });
    }
  } catch (error) {
    console.error('Serverless upload proxy failed:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
}
