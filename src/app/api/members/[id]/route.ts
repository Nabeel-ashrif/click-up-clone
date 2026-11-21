import { NextResponse } from 'next/server';
import { db, initDatabase } from '@/lib/db';
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

    // Verify user exists
    const existing = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ? LIMIT 1',
      args: [userId],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updates: string[] = [];
    const args: any[] = [];

    if (role !== undefined) {
      updates.push('role = ?');
      args.push(role);
    }

    if (fullName !== undefined && fullName.trim()) {
      updates.push('full_name = ?');
      args.push(fullName.trim());
    }

    if (isFrozen !== undefined) {
      updates.push('is_frozen = ?');
      args.push(isFrozen ? 1 : 0);
    }

    if (newPassword && newPassword.trim()) {
      const hash = await bcrypt.hash(newPassword.trim(), 10);
      updates.push('password_hash = ?');
      args.push(hash);
    }

    if (updates.length > 0) {
      args.push(userId);
      await db.execute({
        sql: `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        args,
      });
    }

    return NextResponse.json({ success: true, message: 'Member account updated successfully' });
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

    // Check if trying to delete owner
    const existing = await db.execute({
      sql: 'SELECT role FROM users WHERE id = ? LIMIT 1',
      args: [userId],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (existing.rows[0].role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot delete the Workspace Owner account' },
        { status: 403 }
      );
    }

    await db.execute({
      sql: 'DELETE FROM users WHERE id = ?',
      args: [userId],
    });

    return NextResponse.json({ success: true, message: 'Member deleted from workspace' });
  } catch (error: any) {
    console.error('Delete member error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete member' },
      { status: 500 }
    );
  }
}
