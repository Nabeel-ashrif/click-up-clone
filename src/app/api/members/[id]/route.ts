import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { initDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await initDatabase();
    const userId = params.id;
    const body = await req.json();
    const { role, fullName, isFrozen, newPassword } = body;

    const updates: Record<string, any> = {};

    if (role !== undefined) {
      updates.role = role;
    }

    if (fullName !== undefined && fullName.trim()) {
      updates.full_name = fullName.trim();
    }

    if (isFrozen !== undefined) {
      updates.is_frozen = isFrozen ? 1 : 0;
    }

    if (newPassword && newPassword.trim()) {
      updates.password_hash = await bcrypt.hash(newPassword.trim(), 10);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: true, message: 'No updates provided' });
    }

    const { data: updated, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      member: {
        id: String(updated.id),
        username: String(updated.username || ''),
        email: String(updated.email || ''),
        fullName: String(updated.full_name),
        initials: String(updated.initials || 'U'),
        color: String(updated.color || '#0f766e'),
        role: String(updated.role || 'member'),
        isFrozen: updated.is_frozen === 1,
      },
    });
  } catch (error: any) {
    console.error('Update member error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update member' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await initDatabase();
    const userId = params.id;

    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Member removed from workspace successfully',
    });
  } catch (error: any) {
    console.error('Delete member error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete member' },
      { status: 500 }
    );
  }
}
