#!/usr/bin/env node
/**
 * Load Test Suite — AI Mock Interview IT
 * Sử dụng autocannon để kiểm tra khả năng chịu tải của server
 */

const autocannon = require('./node_modules/autocannon');
const http = require('http');

const BASE_URL = 'http://localhost:3000';

// ─── Get auth token ────────────────────────────────────────────────────────────
function getAuthToken() {
  return new Promise((resolve) => {
    const body = JSON.stringify({ identifier: 'admin@aimock.local', password: 'admin@123' });
    const opts = {
      hostname: 'localhost', port: 3000,
      path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          resolve(j.accessToken || j.token || j.data?.token || null);
        } catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.write(body); req.end();
  });
}

// ─── Run a single autocannon scenario ─────────────────────────────────────────
function bench(opts) {
  return new Promise((resolve, reject) => {
    const instance = autocannon(opts, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    autocannon.track(instance, { renderProgressBar: false, renderResultsTable: false });
  });
}

// ─── Formatters ────────────────────────────────────────────────────────────────
const line  = () => '─'.repeat(64);
const dline = () => '═'.repeat(64);

function printPhase(title) {
  console.log(`\n${dline()}`);
  console.log(`  ${title}`);
  console.log(dline());
}

function printResult(label, r) {
  const rps   = Math.round(r.requests.average);
  const kbps  = (r.throughput.average / 1024).toFixed(0);
  const lat   = r.latency.average.toFixed(1);
  const p99   = r.latency.p99.toFixed(0);
  const total = r.requests.total;
  const err   = (r.errors || 0) + (r.timeouts || 0);
  const bad   = r.non2xx || 0;
  const ok    = total - err - bad;
  const pct   = total > 0 ? ((ok / total) * 100).toFixed(1) : '0.0';

  console.log(`\n  📊  ${label}`);
  console.log(`       RPS (avg)          : ${rps.toLocaleString()}`);
  console.log(`       Throughput (avg)   : ${kbps} KB/s`);
  console.log(`       Latency avg / p99  : ${lat} ms / ${p99} ms`);
  console.log(`       Total requests     : ${total.toLocaleString()}`);
  console.log(`       Non-2xx / Errors   : ${bad} / ${err}`);
  console.log(`       ✅  Success rate   : ${pct}%`);
  return { label, rps, lat: parseFloat(lat), p99: parseInt(p99), pct: parseFloat(pct), total, bad, err };
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀  AI Mock Interview IT — Load Test Suite');
  console.log(`    Target : ${BASE_URL}`);
  console.log(`    Date   : ${new Date().toLocaleString('vi-VN')}\n`);

  // Verify server
  try {
    await new Promise((res, rej) => {
      http.get(`${BASE_URL}/api/health`, r => { r.resume(); res(); }).on('error', rej);
    });
    console.log('  ✅  Server is reachable');
  } catch {
    console.error('  ❌  Server NOT reachable at', BASE_URL);
    process.exit(1);
  }

  // Auth token
  process.stdout.write('  🔑  Obtaining auth token... ');
  const token = await getAuthToken();
  if (token) console.log('✅  obtained');
  else console.log('⚠️  failed — authenticated tests will be skipped');

  const authHeaders = token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : null;

  const summary = [];

  // ── PHASE 1: Baseline — no DB, no auth ───────────────────────────────────────
  printPhase('PHASE 1 — Baseline: GET /api/health  (no DB, no auth)');

  for (const [conc, dur] of [[10,10],[50,10],[100,10],[200,10],[500,10]]) {
    process.stdout.write(`\n  ⏳  ${conc.toString().padStart(4)} concurrent users...`);
    const r = await bench({ url: `${BASE_URL}/api/health`, connections: conc, duration: dur });
    process.stdout.write(' done\n');
    summary.push(printResult(`Health  | ${conc.toString().padStart(4)} users`, r));
  }

  // ── PHASE 2: Login — POST with bcrypt & JWT ──────────────────────────────────
  printPhase('PHASE 2 — Auth: POST /api/auth/login  (bcrypt + JWT)');

  const loginBody = JSON.stringify({ identifier: 'admin@aimock.local', password: 'admin@123' });

  for (const [conc, dur] of [[5,10],[10,10],[30,10],[50,10],[100,10]]) {
    process.stdout.write(`\n  ⏳  ${conc.toString().padStart(4)} concurrent users...`);
    const r = await bench({
      url: `${BASE_URL}/api/auth/login`,
      connections: conc,
      duration: dur,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: loginBody,
    });
    process.stdout.write(' done\n');
    summary.push(printResult(`Login   | ${conc.toString().padStart(4)} users`, r));
  }

  // ── PHASE 3: Authenticated DB read ───────────────────────────────────────────
  if (authHeaders) {
    printPhase('PHASE 3 — Authenticated DB Read: GET /api/questions');

    for (const [conc, dur] of [[10,10],[50,10],[100,10],[200,10],[300,10]]) {
      process.stdout.write(`\n  ⏳  ${conc.toString().padStart(4)} concurrent users...`);
      const r = await bench({
        url: `${BASE_URL}/api/questions`,
        connections: conc,
        duration: dur,
        headers: authHeaders,
      });
      process.stdout.write(' done\n');
      summary.push(printResult(`Questions | ${conc.toString().padStart(4)} users`, r));
    }

    printPhase('PHASE 4 — Authenticated Profile: GET /api/users/me/stats');

    for (const [conc, dur] of [[10,10],[50,10],[100,10],[200,10]]) {
      process.stdout.write(`\n  ⏳  ${conc.toString().padStart(4)} concurrent users...`);
      const r = await bench({
        url: `${BASE_URL}/api/users/me/stats`,
        connections: conc,
        duration: dur,
        headers: authHeaders,
      });
      process.stdout.write(' done\n');
      summary.push(printResult(`UserStats | ${conc.toString().padStart(4)} users`, r));
    }
  }

  // ── PHASE 5: Stress Test ──────────────────────────────────────────────────────
  printPhase('PHASE 5 — Stress Test: Ramp to breaking point');
  console.log('  Target: GET /api/health (no auth, pure throughput)');

  for (const [conc, dur] of [[500,10],[750,10],[1000,10],[1500,10]]) {
    process.stdout.write(`\n  ⏳  ${conc.toString().padStart(5)} concurrent users...`);
    const r = await bench({ url: `${BASE_URL}/api/health`, connections: conc, duration: dur });
    process.stdout.write(' done\n');
    summary.push(printResult(`Stress  | ${conc.toString().padStart(5)} users`, r));
  }

  // ── Summary Table ─────────────────────────────────────────────────────────────
  console.log(`\n${dline()}`);
  console.log('  SUMMARY TABLE');
  console.log(dline());
  console.log('');
  console.log('  Scenario                              RPS    Lat avg  Lat p99  Success');
  console.log('  ' + line());

  for (const s of summary) {
    const rps  = String(s.rps).padStart(6);
    const lat  = (s.lat.toFixed(1) + ' ms').padStart(8);
    const p99  = (s.p99 + ' ms').padStart(8);
    const pct  = (s.pct.toFixed(1) + '%').padStart(8);
    const flag = s.pct >= 99 ? '✅' : s.pct >= 95 ? '⚠️ ' : '❌';
    console.log(`  ${s.label.padEnd(36)}${rps}  ${lat}  ${p99}  ${pct}  ${flag}`);
  }

  // ── Capacity conclusion ───────────────────────────────────────────────────────
  console.log(`\n${dline()}`);
  console.log('  KẾT LUẬN KHẢ NĂNG CHỊU TẢI');
  console.log(dline());

  const healthOk    = summary.filter(s => s.label.startsWith('Health') && s.pct >= 99);
  const loginOk     = summary.filter(s => s.label.startsWith('Login') && s.pct >= 99);
  const questionsOk = summary.filter(s => s.label.startsWith('Questions') && s.pct >= 99);
  const stressOk    = summary.filter(s => s.label.startsWith('Stress') && s.pct >= 99);

  const maxHealth    = healthOk.length    ? Math.max(...healthOk.map(s => parseInt(s.label.match(/\d+/)?.[0]||0)))    : 0;
  const maxLogin     = loginOk.length     ? Math.max(...loginOk.map(s => parseInt(s.label.match(/\d+/)?.[0]||0)))     : 0;
  const maxQuestions = questionsOk.length ? Math.max(...questionsOk.map(s => parseInt(s.label.match(/\d+/)?.[0]||0))) : 0;
  const maxStress    = stressOk.length    ? Math.max(...stressOk.map(s => parseInt(s.label.match(/\d+/)?.[0]||0)))    : 0;

  const peakRPS = Math.max(...summary.filter(s => !s.label.startsWith('Login')).map(s => s.rps));

  console.log('');
  console.log(`  🟢  Peak throughput đo được   : ~${peakRPS.toLocaleString()} req/s`);
  console.log(`  🟢  Max concurrent (health)   : ~${maxHealth} users  (99%+ success)`);
  console.log(`  🟢  Max concurrent (login)    : ~${maxLogin} users  (99%+ success)`);
  console.log(`  🟢  Max concurrent (DB query) : ~${maxQuestions} users  (99%+ success)`);
  console.log(`  🟢  Max concurrent (stress)   : ~${maxStress} users  (99%+ success, no auth)`);
  console.log('');
  console.log('  ⚠️   Giới hạn thực tế (production):');
  console.log('        • Rate limiter hiện tại: 100 req / 15 phút / IP');
  console.log('        • Login limiter: 10 req / 15 phút / IP (chống brute-force)');
  console.log('        • Server chạy 1 Node.js process đơn — scale bằng cluster/PM2 để tăng gấp bội');
  console.log('        • MongoDB connection pool là bottleneck ở tải cao');
  console.log('');
}

main().catch(console.error);
