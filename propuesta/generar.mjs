// Convierte propuesta-cimo.html en PDF con Chrome headless.
//
//   node propuesta/generar.mjs
//
// POR QUE CHROME Y NO reportlab: la propuesta usa la tipografia y la paleta
// exactas del sitio de CIMO, y eso solo se sostiene con CSS de verdad. Un
// generador de PDF por codigo obligaria a redibujar el sistema a mano y
// acabaria pareciendose al sitio "mas o menos", que es peor que no parecerse.
//
// --no-pdf-header-footer QUITA la cabecera y el pie que Chrome imprime por
// defecto (fecha, titulo y "file:///C:/Users/..."). Sin esa bandera, la
// propuesta que se le manda a un cliente lleva impresa la ruta del disco duro
// de quien la genero.

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ejecutar = promisify(execFile);
const aqui = dirname(fileURLToPath(import.meta.url));

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
].find((p) => p && existsSync(p));

if (!CHROME) { console.error('No se encontro Chrome.'); process.exit(1); }

const entrada = resolve(aqui, 'paquetes.html');
const salida = resolve(aqui, 'Paquetes-Sitio-Web.pdf');
if (!existsSync(entrada)) { console.error('Falta paquetes.html'); process.exit(1); }

await ejecutar(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox',
  '--no-pdf-header-footer',
  '--virtual-time-budget=5000',      // deja que carguen los .woff2
  `--print-to-pdf=${salida}`,
  pathToFileURL(entrada).href,
], { timeout: 60000 });

if (!existsSync(salida)) { console.error('Chrome no escribio el PDF.'); process.exit(1); }
console.log(`${salida}  ${(statSync(salida).size / 1024).toFixed(0)} KB`);
