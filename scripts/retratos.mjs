// Recorta los retratos del equipo y los emite en WebP a dos anchos.
//
//   npm run retratos
//
// DE DONDE SALEN: las entregó la clínica el 2 de noviembre de 2026, de una
// sesión propia en su sede de Tegucigalpa. No son de banco ni de IA: son el
// consultorio real y la gente real, que es exactamente lo que pedía el pendiente
// de fotografía. La procedencia de cada una vive en `src/data/fotos.json`.
//
// POR QUE UN SCRIPT APARTE Y NO `fotos.mjs`: aquel recorta PORTADAS —16:9, 4:5
// alto y un intermedio— con una gravedad (`north`, `east`…) y encima les aplica
// un tratamiento de color para que no compitan con el azul de marca. Un retrato
// no quiere nada de eso: quiere una ventana concreta alrededor de una cara, y
// quiere el color tal cual, porque el color de una cara ES el motivo. Apagarle
// la saturación a una persona la deja con aspecto de cadáver.
//
// EL RECORTE VA ESCRITO A MANO, en píxeles del original, y no por gravedad ni
// por `sharp.strategy.attention`. El motivo largo está en fotos.mjs:70-81 y aquí
// es peor todavía: ocho fotos con la cara en sitios distintos del encuadre —una
// sentada a la derecha, otra de pie a la izquierda— y una, la del Dr. Pineda,
// que es un primer plano de otra sesión, 960x1280 en vez de 853x1280. Con una
// gravedad común, o se corta una cabeza o el Dr. Pineda sale al doble de escala
// que el resto. Los números se fijaron mirando los recortes, uno a uno.
//
// Y DESDE NOVIEMBRE DE 2026 LA VENTANA ES 2:3, EL ENCUADRE ENTERO. Las fichas
// nacieron recortadas a 4:5 de busto para una rejilla de cuatro columnas, y a
// 250 px de ancho ocho bustos se leían como lo que el cliente llamó «pequeñas
// facetas»: una cara y nada más. La página pasó a una fila por doctor, y ahí lo
// que se enseña es la persona de cuerpo entero, tal como la fotografiaron. 2:3
// es justo la proporción nativa de los archivos que entregó la clínica
// (853x1280 = 0.666), así que para siete de los ocho el `extract` no recorta
// nada: es la foto completa, y la comprobación de proporción de más abajo lo
// confirma en vez de darlo por supuesto. El del Dr. Pineda es 3:4 y pierde 53 px
// por lado para entrar en la misma proporción que los demás.
//
// NO SE AMPLIA MAS DE LA CUENTA: los retratos salen a 680 px de ancho sobre un
// original de 853, y la banda del equipo a 853, que es lo que mide. Emitir
// cualquiera de las dos a 1600 no añadiría un solo detalle; solo pesaría más y
// mentiría sobre la calidad que hay.

import sharp from 'sharp';
import { readFileSync, mkdirSync, statSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ORIGEN = 'originales';
const SALIDA = 'public/img';
mkdirSync(SALIDA, { recursive: true });

const fotos = JSON.parse(readFileSync('src/data/fotos.json', 'utf8'));
const retratos = fotos.filter((f) => f.uso === 'retrato');
if (!retratos.length) {
  console.error('fotos.json no declara ninguna entrada con uso "retrato"');
  process.exit(1);
}

let total = 0;
for (const f of retratos) {
  const entrada = resolve(ORIGEN, f.original);
  if (!existsSync(entrada)) {
    console.error(`  falta el original: ${f.original}`);
    process.exitCode = 1;
    continue;
  }

  const [left, top, ancho, alto] = f.recorte;
  const [sw, sh] = f.salida;
  const meta = await sharp(entrada).metadata();

  // REVIENTA ANTES DE EMITIR, no después. Un recorte que se sale del original
  // por diez píxeles no da error en sharp: da una foto con una franja negra, y
  // eso se descubre cuando lo ve el cliente. Mismo criterio que `IconoEsp`, que
  // falla en la compilación ante un icono que no existe.
  if (left < 0 || top < 0 || left + ancho > meta.width || top + alto > meta.height) {
    console.error(
      `  ${f.id}: el recorte [${f.recorte}] se sale del original (${meta.width}x${meta.height})`,
    );
    process.exitCode = 1;
    continue;
  }

  // Y REVIENTA TAMBIEN SI LA PROPORCION NO CUADRA. `resize(w, h)` recorta por su
  // cuenta cuando el aspecto no coincide, así que una salida 4:5 pedida sobre un
  // recorte 1:1 encadena DOS recortes: el escrito aquí y otro invisible. En las
  // portadas ese encadenamiento se comió el cielo entero de una foto.
  const dif = Math.abs(ancho / alto - sw / sh) / (sw / sh);
  if (dif > 0.005) {
    console.error(
      `  ${f.id}: el recorte es ${(ancho / alto).toFixed(3)} y la salida ${(sw / sh).toFixed(3)}; no cuadran`,
    );
    process.exitCode = 1;
    continue;
  }

  // Dos piezas: la base sirve a las pantallas de densidad doble y `-sm` a las de
  // densidad sencilla. Los nombres son los que `verificar` da por declarados a
  // partir del id (comprobación 22), así que no hay que tocar el verificador
  // para que los deje pasar.
  for (const [sufijo, w, h] of [
    ['', sw, sh],
    ['-sm', Math.round(sw / 2), Math.round(sh / 2)],
  ]) {
    const destino = `${SALIDA}/${f.id}${sufijo}.webp`;
    await sharp(entrada)
      .extract({ left, top, width: ancho, height: alto })
      .resize(w, h)
      .webp({ quality: 78 })
      .toFile(destino);
    const kb = statSync(destino).size / 1024;
    total += kb;
    console.log(`  ${destino.padEnd(38)} ${w}x${h}  ${kb.toFixed(0)} KB`);
  }
}
console.log(`\n  total ${total.toFixed(0)} KB`);
