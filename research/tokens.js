// CIMO — fuente de la verdad de los colores y sus contrastes.
//
// Regla del sistema: ningun color se elige, se mide, y se verifica contra CADA
// fondo donde puede aterrizar. Las tablas de DESIGN.md salen de la salida de
// este script; no se escriben a mano.
//
//   node research/tokens.js            tabla + verificacion
//   node research/tokens.js --css      emite el bloque :root
//   node research/tokens.js --md       emite las tablas en Markdown
//
// Sale con codigo 1 si alguna regla falla.

// ---------------------------------------------------------------- utilidades

const canal = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const lum = ([r, g, b]) => 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
const aRgb = h => { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); };

/** Contraste WCAG entre dos hex de 6 digitos. */
function razon(a, b) {
  const x = lum(aRgb(a)), y = lum(aRgb(b));
  const [alto, bajo] = x > y ? [x, y] : [y, x];
  return (alto + 0.05) / (bajo + 0.05);
}

/** hex -> "hsl(200 60% 65%)", para poder comprobar que un color sigue en su tono. */
function aHsl(hex) {
  const [r, g, b] = aRgb(hex).map(v => v / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) h = mx === r ? 60 * (((g - b) / d) % 6) : mx === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4);
  if (h < 0) h += 360;
  const l = (mx + mn) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return `hsl(${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
}

// ------------------------------------------------------------------- fondos
// Los tres fondos reales del sitio. Todo color de texto se mide contra los que
// puede tocar, no solo contra blanco: ese fue el fallo que dio origen a la regla.

const BASE = '#FFFFFF';
const SURFACE = '#F1F6F9';
const SUAVE = '#DFEEF6';   // --marca-suave: tarjetas y chips. ES un fondo de texto.
const INK = '#293237';

// ------------------------------------------------------------------- tokens
// `medido` = sale de contar pixeles del logo. `derivado` = calculado desde una
// ancla medida. `terceros` = no es nuestro. `aprobado` = decision del cliente.

const TOKENS = [
  // --- fondos ---
  ['--base', '#FFFFFF', 'derivado', 'fondo dominante'],
  ['--surface', '#F1F6F9', 'derivado', 'secciones alternas'],
  ['--line', '#DAE6EC', 'derivado', 'bordes de 1 px'],

  // --- anclas medidas del logo ---
  ['--marca', '#6EB8DD', 'medido', 'relleno del simbolo. SOLO rellenos, nunca texto'],
  ['--ink', '#293237', 'medido', 'decil mas oscuro del wordmark. Texto principal'],

  // --- neutros, todos con tinte 201 grados ---
  ['--ink-oscuro', '#182025', 'derivado', 'hover de botones solidos'],
  ['--ink-marino', '#1E3A47', 'derivado', 'el MISMO valor que --ink con el doble de saturacion. Solo para el extremo azul de los degradados de superficie oscura: al estar los dos por encima de 11:1 con blanco, todo punto del recorrido pasa'],
  ['--ink-soft', '#4F6069', 'derivado', 'texto secundario'],
  ['--ink-faint', '#586973', 'derivado', 'texto terciario, pies'],

  // --- marca ---
  ['--marca-oscuro', '#4AA2CF', 'derivado', 'hover de rellenos de marca'],
  ['--marca-text', '#2A6D8F', 'derivado', 'el azul CUANDO ES TEXTO'],
  ['--marca-suave', '#DFEEF6', 'derivado', 'tarjetas, chips, franjas'],
  ['--marca-tenue', '#F4F9FB', 'derivado', 'seccion mas leve que surface'],

  // --- sobre fondo oscuro ---
  ['--sobre-oscuro', '#ABC2CD', 'derivado', 'texto sobre --ink'],
  ['--sobre-oscuro-suave', '#84A2B0', 'derivado', 'texto menor sobre --ink'],
  ['--marca-sobre-oscuro', '#4EA6D3', 'derivado', 'el azul de marca sobre --ink'],

  // --- firma: la script es monolineal y fina, necesita mas contraste que la serif ---
  ['--firma-color', '#1F5D7D', 'derivado', 'la firma sobre fondo claro'],
  ['--firma-sobre-oscuro', '#7EC3E6', 'derivado', 'la firma sobre --ink'],

  // --- oro: APROBADO por el cliente. Rol unico: rotulos de seccion ---
  ['--oro-relleno', '#C9922A', 'aprobado', 'solo fondo, texto en --ink encima'],
  ['--oro-text', '#8A6212', 'aprobado', 'el oro CUANDO ES TEXTO'],
  ['--oro-sobre-oscuro', '#C9922A', 'aprobado', 'el mismo oro sobre franja oscura'],

  // --- semanticos, un solo uso cada uno ---
  ['--abierto', '#177541', 'derivado', '"Abierto ahora"'],
  ['--error', '#A3312A', 'derivado', 'errores de formulario'],
  ['--aviso', '#8A6212', 'derivado', 'avisos'],
  ['--desactivado', '#6E7C83', 'derivado', 'controles inhabilitados (exentos WCAG 1.4.3)'],

  // --- terceros ---
  ['--whatsapp', '#25D366', 'terceros', 'marca de WhatsApp, no de la clinica'],
  ['--whatsapp-oscuro', '#1FB857', 'terceros', 'hover de WhatsApp'],
];

// ------------------------------------------------------------------- reglas
// Cada regla dice: este token, con este papel, contra estos fondos, minimo tanto.

// LOS CUATRO FONDOS REALES. --marca-suave entro aqui despues de que el barrido
// del navegador encontrara el boton 'Ver ortodoncia con brackets' a 4.42:1
// dentro de una tarjeta de ese color: --marca-text pasaba contra blanco (5.24) y
// contra surface (4.82), pero nadie lo habia medido contra el tercer fondo claro.
// Es la MISMA leccion que el sitio hermano documenta dos veces, por tercera vez.
const TEXTO_CLARO = [BASE, SURFACE, SUAVE];

const REGLAS = [
  // texto sobre fondo claro: AA normal
  ['--ink', 'texto', TEXTO_CLARO, 4.5],
  ['--ink-soft', 'texto', TEXTO_CLARO, 4.5],
  ['--ink-faint', 'texto', TEXTO_CLARO, 4.5],
  ['--marca-text', 'texto', TEXTO_CLARO, 4.5],
  ['--firma-color', 'texto', TEXTO_CLARO, 4.5],
  ['--oro-text', 'texto', TEXTO_CLARO, 4.5],
  ['--abierto', 'texto', TEXTO_CLARO, 4.5],
  ['--error', 'texto', TEXTO_CLARO, 4.5],
  ['--aviso', 'texto', TEXTO_CLARO, 4.5],

  // texto sobre la franja oscura
  ['--sobre-oscuro', 'texto', [INK], 4.5],
  ['--sobre-oscuro-suave', 'texto', [INK], 4.5],
  ['--marca-sobre-oscuro', 'texto', [INK], 4.5],
  ['--firma-sobre-oscuro', 'texto', [INK], 4.5],
  ['--oro-sobre-oscuro', 'texto', [INK], 4.5],
];

// Lo que NO debe pasar. El fallo mas probable del proyecto es usar el color de
// marca como color de texto: da 2.20:1 sobre blanco.
const PROHIBIDO = [
  ['--marca', BASE, 4.5, 'el azul claro rellena, --marca-text escribe'],
];

// ------------------------------------------------------------------- salida

const mapa = Object.fromEntries(TOKENS.map(([n, hex]) => [n, hex]));
const arg = process.argv[2];

if (arg === '--css') {
  console.log(':root{');
  for (const [n, hex, , para] of TOKENS) console.log(`  ${n}:${hex};  /* ${para} */`);
  console.log('}');
  process.exit(0);
}

const filas = TOKENS.map(([n, hex, origen, para]) => ({
  n, hex, origen, para,
  base: razon(hex, BASE), surf: razon(hex, SURFACE), suave: razon(hex, SUAVE), ink: razon(hex, INK),
}));

if (arg === '--md') {
  console.log('| token | hex | origen | s/base | s/surface | s/suave | s/ink | para qué |');
  console.log('|---|---|---|---|---|---|---|---|');
  for (const f of filas) {
    const d = (v, propio) => propio ? '—' : v.toFixed(2);
    console.log(`| \`${f.n}\` | \`${f.hex}\` | ${f.origen} | ${d(f.base, f.hex === BASE)} | ${d(f.surf, f.hex === SURFACE)} | ${d(f.suave, f.hex === SUAVE)} | ${d(f.ink, f.hex === INK)} | ${f.para} |`);
  }
  process.exit(0);
}

console.log('CIMO — tokens de color y contraste medido\n');
console.log('fondos reales:  --base ' + BASE + '   --surface ' + SURFACE + '   --ink ' + INK + '\n');
console.log('token'.padEnd(22) + 'hex'.padEnd(9) + 'hsl'.padEnd(20) + 's/base'.padStart(7) + 's/surf'.padStart(8) + 's/suave'.padStart(9) + 's/ink'.padStart(8) + '  origen');
console.log('-'.repeat(96));
for (const f of filas) {
  console.log(
    f.n.padEnd(22) + f.hex.padEnd(9) + aHsl(f.hex).padEnd(20) +
    f.base.toFixed(2).padStart(7) + f.surf.toFixed(2).padStart(8) + f.suave.toFixed(2).padStart(9) + f.ink.toFixed(2).padStart(8) +
    '  ' + f.origen
  );
}

console.log('\nverificacion');
console.log('-'.repeat(96));
let fallos = 0;

for (const [token, papel, fondos, min] of REGLAS) {
  const hex = mapa[token];
  if (!hex) { console.log(`FALLO  ${token} no existe`); fallos++; continue; }
  for (const bg of fondos) {
    const r = razon(hex, bg);
    const ok = r >= min;
    if (!ok) fallos++;
    const nombreFondo = bg === BASE ? 'base' : bg === SURFACE ? 'surface' : bg === SUAVE ? 'marca-suave' : 'ink';
    console.log(`${ok ? '  ok  ' : 'FALLO '}${token} como ${papel} sobre ${nombreFondo}`.padEnd(56) +
      `${r.toFixed(2)}:1  (min ${min})`);
  }
}

// blanco sobre los rellenos solidos que llevan texto encima
for (const [token, min] of [['--ink', 4.5], ['--marca-text', 4.5], ['--ink-oscuro', 4.5], ['--ink-marino', 4.5]]) {
  const r = razon(BASE, mapa[token]);
  const ok = r >= min;
  if (!ok) fallos++;
  console.log(`${ok ? '  ok  ' : 'FALLO '}blanco sobre ${token}`.padEnd(56) + `${r.toFixed(2)}:1  (min ${min})`);
}

// --ink sobre el oro de relleno: el oro es fondo, el texto encima es la tinta
{
  const r = razon(INK, mapa['--oro-relleno']);
  const ok = r >= 4.5;
  if (!ok) fallos++;
  console.log(`${ok ? '  ok  ' : 'FALLO '}--ink sobre --oro-relleno`.padEnd(56) + `${r.toFixed(2)}:1  (min 4.5)`);
}

for (const [token, bg, umbral, motivo] of PROHIBIDO) {
  const r = razon(mapa[token], bg);
  const ok = r < umbral;
  if (!ok) fallos++;
  console.log(`${ok ? '  ok  ' : 'FALLO '}${token} NO puede ser texto`.padEnd(56) +
    `${r.toFixed(2)}:1  (${motivo})`);
}

// el tono: la marca es de un solo tono medido, 200 grados. Un token azul que se
// salga de 190-210 es deriva, no decision.
const AZULES = ['--marca', '--marca-oscuro', '--marca-text', '--marca-suave', '--marca-tenue',
  '--sobre-oscuro', '--sobre-oscuro-suave', '--marca-sobre-oscuro', '--firma-color',
  '--firma-sobre-oscuro', '--ink', '--ink-oscuro', '--ink-marino', '--ink-soft', '--ink-faint', '--line', '--surface'];
for (const t of AZULES) {
  const h = Number(aHsl(mapa[t]).match(/hsl\((\d+)/)[1]);
  const ok = h >= 190 && h <= 212;
  if (!ok) fallos++;
  console.log(`${ok ? '  ok  ' : 'FALLO '}${t} sigue en el tono de marca`.padEnd(56) + `${h}deg  (190-212)`);
}

console.log('-'.repeat(96));
console.log(`FALLOS=${fallos}`);
if (fallos) process.exit(1);
console.log('\nNota: --desactivado (#6E7C83) falla a proposito contra surface (3.96:1).');
console.log('WCAG 1.4.3 exime los controles inhabilitados. No se "arregla".');
