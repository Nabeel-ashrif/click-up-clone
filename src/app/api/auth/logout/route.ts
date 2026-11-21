import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = cookies();
  cookieStore.delete('clickup_session_user');
  const res = NextResponse.json({ success: true, message: 'Logged out successfully' });
  res.cookies.delete('clickup_session_user');
  return res;
}
