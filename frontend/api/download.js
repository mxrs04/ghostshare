// frontend/api/download.js
import client, { initDB } from './db.js';

export default async function handler(req, res) {
  const { f } = req.query; // ?f=dateiname

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

    // Prüfen ob abgelaufen
    if (new Date(file.expiresAt) < new Date()) {
      // Optional: Datei hier aus Blob löschen
      return res.status(410).json({ error: 'Transfer abgelaufen.' });
    }

    return res.status(200).json(file);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
