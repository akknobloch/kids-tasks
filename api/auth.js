const APP_PASSWORD = process.env.APP_PASSWORD;

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;

  if (!APP_PASSWORD) {
    // No password set, allow access
    return res.status(200).json({ success: true });
  }

  if (password === APP_PASSWORD) {
    return res.status(200).json({ success: true });
  } else {
    return res.status(401).json({ error: 'Incorrect password' });
  }
}