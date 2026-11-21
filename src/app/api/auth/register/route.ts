import { NextResponse } from 'next/server';
import { db, initDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await initDatabase();
    const body = await req.json();
    const { username, fullName, password, role = 'member', email } = body;

    // Only Username/ID, Full Name, Password, and Role are required
    if (!username || !fullName || !password) {
      return NextResponse.json(
        { error: 'User ID / Username, Full Name, and Password are required.' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();

    // Check if username/ID already exists
    const existing = await db.execute({
      sql: `SELECT id FROM users WHERE LOWER(username) = ? LIMIT 1`,
      args: [cleanUsername],
    });

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'This User ID / Username is already taken. Please choose another.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `u-${Date.now()}`;
    const initials = fullName
      .trim()
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || cleanUsername.slice(0, 2).toUpperCase();

    // Executive palette assignment: Teal, Navy, Maroon, Golden Yellow
    const executiveColors = ['#0f766e', '#1e3a5f', '#881337', '#d97706'];
    const randomColor = executiveColors[Math.floor(Math.random() * executiveColors.length)];

    const userEmail = email && email.trim() ? email.trim().toLowerCase() : `${cleanUsername}@workspace.internal`;

    await db.execute({
      sql: `INSERT INTO users (id, username, email, password_hash, full_name, initials, color, role, is_frozen)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      args: [
        userId,
        cleanUsername,
        userEmail,
        passwordHash,
        fullName.trim(),
        initials,
        randomColor,
        role,
      ],
    });

    const userPayload = {
      id: userId,
      username: cleanUsername,
      email: userEmail,
      fullName: fullName.trim(),
      initials,
      color: randomColor,
      role,
      isFrozen: false,
    };

    const res = NextResponse.json({ success: true, user: userPayload });

    res.cookies.set('clickup_session_user', JSON.stringify(userPayload), {
      httpOnly: false,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return res;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
