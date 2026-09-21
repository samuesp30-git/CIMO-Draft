// Auditoría de dist/. Cero dependencias.
//
//   npm run verificar
//
// Hereda las comprobaciones del sitio hermano (C:\Users\Darwin\Dentco) y añade
// las propias de CIMO. Cada una existe porque su fallo YA PASÓ en algún sitio, o
// porque romperla convierte el entregable en algo que no abre.
//
// Lo que NO está aquí: el barrido de contraste, que necesita un navegador. Vive
// en `npm run contraste` para que este script conserve sus cero dependencias y
// pueda correr en cualquier parte.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';

const DIST = 'dist';
const fallos = [];
const avisos = [];
const F = (m) => fallos.push(m);
const A = (m) => avisos.push(m);

if (!existsSync(DIST)) { console.error('No hay dist/. Corre `npm run build`.'); process.exit(1); }

const PAGINAS_ESPERADAS = ['index.html', 'servicios.html', 'invisalign.html', 'preguntas.html', 'contacto.html'];
const INTERNAS = ['404.html'];        // se le comprueba lo estructural, se le perdona lo editorial

const clinica = JSON.parse(readFileSync('src/data/clinica.json', 'utf8'));
const pendientes = JSON.parse(readFileSync('src/data/pendientes.json', 'utf8'));
const fotos = JSON.parse(readFileSync('src/data/fotos.json', 'utf8'));
const sede = clinica.sedes[0];
const NUMERO = clinica.whatsapp.numero;
const TEL = clinica.telefono.href;

const html = readdirSync(DIST).filter((f) => f.endsWith('.html'));
const doc = Object.fromEntries(html.map((f) => [f, readFileSync(join(DIST, f), 'utf8')]));

// Mapa token -> hex, leido del CSS que de verdad se compila.
const tokens = {};
{
  const css = readFileSync('src/styles/tokens.css', 'utf8');
  for (const m of css.matchAll(/(--[\w-]+)\s*:\s*(#[0-9A-Fa-f]{6})\b/g)) tokens[m[1]] = m[2].toUpperCase();
}

// ─────────────────────────────────────────────────── 1. paginas esperadas
for (const p of PAGINAS_ESPERADAS) if (!doc[p]) F(`falta la pagina ${p}`);
for (const p of INTERNAS) if (!doc[p]) A(`falta ${p} (interna)`);

// ─────────────────────────────────────────────────── 2. rutas absolutas
for (const [f, s] of Object.entries(doc)) {
  for (const m of s.matchAll(/(?:href|src)="(\/[^"/][^"]*)"/g)) {
    F(`${f}: ruta absoluta "${m[1]}" — no funcionaria desde file://`);
  }
}

// ─────────────────────────────────────────────────── 3. enlaces internos
for (const [f, s] of Object.entries(doc)) {
  for (const m of s.matchAll(/href="([^"#?:]+\.html)(?:#[^"]*)?"/g)) {
    if (!existsSync(join(DIST, m[1]))) F(`${f}: enlace a ${m[1]}, que no existe`);
  }
}

// ─────────────────────────────────────────────────── 4. recursos locales
let recursos = 0;
for (const [f, s] of Object.entries(doc)) {
  const refs = new Set();
  for (const m of s.matchAll(/(?:href|src)="(?!https?:|mailto:|tel:|data:|#)([^"]+\.(?:png|jpg|jpeg|webp|svg|woff2?|ico))"/g)) refs.add(m[1]);
  for (const m of s.matchAll(/url\(['"]?(?!https?:|data:)([^)'"]+\.(?:woff2?|png|jpg|jpeg|webp|svg))['"]?\)/g)) refs.add(m[1]);
  for (const r of refs) {
    recursos++;
    if (!existsSync(join(DIST, r))) F(`${f}: recurso ausente ${r}`);
  }
}

// ─────────────────────────────────────────────────── 5. metadatos
for (const [f, s] of Object.entries(doc)) {
  if (!/<html lang="es"/.test(s)) F(`${f}: falta <html lang="es">`);
  const t = s.match(/<title>([^<]*)<\/title>/);
  if (!t || t[1].trim().length < 5) F(`${f}: <title> ausente o demasiado corto`);
  const d = s.match(/<meta name="description" content="([^"]*)"/);
  if (!d || d[1].trim().length < 20) F(`${f}: meta description ausente o demasiado corta`);
  const h1 = (s.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) F(`${f}: hay ${h1} <h1>, tiene que haber exactamente 1`);
  // jerarquia sin saltos: h1 -> h3 es fallo
  const niveles = [...s.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  for (let i = 1; i < niveles.length; i++) {
    if (niveles[i] - niveles[i - 1] > 1) F(`${f}: salto de encabezado h${niveles[i - 1]} -> h${niveles[i]}`);
  }
}

// ─────────────────────────────────────────── 6. WhatsApp: icono y tope
for (const [f, s] of Object.entries(doc)) {
  if (!/class="wa"/.test(s)) F(`${f}: falta el icono flotante de WhatsApp`);
  const enlaces = (s.match(/wa\.me\//g) || []).length;
  // 1 icono flotante + 1 plantilla dentro del script del dialogo = 2.
  // +1 si la pagina declara un enlace de contacto explicito.
  const explicitos = (s.match(/data-wa-contacto/g) || []).length;
  const tope = 2 + explicitos;
  if (enlaces > tope) F(`${f}: ${enlaces} enlaces wa.me, el tope es ${tope}. El icono flotante es la unica entrada, salvo contacto explicito.`);
  if (/data-abrir-cita/.test(s) && !/data-agendar/.test(s)) F(`${f}: hay boton de cita pero no esta el dialogo`);
  // el gemelo tel: tiene que existir donde hay boton de cita
  if (/data-abrir-cita/.test(s) && !/data-cita-tel/.test(s)) F(`${f}: boton de cita sin gemelo tel: — sin JavaScript no habria forma de contactar`);
}

// ─────────────────────────────────────────────────── 7. scripts externos
for (const [f, s] of Object.entries(doc)) {
  for (const m of s.matchAll(/<script[^>]+src="([^"]+)"/g)) F(`${f}: <script src> externo: ${m[1]}`);
}

// ─────────────────────────────────────────────────── 8. imagenes con alt
for (const [f, s] of Object.entries(doc)) {
  for (const m of s.matchAll(/<img\b([^>]*)>/g)) {
    // `alt` a secas cuenta. Astro emite `alt=""` como atributo sin valor, y en
    // HTML eso ES el alt vacio: la forma correcta de marcar una imagen como
    // decorativa. Exigir el `=` obligaba a inventarle una descripcion a un
    // icono que va justo encima del titular que ya lo nombra — o sea, a que el
    // lector de pantalla lo diga dos veces.
    if (!/\balt(?:=|[\s>]|$)/.test(m[1] + '>')) F(`${f}: <img> sin alt`);
    if (!/\bwidth=/.test(m[1]) || !/\bheight=/.test(m[1])) A(`${f}: <img> sin width/height (salto de maquetacion)`);
  }
}

// ══════════════════════════════ COMPROBACIONES PROPIAS DE CIMO ══════════════

// ── 9. --marca NUNCA escribe. Es el error mas probable del proyecto: el color
//      de marca da 2.20:1 sobre blanco y todo el mundo quiere ponerlo en texto.
const MARCA = tokens['--marca'] || '#6EB8DD';
const marcaRgb = MARCA.slice(1).match(/../g).map((h) => parseInt(h, 16)).join(',\\s*');
for (const [f, s] of Object.entries(doc)) {
  const patrones = [
    [new RegExp(`color:\\s*var\\(--marca\\)`, 'g'), 'color: var(--marca)'],
    [new RegExp(`color:\\s*${MARCA}`, 'gi'), `color: ${MARCA}`],
    [new RegExp(`color:\\s*rgb\\(\\s*${marcaRgb}\\s*\\)`, 'gi'), 'color: rgb(...) del azul de marca'],
    [/-webkit-text-fill-color/g, '-webkit-text-fill-color'],
    [/background-clip:\s*text/g, 'background-clip: text'],
  ];
  for (const [re, etiqueta] of patrones) {
    if (re.test(s)) F(`${f}: ${etiqueta} — el azul claro rellena, --marca-text escribe`);
  }
}

// ── 10. hex literal en vez de token, fuera del bloque :root
const invertido = Object.fromEntries(Object.entries(tokens).map(([k, v]) => [v, k]));
for (const [f, s] of Object.entries(doc)) {
  // Se excluyen dos cosas: el bloque :root, que es donde VIVEN los tokens, y las
  // etiquetas <meta> — theme-color es un atributo HTML y no admite var().
  const sinRoot = s.replace(/:root\s*\{[^}]*\}/g, '').replace(/<meta[^>]*>/g, '');
  for (const m of sinRoot.matchAll(/#[0-9A-Fa-f]{6}\b/g)) {
    const hex = m[0].toUpperCase();
    if (invertido[hex]) A(`${f}: hex literal ${hex} — existe el token ${invertido[hex]}`);
  }
}

// ── 11. cero rastro de CDN
const CDN = ['fonts.googleapis', 'fonts.gstatic', 'unpkg.com', 'cdn.jsdelivr', 'iconify', 'babel', 'cdnjs'];
for (const [f, s] of Object.entries(doc)) {
  for (const c of CDN) if (s.includes(c)) F(`${f}: rastro de CDN "${c}" — el sitio tiene que abrir sin red`);
}

// ── 12. el numero es el real, sin marcadores
for (const [f, s] of Object.entries(doc)) {
  for (const m of s.matchAll(/wa\.me\/(\d+)/g)) {
    if (m[1] !== NUMERO) F(`${f}: wa.me/${m[1]} no es el numero de la clinica (${NUMERO})`);
  }
  for (const m of s.matchAll(/href="tel:([^"]+)"/g)) {
    if (m[1] !== TEL) F(`${f}: tel:${m[1]} no es el telefono de la clinica (${TEL})`);
  }
}

// ── 13. direccion sin confirmar -> el aviso tiene que estar
if (sede.direccionPendiente) {
  if (!/data-direccion-pendiente/.test(doc['contacto.html'] || '')) {
    F('contacto.html: la direccion esta marcada como pendiente pero no aparece el aviso');
  }
}

// ── 14. el mapa no puede afirmar mas de lo que se sabe.
//
//       ANTES esta comprobacion prohibia el mapa entero mientras `coordenadas`
//       fuese null. Prohibia de mas: lo que no se sabe no es DONDE dice la
//       clinica que esta —eso lo publico ella—, es si sigue ahi despues de la
//       mudanza de mayo de 2026. Un embebido que consulta a Google POR LA
//       DIRECCION PUBLICADA no afirma nada que la clinica no haya dicho; un par
//       de coordenadas escrito a mano si: afirma una precision que nadie ha
//       comprobado. Asi que lo prohibido son las coordenadas inventadas, y el
//       aviso de mudanza tiene que ir en la misma pagina que el mapa.
{
  const conMapa = Object.entries(doc).filter(([, s]) => /data-mapa/.test(s));

  if (!sede.coordenadas) {
    for (const [f, s] of conMapa) {
      for (const m of s.matchAll(/maps\.google\.com\/maps\?q=(-?\d+\.\d+)(?:%2C|,)(-?\d+\.\d+)/g)) {
        F(`${f}: el mapa apunta a ${m[1]},${m[2]} y la sede NO tiene coordenadas confirmadas`);
      }
      if (sede.direccionPendiente && !/data-direccion-pendiente/.test(s)) {
        F(`${f}: hay mapa y la direccion esta sin confirmar, pero no sale el aviso en esa pagina`);
      }
    }
  }

  // El destino sale de clinica.json, nunca escrito a mano en el componente.
  const destino = sede.coordenadas
    ? `${sede.coordenadas.lat},${sede.coordenadas.lng}`
    : sede.direccion.consulta;
  const huella = encodeURIComponent(destino).slice(0, 40);
  for (const [f, s] of conMapa) {
    if (!s.includes(huella)) F(`${f}: el mapa no apunta al destino declarado en clinica.json`);
  }
}

// ── 15. fuentes coherentes
{
  const declaradas = new Set();
  for (const s of Object.values(doc)) {
    for (const m of s.matchAll(/@font-face[^}]*?url\(['"]?([^)'"]+)['"]?\)/g)) declaradas.add(m[1]);
  }
  for (const d of declaradas) if (!existsSync(join(DIST, d))) F(`@font-face apunta a ${d}, que no esta en dist/`);
  const enDisco = existsSync(join(DIST, 'fonts')) ? readdirSync(join(DIST, 'fonts')) : [];
  for (const a of enDisco) {
    if (/\.(ttf|otf)$/i.test(a)) F(`dist/fonts/${a}: no se entregan .ttf/.otf, solo .woff2`);
    if (/\.woff2$/i.test(a) && ![...declaradas].some((d) => d.endsWith(a))) A(`dist/fonts/${a}: no lo referencia ningun @font-face (peso muerto)`);
  }
}

// ── 16. CSS hostil a file://. mask-image bajo file:// no falla: hace
//       DESAPARECER el elemento entero, sin error en consola.
for (const [f, s] of Object.entries(doc)) {
  if (/mask-image|-webkit-mask/.test(s)) F(`${f}: mask-image no funciona bajo file:// — el elemento desaparece sin avisar`);
  for (const m of s.matchAll(/<use[^>]+(?:xlink:)?href="([^"#][^"]*)"/g)) F(`${f}: <use href="${m[1]}"> a otro archivo no resuelve bajo file://`);
}

// ── 17. cero hojas externas + presupuesto de JS en linea
for (const [f, s] of Object.entries(doc)) {
  if (/<link[^>]+rel="stylesheet"/.test(s)) F(`${f}: <link rel=stylesheet> — inlineStylesheets deberia estar en 'always'`);
  const js = [...s.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
    .map((m) => m[1].length).reduce((a, b) => a + b, 0);
  if (js > 25 * 1024) A(`${f}: ${(js / 1024).toFixed(1)} KB de JS en linea (presupuesto 25 KB)`);
}

// ── 18. nada inventado
for (const [f, s] of Object.entries(doc)) {
  if (/aggregateRating|"review"/.test(s)) F(`${f}: JSON-LD con valoraciones — CIMO tiene CERO resenas publicas`);
  // el unico nombre propio verificable del equipo
  for (const m of s.matchAll(/\bDra?\.\s+([A-ZÁÉÍÓÚÑ][\wáéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][\wáéíóúñ]+)?)/g)) {
    if (!/Marta Mu(ñ|&#241;)oz/.test(m[0])) F(`${f}: nombre de doctor no verificado: "${m[0]}"`);
  }
  for (const m of s.matchAll(/data-marcador="([^"]*)"[^>]*aria-label="([^"]*)"/g)) {
    if (!m[2].trim()) F(`${f}: hay un Marcador sin texto de lo que falta`);
  }
}

// ── 19. cada marcador de dist corresponde a un pendiente declarado
{
  const ids = new Set(pendientes.map((p) => p.id));
  for (const [f, s] of Object.entries(doc)) {
    for (const m of s.matchAll(/data-marcador="([^"]+)"/g)) {
      if (!ids.has(m[1])) F(`${f}: Marcador con pendiente "${m[1]}" que no esta en pendientes.json`);
    }
  }
}

// ── 20. la firma se dibuja: es el rasgo del sistema, si falta es que alguien
//       escribio el titular a mano en vez de usar Titular.astro
for (const [f, s] of Object.entries(doc)) {
  if (!/<h[123][^>]*>[\s\S]*?<em[\s>]/.test(s)) A(`${f}: ninguna firma (h1/h2/h3 con <em>)`);
}

// ── 21. cero voseo. Decision editorial del cliente: el sitio trata de TU.
//       Honduras vosea, asi que la forma sale sola al escribir y ya se habia
//       colado en nueve sitios —titulares, dialogo de cita, 404, preguntas—
//       conviviendo con el tuteo en la MISMA frase ("Escribinos y te confirman").
//       Lista explicita a proposito: un patron generico de "-as/-es acentuada"
//       marcaria "estas", "mas", "ademas" o "despues", que son correctos.
{
  // Lo que separa la forma voseante de la tuteante es la TILDE, y solo se busca
  // la acentuada: "mira" es correcto, "mirá" no. Asi no hace falta ningun filtro
  // posterior ni se marca "estas", "mas" o "despues", que llevan tilde y son
  // castellano normal.
  const CON_TILDE = [
    'podés', 'tenés', 'querés', 'sabés', 'necesitás', 'llegás', 'hacés', 'ponés',
    'venís', 'decís', 'elegís', 'escribís',
    'mirá', 'elegí', 'escribí', 'confirmá', 'agendá', 'llamá', 'contactá', 'hacé',
    'poné', 'vení', 'andá', 'dejá', 'contá', 'pedí', 'tomá', 'buscá', 'usá', 'abrí',
    'seguí', 'revisá', 'mandá', 'volvé', 'cuidá', 'aprovechá', 'consultá', 'solicitá',
    'reservá', 'visitá', 'preguntá', 'comprobá', 'descargá', 'compartí', 'apuntá',
  ];
  // Estas vosean sin tilde: el pronombre pegado se la come o no la llevan nunca.
  const SIN_TILDE = [
    'vos', 'sos',
    'escribinos', 'llamanos', 'contactanos', 'decinos', 'mandanos',
    'escribime', 'decime', 'acordate', 'fijate', 'quedate', 'cuidate', 'olvidate',
  ];
  // \b NO sirve aqui: se define sobre [A-Za-z0-9_], asi que una palabra terminada
  // en vocal acentuada ("mirá") no tiene frontera detras y no llegaba a marcarse.
  const LETRA = 'A-Za-z0-9_áéíóúüñÁÉÍÓÚÜÑ';
  const patron = new RegExp(
    `(?<![${LETRA}])(?:${[...CON_TILDE, ...SIN_TILDE].join('|')})(?![${LETRA}])`,
    'gi',
  );

  for (const [f, s] of Object.entries(doc)) {
    const texto = s
      .replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
      .replace(/&(aacute|eacute|iacute|oacute|uacute|ntilde);/g,
        (_, n) => ({ aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', ntilde: 'ñ' })[n]);
    const voseo = [...new Set((texto.match(patron) || []).map((m) => m.toLowerCase()))];
    if (voseo.length) F(`${f}: voseo — ${voseo.join(', ')}. El sitio trata de tu.`);
  }
}

// ── 22. NINGUNA FOTOGRAFIA SIN PROCEDENCIA, Y NINGUNA QUE FINJA SER LA CLINICA
//
// La regla de la casa es que no se usan fotos de banco de un consultorio que no
// es el suyo: una clinica que ensena un local ajeno promete algo que el paciente
// no va a encontrar. Pero SI se usan imagenes que no afirman nada sobre la sede
// —un primer plano de una sonrisa, una textura—, y esas necesitan dos cosas:
//
//   a) estar declaradas en fotos.json con licencia y enlace de origen, para
//      poder justificarle a un cliente de donde salio cada una; y
//   b) no haber discharge-ado el pendiente de fotografia real, que sigue vivo.
//
// Sin esta comprobacion, cualquiera suelta un .jpg en public/img y a nadie le
// consta de donde vino hasta que llega el abogado de alguien.
const LOGOS = ['favicon.png', 'logo-cimo.png', 'simbolo-cimo.png'];
const declaradas = new Set();
for (const f of fotos) {
  if (!f.licencia) F(`fotos.json: "${f.id}" sin licencia`);
  // Una imagen generada con IA no tiene enlace de origen; lo que se le exige en
  // su lugar es que lo DIGA, y que diga que no es la clinica. Una foto de banco
  // sin enlace, en cambio, es una foto cuya procedencia nadie puede comprobar.
  if (f.fuente === 'IA') {
    const nota = String(f.nota || '').toUpperCase();
    if (!nota.includes(' IA') && !nota.includes('IA ')) F(`fotos.json: "${f.id}" es de IA y su nota no lo dice`);
  } else if (!f.url) {
    F(`fotos.json: "${f.id}" sin url de origen`);
  }
  for (const suf of ['', '-sm', '-alto']) declaradas.add(`${f.id}${suf}.webp`);
  // Una lamina de la que se recortan piezas declara CUALES son, por nombre. El
  // recorte hereda la procedencia del original, pero no en silencio: si manana
  // aparece un sexto icono en la pagina y nadie lo anadio aqui, el verificador
  // lo caza igual que cazaria una imagen suelta sin origen.
  for (const r of f.recortes || []) {
    declaradas.add(`${r}.webp`);
    declaradas.add(`${r}@2x.webp`);
  }
}
for (const [f, s] of Object.entries(doc)) {
  for (const m of s.matchAll(/(?:src|srcset)="([^"]+)"/g)) {
    // UN srcset SON VARIAS URLS SEPARADAS POR COMAS, cada una con su
    // descriptor (`img/a.webp 1x, img/a@2x.webp 2x`). Antes esto se trataba
    // como una sola cadena y se le hacia split('/').pop(), que devolvia
    // «a@2x.webp 2x» —con el descriptor pegado— y ADEMAS se saltaba todas las
    // piezas menos la ultima. Cualquier imagen intermedia de un srcset pasaba
    // sin que nadie comprobara su procedencia.
    for (const pieza of m[1].split(',')) {
      const url = pieza.trim().split(/\s+/)[0];
      if (!url.startsWith('img/')) continue;
      const archivo = url.split('/').pop();
      if (LOGOS.includes(archivo)) continue;
      if (!declaradas.has(archivo)) F(`${f}: imagen "${archivo}" sin declarar en fotos.json (procedencia y licencia)`);
    }
  }
}
// La foto de banco NO cierra el pendiente: la fotografia real sigue haciendo falta.
if (!pendientes.some((p) => p.id === 'fotografia')) {
  F('pendientes.json: se borro el pendiente "fotografia". Las imagenes de banco no son la fotografia de la clinica.');
}

// ─────────────────────────────────────────────────────────────── informe
const pesoTotal = readdirSync(DIST, { recursive: true })
  .map((f) => join(DIST, String(f)))
  .filter((p) => { try { return statSync(p).isFile(); } catch { return false; } })
  .reduce((a, p) => a + statSync(p).size, 0);

console.log(`Paginas HTML       ${html.length}`);
console.log(`Recursos locales   ${recursos}`);
console.log(`Peso de index      ${(statSync(join(DIST, 'index.html')).size / 1024).toFixed(1)} KB`);
console.log(`Peso total de dist ${(pesoTotal / 1024).toFixed(1)} KB`);

const unicos = [...new Set(avisos)];
if (unicos.length) {
  console.log(`\nAvisos (${unicos.length}):`);
  for (const a of unicos.slice(0, 10)) console.log('  · ' + a);
  if (unicos.length > 10) console.log(`  … y ${unicos.length - 10} mas`);
}

const fUnicos = [...new Set(fallos)];
if (fUnicos.length) {
  console.log(`\nFALLOS (${fUnicos.length}):`);
  for (const f of fUnicos) console.log('  ✗ ' + f);
  process.exit(1);
}
console.log('\nTodo correcto.');
