// Mide el contraste REAL del texto de la portada contra la fotografía.
//
//   npm run contraste
//
// POR QUE EXISTE ESTE SCRIPT Y NO BASTA CON `tokens`
//
// `research/tokens.js` audita pares de colores: sabe que blanco sobre --ink da
// 13.08:1 porque los dos son colores. Una fotografía no es un color. Cada píxel
// es distinto y el peor caso —un píxel claro justo debajo de una letra blanca—
// no aparece en ninguna tabla.
//
// COMO SE MIDE, QUE NO ES COMO SE CALCULA
//
//   1. Se renderiza la página y se preguntan las cajas exactas del titular y de
//      la entradilla.
//   2. Se vuelve a renderizar con ESE TEXTO INVISIBLE, no borrado: la foto y el
//      velo quedan exactamente donde estaban, sin las letras encima.
//   3. Se leen todos los píxeles de esas cajas y se busca el MAS CLARO.
//   4. Contra ese píxel —el peor caso real, no el estimado— se mide el color
//      del texto.
//
// Si algún día alguien cambia la foto por una más clara, o afloja el velo, esto
// lo caza. Sale con código 1 para que pueda ir en un pipeline.

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

const ejecutar = promisify(execFile);

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
].find((p) => p && existsSync(p));

if (!CHROME) { console.error('No se encontro Chrome.'); process.exit(1); }
if (!existsSync('dist/index.html')) { console.error('No hay dist/. Corre `npm run build` primero.'); process.exit(1); }

// Qué se mide y de qué color va escrito. Si se añade texto a la portada, entra aquí.
const OBJETIVOS = [
  { sel: '.portada-foto h1', nombre: 'titular', color: '#FFFFFF' },
  { sel: '.portada-foto .entradilla', nombre: 'entradilla', color: '#E8EEF1' },
];
const MINIMO = 4.5;   // WCAG 1.4.3 AA para texto normal

const lineal = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (r, g, b) => 0.2126 * lineal(r) + 0.7152 * lineal(g) + 0.0722 * lineal(b);
const razon = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const deHex = (h) => [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16));

const ANCHO = Number(process.argv[2]) || 1440;
const ALTO = Number(process.argv[3]) || 900;

const base = readFileSync('dist/index.html', 'utf8');
const tmp = (n) => resolve(`dist/__contraste-${n}`);

// ── 1. las cajas
const sondas = JSON.stringify(OBJETIVOS.map((o) => o.sel));
const sonda = `<script>
  var sels = ${sondas}, r = [];
  sels.forEach(function (s) {
    var e = document.querySelector(s);
    if (!e) { r.push(null); return; }
    var b = e.getBoundingClientRect();
    r.push([Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]);
  });
  document.title = JSON.stringify(r);
</` + `script></body>`;

writeFileSync(tmp('a.html'), base.replace('</body>', sonda));
const { stdout } = await ejecutar(CHROME, ['--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  `--window-size=${ANCHO},${ALTO}`, '--virtual-time-budget=5000', '--dump-dom',
  pathToFileURL(tmp('a.html')).href], { maxBuffer: 1e8 });
unlinkSync(tmp('a.html'));

const crudo = (stdout.match(/<title>([^<]*)<\/title>/) || [])[1];
if (!crudo) { console.error('No se pudieron leer las cajas del texto.'); process.exit(1); }
const cajas = JSON.parse(crudo.replace(/&quot;/g, '"'));

// ── 2. el fondo desnudo. `visibility:hidden` y NO `display:none`: lo segundo
//      recolocaria la portada entera y las cajas dejarian de corresponder.
writeFileSync(tmp('b.html'), base.replace('</head>',
  `<style>${OBJETIVOS.map((o) => o.sel).join(',')}{visibility:hidden}</style></head>`));
await ejecutar(CHROME, ['--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  '--force-device-scale-factor=1', `--window-size=${ANCHO},${ALTO}`, '--virtual-time-budget=5000',
  `--screenshot=${tmp('fondo.png')}`, pathToFileURL(tmp('b.html')).href], { maxBuffer: 1e8 });
unlinkSync(tmp('b.html'));

const { data, info } = await sharp(tmp('fondo.png')).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const pixel = (x, y) => { const i = (y * info.width + x) * info.channels; return [data[i], data[i + 1], data[i + 2]]; };

console.log(`Portada sobre fotografia · ${ANCHO}x${ALTO}\n`);
let fallos = 0;
let peorGlobal = Infinity;

OBJETIVOS.forEach((o, i) => {
  const c = cajas[i];
  if (!c) { console.log(`  ${o.nombre}: no encontrado (${o.sel})`); return; }
  const [x, y, w, h] = c;
  let peorL = -1, donde = null;
  for (let yy = Math.max(0, y); yy < Math.min(y + h, info.height); yy++) {
    for (let xx = Math.max(0, x); xx < Math.min(x + w, info.width); xx++) {
      const [r, g, b] = pixel(xx, yy);
      const l = lum(r, g, b);
      if (l > peorL) { peorL = l; donde = [r, g, b]; }
    }
  }
  const r = razon(lum(...deHex(o.color)), peorL);
  peorGlobal = Math.min(peorGlobal, r);
  const ok = r >= MINIMO;
  if (!ok) fallos++;
  console.log(`  ${o.nombre.padEnd(12)} ${o.color}  peor pixel rgb(${String(donde).padEnd(11)})  ${r.toFixed(2)}:1  ${ok ? 'pasa' : 'FALLA'}`);
});

unlinkSync(tmp('fondo.png'));
console.log(`\n  peor caso medido: ${peorGlobal.toFixed(2)}:1  (minimo ${MINIMO})`);
if (fallos) { console.error(`\n${fallos} fallo(s) de contraste sobre la foto.`); process.exit(1); }
console.log('\nTodo correcto.');
