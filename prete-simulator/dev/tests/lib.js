/* shared by every suite: open the built game headless, pin English (the
   asserts are written in it), and count passes and failures */
const { chromium } = require('playwright-core');
const path = require('path');
const FILE = 'file://' + path.resolve(__dirname, '..', '..', 'index.html');
const EXE = process.env.CHROMIUM || '/opt/pw-browsers/chromium';
async function open(opts = {}) {
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox', ...(opts.args || [])] });
  const page = await b.newPage(opts.page || { viewport: { width: 960, height: 540 } });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message + ' ' + ((e.stack || '').split('\n')[1] || '')));
  await page.goto(FILE);
  await page.waitForFunction(() => typeof WORLD_READY !== 'undefined' && WORLD_READY, null, { timeout: 60000 });
  await page.evaluate(() => setLang('en'));
  const ok = [], bad = [];
  const chk = (n, c, d) => { (c ? ok : bad).push(n);
    console.log((c ? 'PASS ' : 'FAIL ') + n + (d !== undefined && d !== '' ? ' — ' + d : '')); };
  const get = (fn, arg) => page.evaluate(fn, arg);
  const done = async () => {
    chk('no runtime errors', errs.length === 0, errs.slice(0, 3).join(' | '));
    console.log(`\n=== ${ok.length} passed, ${bad.length} failed ===`);
    if (bad.length) console.log('FAILED: ' + bad.join('; '));
    await b.close(); process.exit(bad.length ? 1 : 0);
  };
  return { b, page, errs, chk, get, done };
}
module.exports = { open, FILE };
