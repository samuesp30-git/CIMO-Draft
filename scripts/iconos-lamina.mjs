// Extrae los iconos circulares de la lamina generada con IA.
//
//   node scripts/iconos-lamina.mjs [--solo-detectar]
//
// POR QUE UN SCRIPT Y NO RECORTES A MANO: la lamina es un JPG de 1408x768 con
// nueve discos azules en rejilla. Recortar por coordenadas estimadas deja los
// iconos descentrados de dos o tres pixeles cada uno, y eso en una fila de
// iconos se ve: bailan. Se detectan los discos por color y se recorta por su
// centro real.
//
// EL RECORTE LLEVA ALFA. Cada disco sale como circulo recortado sobre
// transparencia, no como cuadrado con el gris de fondo de la lamina. Un
// cuadrado con fondo se nota en cuanto la seccion cambia de color, y el sitio
// alterna blanco con --surface.

import sharp from 'sharp';
import { mkdirSync, statSync } from 'node:fs';

const ORIGEN = 'originales/especialidades-lamina.jpg';
const SALIDA = 'public/img/esp';
const SOLO_DETECTAR = process.argv.includes('--solo-detectar');

// Que disco es cada cual, por posicion en la rejilla (fila, columna), y con
// que servicio de servicios.json casa.
//
// LOS CUATRO QUE FALTAN SON DELIBERADOS. La lamina trae ademas odontologia
// general, endodoncia, periodoncia y cirugia maxilofacial. No hay ninguna
// fuente que diga que CIMO las ofrece, asi que no se extraen: un icono en la
// pagina es una afirmacion de que el servicio existe.
const MAPA = [
  { fila: 0, col: 0, id: 'invisible', servicio: 'Ortodoncia invisible' },
  { fila: 0, col: 1, id: 'brackets', servicio: 'Brackets' },
  { fila: 0, col: 2, id: 'higiene', servicio: 'Higiene y prevención' },
  { fila: 1, col: 1, id: 'estetica', servicio: 'Rehabilitación estética' },
  { fila: 1, col: 2, id: 'ninos', servicio: 'Odontopediatría' },
];

const TAMANOS = [
  { sufijo: '', px: 128 },
  { sufijo: '@2x', px: 256 },
];

const { data, info } = await sharp(ORIGEN).ensureAlpha().raw()
  .toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const px = (x, y) => { const i = (y * W + x) * C; return [data[i], data[i + 1], data[i + 2]]; };

// El azul de los discos ronda #7FB3D5. Se acepta un margen amplio porque el
// JPG introduce ruido y los discos llevan sombra propia en los bordes.
const esAzul = (r, g, b) => b > 150 && b - r > 28 && g > r && b < 240 && r > 80;

// Rejilla: se detecta por proyeccion. Se cuentan pixeles azules por columna y
// por fila; los picos son las bandas donde viven los discos. Es mas robusto
// que buscar blobs porque los discos estan perfectamente alineados.
const porColumna = new Array(W).fill(0);
const porFila = new Array(H).fill(0);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const [r, g, b] = px(x, y);
    if (esAzul(r, g, b)) { porColumna[x]++; porFila[y]++; }
  }
}

// Bandas: tramos contiguos por encima de un umbral RELATIVO al pico.
//
// El umbral no puede ser un numero fijo bajo. La lamina lleva un MARCO azul
// que recorre todo el borde, asi que aporta unos pocos pixeles azules a cada
// columna y a cada fila: con un umbral de cuatro, las tres bandas se funden en
// una sola que abarca la lamina entera.
//
// EL 0.08 ESTA BARRIDO, no elegido. Entre 0.04 y 0.10 la rejilla sale
// identica —columnas 422/704/987, filas 130/337/539, discos de ~138px—, asi
// que 0.08 cae en medio de la meseta. Por encima empieza a perder discos: a
// 0.15 se caian la columna del medio y la fila de arriba, porque no todos los
// discos llevan la misma cantidad de azul.
function bandas(cuenta, minAncho) {
  const umbral = Math.max(...cuenta) * 0.08;
  const out = [];
  let ini = -1;
  for (let i = 0; i < cuenta.length; i++) {
    const vivo = cuenta[i] > umbral;
    if (vivo && ini < 0) ini = i;
    if ((!vivo || i === cuenta.length - 1) && ini >= 0) {
      const fin = i;
      if (fin - ini >= minAncho) out.push({ ini, fin, centro: Math.round((ini + fin) / 2), ancho: fin - ini });
      ini = -1;
    }
  }
  return out;
}

const cols = bandas(porColumna, 60);
const filas = bandas(porFila, 60);

console.log(`Lamina ${W}x${H}`);
console.log(`Columnas detectadas: ${cols.map((c) => `${c.centro}(${c.ancho})`).join('  ')}`);
console.log(`Filas detectadas:    ${filas.map((f) => `${f.centro}(${f.ancho})`).join('  ')}`);

if (cols.length !== 3 || filas.length !== 3) {
  console.error(`\nSe esperaban 3 columnas y 3 filas y salieron ${cols.length} y ${filas.length}.`);
  console.error('No se recorta nada: mejor no generar iconos descentrados en silencio.');
  process.exit(1);
}

// El radio se toma del disco mas ancho detectado, para que todos los iconos
// salgan al mismo tamano aunque el detector varie un pixel entre uno y otro.
const radio = Math.round(Math.max(...cols.map((c) => c.ancho), ...filas.map((f) => f.ancho)) / 2);
console.log(`Radio comun: ${radio}px\n`);

if (SOLO_DETECTAR) process.exit(0);

mkdirSync(SALIDA, { recursive: true });

// Mascara circular, generada una vez al tamano del recorte.
const lado = radio * 2;
const mascara = Buffer.from(
  `<svg width="${lado}" height="${lado}"><circle cx="${radio}" cy="${radio}" r="${radio - 1}" fill="#fff"/></svg>`
);

let total = 0;
for (const m of MAPA) {
  const cx = cols[m.col].centro;
  const cy = filas[m.fila].centro;
  const izq = Math.max(0, cx - radio);
  const arr = Math.max(0, cy - radio);

  const recorte = await sharp(ORIGEN)
    .extract({ left: izq, top: arr, width: lado, height: lado })
    .composite([{ input: mascara, blend: 'dest-in' }])
    .png()
    .toBuffer();

  for (const t of TAMANOS) {
    const destino = `${SALIDA}/${m.id}${t.sufijo}.webp`;
    await sharp(recorte).resize(t.px, t.px).webp({ quality: 88, alphaQuality: 90 }).toFile(destino);
    const kb = statSync(destino).size / 1024;
    total += kb;
    console.log(`  ${destino.padEnd(34)} ${t.px}x${t.px}  ${kb.toFixed(1)} KB   ${m.servicio}`);
  }
}
console.log(`\n  total ${total.toFixed(0)} KB`);
