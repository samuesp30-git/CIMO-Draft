// Elegir la script de la firma MIDIENDO, no por nombre.
//
// Brittany Signature (la del prototipo) es PERSONAL USE ONLY: su Readme prohibe
// expresamente el uso comercial, y el sitio de una clinica lo es. Hay que
// sustituirla por una de licencia abierta, y la regla de la casa dice que la
// tipografia se decide viendo y midiendo el especimen, no por reputacion.
//
// Este script mide a Brittany y a cada candidata y las ordena por distancia a
// ella. Salida: tabla + un ranking.
//
//   node scripts/comparar-firma.mjs

import * as fontkit from 'fontkit';
import { readFileSync, existsSync } from 'node:fs';

const REFERENCIA = { nombre: 'Brittany Signature', ruta: '.tipos/BrittanySignature.ttf', licencia: 'PERSONAL — no usable' };

const CANDIDATAS = [
  ['Allison', 'node_modules/@fontsource/allison/files/allison-latin-400-normal.woff2'],
  ['Style Script', 'node_modules/@fontsource/style-script/files/style-script-latin-400-normal.woff2'],
  ['Sacramento', 'node_modules/@fontsource/sacramento/files/sacramento-latin-400-normal.woff2'],
  ['Mrs Saint Delafield', 'node_modules/@fontsource/mrs-saint-delafield/files/mrs-saint-delafield-latin-400-normal.woff2'],
  ['Great Vibes', 'node_modules/@fontsource/great-vibes/files/great-vibes-latin-400-normal.woff2'],
  ['Dancing Script', 'node_modules/@fontsource/dancing-script/files/dancing-script-latin-400-normal.woff2'],
];

const FRASE = 'tu sonrisa';

/** Ancho del trazo: el tallo mas estrecho que encontramos recorriendo la 'l'
 *  a media altura de x. Para una script monolineal esto ES el grosor de pluma. */
function grosorTrazo(fuente, alturaX) {
  const cand = ['l', 'i', 't'];
  let mejor = null;
  for (const ch of cand) {
    const g = fuente.layout(ch).glyphs[0];
    if (!g || !g.path || !g.bbox) continue;
    // aproximacion: el ancho del bbox de la 'l' de una script monolineal es
    // ~el grosor mas la curvatura; usamos el minimo de los candidatos.
    const ancho = g.bbox.maxX - g.bbox.minX;
    if (ancho > 0 && (mejor === null || ancho < mejor)) mejor = ancho;
  }
  return mejor;
}

function medir(nombre, ruta) {
  if (!existsSync(ruta)) return { nombre, error: 'no encontrada' };
  let f;
  try { f = fontkit.create(readFileSync(ruta)); }
  catch (e) { return { nombre, error: e.message.slice(0, 60) }; }

  const upm = f.unitsPerEm;
  const norm = v => v == null ? null : v / upm;

  // altura de x y de mayuscula: preferimos las tablas, con respaldo por bbox
  let alturaX = f.xHeight, alturaMay = f.capHeight;
  if (!alturaX) { const g = f.layout('x').glyphs[0]; alturaX = g?.bbox ? g.bbox.maxY : null; }
  if (!alturaMay) { const g = f.layout('H').glyphs[0]; alturaMay = g?.bbox ? g.bbox.maxY : null; }

  const trazo = grosorTrazo(f, alturaX);
  const anchoFrase = f.layout(FRASE).advanceWidth;

  return {
    nombre,
    upm,
    inclinacion: f.italicAngle ?? 0,
    ascenso: norm(f.ascent),
    descenso: norm(f.descent),
    hueco: norm(f.lineGap ?? 0),
    alturaX: norm(alturaX),
    alturaMay: norm(alturaMay),
    // los tres ratios que de verdad definen el parecido de una script:
    rXsobreMay: alturaX && alturaMay ? alturaX / alturaMay : null,
    rTrazoSobreX: trazo && alturaX ? trazo / alturaX : null,
    rAnchoSobreX: alturaX ? anchoFrase / alturaX : null,
  };
}

const ref = medir(REFERENCIA.nombre, REFERENCIA.ruta);
if (ref.error) { console.error('No se pudo leer la referencia:', ref.error); process.exit(1); }

const medidas = CANDIDATAS.map(([n, r]) => medir(n, r)).filter(m => !m.error);

const f2 = v => v == null ? '   —  ' : v.toFixed(2).padStart(6);
const f3 = v => v == null ? '    —  ' : v.toFixed(3).padStart(7);

console.log(`Referencia: ${REFERENCIA.nombre}  (${REFERENCIA.licencia})`);
console.log(`Frase medida: "${FRASE}"\n`);
console.log('fuente'.padEnd(22) + 'incl.' .padStart(7) + 'x/May'.padStart(8) + 'trazo/x'.padStart(9) + 'ancho/x'.padStart(9) + 'asc'.padStart(7) + 'desc'.padStart(7));
console.log('-'.repeat(69));
const fila = m => m.nombre.padEnd(22) + f2(m.inclinacion) + '°' + f3(m.rXsobreMay) + ' ' + f3(m.rTrazoSobreX) + ' ' + f3(m.rAnchoSobreX) + ' ' + f2(m.ascenso) + ' ' + f2(m.descenso);
console.log(fila(ref));
console.log('-'.repeat(69));
for (const m of medidas) console.log(fila(m));

// Distancia: cada ratio pesa lo mismo, normalizado por el valor de la referencia.
// La inclinacion se compara en grados absolutos sobre un rango de 30.
function distancia(m) {
  const partes = [];
  const rel = (a, b) => (a == null || b == null || !b) ? null : Math.abs(a - b) / Math.abs(b);
  partes.push(rel(m.rXsobreMay, ref.rXsobreMay));
  partes.push(rel(m.rTrazoSobreX, ref.rTrazoSobreX));
  partes.push(rel(m.rAnchoSobreX, ref.rAnchoSobreX));
  partes.push(Math.abs((m.inclinacion ?? 0) - (ref.inclinacion ?? 0)) / 30);
  const v = partes.filter(x => x != null);
  return v.reduce((a, b) => a + b, 0) / v.length;
}

console.log('\nranking por distancia a Brittany (0 = identica)');
console.log('-'.repeat(69));
const orden = medidas.map(m => ({ m, d: distancia(m) })).sort((a, b) => a.d - b.d);
orden.forEach(({ m, d }, i) => {
  console.log(`${String(i + 1).padStart(2)}. ${m.nombre.padEnd(24)} ${d.toFixed(3)}`);
});

const ganadora = orden[0].m;
console.log(`\nMas cercana por metrica: ${ganadora.nombre}`);
console.log('\nPara el @font-face de esa cara (overrides medidos del binario):');
console.log(`  ascent-override: ${(ganadora.ascenso * 100).toFixed(1)}%;`);
console.log(`  descent-override: ${(Math.abs(ganadora.descenso) * 100).toFixed(1)}%;`);
console.log(`  line-gap-override: ${(ganadora.hueco * 100).toFixed(1)}%;`);
console.log('\n--firma-escala vigente es 1.34, calibrado para Brittany.');
// OJO: lo que gobierna el tamano APARENTE a un font-size dado es la altura de x
// sobre el EM, no sobre la mayuscula. Usar x/May da el ajuste al reves: Allison
// tiene la x mas alta que Brittany en relacion a su mayuscula, pero mas baja en
// relacion al em, y en pantalla se ve mas pequena. Comprobado mirando el
// especimen — la metrica sola se habria equivocado de direccion.
if (ganadora.alturaX && ref.alturaX) {
  const ajuste = 1.34 * (ref.alturaX / ganadora.alturaX);
  console.log(`  x/em de Brittany: ${ref.alturaX.toFixed(3)}   x/em de ${ganadora.nombre}: ${ganadora.alturaX.toFixed(3)}`);
  console.log(`Para igualar el ojo de la nueva cara: --firma-escala: ${ajuste.toFixed(2)}`);
}
console.log('\nLa metrica ordena, pero NO decide sola: hay que mirar el especimen.');
