import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { initDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await initDatabase();
    const body = await req.json();
    const { currentPassword, newPassword, username } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 3) {
      return NextResponse.json(
        { error: 'New password must be at least 3 characters long' },
        { status: 400 }
      );
    }

    // Determine target user: from body username, or from session cookie
    let targetUsername = (username || '').trim().toLowerCase();

    if (!targetUsername) {
      const cookieStore = cookies();
      const sessionCookie = cookieStore.get('clickup_session_user');
      if (sessionCookie && sessionCookie.value) {
        try {
          const sessionUser = JSON.parse(sessionCookie.value);
          targetUsername = (sessionUser.username || '').toLowerCase();
        } catch {
          // ignore error
        }
      }
    }

    if (!targetUsername) {
      return NextResponse.json(
        { error: 'Unable to identify user. Please provide username or log in again.' },
        { status: 401 }
      );
    }

    // Query user from Supabase
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .or(`username.ilike.${targetUsername},email.ilike.${targetUsername}`)
      .limit(1);

    if (error || !users || users.length === 0) {
      return NextResponse.json(
        { error: 'User not found in system' },
        { status: 404 }
      );
    }

    const user = users[0];

    // Check if account is frozen
    if (user.is_frozen === 1) {
      return NextResponse.json(
        { error: 'This account is frozen. Please contact administrator.' },
        { status: 403 }
      );
    }

    // Verify current password
    const isCurrentValid = await bcrypt.compare(currentPassword, String(user.password_hash));
    if (!isCurrentValid) {
      return NextResponse.json(
        { error: 'Incorrect current password' },
        { status: 400 }
      );
    }

    // Hash new password and update in Supabase
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || 'Failed to update password' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully! You can now use your new password.',
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal error changing password' },
      { status: 500 }
    );
  }
}
