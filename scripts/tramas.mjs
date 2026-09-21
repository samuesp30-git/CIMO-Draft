// Convierte las láminas de Haikei en tramas vectoriales del sistema.
//
//   node scripts/tramas.mjs [--solo-detectar]
//
// Escribe src/styles/tramas.css (GENERADO — no se edita a mano).
//
// ─────────────────────────────────────────────────────────────────────────────
// POR QUÉ NO SE USAN LOS PNG TAL CUAL
//
// Las láminas vienen a 500x333. Una banda del sitio mide entre 360 y 2560 px de
// ancho, así que usarlas como fondo obliga a estirarlas: a 1400 px el trazo de
// 2 px se convierte en 5,6 px borrosos. Un dibujo de líneas estirado se nota
// inmediatamente y es lo que separa una textura de un fondo pixelado.
//
// Aquí se hace lo contrario: se MIDE la geometría de la lámina —centro y radio
// de cada figura, ajustados por mínimos cuadrados— y se vuelve a dibujar como
// SVG. El resultado pesa ~1,5 KB, es nítido a cualquier tamaño y va incrustado
// como data-URI, así que no añade ni un archivo ni una petición (y por tanto
// funciona bajo file://, donde una petición de más es una imagen que no carga).
//
// LA COMPOSICIÓN ES LA SUYA, NO LA MÍA. No se generan posiciones nuevas: se
// recuperan las de Haikei. Lo único que se añade es el ENVOLTORIO TOROIDAL —
// cada figura se dibuja también desplazada ±ancho y ±alto— para que el mosaico
// repita sin costura. Las figuras que Haikei dejó cortadas por el borde son
// justo las que al envolverse cierran el patrón: el recorte deja de ser un
// corte y pasa a ser continuidad.
//
// ─────────────────────────────────────────────────────────────────────────────
// LA LÁMINA YA VIENE EN PALETA
//
// Fondo #293237 y trazo #6EB8DD: son EXACTAMENTE --ink y --marca. No hay que
// corregir color, solo separar el dibujo del fondo — la trama se emite con
// fondo transparente para que se apoye sobre el degradado oscuro que ya existe
// y no lo tape. Una superficie oscura, un material; la trama es su textura.
//
// LA ALFA SE CALCULA, NO SE ELIGE. Un trazo de marca sobre --ink aclara el
// fondo justo debajo del texto. El script busca la alfa más alta con la que
// --base y --sobre-oscuro SIGUEN pasando 4.5:1 sobre el fondo ya aclarado, y
// se queda un escalón por debajo. Con 0.25 el texto secundario cae a 4.33:1;
// por eso no se puso "el que se veía bien".

import sharp from 'sharp';
import { writeFileSync, statSync } from 'node:fs';

const SOLO_DETECTAR = process.argv.includes('--solo-detectar');

const FONDO = [0x29, 0x32, 0x37];   // --ink
const TRAZO = [0x6e, 0xb8, 0xdd];   // --marca

// Texto que aterriza sobre la banda oscura, en dos grupos.
//
// ENCIMA DE LA TRAMA solo se admite el texto con holgura: blanco (13.08:1 sobre
// --ink) y --sobre-oscuro (7.06:1). La alfa de la trama sale de estos dos.
//
// LOS OTROS DOS NO CABEN, y no es cuestión de bajar la alfa. --oro-sobre-oscuro
// da 4.75:1 y --marca-sobre-oscuro 4.81:1: están a 0.0045 y 0.0064 de
// luminancia del suelo de 4.5, así que CUALQUIER trama que se vea los tumba.
// La alfa máxima que los respetaría es 0.02, o sea invisible.
//
// Por eso la banda no resuelve esto con alfa sino con un VELO: la trama se tapa
// con --ink sólido justo donde va la columna de texto. Debajo de las letras el
// fondo es literalmente --ink, que es el color contra el que se midió cada uno
// de estos tokens. Es más estricto que lo que hay hoy: --trama-puntos sí corre
// por debajo del rótulo de oro en .promesa y en .franja.
const SOBRE_LA_TRAMA = {
  '--base': [0xff, 0xff, 0xff],
  '--sobre-oscuro': [0xab, 0xc2, 0xcd],
};
const PROTEGIDOS_POR_EL_VELO = {
  '--oro-sobre-oscuro': [0xc9, 0x92, 0x2a],
  '--marca-sobre-oscuro': [0x4e, 0xa6, 0xd3],
};

const LAMINAS = [
  { archivo: 'originales/haikei-circulos.png', figura: 'circulo', token: 'trama-circulos' },
  { archivo: 'originales/haikei-hexagonos.png', figura: 'hexagono', token: 'trama-hexagonos' },
];

/* ══════════════════════════════════════════════════════════ contraste */

const canal = (v) => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminancia = ([r, g, b]) => 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
const contraste = (a, b) => {
  const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const mezclar = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

/* ══════════════════════════════════════════════════ componentes conexos */

async function componentes(ruta) {
  const { data, info } = await sharp(ruta).raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;

  // "Es dibujo" = se aparta del fondo. El umbral es flojo a propósito: el
  // antialias del trazo llega hasta medio camino entre fondo y trazo, y si se
  // descarta, los círculos salen con el borde mordido y el ajuste se sesga.
  const marca = new Uint8Array(W * H);
  for (let p = 0; p < W * H; p++) {
    const i = p * C;
    const d = Math.abs(data[i] - FONDO[0]) + Math.abs(data[i + 1] - FONDO[1]) + Math.abs(data[i + 2] - FONDO[2]);
    if (d > 24) marca[p] = 1;
  }

  const etiq = new Int32Array(W * H).fill(-1);
  const comps = [];
  const pila = [];
  for (let p0 = 0; p0 < W * H; p0++) {
    if (!marca[p0] || etiq[p0] >= 0) continue;
    const id = comps.length;
    const px = [];
    pila.push(p0);
    etiq[p0] = id;
    while (pila.length) {
      const p = pila.pop();
      const x = p % W;
      const y = (p / W) | 0;
      px.push([x, y]);
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          const q = ny * W + nx;
          if (marca[q] && etiq[q] < 0) { etiq[q] = id; pila.push(q); }
        }
      }
    }
    comps.push(px);
  }
  return { comps, W, H };
}

/* ═══════════════════════════════════════════════════════ ajuste de figuras */

// Ajuste algebraico de circunferencia (Kåsa). Se elige ESTE y no la caja
// envolvente porque funciona con ARCOS PARCIALES: las figuras que el borde
// corta conservan su centro y su radio verdaderos, que es precisamente lo que
// hace falta para envolver el mosaico. Con la caja envolvente, una figura
// cortada daría un centro desplazado y el patrón no cerraría.
function ajustarCirculo(px) {
  const n = px.length;
  let Sx = 0, Sy = 0, Sxx = 0, Syy = 0, Sxy = 0, Sxz = 0, Syz = 0, Sz = 0;
  for (const [x, y] of px) {
    const z = x * x + y * y;
    Sx += x; Sy += y; Sxx += x * x; Syy += y * y; Sxy += x * y;
    Sxz += x * z; Syz += y * z; Sz += z;
  }
  const A = [[Sxx, Sxy, Sx], [Sxy, Syy, Sy], [Sx, Sy, n]];
  const b = [Sxz, Syz, Sz];
  for (let i = 0; i < 3; i++) {
    let piv = i;
    for (let j = i + 1; j < 3; j++) if (Math.abs(A[j][i]) > Math.abs(A[piv][i])) piv = j;
    [A[i], A[piv]] = [A[piv], A[i]];
    [b[i], b[piv]] = [b[piv], b[i]];
    if (Math.abs(A[i][i]) < 1e-9) return null;
    for (let j = i + 1; j < 3; j++) {
      const f = A[j][i] / A[i][i];
      for (let k = i; k < 3; k++) A[j][k] -= f * A[i][k];
      b[j] -= f * b[i];
    }
  }
  const s = [0, 0, 0];
  for (let i = 2; i >= 0; i--) {
    let t = b[i];
    for (let k = i + 1; k < 3; k++) t -= A[i][k] * s[k];
    s[i] = t / A[i][i];
  }
  const cx = s[0] / 2;
  const cy = s[1] / 2;
  const r = Math.sqrt(s[2] + cx * cx + cy * cy);
  if (!isFinite(r) || r <= 0) return null;
  let err = 0;
  for (const [x, y] of px) err += Math.abs(Math.hypot(x - cx, y - cy) - r);
  return { cx, cy, r, err: err / n };
}

// Hexágono regular por descenso de coordenadas. El radio del contorno en la
// dirección φ vale apotema / cos(δ), con δ el ángulo hasta la normal de la
// arista más cercana. Se parte del ajuste circular, que sobre un hexágono da un
// centro casi exacto aunque el radio salga entre apotema y circunradio.
function ajustarHexagono(px, ini) {
  const resid = (cx, cy, ap, th) => {
    let e = 0;
    for (const [x, y] of px) {
      const dx = x - cx;
      const dy = y - cy;
      const rad = Math.hypot(dx, dy);
      let d = (Math.atan2(dy, dx) - th + Math.PI / 6) % (Math.PI / 3);
      if (d < 0) d += Math.PI / 3;
      e += Math.abs(rad - ap / Math.cos(d - Math.PI / 6));
    }
    return e / px.length;
  };

  let mejor = null;
  for (let k = 0; k < 24; k++) {
    const th = (k * Math.PI) / 36;
    const e = resid(ini.cx, ini.cy, ini.r * 0.94, th);
    if (!mejor || e < mejor.e) mejor = { th, e };
  }

  let [cx, cy, ap, th] = [ini.cx, ini.cy, ini.r * 0.94, mejor.th];
  let e = resid(cx, cy, ap, th);
  for (let paso = 2; paso > 0.01; paso *= 0.6) {
    let mejoro = true;
    while (mejoro) {
      mejoro = false;
      const pruebas = [
        [cx + paso, cy, ap, th], [cx - paso, cy, ap, th],
        [cx, cy + paso, ap, th], [cx, cy - paso, ap, th],
        [cx, cy, ap + paso, th], [cx, cy, ap - paso, th],
        [cx, cy, ap, th + paso * 0.02], [cx, cy, ap, th - paso * 0.02],
      ];
      for (const p of pruebas) {
        const v = resid(...p);
        if (v < e - 1e-6) { [cx, cy, ap, th] = p; e = v; mejoro = true; }
      }
    }
  }
  // Se devuelve el CIRCUNRADIO, que es lo que necesita el polígono del SVG.
  return { cx, cy, r: ap / Math.cos(Math.PI / 6), th, err: e };
}

/* ═════════════════════════════════════════════════════════ emisión del SVG */

// Envoltorio toroidal: cada figura se dibuja en las nueve posiciones posibles y
// se conservan las que tocan el mosaico. Así una figura que se sale por la
// derecha vuelve a entrar por la izquierda y la repetición no tiene costura.
function envolver(figs, W, H) {
  const fuera = [];
  for (const f of figs) {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const cx = f.cx + i * W;
        const cy = f.cy + j * H;
        if (cx + f.r < 0 || cx - f.r > W || cy + f.r < 0 || cy - f.r > H) continue;
        fuera.push({ ...f, cx, cy });
      }
    }
  }
  return fuera;
}

const n2 = (v) => Number(v.toFixed(1));

function svg(figs, W, H, figura, alfa, grosor) {
  const cuerpo = figs.map((f) => {
    if (figura === 'circulo') {
      return `<circle cx='${n2(f.cx)}' cy='${n2(f.cy)}' r='${n2(f.r)}'/>`;
    }
    const pts = [];
    for (let k = 0; k < 6; k++) {
      const a = f.th + (k * Math.PI) / 3;
      pts.push(`${n2(f.cx + f.r * Math.cos(a))},${n2(f.cy + f.r * Math.sin(a))}`);
    }
    return `<polygon points='${pts.join(' ')}'/>`;
  }).join('');

  const col = '#' + TRAZO.map((v) => v.toString(16).padStart(2, '0')).join('');
  return (
    `<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}' viewBox='0 0 ${W} ${H}'>` +
    `<g fill='none' stroke='${col}' stroke-opacity='${alfa}' stroke-width='${grosor}'>${cuerpo}</g>` +
    `</svg>`
  );
}

// Codificación mínima para meter el SVG en un url() de CSS. Se dejan las
// comillas simples dentro del SVG para no tener que escapar ninguna.
const aDataURI = (s) =>
  'url("data:image/svg+xml,' +
  s.replace(/%/g, '%25').replace(/#/g, '%23').replace(/</g, '%3C').replace(/>/g, '%3E').replace(/"/g, '%22') +
  '")';

/* ═══════════════════════════════════════════════════════════════ ALFA MÁXIMA */

// El trazo aclara el fondo justo debajo de donde caiga. Se busca la alfa más
// alta a la que el texto admitido encima de la trama sigue pasando 4.5:1, y se
// baja un escalón para no vivir en el límite.
function techoDe(tokens) {
  let ultima = 0;
  for (let a = 0.01; a <= 0.8; a += 0.01) {
    const fondo = mezclar(FONDO, TRAZO, a);
    if (!Object.values(tokens).every((t) => contraste(t, fondo) >= 4.5)) break;
    ultima = a;
  }
  return Math.round(ultima * 100) / 100;
}

function alfaSegura() {
  const techo = techoDe(SOBRE_LA_TRAMA);
  const elegida = Math.round((techo - 0.03) * 100) / 100;
  const fondo = mezclar(FONDO, TRAZO, elegida);
  const detalle = Object.entries(SOBRE_LA_TRAMA)
    .map(([n, c]) => `${n} ${contraste(c, fondo).toFixed(2)}:1`)
    .join(' · ');
  return { elegida, techo, techoVelo: techoDe(PROTEGIDOS_POR_EL_VELO), detalle };
}

/* ═══════════════════════════════════════════════════════════════════ MAIN */

const { elegida: ALFA, techo, techoVelo, detalle } = alfaSegura();
console.log(`Alfa de trama: ${ALFA}  (techo ${techo}, se baja un escalón)`);
console.log(`  sobre el fondo aclarado → ${detalle}`);
console.log(`  oro y marca sobre oscuro aguantarían ${techoVelo}: por eso van bajo velo, no bajo alfa\n`);

/* ═══════════════════════════════════════════ EL LAVADO CLARO (tercera lámina)

   originales/haikei-degradado.png es un degradado difuso azul claro. Tal cual
   NO SIRVE como fondo de texto, y esto es medido, no una impresión: su punto
   más oscuro es #ABD7EE, y contra él --oro-text da 3.57:1, --marca-text 3.71:1
   y --ink-soft 4.26:1. Los tres por debajo de 4.5. El único token del sistema
   que lo aguanta es --ink.

   Así que se aclara hasta que el punto MÁS OSCURO de toda la lámina pasa 4.5:1
   contra el token más débil que puede aterrizar encima. Se mezcla hacia blanco,
   que es exactamente lo que haría un velo blanco por encima, y se vuelve a
   medir sobre la imagen ya aclarada en vez de fiarse del cálculo. */

// Texto que puede caer sobre una superficie clara. El techo lo pone --oro-text.
const TEXTO_SOBRE_CLARO = {
  '--oro-text': [0x8a, 0x62, 0x12],
  '--marca-text': [0x2a, 0x6d, 0x8f],
  '--ink-faint': [0x58, 0x69, 0x73],
  '--ink-soft': [0x4f, 0x60, 0x69],
};

async function lavado() {
  const ORIGEN = 'originales/haikei-degradado.png';

  const minimo = async (buf) => {
    const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
    let peor = null;
    let peorL = Infinity;
    for (let p = 0; p < info.width * info.height; p++) {
      const i = p * info.channels;
      const c = [data[i], data[i + 1], data[i + 2]];
      const L = luminancia(c);
      if (L < peorL) { peorL = L; peor = c; }
    }
    return { color: peor, L: peorL };
  };

  const antes = await minimo(ORIGEN);
  const contraAntes = Object.entries(TEXTO_SOBRE_CLARO)
    .map(([n, c]) => `${n} ${contraste(c, antes.color).toFixed(2)}:1`)
    .join(' · ');

  // Búsqueda binaria de la mezcla hacia blanco: la más PEQUEÑA que hace pasar a
  // todos. Cuanto menos se aclare, más carácter conserva la lámina.
  //
  // EL OBJETIVO ES 4.75, NO 4.5, Y ESE NÚMERO NO ES ARBITRARIO: es el suelo que
  // el sistema YA acepta como su punto más justo —--oro-sobre-oscuro da 4.75:1
  // sobre --ink y así está escrito en tokens.css—. Pedir menos convertiría a
  // este fondo en el eslabón más débil del sitio; pedir más lo borra.
  //
  // Se midieron las tres opciones sobre la página construida:
  //   4.50 → mezcla 55 %, --oro-text a 4.51:1. Pasa, pero por debajo de todo
  //          lo demás del sistema.
  //   5.00 → mezcla 80 %, el lavado deja de verse: queda en un blanco roto que
  //          --marca-tenue ya daba con cero bytes.
  //   4.75 → el punto donde todavía se lee como superficie sin bajar del suelo
  //          que el sistema ya tiene asumido.
  const OBJETIVO = 4.75;
  let lo = 0;
  let hi = 1;
  for (let k = 0; k < 24; k++) {
    const t = (lo + hi) / 2;
    const prueba = mezclar(antes.color, [255, 255, 255], t);
    const pasa = Object.values(TEXTO_SOBRE_CLARO).every((c) => contraste(c, prueba) >= OBJETIVO);
    if (pasa) hi = t; else lo = t;
  }
  const T = Math.ceil(hi * 100) / 100;

  // `linear` con pendiente (1-T) y desvío 255*T es la mezcla hacia blanco
  // aplicada a cada canal: el equivalente exacto de un velo blanco al T.
  const aclarado = await sharp(ORIGEN)
    .linear(1 - T, 255 * T)
    .toColourspace('srgb')
    .png()
    .toBuffer();

  const despues = await minimo(aclarado);
  const contraDespues = Object.entries(TEXTO_SOBRE_CLARO)
    .map(([n, c]) => `${n} ${contraste(c, despues.color).toFixed(2)}:1`)
    .join(' · ');
  const hex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();

  console.log('El lavado claro:');
  console.log(`  original  punto más oscuro ${hex(antes.color)} → ${contraAntes}`);
  console.log(`  mezcla hacia blanco: ${(T * 100).toFixed(0)} %`);
  console.log(`  aclarado  punto más oscuro ${hex(despues.color)} → ${contraDespues}`);
  console.log(`  (--marca-suave, el fondo claro más oscuro que ya admite el sistema, es #DFEEF6)`);

  if (SOLO_DETECTAR) return;
  const destino = 'public/img/lavado.webp';
  await sharp(aclarado).webp({ quality: 88 }).toFile(destino);
  const kb = statSync(destino).size / 1024;
  console.log(`  ${destino}  ${kb.toFixed(1)} KB (el PNG original pesaba 141.5)\n`);
}

await lavado();

const bloques = [];

for (const lam of LAMINAS) {
  const { comps, W, H } = await componentes(lam.archivo);
  const grandes = comps.filter((c) => c.length >= 40);

  const figs = [];
  let grosorTotal = 0;
  let grosorN = 0;
  let peor = 0;
  for (const c of grandes) {
    const circ = ajustarCirculo(c);
    if (!circ) continue;
    const f = lam.figura === 'hexagono' ? ajustarHexagono(c, circ) : circ;
    peor = Math.max(peor, f.err);

    // El grosor sale del área del trazo dividida por su perímetro, y SOLO se
    // mide en las figuras enteras: en una cortada el perímetro visible es
    // menor que el real y el grosor saldría subestimado.
    const xs = c.map((p) => p[0]);
    const ys = c.map((p) => p[1]);
    const entera = Math.min(...xs) > 1 && Math.min(...ys) > 1 && Math.max(...xs) < W - 2 && Math.max(...ys) < H - 2;
    if (entera) {
      const perim = lam.figura === 'hexagono' ? 6 * f.r : 2 * Math.PI * f.r;
      grosorTotal += c.length / perim;
      grosorN++;
    }
    figs.push(f);
  }

  const grosor = Math.round((grosorTotal / grosorN) * 100) / 100;
  const envueltas = envolver(figs, W, H);
  const s = svg(envueltas, W, H, lam.figura, ALFA, grosor);

  console.log(`${lam.archivo}  ${W}x${H}`);
  console.log(`  figuras: ${figs.length} → ${envueltas.length} con envoltorio`);
  console.log(`  residuo peor: ${peor.toFixed(2)} px · grosor medio: ${grosor} px`);
  console.log(`  SVG: ${(s.length / 1024).toFixed(2)} KB\n`);

  bloques.push({ token: lam.token, uri: aDataURI(s), W, H, n: figs.length, figura: lam.figura });
}

if (SOLO_DETECTAR) process.exit(0);

const css =
  `/* GENERADO por scripts/tramas.mjs — no se edita a mano.\n` +
  `   Geometría medida de las láminas de Haikei en originales/haikei-*.png:\n` +
  bloques.map((b) => `     --${b.token}: ${b.n} ${b.figura}s, mosaico de ${b.W}x${b.H}\n`).join('') +
  `\n` +
  `   Los SVG van con fondo TRANSPARENTE: la trama se apoya sobre el degradado\n` +
  `   oscuro que ya existe en vez de sustituirlo. Una superficie oscura, un\n` +
  `   material.\n` +
  `\n` +
  `   La alfa (${ALFA}) no se eligió: es la más alta con la que --base y\n` +
  `   --sobre-oscuro siguen pasando 4.5:1 sobre el fondo que el propio trazo\n` +
  `   aclara, menos un escalón. Techo medido: ${techo}.\n` +
  `   ${detalle}\n` +
  `\n` +
  `   --oro-sobre-oscuro (4.75:1) y --marca-sobre-oscuro (4.81:1) NO caben\n` +
  `   encima de ninguna trama visible: su techo de alfa es ${techoVelo}. No se\n` +
  `   resuelven bajando la alfa sino con --velo-trama, que tapa la trama con\n` +
  `   --ink sólido justo donde va la columna de texto. */\n` +
  `:root {\n` +
  bloques.map((b) => `  --${b.token}: ${b.uri};\n`).join('') +
  `  --trama-figuras-paso: ${bloques[0].W}px ${bloques[0].H}px;\n` +
  `}\n`;

writeFileSync('src/styles/tramas.css', css);
console.log(`src/styles/tramas.css  ${(css.length / 1024).toFixed(1)} KB`);
