// Procesa las fotos de portada: recorte, tratamiento y WebP a dos anchos.
//
//   node scripts/fotos.mjs
//
// DE DONDE SALEN: Unsplash, bajo la Licencia Unsplash — uso comercial libre y
// sin atribucion obligatoria. La procedencia de cada una vive en
// `src/data/fotos.json`, no en la cabeza de nadie: si manana hay que
// justificarle a un cliente de donde salio una imagen, ahi esta el enlace.
//
// QUE NO SE USA Y POR QUE: ninguna foto de consultorio, de equipo ni de
// pacientes. Una clinica que ensena un quirofano que no es el suyo promete algo
// que el paciente no va a encontrar. Un primer plano de una sonrisa no afirma
// nada sobre el local: habla del tratamiento, no de la sede. Esa es la linea, y
// esta escrita en DESIGN.md.
//
// EL TRATAMIENTO NO ES DECORACION. Se baja la saturacion y se sube ligeramente
// el negro para que la imagen deje de competir con el azul de marca y para que
// la capa oscura de encima tenga algo estable debajo. Una foto de banco a todo
// color, sin tocar, es lo que hace que una pagina parezca una plantilla.

import sharp from 'sharp';
import { readFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const ORIGEN = process.argv[2];
if (!ORIGEN || !existsSync(ORIGEN)) {
  console.error('Uso: node scripts/fotos.mjs <carpeta-con-los-originales>');
  process.exit(1);
}

const fotos = JSON.parse(readFileSync('src/data/fotos.json', 'utf8'));
const SALIDA = 'public/img';
mkdirSync(SALIDA, { recursive: true });

// Tres piezas, y la tercera es la que importa en movil.
//
// El recorte cuadrado NO sirve para una portada vertical: en una pantalla de
// 390x1200, `cover` sobre una imagen cuadrada amplia tanto que lo que queda en
// cuadro es un hombro. Por eso la cara vertical es un recorte propio, 4:5, y
// ademas se deja elegir el encuadre a `attention`, que busca la zona de mas
// interes visual de la imagen en vez de asumir que el motivo esta centrado —
// que en estas fotos no lo esta.
// 1600x900 y no 1600x1000: la portada se muestra a ~1.82 de aspecto, asi que
// un recorte de 1.60 obliga al CSS a recortar OTRA VEZ por arriba y por abajo.
// Dos recortes encadenados amplian el doble y se comen el encuadre — en la
// primera version desaparecio el cielo entero de la foto. 1.78 deja que `cover`
// casi no tenga que tocar nada.
const ANCHOS = [
  { sufijo: '', w: 1600, h: 900, q: 74 },
  { sufijo: '-sm', w: 900, h: 620, q: 72 },
  { sufijo: '-alto', w: 800, h: 1150, q: 72 },
];

let total = 0;
for (const f of fotos) {
  // fotos.json es el registro de procedencia de TODAS las imagenes, no solo de
  // las portadas. La lamina de iconos vive ahi para que su origen de IA quede
  // anotado, pero no es una portada: recortarla a 16:9 no tiene ningun sentido.
  // La procesa `scripts/iconos-lamina.mjs`, que es quien sabe partirla.
  // Las laminas que no son fotografia no pasan por el recorte de portadas: los
  // iconos los extrae scripts/iconos-simbolos.mjs y las tramas y el lavado,
  // scripts/tramas.mjs. Aqui solo constan para dejar registrada su procedencia.
  if (f.uso) continue;

  const entrada = resolve(ORIGEN, f.original);
  if (!existsSync(entrada)) { console.error(`  falta el original: ${f.original}`); continue; }

  for (const a of ANCHOS) {
    const destino = `${SALIDA}/${f.id}${a.sufijo}.webp`;
    // CADA ORIENTACION LLEVA SU ENCUADRE, escrito a mano en fotos.json.
    //
    // Se intento dejarselo a `sharp.strategy.attention`, que busca la zona de
    // mas interes visual. Encuadra de maravilla un retrato... y eso es el
    // problema: en el apaisado de la portada te planta los ojos a pantalla
    // completa. Lo que una portada necesita no es el punto mas interesante de
    // la foto, es una COMPOSICION — la cara a un lado y aire al otro para que
    // entre el titular. Eso no lo sabe un algoritmo de saliencia.
    //
    // Y el recorte vertical no es el apaisado reescalado: en una foto apaisada
    // con la cara a la derecha, el vertical hay que tirarlo del este o sale un
    // primer plano del pelo. Comprobado a base de mirar los recortes en crudo.
    const vertical = a.h > a.w;
    const encuadre = (vertical ? f.encuadreAlto : f.encuadre) || 'centre';
    let img = sharp(entrada).resize(a.w, a.h, { fit: 'cover', position: encuadre });
    if (f.tratamiento === 'bn') img = img.grayscale().modulate({ brightness: 0.98 });
    else if (f.tratamiento === 'apagado') img = img.modulate({ saturation: 0.55, brightness: 0.97 });
    // `suave` para las imagenes cuyo color ES el motivo —un cielo azul, aqui—.
    // Apagarlas al 55 % las convierte en una mancha gris y se pierde justo lo
    // que las hacia funcionar.
    else if (f.tratamiento === 'suave') img = img.modulate({ saturation: 0.88, brightness: 1.0 });
    await img.webp({ quality: a.q }).toFile(destino);
    const kb = statSync(destino).size / 1024;
    total += kb;
    console.log(`  ${destino.padEnd(34)} ${a.w}x${a.h}  ${kb.toFixed(0)} KB`);
  }
}
console.log(`\n  total ${total.toFixed(0)} KB`);
