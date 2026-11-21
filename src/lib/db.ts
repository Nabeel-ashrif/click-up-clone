import bcrypt from 'bcryptjs';
import { supabaseAdmin } from './supabase';

export interface UserRow {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  full_name: string;
  initials: string;
  color: string;
  role: string;
  is_frozen: number;
}

// Check whether Supabase is configured via environment variables
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function initDatabase() {
  if (!isSupabaseConfigured) {
    return;
  }

  try {
    // Check if initial users exist in Supabase
    const { count, error } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Supabase users check error:', error);
      return;
    }

    if (count === 0) {
      const defaultPassword = await bcrypt.hash('password123', 10);
      const initialUsers: UserRow[] = [
        {
          id: '00000000-0000-0000-0000-000000000001',
          username: 'alex',
          email: 'alex.chen@team.internal',
          password_hash: defaultPassword,
          full_name: 'Alex Chen',
          initials: 'AC',
          color: '#0f766e',
          role: 'owner',
          is_frozen: 0,
        },
        {
          id: '00000000-0000-0000-0000-000000000002',
          username: 'maya',
          email: 'maya.patel@team.internal',
          password_hash: defaultPassword,
          full_name: 'Maya Patel',
          initials: 'MP',
          color: '#1e3a5f',
          role: 'admin',
          is_frozen: 0,
        },
        {
          id: '00000000-0000-0000-0000-000000000003',
          username: 'jordan',
          email: 'jordan.lee@team.internal',
          password_hash: defaultPassword,
          full_name: 'Jordan Lee',
          initials: 'JL',
          color: '#d97706',
          role: 'member',
          is_frozen: 0,
        },
      ];

      await supabaseAdmin.from('users').upsert(initialUsers, { onConflict: 'id' });
    }
  } catch (err) {
    console.error('Error during initDatabase:', err);
  }
}
