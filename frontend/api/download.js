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

  const { f } = req.query;

  if (!f) return res.status(400).send('Missing filename');

  try {
    await initDB();
    const result = await client.execute({
      sql: 'SELECT * FROM files WHERE filename = ?',
      args: [f],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Datei nicht gefunden oder abgelaufen.' });
    }

    const file = result.rows[0];

    if (new Date(file.expiresAt) < new Date()) {
      return res.status(410).json({ error: 'Transfer abgelaufen.' });
    }

    return res.status(200).json(file);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
