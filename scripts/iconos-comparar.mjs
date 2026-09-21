// Compara los iconos de la lamina de IA con los SVG actuales, a tamano real.
//
//   node scripts/iconos-comparar.mjs
//
// POR QUE EXISTE: un icono no se elige mirandolo grande. Se elige al tamano al
// que se va a ver, que aqui son 30px dentro del <h2> de cada servicio. Un
// render 3D detallado que a 256px es precioso puede ser una mancha a 30, y eso
// no se sabe hasta ponerlo al lado del que ya funciona.
//
// La fila de 48 y 64 esta porque, si a 30 no leen, la pregunta siguiente no es
// «cuales» sino «cabe agrandarlos», que cambia la maqueta de servicios.

import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const NUEVOS = ['invisible', 'brackets', 'higiene', 'estetica', 'ninos'];
const FILAS = [30, 48, 64];
const SALIDA = '.capturas/iconos';
mkdirSync(SALIDA, { recursive: true });

// Los SVG actuales se sacan del HTML ya construido, no del registro en
// TypeScript: asi se compara contra lo que el visitante ve de verdad, con el
// grosor de trazo que le aplica Icono.astro, y no contra la idea del codigo.
const html = readFileSync('dist/servicios.html', 'utf8');
const svgs = [...html.matchAll(/<svg[^>]*>[\s\S]*?<\/svg>/g)]
  .map((m) => m[0])
  .filter((s) => s.includes('stroke-width') || s.includes('stroke-linecap'))
  .slice(0, 4);

const FONDO = '#FFFFFF';
const MARGEN = 24;
const PASO = 96;
const ALTO_FILA = 96;
const ANCHO = MARGEN * 2 + PASO * 5;

const piezas = [];
let y = MARGEN;

const etiqueta = (texto, ancho) => Buffer.from(
  `<svg width="${ancho}" height="22" xmlns="http://www.w3.org/2000/svg">` +
  `<text x="0" y="15" font-family="system-ui,sans-serif" font-size="13" fill="#3D5560">${texto}</text></svg>`
);

for (const px of FILAS) {
  piezas.push({ input: etiqueta(`Lamina de IA &#183; ${px}px`, ANCHO), left: MARGEN, top: y });
  y += 26;
  for (let i = 0; i < NUEVOS.length; i++) {
    piezas.push({
      input: await sharp(`public/img/esp/${NUEVOS[i]}@2x.webp`).resize(px, px).png().toBuffer(),
      left: MARGEN + i * PASO + Math.round((PASO - px) / 2),
      top: y + Math.round((ALTO_FILA - px) / 2),
    });
  }
  y += ALTO_FILA;
}

// Los actuales, al unico tamano al que se usan hoy.
piezas.push({ input: etiqueta('SVG actuales &#183; 30px (lo que hay en la pagina)', ANCHO), left: MARGEN, top: y });
y += 26;
for (let i = 0; i < svgs.length; i++) {
  // Se fuerza el color de marca porque en la pagina lo heredan por currentColor
  // y aqui, sueltos, saldrian negros.
  // Los atributos de ambito de Astro (`data-astro-cid-xxxx`, sin valor) son
  // HTML valido pero NO XML, y sharp parsea el SVG como XML: sin quitarlos
  // revienta con «Specification mandates value for attribute».
  const svg = svgs[i]
    .replace(/\sdata-astro-cid-[a-z0-9]+(?![-\w=])/g, '')
    .replace(/<svg /, '<svg xmlns="http://www.w3.org/2000/svg" ')
    .replace(/currentColor/g, '#2A6D8F');
  piezas.push({
    input: await sharp(Buffer.from(svg)).resize(30, 30).png().toBuffer(),
    left: MARGEN + i * PASO + Math.round((PASO - 30) / 2),
    top: y + Math.round((ALTO_FILA - 30) / 2),
  });
}
y += ALTO_FILA + MARGEN;

const destino = resolve(SALIDA, 'comparativa.png');
await sharp({ create: { width: ANCHO, height: y, channels: 3, background: FONDO } })
  .composite(piezas).png().toFile(destino);

console.log(`SVG actuales encontrados en dist: ${svgs.length}`);
console.log(destino);
