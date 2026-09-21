// Prepara las fuentes del sitio. CERO CDN: todo .woff2 acaba en public/fonts/.
//
//   npm run fuentes
//
// Hace tres cosas:
//   1. copia las caras de @fontsource a public/fonts/
//   2. subconjunta la firma (Allison) al latino con acentos espanoles
//   3. ESCRIBE src/styles/fuentes.css con los @font-face y los overrides
//      verticales MEDIDOS del binario, para que nadie los copie a mano
//
// Por que los overrides no son opcionales: una script tiene ascendentes y
// descendentes enormes. La firma se compone a calc(--step-5 * 1.92) dentro de un
// h1; sin ascent/descent-override empuja el interlineado y descoloca la portada.

import * as fontkit from 'fontkit';
import subsetFont from 'subset-font';
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { basename } from 'node:path';

const DESTINO = 'public/fonts';
const RANGO_LATINO = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+2000-206F, U+2122, U+2191, U+2193, U+2212, U+2215';

// Caracteres que la firma puede necesitar. Se subconjunta a esto y no a las
// frases concretas: el cliente va a querer cambiar el texto, y regenerar la
// fuente cada vez que se edita un titular es una trampa esperando a alguien.
const ALFABETO_FIRMA =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
  'abcdefghijklmnopqrstuvwxyz' +
  '0123456789' +
  'áéíóúÁÉÍÓÚñÑüÜ' +
  ' .,;:¿?¡!«»"\'()-–—…&';

const CARAS = [
  { fam: 'Jost', peso: '100 900', estilo: 'normal', fmt: 'woff2-variations',
    origen: 'node_modules/@fontsource-variable/jost/files/jost-latin-wght-normal.woff2',
    salida: 'jost-latin-wght-normal.woff2' },
  { fam: 'Tinos', peso: '400', estilo: 'normal', fmt: 'woff2',
    origen: 'node_modules/@fontsource/tinos/files/tinos-latin-400-normal.woff2',
    salida: 'tinos-latin-400-normal.woff2' },
  { fam: 'Tinos', peso: '700', estilo: 'normal', fmt: 'woff2',
    origen: 'node_modules/@fontsource/tinos/files/tinos-latin-700-normal.woff2',
    salida: 'tinos-latin-700-normal.woff2' },
  { fam: 'Tinos', peso: '400', estilo: 'italic', fmt: 'woff2',
    origen: 'node_modules/@fontsource/tinos/files/tinos-latin-400-italic.woff2',
    salida: 'tinos-latin-400-italic.woff2' },
];

// La firma va aparte porque se subconjunta y porque lleva overrides medidos.
const FIRMA = {
  fam: 'Firma CIMO',
  cara: 'Allison',
  origen: 'node_modules/@fontsource/allison/files/allison-latin-400-normal.woff2',
  salida: 'firma-latin-400-normal.woff2',
};

const kb = n => (n / 1024).toFixed(1) + ' KB';

mkdirSync(DESTINO, { recursive: true });

console.log('Fuentes -> public/fonts/\n');
let total = 0;

for (const c of CARAS) {
  if (!existsSync(c.origen)) { console.error(`FALTA  ${c.origen}\n  ¿corriste npm install?`); process.exit(1); }
  const buf = readFileSync(c.origen);
  writeFileSync(`${DESTINO}/${c.salida}`, buf);
  total += buf.length;
  console.log(`  ${c.salida.padEnd(34)} ${kb(buf.length).padStart(9)}`);
}

// --- la firma: subconjunto + medicion ---------------------------------------
if (!existsSync(FIRMA.origen)) { console.error(`FALTA ${FIRMA.origen}`); process.exit(1); }
const original = readFileSync(FIRMA.origen);
const subconjunto = await subsetFont(original, ALFABETO_FIRMA, { targetFormat: 'woff2' });
writeFileSync(`${DESTINO}/${FIRMA.salida}`, subconjunto);
total += subconjunto.length;
console.log(`  ${FIRMA.salida.padEnd(34)} ${kb(subconjunto.length).padStart(9)}   (${FIRMA.cara}, de ${kb(original.length)})`);

// Se mide el ORIGINAL, no el subconjunto: subset-font conserva las metricas,
// pero leerlas de la fuente completa evita depender de ese detalle.
const f = fontkit.create(original);
const pct = v => ((Math.abs(v) / f.unitsPerEm) * 100).toFixed(1) + '%';
const ascenso = pct(f.ascent), descenso = pct(f.descent), hueco = pct(f.lineGap ?? 0);

console.log(`\n  total ${kb(total)}`);
console.log(`\n  ${FIRMA.cara}: ascent ${ascenso} · descent ${descenso} · line-gap ${hueco}`);

// --- CSS generado ------------------------------------------------------------
const bloques = CARAS.map(c => `@font-face {
  font-family: '${c.fam}';
  src: url('fonts/${c.salida}') format('${c.fmt}');
  font-weight: ${c.peso};
  font-style: ${c.estilo};
  font-display: swap;
  unicode-range: ${RANGO_LATINO};
}`).join('\n\n');

writeFileSync('src/styles/fuentes.css', `/* GENERADO POR scripts/fuentes.mjs — no editar a mano.
   Se regenera con \`npm run fuentes\`.

   Rutas SIN barra inicial: con barra, el navegador las busca en la raiz del
   disco y bajo file:// no las encuentra. */

${bloques}

/* La firma. Cara: ${FIRMA.cara} (Open Font License), subconjuntada al latino con
   acentos espanoles.

   Sustituye a Brittany Signature, que es la del prototipo pero cuya licencia
   dice literalmente "ONLY for PERSONAL USE. NO COMMERCIAL USE ALLOWED" — y el
   sitio de una clinica es uso comercial. Allison se eligio MIDIENDO contra
   Brittany (scripts/comparar-firma.mjs): trazo/x 0.859 contra 0.879, ancho/x
   10.06 contra 10.42, la mas cercana de seis candidatas por un factor de dos.

   Los overrides estan medidos del binario. Sin ellos la firma empuja el
   interlineado del h1. */
@font-face {
  font-family: '${FIRMA.fam}';
  src: url('fonts/${FIRMA.salida}') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  ascent-override: ${ascenso};
  descent-override: ${descenso};
  line-gap-override: ${hueco};
}
`);
console.log('\n  escrito src/styles/fuentes.css');
console.log('\nRecordatorio: --firma-escala vale 1.92 para Allison (era 1.34 con');
console.log('Brittany). Sale de x/em 0.220 contra 0.316. Verificado en especimen.');
