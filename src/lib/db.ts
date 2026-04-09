import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

let initialized = false;

export async function getDb() {
  if (!initialized) {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        image_path TEXT,
        delivery_method TEXT NOT NULL,
        delivery_note TEXT,
        category TEXT DEFAULT 'other',
        seller_slack_id TEXT NOT NULL,
        seller_name TEXT NOT NULL,
        seller_image TEXT,
        slack_message_ts TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    initialized = true;
  }
  return db;
}

export interface Item {
  id: number;
  title: string;
  description: string;
  image_path: string | null;
  delivery_method: string;
  delivery_note: string | null;
  category: string;
  seller_slack_id: string;
  seller_name: string;
  seller_image: string | null;
  slack_message_ts: string | null;
  status: string;
  created_at: string;
}
