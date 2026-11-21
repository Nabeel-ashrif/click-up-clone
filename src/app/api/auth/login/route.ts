import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { initDatabase } from '@/lib/db';
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

    const cleanId = identifier.trim().toLowerCase();

    // Query user by username or email from Supabase
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .or(`username.ilike.${cleanId},email.ilike.${cleanId}`)
      .limit(1);

    if (error || !users || users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid User ID or password' },
        { status: 401 }
      );
    }

    const user = users[0];

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
      username: String(user.username || cleanId),
      email: String(user.email || `${cleanId}@workspace.internal`),
      fullName: String(user.full_name),
      initials: String(user.initials || cleanId.slice(0, 2).toUpperCase()),
      color: String(user.color || '#0f766e'),
      role: String(user.role || 'member'),
    };

    const response = NextResponse.json({
      success: true,
      user: userPayload,
      message: 'Login successful',
    });

    // Set secure HTTP-only session cookie
    response.cookies.set({
      name: 'clickup_session_user',
      value: JSON.stringify(userPayload),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login authentication error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during login' },
      { status: 500 }
    );
  }
}
