// Extrae los iconos de linea de la lamina "simbolos" y los tine de marca.
//
//   node scripts/iconos-simbolos.mjs [--solo-detectar]
//
// LA LAMINA VIENE AL REVES DE COMO LA NECESITA EL SITIO. Son trazos celestes
// sobre azul marino, y la pagina de servicios es blanca. Recortarlos tal cual
// daria iconos celestes sobre blanco: ~2.2:1, el error que DESIGN.md prohibe
// desde la primera pagina —el azul claro RELLENA, nunca ESCRIBE—.
//
// Lo que se hace en su lugar: el brillo del pixel se convierte en ALFA. En una
// lamina de trazo claro sobre fondo oscuro, la luminancia ya es el dibujo: el
// fondo es casi negro (alfa 0) y el trazo casi blanco (alfa 1). Con esa mascara
// se tine una superficie del color de marca que SI escribe. El resultado es un
// icono de linea azul oscuro sobre transparencia, que es lo que habia antes con
// los SVG y lo que la maqueta espera.
//
// SE DESCARTA EL HALO. Los trazos llevan un brillo de neon alrededor que, como
// alfa, deja un aura sucia sobre blanco. Se aplica una curva que hunde los
// tonos bajos y conserva los altos, asi que el halo cae a cero y el trazo se
// queda entero.

import sharp from 'sharp';
import { mkdirSync, statSync } from 'node:fs';

const ORIGEN = 'originales/simbolos-lamina.jpg';
const SALIDA = 'public/img/ico';
const SOLO_DETECTAR = process.argv.includes('--solo-detectar');

// Color con el que se tinen. --marca-text, 5.70:1 sobre blanco.
const TINTA = { r: 0x2a, g: 0x6d, b: 0x8f };

const COLS = 4;
const FILAS = 3;

// Rejilla 4x3 con etiqueta debajo de cada icono. Solo se extraen los CINCO que
// casan con un servicio real de servicios.json; la lamina trae doce.
//
// Los siete que se quedan fuera —endodoncia, periodoncia, prostodoncia e
// implantologia, cirugia maxilofacial, odontologia general, odontogeriatria y
// diagnostico digital— no se usan porque ninguna fuente dice que CIMO los
// ofrezca. Un icono en la pagina afirma que el servicio existe.
const MAPA = [
  { fila: 1, col: 0, id: 'invisible', servicio: 'Ortodoncia invisible' },
  { fila: 0, col: 1, id: 'brackets', servicio: 'Brackets' },
  { fila: 2, col: 2, id: 'higiene', servicio: 'Higiene y prevención' },
  { fila: 1, col: 3, id: 'ninos', servicio: 'Odontopediatría' },
  { fila: 2, col: 0, id: 'estetica', servicio: 'Rehabilitación estética' },
];

const TAMANOS = [
  { sufijo: '', px: 72 },
  { sufijo: '@2x', px: 144 },
];

const { data, info } = await sharp(ORIGEN).greyscale().raw()
  .toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const lumi = (x, y) => data[y * W + x];

const anchoCelda = Math.floor(W / COLS);
const altoCelda = Math.floor(H / FILAS);

// Dentro de una celda hay DOS cosas claras: el icono arriba y su etiqueta
// abajo, separadas por un hueco. Se cuentan pixeles claros por fila y se toma
// la PRIMERA banda: el icono. La etiqueta se descarta sola — y hay que
// descartarla, porque el nombre ya lo escribe el HTML y salir dos veces es
// peor que no salir.
const UMBRAL = 105;

function bandaIcono(cx0, cy0) {
  const filas = [];
  for (let y = 0; y < altoCelda; y++) {
    let n = 0;
    for (let x = 0; x < anchoCelda; x++) if (lumi(cx0 + x, cy0 + y) > UMBRAL) n++;
    filas.push(n);
  }
  const bandas = [];
  let ini = -1;
  for (let y = 0; y <= altoCelda; y++) {
    const vivo = y < altoCelda && filas[y] > 1;
    if (vivo && ini < 0) ini = y;
    if (!vivo && ini >= 0) { if (y - ini > 8) bandas.push([ini, y]); ini = -1; }
  }
  return bandas.length ? bandas[0] : null;
}

// Caja exacta del dibujo dentro de su banda, para que todos los iconos queden
// centrados de verdad y no bailen en la columna de la pagina.
function caja(cx0, cy0, y0, y1) {
  let xi = anchoCelda, xf = -1, yi = y1, yf = -1;
  for (let y = y0; y < y1; y++) {
    for (let x = 0; x < anchoCelda; x++) {
      if (lumi(cx0 + x, cy0 + y) > UMBRAL) {
        if (x < xi) xi = x; if (x > xf) xf = x;
        if (y < yi) yi = y; if (y > yf) yf = y;
      }
    }
  }
  return xf < 0 ? null : { xi, xf, yi, yf };
}

console.log(`Lamina ${W}x${H} · celda ${anchoCelda}x${altoCelda}\n`);

const trabajos = [];
for (const m of MAPA) {
  const cx0 = m.col * anchoCelda;
  const cy0 = m.fila * altoCelda;
  const banda = bandaIcono(cx0, cy0);
  if (!banda) { console.error(`  ${m.id}: no se encontro el dibujo en su celda`); process.exit(1); }
  const c = caja(cx0, cy0, banda[0], banda[1]);
  if (!c) { console.error(`  ${m.id}: caja vacia`); process.exit(1); }
  const w = c.xf - c.xi + 1;
  const h = c.yf - c.yi + 1;
  console.log(`  ${m.id.padEnd(10)} celda(${m.fila},${m.col})  dibujo ${w}x${h}  ${m.servicio}`);
  trabajos.push({ m, left: cx0 + c.xi, top: cy0 + c.yi, width: w, height: h });
}

if (SOLO_DETECTAR) process.exit(0);
mkdirSync(SALIDA, { recursive: true });

// Lado comun: el mayor de los recortes. Todos se encajan en un cuadrado de ese
// lado sin deformarse, asi que conservan su proporcion y su peso relativo — un
// arco de dientes es ancho y un implante es estrecho, y eso debe notarse.
const LADO = Math.max(...trabajos.map((t) => Math.max(t.width, t.height)));
console.log(`\nLado comun: ${LADO}px\n`);

let total = 0;
for (const t of trabajos) {
  // 1. el recorte en gris, que ES la mascara.
  //
  // SE PIDE `raw` AQUI MISMO, sin pasar por un buffer codificado en medio.
  // Hacerlo en dos pasos —codificar a JPEG y volver a abrirlo— parece
  // equivalente y no lo es: un JPEG en escala de grises se decodifica a TRES
  // canales sRGB, asi que el buffer sale tres veces mas largo de lo esperado.
  // Declararlo como un canal hacia que joinChannel leyera la memoria con el
  // paso equivocado y los iconos salian como rayas horizontales.
  const { data: alfa, info: iAlfa } = await sharp(ORIGEN)
    .extract({ left: t.left, top: t.top, width: t.width, height: t.height })
    .greyscale()
    // Curva dura: hunde el halo de neon y conserva el trazo. Sin esto el icono
    // sale con un aura gris que sobre blanco se ve como suciedad.
    .linear(1.75, -60)
    .resize(LADO, LADO, { fit: 'contain', background: '#000000' })
    .toColourspace('b-w')
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Y se comprueba, en vez de confiar: si algun dia cambia el comportamiento,
  // que reviente aqui y no que publique iconos rayados.
  if (iAlfa.channels !== 1 || alfa.length !== LADO * LADO) {
    throw new Error(
      `Mascara de "${t.m.id}" con ${iAlfa.channels} canal(es) y ${alfa.length} bytes; ` +
      `se esperaba 1 canal y ${LADO * LADO} bytes.`
    );
  }

  // 2. superficie del color de marca, con el gris como canal alfa
  const tenido = await sharp({
    create: { width: LADO, height: LADO, channels: 3, background: TINTA },
  })
    .joinChannel(alfa, { raw: { width: LADO, height: LADO, channels: 1 } })
    .png()
    .toBuffer();

  for (const z of TAMANOS) {
    const destino = `${SALIDA}/${t.m.id}${z.sufijo}.webp`;
    await sharp(tenido).resize(z.px, z.px).webp({ quality: 90, alphaQuality: 100 }).toFile(destino);
    const kb = statSync(destino).size / 1024;
    total += kb;
    console.log(`  ${destino.padEnd(32)} ${z.px}x${z.px}  ${kb.toFixed(1)} KB`);
  }
}
console.log(`\n  total ${total.toFixed(0)} KB`);
