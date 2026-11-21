import { NextResponse } from 'next/server';
import { db, initDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await initDatabase();
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'User ID and password are required' },
        { status: 400 }
      );
    }

    // Query user by username or email
    const result = await db.execute({
      sql: `SELECT * FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?) LIMIT 1`,
      args: [identifier.trim(), identifier.trim()],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid User ID or password' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Check if account is frozen by admin
    if (user.is_frozen === 1) {
      return NextResponse.json(
        {
          error:
            'This account has been frozen by a workspace administrator. Please contact your admin.',
        },
        { status: 403 }
      );
    }

    const passwordValid = await bcrypt.compare(password, String(user.password_hash));

    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Invalid User ID or password' },
        { status: 401 }
      );
    }

    // Construct authenticated user payload
    const userPayload = {
      id: String(user.id),
      username: String(user.username),
      email: String(user.email || `${user.username}@workspace.internal`),
      fullName: String(user.full_name),
      initials: String(user.initials),
      color: String(user.color),
      role: String(user.role),
      isFrozen: false,
    };

    const res = NextResponse.json({ success: true, user: userPayload });

    // Set session cookie
    res.cookies.set('clickup_session_user', JSON.stringify(userPayload), {
      httpOnly: false,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return res;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
