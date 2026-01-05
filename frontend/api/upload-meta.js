import client, { initDB } from './db.js';

export default async function handler(req, res) {
  // --- CORS BLOCK START ---
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  // --- CORS BLOCK ENDE ---

  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  try {
    const { url, filename, minutes } = req.body;
    await initDB();

    const expiresAt = new Date(Date.now() + minutes * 60000).toISOString();

    await client.execute({
      sql: 'INSERT INTO files (id, filename, url, expiresAt) VALUES (?, ?, ?, ?)',
      args: [filename, filename, url, expiresAt],
    });

    return res.status(200).json({ success: true, filename });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
