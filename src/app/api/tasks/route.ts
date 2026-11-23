import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('workspace_tasks')
      .select('tasks_json')
      .eq('id', 'shared')
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tasks } = body;

    if (!Array.isArray(tasks)) {
      return NextResponse.json({ error: 'tasks must be an array' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('workspace_tasks')
      .upsert(
        { id: 'shared', tasks_json: JSON.stringify(tasks), updated_at: new Date().toISOString() },
        { onConflict: 'id' }
      );

    if (error) {
      console.error('POST /api/tasks upsert error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, synced: true });
  } catch (err: any) {
    console.error('POST /api/tasks error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
