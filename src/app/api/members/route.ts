import { NextResponse } from 'next/server';
import { db, initDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initDatabase();
    const result = await db.execute(`
      SELECT id, username, email, full_name, initials, color, role, is_frozen, created_at
      FROM users
      ORDER BY created_at ASC
    `);

    const members = result.rows.map((row) => ({
      id: String(row.id),
      username: String(row.username),
      email: String(row.email || `${row.username}@workspace.internal`),
      fullName: String(row.full_name),
      initials: String(row.initials),
      color: String(row.color),
      role: String(row.role),
      isFrozen: Boolean(row.is_frozen),
      createdAt: String(row.created_at),
    }));

    return NextResponse.json({ success: true, members });
  } catch (error: any) {
    console.error('Fetch members error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await initDatabase();
    const body = await req.json();
    const { username, fullName, password, role = 'member' } = body;

    if (!username || !fullName || !password) {
      return NextResponse.json(
        { error: 'User ID / Username, Full Name, and Password are required.' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();

    const existing = await db.execute({
      sql: `SELECT id FROM users WHERE LOWER(username) = ? LIMIT 1`,
      args: [cleanUsername],
    });

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'This User ID / Username already exists.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `u-${Date.now()}`;
    const initials =
      fullName
        .trim()
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || cleanUsername.slice(0, 2).toUpperCase();

    const executiveColors = ['#0f766e', '#1e3a5f', '#881337', '#d97706'];
    const randomColor = executiveColors[Math.floor(Math.random() * executiveColors.length)];
    const defaultEmail = `${cleanUsername}@workspace.internal`;

    await db.execute({
      sql: `INSERT INTO users (id, username, email, password_hash, full_name, initials, color, role, is_frozen)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      args: [
        userId,
        cleanUsername,
        defaultEmail,
        passwordHash,
        fullName.trim(),
        initials,
        randomColor,
        role,
      ],
    });

    return NextResponse.json({
      success: true,
      member: {
        id: userId,
        username: cleanUsername,
        email: defaultEmail,
        fullName: fullName.trim(),
        initials,
        color: randomColor,
        role,
        isFrozen: false,
      },
    });
  } catch (error: any) {
    console.error('Create member error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create member' },
      { status: 500 }
    );
  }
}
