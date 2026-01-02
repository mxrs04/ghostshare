// frontend/api/db.js
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Tabelle erstellen, falls sie noch nicht existiert (passiert automatisch beim ersten Aufruf)
export async function initDB() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      filename TEXT,
      url TEXT,
      expiresAt DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  return client;
}

export default client;
