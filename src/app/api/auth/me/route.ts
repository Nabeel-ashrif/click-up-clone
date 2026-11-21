import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST() {
  const cookieStore = cookies();
  cookieStore.delete('clickup_session_user');
  return NextResponse.json({ success: true, message: 'Logged out successfully' });
}

export async function GET() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('clickup_session_user');

  if (!sessionCookie || !sessionCookie.value) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  try {
    const user = JSON.parse(sessionCookie.value);
    return NextResponse.json({ authenticated: true, user });
  } catch {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
