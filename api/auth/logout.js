export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }

  // Clear cookie session immediately by setting Max-Age=0
  res.setHeader(
    'Set-Cookie',
    'session_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'
  );

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
}
