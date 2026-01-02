// frontend/api/upload-meta.js
import client, { initDB } from './db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  try {
    const { url, filename, minutes } = req.body;
    await initDB(); // Sicherstellen, dass DB existiert

    // Ablaufdatum berechnen
    const expiresAt = new Date(Date.now() + minutes * 60000).toISOString();

    // Wir nutzen den Dateinamen (oder einen Teil davon) als ID für den Download-Link
    // Um es einfach zu halten, nehmen wir hier den echten Dateinamen.
    // In einer Pro-Version würde man eine zufällige ID generieren.

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
