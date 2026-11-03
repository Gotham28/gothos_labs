// Verification runner (dev tooling, not loaded by the site).
// Usage: node .agents/runs/run.mjs <script.mjs> [baseUrl]
// The script default-exports `async (page, ctx) => result`; the result is printed as JSON.
// Needs playwright-core and an installed Chrome. It uses a throwaway headless profile, so it
// never touches another browser session.
//   PLAYWRIGHT_CORE  path to playwright-core's index.mjs (default: the newest copy found in
//                    the npx cache, ~/AppData/Local/npm-cache/_npx or ~/.npm/_npx)
//   SHOTS            folder for screenshots (default: <tmp>/gothos-shots/)
//   OUT              also save the JSON result to this file
import { pathToFileURL } from 'node:url';
import { resolve, join } from 'node:path';
import { homedir, tmpdir } from 'node:os';
import { existsSync, readdirSync, statSync, mkdirSync, writeFileSync } from 'node:fs';

function findPlaywright() {
  if (process.env.PLAYWRIGHT_CORE) return process.env.PLAYWRIGHT_CORE;
  const roots = [join(process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local'), 'npm-cache', '_npx'), join(homedir(), '.npm', '_npx')];
  const found = [];
  for (const root of roots) {
    if (!existsSync(root)) continue;
    for (const dir of readdirSync(root)) {
      const file = join(root, dir, 'node_modules', 'playwright-core', 'index.mjs');
      if (existsSync(file)) found.push({ file, time: statSync(file).mtimeMs });
    }
  }
  found.sort((a, b) => b.time - a.time);
  if (!found.length) throw new Error('playwright-core not found; set PLAYWRIGHT_CORE to its index.mjs');
  return found[0].file;
}

const { chromium } = await import(pathToFileURL(findPlaywright()).href);
const [script, base = 'http://127.0.0.1:4177'] = process.argv.slice(2);
if (!script) { console.error('usage: node run.mjs <script.mjs> [baseUrl]'); process.exit(2); }
const shots = (process.env.SHOTS || join(tmpdir(), 'gothos-shots')).replace(/\\/g, '/').replace(/\/?$/, '/');
mkdirSync(shots, { recursive: true });
const run = (await import(pathToFileURL(resolve(script)).href)).default;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const result = await run(page, { base, context, browser, shots });
  const text = JSON.stringify(result, null, 1);
  console.log(text);
  if (process.env.OUT) writeFileSync(process.env.OUT, text);
} finally {
  await browser.close();
}
