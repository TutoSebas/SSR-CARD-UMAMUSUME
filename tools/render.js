// Usage: node tools/render.js [--fps 60] [--only Name,Name] [--preview F,F,...]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2), opt = k => { const i = args.indexOf(k); return i < 0 ? null : args[i + 1]; };
const FPS = +(opt('--fps') || 60), ONLY = opt('--only'), PREVIEW = opt('--preview'), OUT = opt('--out') || path.join(ROOT, 'output');
const faces = JSON.parse(fs.readFileSync(path.join(__dirname, 'faces.json')));
let cards = JSON.parse(fs.readFileSync(path.join(__dirname, 'cards.json')));
if (ONLY) cards = cards.filter(c => ONLY.split(',').includes(c.name));
const durl = p => 'data:image/' + (p.endsWith('.png') ? 'png' : 'webp') + ';base64,' + fs.readFileSync(p).toString('base64');

async function renderCard(page, c) {
  const f = c.face || (faces[c.name] && faces[c.name].score > .75 ? faces[c.name] : { cx: .5, cy: .41 });
  await page.evaluate(cfg => window.init(cfg), {
    name: c.label || c.name, type: c.type, face: f,
    gfx: durl(path.join(ROOT, 'assets/gfx', c.name + '.webp')),
    icon: durl(path.join(ROOT, 'assets/icons', c.type + '.png')),
    badge: durl(path.join(ROOT, 'assets/icons/SSR_badge.png')),
  });
  const total = await page.evaluate(() => window.TOTAL_F);
  if (PREVIEW) {
    fs.mkdirSync(path.join(OUT, 'preview'), { recursive: true });
    for (const F of PREVIEW.split(',').map(Number)) {
      const b64 = await page.evaluate(F => { render(F / 30); return document.getElementById('c').toDataURL('image/png').split(',')[1]; }, F);
      fs.writeFileSync(path.join(OUT, 'preview', `${c.name}_${String(F).padStart(3, '0')}.png`), Buffer.from(b64, 'base64'));
    }
    return;
  }
  fs.mkdirSync(OUT, { recursive: true });
  const n = Math.round(total / 30 * FPS);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    path.join(OUT, `SSR_${c.name}.mp4`)], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < n; i++) {
    const b64 = await page.evaluate(t => { render(t); return document.getElementById('c').toDataURL('image/png').split(',')[1]; }, i / FPS);
    if (!ff.stdin.write(Buffer.from(b64, 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log('done', c.name);
}

(async () => {
  const browser = await chromium.launch();
  const workers = +(opt('--jobs') || 3), queue = [...cards];
  await Promise.all(Array.from({ length: Math.min(workers, queue.length) }, async () => {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    await page.goto('file://' + path.join(__dirname, 'card.html'));
    while (queue.length) await renderCard(page, queue.shift());
  }));
  await browser.close();
})();
