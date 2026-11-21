import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

// If deployed on Vercel, connects to cloud SQLite (Turso) via environment variables.
// Otherwise, seamlessly falls back to local persistent disk SQLite (file:clickup.db).
export const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:clickup.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function initDatabase() {
  // 1. Create Users Table (email is optional, username/ID, full_name, password_hash, role are required)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      initials TEXT NOT NULL,
      color TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      is_frozen INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Safely ensure is_frozen column exists if table was created earlier
  try {
    await db.execute(`ALTER TABLE users ADD COLUMN is_frozen INTEGER DEFAULT 0;`);
  } catch {
    // Column already exists
  }

  // 2. Create Sessions Table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL
    );
  `);

  // 3. Seed Default Team Accounts if empty
  const existingUsers = await db.execute('SELECT COUNT(*) as count FROM users');
  const count = Number(existingUsers.rows[0].count);

  if (count === 0) {
    const defaultPassword = await bcrypt.hash('password123', 10);

    const initialUsers = [
      {
        id: 'u-alex',
        username: 'alex',
        email: 'alex.chen@team.internal',
        fullName: 'Alex Chen',
        initials: 'AC',
        color: '#0f766e', // Teal Green
        role: 'owner',
      },
      {
        id: 'u-maya',
        username: 'maya',
        email: 'maya.patel@team.internal',
        fullName: 'Maya Patel',
        initials: 'MP',
        color: '#1e3a5f', // Navy Blue
        role: 'admin',
      },
      {
        id: 'u-jordan',
        username: 'jordan',
        email: 'jordan.lee@team.internal',
        fullName: 'Jordan Lee',
        initials: 'JL',
        color: '#d97706', // Golden Yellow
        role: 'member',
      },
      {
        id: 'u-liam',
        username: 'liam',
        email: 'liam.smith@team.internal',
        fullName: 'Liam Smith',
        initials: 'LS',
        color: '#881337', // Maroon
        role: 'member',
      },
      {
        id: 'u-sam',
        username: 'sam',
        email: 'sam.taylor@team.internal',
        fullName: 'Sam Taylor',
        initials: 'ST',
        color: '#64748b',
        role: 'viewer',
      },
    ];

    for (const u of initialUsers) {
      await db.execute({
        sql: `INSERT INTO users (id, username, email, password_hash, full_name, initials, color, role, is_frozen)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        args: [
          u.id,
          u.username,
          u.email,
          defaultPassword,
          u.fullName,
          u.initials,
          u.color,
          u.role,
        ],
      });
    }
  }
}
