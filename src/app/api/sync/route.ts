import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sync
 * Returns authoritative shared workspaces and tasks from Supabase.
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('workspace_tasks')
      .select('workspaces_json, tasks_json')
      .eq('id', 'shared')
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('GET /api/sync query error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    let workspaces = null;
    let tasks = null;

    if (data?.workspaces_json) {
      try {
        workspaces = JSON.parse(data.workspaces_json);
      } catch (e) {
        console.error('Error parsing workspaces_json:', e);
      }
    }

    if (data?.tasks_json) {
      try {
        tasks = JSON.parse(data.tasks_json);
      } catch (e) {
        console.error('Error parsing tasks_json:', e);
      }
    }

    return NextResponse.json({
      success: true,
      workspaces,
      tasks,
    });
  } catch (err: any) {
    console.error('GET /api/sync error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/sync
 * Updates workspaces, tasks, or both in the shared Supabase store.
 * Body: { workspaces?: Workspace[], tasks?: Task[] }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { workspaces, tasks } = body;

    const updates: Record<string, any> = {
      id: 'shared',
      updated_at: new Date().toISOString(),
    };

    if (Array.isArray(workspaces)) {
      updates.workspaces_json = JSON.stringify(workspaces);
    }

    if (Array.isArray(tasks)) {
      updates.tasks_json = JSON.stringify(tasks);
    }

    const { error } = await supabaseAdmin
      .from('workspace_tasks')
      .upsert(updates, { onConflict: 'id' });

    if (error) {
      console.error('POST /api/sync upsert error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, synced: true });
  } catch (err: any) {
    console.error('POST /api/sync error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
