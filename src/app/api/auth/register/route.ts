import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { initDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await initDatabase();
    const body = await req.json();
    const { username, fullName, password, role = 'member', email } = body;

    if (!username || !fullName || !password) {
      return NextResponse.json(
        { error: 'User ID / Username, Full Name, and Password are required.' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();

    // Check if username already exists in Supabase
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .ilike('username', cleanUsername)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'This User ID / Username is already taken. Please choose another.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const initials = fullName
      .trim()
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || cleanUsername.slice(0, 2).toUpperCase();

    const executiveColors = ['#0f766e', '#1e3a5f', '#881337', '#d97706'];
    const randomColor = executiveColors[Math.floor(Math.random() * executiveColors.length)];
    const userEmail = email && email.trim() ? email.trim().toLowerCase() : `${cleanUsername}@workspace.internal`;

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        username: cleanUsername,
        email: userEmail,
        password_hash: passwordHash,
        full_name: fullName.trim(),
        initials,
        color: randomColor,
        role,
        is_frozen: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Registration insertion error:', insertError);
      return NextResponse.json(
        { error: insertError.message || 'Failed to create user account' },
        { status: 500 }
      );
    }

    const userPayload = {
      id: String(inserted.id),
      username: cleanUsername,
      email: userEmail,
      fullName: fullName.trim(),
      initials,
      color: randomColor,
      role,
    };

    const response = NextResponse.json({
      success: true,
      user: userPayload,
      message: 'Account created successfully',
    });

    response.cookies.set({
      name: 'clickup_session_user',
      value: JSON.stringify(userPayload),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register user' },
      { status: 500 }
    );
  }
}
