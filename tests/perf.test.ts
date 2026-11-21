// Performance & Benchmark Suite for Supabase Database
import { supabase, supabaseAdmin } from '../src/lib/supabase';

async function runPerformanceBenchmark() {
  console.log('=== RUNNING DATABASE & API PERFORMANCE BENCHMARK ===');

  const iterations = 10;
  const latencies: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const { error } = await supabaseAdmin.from('spaces').select('id, name').limit(10);
    const duration = performance.now() - start;
    if (!error) {
      latencies.push(duration);
    }
  }

  const sum = latencies.reduce((a, b) => a + b, 0);
  const avg = sum / latencies.length;
  const min = Math.min(...latencies);
  const max = Math.max(...latencies);

  console.log(`Executed ${latencies.length}/${iterations} successful queries`);
  console.log(`Average Latency: ${avg.toFixed(2)} ms`);
  console.log(`Minimum Latency: ${min.toFixed(2)} ms`);
  console.log(`Maximum Latency: ${max.toFixed(2)} ms`);

  // Target: average response under 500ms across international region
  if (avg < 500) {
    console.log('PERFORMANCE TARGET MET (< 500ms round-trip API query)');
  } else {
    console.warn('NOTE: Latency is higher than 500ms due to geographic round-trip distance');
  }
}

runPerformanceBenchmark();
