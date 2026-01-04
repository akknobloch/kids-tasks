import crypto from 'crypto';

const APP_PASSWORD = process.env.APP_PASSWORD;

function makeToken(secret) {
  return crypto.createHash('sha256').update(secret || 'open-access').digest('hex');
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;

  const expected = APP_PASSWORD || '';

  if (!expected || password === expected) {
    return res.status(200).json({ success: true, token: makeToken(expected) });
  }

  return res.status(401).json({ error: 'Incorrect password' });
}
