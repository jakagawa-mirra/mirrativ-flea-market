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
);
