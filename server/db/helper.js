import dotenv from 'dotenv';
import { createClient } from '@libsql/client';

dotenv.config();

const db = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

await db.execute(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
  );
`)
await db.execute(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT,
    user_id INTEGER,
    destination_user_id INTEGER,
    status TEXT DEFAULT 'sending',
    created_at DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(destination_user_id) REFERENCES users(id)
  );
`)

export const listMessages = (id = 0, user_id, destination_user_id) => db.execute({
  sql: `SELECT * FROM messages WHERE id > :id AND (user_id = :user_id AND destination_user_id = :destination_user_id) OR (user_id = :destination_user_id AND destination_user_id = :user_id)`,
  args: { id, user_id, destination_user_id }
})

export const insertMessage = (msg, user_id, target_user_id) => db.execute({
  sql:`INSERT INTO messages (message, user_id, destination_user_id) VALUES (:msg, :user_id, :target_user_id)`, 
  args: { msg, user_id, target_user_id }
})

// USERS
export const createUser = (name) => db.execute({
  sql: `INSERT INTO users (name) VALUES (:name)`,
  args: { name }
});

export const listUsers = () => db.execute(`SELECT * FROM users`)

export default {}