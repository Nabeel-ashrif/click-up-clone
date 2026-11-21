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
      // Default password hash for '1000'
      const defaultPassword = await bcrypt.hash('1000', 10);
      const initialUsers: UserRow[] = [
        {
          id: '00000000-0000-0000-0000-000000000001',
          username: 'nabeel',
          email: 'nabeel@workspace.internal',
          password_hash: defaultPassword,
          full_name: 'Nabeel',
          initials: 'NA',
          color: '#0f766e',
          role: 'owner',
          is_frozen: 0,
        },
        {
          id: '00000000-0000-0000-0000-000000000002',
          username: 'maham',
          email: 'maham@workspace.internal',
          password_hash: defaultPassword,
          full_name: 'Maham',
          initials: 'MA',
          color: '#1e3a5f',
          role: 'admin',
          is_frozen: 0,
        },
        {
          id: '00000000-0000-0000-0000-000000000003',
          username: 'farhan',
          email: 'farhan@workspace.internal',
          password_hash: defaultPassword,
          full_name: 'Farhan',
          initials: 'FA',
          color: '#2563eb',
          role: 'admin',
          is_frozen: 0,
        },
        {
          id: '00000000-0000-0000-0000-000000000004',
          username: 'anees',
          email: 'anees@workspace.internal',
          password_hash: defaultPassword,
          full_name: 'Anees',
          initials: 'AN',
          color: '#16a34a',
          role: 'member',
          is_frozen: 0,
        },
        {
          id: '00000000-0000-0000-0000-000000000005',
          username: 'areeba',
          email: 'areeba@workspace.internal',
          password_hash: defaultPassword,
          full_name: 'Areeba',
          initials: 'AR',
          color: '#ea580c',
          role: 'member',
          is_frozen: 0,
        },
        {
          id: '00000000-0000-0000-0000-000000000006',
          username: 'jawad',
          email: 'jawad@workspace.internal',
          password_hash: defaultPassword,
          full_name: 'Jawad',
          initials: 'JA',
          color: '#7b68ee',
          role: 'member',
          is_frozen: 0,
        },
        {
          id: '00000000-0000-0000-0000-000000000007',
          username: 'fatima',
          email: 'fatima@workspace.internal',
          password_hash: defaultPassword,
          full_name: 'Fatima',
          initials: 'FA',
          color: '#ec4899',
          role: 'member',
          is_frozen: 0,
        },
        {
          id: '00000000-0000-0000-0000-000000000008',
          username: 'umair',
          email: 'umair@workspace.internal',
          password_hash: defaultPassword,
          full_name: 'Umair',
          initials: 'UM',
          color: '#06b6d4',
          role: 'member',
          is_frozen: 0,
        },
        {
          id: '00000000-0000-0000-0000-000000000009',
          username: 'waqas',
          email: 'waqas@workspace.internal',
          password_hash: defaultPassword,
          full_name: 'Waqas',
          initials: 'WA',
          color: '#64748b',
          role: 'viewer',
          is_frozen: 0,
        },
      ];

      await supabaseAdmin.from('users').upsert(initialUsers, { onConflict: 'id' });
    }
  } catch (err) {
    console.error('Error during initDatabase:', err);
  }
}
