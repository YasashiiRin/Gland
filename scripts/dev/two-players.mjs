// Dev check (not part of the game): two headless Chrome instances, a host and a guest, driven over CDP.
// Usage (with the dev server on :5180): S=<scratch dir> node scripts/dev/two-players.mjs <abs path>/scripts/dev/two-players-steps.mjs
// Two-page CDP driver: node cdp2.mjs steps.mjs — steps gets { host, guest, wait } each with evaluate/shot.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const S = process.env.S;
const chromes = [9334, 9335].map((port, i) => spawn('google-chrome', ['--headless=new', '--remote-debugging-port=' + port, '--use-gl=angle', '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader', '--user-data-dir=' + S + '/prof' + (i + 2), '--window-size=1280,800', '--no-first-run', 'about:blank'], { stdio: 'ignore' }));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function firstPage(port) {
  for (let i = 0; i < 50; i++) {
    await wait(200);
    try { const l = await (await fetch('http://127.0.0.1:' + port + '/json')).json(); const p = l.find((t) => t.type === 'page'); if (p) return p; } catch {}
  }
}
const pages = [await firstPage(9334), await firstPage(9335)];
async function connect(target, name) {
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  let id = 0; const pending = new Map(); const logs = [];
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) logs.push(name + ' ' + m.params.type + ': ' + m.params.args.map((a) => a.value ?? a.description).join(' '));
    if (m.method === 'Runtime.exceptionThrown') logs.push(name + ' EXC: ' + (m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text));
  });
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Runtime.enable'); await send('Page.enable');
  const evaluate = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: `(async () => { ${expr} })()`, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) return 'ERR ' + (r.result.exceptionDetails.exception?.description ?? r.result.exceptionDetails.text);
    return r.result?.result?.value;
  };
  const shot = async (path) => { const r = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path, Buffer.from(r.result.data, 'base64')); };
  await send('Page.navigate', { url: 'http://localhost:5180/' });
  return { evaluate, shot, send, logs, ws };
}
const host = await connect(pages[0], 'HOST');
const guest = await connect(pages[1], 'GUEST');
await wait(4000);
try { await (await import(process.argv[2])).default({ host, guest, wait }); } catch (e) { console.log('STEP ERROR', e); }
console.log('--- console ---\n' + [...host.logs, ...guest.logs].slice(0, 40).join('\n'));
host.ws.close(); guest.ws.close(); chromes.forEach((c) => c.kill()); process.exit(0);
