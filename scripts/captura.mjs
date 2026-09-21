// Capturas de dist/ con Chrome headless.
//
//   npm run captura                 las paginas construidas, a 1280
//   npm run captura -- 768          a otro ancho
//
// POR QUE NO SIRVE EL PANEL DEL NAVEGADOR: renderiza las paginas locales como
// instantaneas data:, y bajo un data: URL las rutas relativas de las fuentes
// (fonts/...) no resuelven. El resultado se ve con las caras de reserva y hace
// creer que la tipografia esta mal puesta. Chrome headless si carga file://.
//
// AVISO DE WINDOWS: Chrome no reduce la ventana por debajo de unos 500 px, asi
// que --window-size=375 devuelve una captura recortada que PARECE un desborde y
// no lo es. Para anchos de movil hay que medir scrollWidth contra innerWidth,
// no mirar la imagen.

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readdirSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const ejecutar = promisify(execFile);

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
].find((p) => p && existsSync(p));

if (!CHROME) { console.error('No se encontro Chrome.'); process.exit(1); }
if (!existsSync('dist')) { console.error('No hay dist/. Corre `npm run build` primero.'); process.exit(1); }

const ancho = Number(process.argv[2]) || 1280;
const alto = Number(process.argv[3]) || 1400;
const salida = `.capturas/${ancho}`;
mkdirSync(salida, { recursive: true });

const paginas = readdirSync('dist').filter((f) => f.endsWith('.html'));
if (!paginas.length) { console.error('dist/ no tiene ningun .html'); process.exit(1); }

console.log(`Chrome headless · ${ancho}x${alto} · ${paginas.length} pagina(s)\n`);

for (const p of paginas) {
  // La ruta del proyecto lleva un espacio ("CIMO Draft"): hay que codificarlo
  // o Chrome corta la URL ahi y abre una pagina en blanco sin avisar.
  const url = 'file:///' + resolve('dist', p).replace(/\\/g, '/').replace(/ /g, '%20');
  // --screenshot RESUELVE CONTRA EL DIRECTORIO DE CHROME, no contra el nuestro:
  // con una ruta relativa falla con "cannot find the path specified" y devuelve
  // codigo de salida 0, asi que parece que ha funcionado. Ruta absoluta siempre.
  const img = resolve(salida, p.replace('.html', '') + '.png');
  try {
    await ejecutar(CHROME, [
      '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-sandbox',
      '--force-device-scale-factor=1',
      '--virtual-time-budget=3000',       // deja que las fuentes se apliquen
      `--window-size=${ancho},${alto}`,
      `--screenshot=${img}`,
      url,
    ], { timeout: 45000 });
    const kb = existsSync(img) ? (statSync(img).size / 1024).toFixed(0) + ' KB' : 'SIN IMAGEN';
    console.log(`  ${p.padEnd(22)} -> ${img.padEnd(34)} ${kb}`);
  } catch (e) {
    console.error(`  ${p.padEnd(22)} FALLO: ${String(e.message).slice(0, 90)}`);
  }
}
console.log(`\nCapturas en ${salida}/`);
