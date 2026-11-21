import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { initDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initDatabase();
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, username, email, full_name, initials, color, role, is_frozen, created_at')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Fetch members error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const members = (users || []).map((row) => ({
      id: String(row.id),
      username: String(row.username || ''),
      email: String(row.email || `${row.username}@workspace.internal`),
      fullName: String(row.full_name),
      initials: String(row.initials || 'U'),
      color: String(row.color || '#0f766e'),
      role: String(row.role || 'member'),
      isFrozen: row.is_frozen === 1,
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

    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .ilike('username', cleanUsername)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'This User ID / Username already exists.' },
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
    const defaultEmail = `${cleanUsername}@workspace.internal`;

    const { data: inserted, error } = await supabaseAdmin
      .from('users')
      .insert({
        username: cleanUsername,
        email: defaultEmail,
        password_hash: passwordHash,
        full_name: fullName.trim(),
        initials,
        color: randomColor,
        role,
        is_frozen: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      member: {
        id: String(inserted.id),
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
