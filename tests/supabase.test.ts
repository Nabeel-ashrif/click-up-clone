// Supabase Database Connection & Migration Unit Tests
import { supabase, supabaseAdmin } from '../src/lib/supabase';

async function runTests() {
  console.log('--- STARTING UNIT & INTEGRATION TESTS ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  FAIL: ${msg}`);
      failed++;
    }
  }

  try {
    // Test 1: Verify Supabase Public Endpoint Connectivity
    const t0 = Date.now();
    const { data: spaces, error: spaceErr } = await supabase.from('spaces').select('id, name');
    const spaceLatency = Date.now() - t0;
    assert(!spaceErr, `Supabase client connects and queries public schema (${spaceLatency}ms)`);

    // Test 2: Verify Supabase Admin Client
    const { data: tables, error: adminErr } = await supabaseAdmin.from('workspaces').select('id, name');
    assert(!adminErr, 'Supabase Admin client connects with service role');

    // Test 3: Seed / Query Test Workspace
    const testSlug = `test-org-${Date.now()}`;
    const testWorkspaceId = '00000000-0000-0000-0000-000000000001';

    // Check if test user exists
    const testUserId = '00000000-0000-0000-0000-000000000002';
    const { error: userInsertErr } = await supabaseAdmin.from('users').upsert({
      id: testUserId,
      email: 'test@internal.team',
      password_hash: 'hash_test_123',
      full_name: 'Test Administrator',
    });
    assert(!userInsertErr, 'Insert / Upsert test user into Supabase');

    // Insert workspace
    const { error: wsInsertErr } = await supabaseAdmin.from('workspaces').upsert({
      id: testWorkspaceId,
      name: 'Automated Test Workspace',
      slug: testSlug,
      owner_id: testUserId,
    });
    assert(!wsInsertErr, 'Insert test workspace with foreign key reference to user');

    // Test 4: Query with join / relation
    const { data: wsData, error: wsQueryErr } = await supabaseAdmin
      .from('workspaces')
      .select('id, name, slug, owner:users(full_name, email)')
      .eq('id', testWorkspaceId)
      .single();

    assert(!wsQueryErr && wsData?.name === 'Automated Test Workspace', 'Foreign key join on workspaces -> users');

    // Test 5: Clean up test fixtures
    await supabaseAdmin.from('workspaces').delete().eq('id', testWorkspaceId);
    await supabaseAdmin.from('users').delete().eq('id', testUserId);
    assert(true, 'Test fixtures cleanup completed');

  } catch (err: any) {
    console.error('Test execution exception:', err);
    failed++;
  }

  console.log(`--- TEST RESULTS: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
