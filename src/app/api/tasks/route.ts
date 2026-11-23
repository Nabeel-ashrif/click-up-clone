import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/tasks
 * Returns ALL tasks from localStorage-compatible JSON column
 * stored in Supabase as a shared workspace task store.
 *
 * Since the app uses localStorage as primary storage, this endpoint
 * acts as a cross-device sync bridge. Tasks are stored as JSON blobs
 * in the workspace_tasks table (created on first use).
 */
export async function GET() {
  try {
    // Try to fetch from the shared tasks store
    const { data, error } = await supabaseAdmin
      .from('workspace_tasks')
      .select('tasks_json')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      // Table may not exist yet — return empty
      return NextResponse.json({ success: true, tasks: [] });
    }

    if (!data || !data.tasks_json) {
      return NextResponse.json({ success: true, tasks: [] });
    }

    const tasks = JSON.parse(data.tasks_json);
    return NextResponse.json({ success: true, tasks });
  } catch (err: any) {
    console.error('GET /api/tasks error:', err);
    return NextResponse.json({ success: true, tasks: [] });
  }
}

/**
 * POST /api/tasks
 * Saves the entire tasks array as a JSON blob for cross-user sync.
 * Body: { tasks: Task[] }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tasks } = body;

    if (!Array.isArray(tasks)) {
      return NextResponse.json({ error: 'tasks must be an array' }, { status: 400 });
    }

    const tasksJson = JSON.stringify(tasks);

    // Try upsert into workspace_tasks
    const { error } = await supabaseAdmin
      .from('workspace_tasks')
      .upsert(
        { id: 'shared', tasks_json: tasksJson, updated_at: new Date().toISOString() },
        { onConflict: 'id' }
      );

    if (error) {
      console.error('POST /api/tasks upsert error:', error);
      // Don't fail — localStorage is still the primary store
      return NextResponse.json({ success: true, synced: false });
    }

    return NextResponse.json({ success: true, synced: true });
  } catch (err: any) {
    console.error('POST /api/tasks error:', err);
    return NextResponse.json({ success: true, synced: false });
  }
}
