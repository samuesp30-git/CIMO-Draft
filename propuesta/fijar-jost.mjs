// Fija el eje de peso de Jost y escribe dos caras ESTATICAS para el PDF.
//
//   node propuesta/fijar-jost.mjs
//
// POR QUE HACE FALTA: Chrome imprime a PDF sin incrustar fuentes variables.
// El sitio usa el Jost variable y ahi funciona; en el PDF, en cambio, todo el
// texto de datos —los precios, los rotulos, la cifra de la suscripcion— caia
// callado a la fuente del sistema. No da error: el PDF sale, pesa lo mismo y
// solo se nota comparando. Se detecto leyendo /BaseFont dentro del PDF, no
// mirandolo.
//
// Se fijan dos pesos porque el documento usa 400 y 500, y una cara estatica
// solo lleva uno.

import subsetFont from 'subset-font';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const origen = await readFile(resolve(aqui, 'fonts/jost-latin-wght-normal.woff2'));

// Todo lo que el documento puede llegar a escribir en Jost. Un subconjunto de
// verdad: si falta un glifo, ese caracter cae a la fuente del sistema y se ve
// el salto a mitad de palabra.
const TEXTO =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' +
  'áéíóúüñÁÉÍÓÚÜÑ¿?¡!.,;:()[]«»“”\'"·–—-/\\&%$@#+*=<>|~^_ ' +
  'ÀÈÌÒÙàèìòùÂÊÎÔÛâêîôûÇç';

for (const peso of [400, 500]) {
  const salida = await subsetFont(origen, TEXTO, {
    targetFormat: 'woff2',
    variationAxes: { wght: peso },   // un numero suelto CLAVA el eje; {min,max} solo lo recorta
  });
  const nombre = `fonts/jost-${peso}-estatica.woff2`;
  await writeFile(resolve(aqui, nombre), salida);
  console.log(`${nombre}  ${(salida.length / 1024).toFixed(1)} KB`);
}
