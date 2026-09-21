// Monta la portada con CADA foto de fotos.json y las apila para compararlas.
//
//   npm run portadas
//
// POR QUE EXISTE: elegir la fotografia de una portada mirando los archivos
// sueltos no funciona. Una imagen que en el visor parece perfecta puede quedar
// fatal detras del velo, con el titular encima y recortada al aspecto real de
// la pantalla. Lo unico que decide es verlas MONTADAS y una debajo de la otra.
//
// EL MOVIMIENTO SE NEUTRALIZA. Las palabras del titular entran animadas; en una
// captura headless la animacion puede no haber terminado y entonces FALTAN
// PALABRAS en la imagen. Parece un fallo de maquetacion y no lo es. Ya costo
// una vuelta entera de depuracion: no se quita esta linea.

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
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

const QUIETO = '<style>*,*::before,*::after{animation:none!important;'
  + 'transition:none!important;opacity:1!important;transform:none!important}</style></head>';

const ANCHO = Number(process.argv[2]) || 1440;
const ALTO = Number(process.argv[3]) || 860;
const SALIDA = '.capturas/portadas';

const fotos = JSON.parse(readFileSync('src/data/fotos.json', 'utf8'));
const base = readFileSync('dist/index.html', 'utf8');
mkdirSync(SALIDA, { recursive: true });

console.log(`Portadas · ${ANCHO}x${ALTO} · ${fotos.length} fotos\n`);
const hechas = [];

for (const f of fotos) {
  // El orden de los reemplazos importa: `-alto` y `-sm` primero, porque el
  // patron general tambien casaria con ellos y dejaria el sufijo colgando.
  const html = base
    .replace(/img\/portada-[a-z-]+-alto\.webp/g, `img/${f.id}-alto.webp`)
    .replace(/img\/portada-[a-z-]+-sm\.webp/g, `img/${f.id}-sm.webp`)
    .replace(/img\/portada-[a-z-]+\.webp/g, `img/${f.id}.webp`)
    .replace('</head>', QUIETO);

  const tmp = 'dist/__portada.html';
  writeFileSync(tmp, html);
  const png = resolve(SALIDA, f.id + '.png');
  await ejecutar(CHROME, ['--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--force-device-scale-factor=1', `--window-size=${ANCHO},${ALTO}`, '--virtual-time-budget=5000',
    `--screenshot=${png}`, pathToFileURL(resolve(tmp)).href], { maxBuffer: 1e8, timeout: 60000 });
  unlinkSync(resolve(tmp));
  hechas.push(png);
  console.log(`  ${f.id.padEnd(22)} ${String(f.tratamiento).padEnd(10)} ${f.nota.slice(0, 46)}…`);
}

const W = 900, H = Math.round((ALTO / ANCHO) * W), GAP = 10;
const piezas = [];
for (let i = 0; i < hechas.length; i++) {
  piezas.push({
    input: await sharp(hechas[i]).resize(W, H, { fit: 'cover', position: 'top' }).toBuffer(),
    left: 0, top: i * (H + GAP),
  });
}
const comparativa = resolve(SALIDA, 'comparativa.png');
await sharp({ create: { width: W, height: (H + GAP) * hechas.length, channels: 3, background: '#ffffff' } })
  .composite(piezas).png().toFile(comparativa);

console.log(`\n  ${comparativa}`);
