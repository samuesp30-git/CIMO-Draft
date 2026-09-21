// Pruebas de la fontaneria. Gratis, sin red, instantaneas.
//
//   npm run probar        (desde agente/)
//
// Division del trabajo: esto comprueba lo que es determinista —el guardia, el
// reloj, los enlaces, la validacion— y `evaluar.mjs` comprueba el criterio del
// modelo, que cuesta dinero y necesita clave. Lo de aqui tiene que estar en
// verde ANTES de gastar un centavo en lo otro: casi todos los fallos son de
// fontaneria, no de modelo.

import { statSync, readdirSync } from 'node:fs';
import { revisar } from './src/responder.js';
import { estadoAhora } from './src/reloj.js';
import { ejecutar } from './src/herramientas.js';
import { validar, permitir } from './src/limites.js';
import { construirPrompt } from './src/prompt.js';
import { texto as CONOCIMIENTO, horarios, whatsapp } from './conocimiento.generado.js';

let fallos = 0;
let total = 0;

function comprobar(condicion, etiqueta, detalle) {
  total++;
  if (condicion) return;
  fallos++;
  console.log(`  FALLA  ${etiqueta}`);
  if (detalle !== undefined) console.log(`         ${detalle}`);
}

// ── El guardia de salida ────────────────────────────────────────────────────
console.log('\n  GUARDIA DE SALIDA');

for (const [texto, que] of [
  ['Los brackets cuestan L 6,000 aproximadamente.', 'lempiras con prefijo L'],
  ['Ronda los Lps. 8000.', 'formato Lps.'],
  ['Cuesta $20 la consulta.', 'dolares'],
  ['Son como 5000 lempiras.', 'la palabra lempiras'],
  ['Te atiende el Dr. Fuentes, ortodoncista.', 'doctor inventado'],
  ['Pregunta por la Dra. Carolina Reyes.', 'doctora inventada'],
]) {
  comprobar(revisar(texto) !== null, `veta: ${que}`, `no vetó: ${JSON.stringify(texto)}`);
}

for (const [texto, que] of [
  ['Estamos en el 3.er piso, local 8 de la torre.', '"local 8" no es dinero'],
  ['Abrimos lunes a viernes de 9 a. m. a 7 p. m.', 'un horario no es dinero'],
  ['Escríbenos al 9770-3774.', 'el teléfono no es dinero'],
  ['El código postal es 11101.', 'el código postal no es dinero'],
  ['La Dra. Marta Muñoz es quien consta públicamente.', 'la única doctora verificada sí pasa'],
  ['El escáner iTero 5D Plus llegó en julio de 2026.', 'un modelo de equipo no es dinero'],
]) {
  comprobar(revisar(texto) === null, `deja pasar: ${que}`, `vetó de más: ${revisar(texto)}`);
}

// ── El reloj ────────────────────────────────────────────────────────────────
// Honduras es UTC-6 todo el ano. 2026-09-20 es domingo.
console.log('\n  RELOJ');

const cuando = (iso) => estadoAhora(horarios, new Date(iso));

comprobar(/ABIERTA/.test(cuando('2026-09-21T15:30:00Z')), 'lunes 9:30 a. m. → abierta', cuando('2026-09-21T15:30:00Z'));
comprobar(/NO ha abierto/.test(cuando('2026-09-21T13:00:00Z')), 'lunes 7 a. m. → todavía cerrada', cuando('2026-09-21T13:00:00Z'));
comprobar(/ya CERRO/.test(cuando('2026-09-22T02:00:00Z')), 'lunes 8 p. m. → ya cerró', cuando('2026-09-22T02:00:00Z'));
comprobar(/CERRADA hoy/.test(cuando('2026-09-20T18:00:00Z')), 'domingo mediodía → cerrada todo el día', cuando('2026-09-20T18:00:00Z'));
comprobar(/domingo/.test(cuando('2026-09-20T18:00:00Z')), 'nombra el día correcto', cuando('2026-09-20T18:00:00Z'));
comprobar(/ABIERTA/.test(cuando('2026-09-26T20:00:00Z')), 'sábado 2 p. m. → abierta', cuando('2026-09-26T20:00:00Z'));
comprobar(/lunes a las 9/.test(cuando('2026-09-27T00:00:00Z')), 'sábado 6 p. m. → reabre el lunes, no el domingo', cuando('2026-09-27T00:00:00Z'));
comprobar(!/19:00|17:00|07:00/.test(cuando('2026-09-21T15:30:00Z')), 'nunca dice la hora en formato 24 h', cuando('2026-09-21T15:30:00Z'));

// ── Los enlaces de WhatsApp ─────────────────────────────────────────────────
console.log('\n  ENLACES');

const cita = ejecutar(
  'registrar_interes',
  { nombre: 'Sofía Discua', servicio: 'ortodoncia invisible', dia: 'el jueves', telefono: null },
  whatsapp,
);
comprobar(cita.accion.url.startsWith('https://wa.me/50497703774?text='), 'usa el número real de la clínica', cita.accion.url.slice(0, 60));
const textoCita = decodeURIComponent(cita.accion.url.split('?text=')[1]);
comprobar(textoCita.includes('Sofía Discua'), 'el mensaje lleva el nombre');
comprobar(textoCita.includes('ortodoncia invisible'), 'el mensaje lleva el servicio');
comprobar(textoCita.includes('el jueves'), 'el mensaje lleva el día');
comprobar(/disponibilidad/.test(textoCita), 'conserva la plantilla de clinica.json, que ya avisa que la hora la confirma la clínica');
comprobar(!/\{nombre\}|\{servicio\}|\{dia\}/.test(textoCita), 'no quedan marcadores sin rellenar', textoCita);
comprobar(!textoCita.includes('Mi teléfono'), 'sin teléfono no inventa la línea del teléfono');

const conTel = ejecutar(
  'registrar_interes',
  { nombre: 'Ana', servicio: 'limpieza', dia: 'mañana', telefono: '9999-0000' },
  whatsapp,
);
comprobar(decodeURIComponent(conTel.accion.url).includes('9999-0000'), 'con teléfono sí lo incluye');

const deriv = ejecutar('derivar_a_humano', { motivo: 'precio', resumen: 'Pregunta por el precio de los brackets.' }, whatsapp);
comprobar(decodeURIComponent(deriv.accion.url).includes('brackets'), 'la derivación lleva el resumen');
comprobar(!deriv.paraElModelo.includes('wa.me'), 'al modelo NO se le pasa el enlace (si no, lo escribe en el texto)');

const raro = ejecutar('herramienta_que_no_existe', {}, whatsapp);
comprobar(raro.accion.url.includes('wa.me'), 'una herramienta desconocida no revienta');

// ── Validacion y limites ────────────────────────────────────────────────────
console.log('\n  LIMITES');

comprobar(validar({ mensaje: 'hola' }) === null, 'acepta un mensaje normal');
comprobar(validar({ mensaje: '' }) !== null, 'rechaza vacío');
comprobar(validar({ mensaje: 'x'.repeat(601) }) !== null, 'rechaza más de 600 caracteres');
comprobar(validar({ mensaje: 'hola', historial: 'no soy lista' }) !== null, 'rechaza historial que no es lista');
comprobar(validar({ mensaje: 'hola', historial: [{ rol: 'pirata', texto: 'x' }] }) !== null, 'rechaza rol inválido');
comprobar(
  validar({ mensaje: 'hola', historial: Array(30).fill({ rol: 'usuario', texto: 'x' }) }) !== null,
  'rechaza conversación demasiado larga',
);
comprobar(validar({ mensaje: 'hola', historial: [{ rol: 'usuario', texto: 'x' }] }) === null, 'acepta historial bien formado');

const ip = 'prueba.' + Math.random();
let ultimo;
for (let i = 0; i < 21; i++) ultimo = permitir(ip);
comprobar(ultimo.ok === false, 'corta al pasarse de 20 mensajes en la ventana');
comprobar(typeof ultimo.esperaSegundos === 'number', 'dice cuánto hay que esperar');
comprobar(permitir('otra.' + Math.random()).ok === true, 'no castiga a otra IP');

// ── El prompt ───────────────────────────────────────────────────────────────
console.log('\n  PROMPT');

const p1 = construirPrompt(CONOCIMIENTO);
const p2 = construirPrompt(CONOCIMIENTO);
comprobar(p1 === p2, 'es idéntico byte a byte entre llamadas (si no, no hay caché)');
comprobar(!/\d{4}-\d{2}-\d{2}T/.test(p1), 'no lleva ninguna marca de tiempo dentro');
comprobar(p1.includes('9770-3774'), 'lleva el teléfono real');
comprobar(p1.includes('iTero 5D Plus'), 'lleva la tecnología');
comprobar(/No des precios|No das precios/.test(p1), 'lleva la regla de los precios');
comprobar(p1.includes('Marta Muñoz'), 'nombra a la única doctora verificada');
comprobar(revisar(p1) === null, 'el propio prompt pasa el guardia (no se coló un precio de propuesta/)');

const tokens = Math.round(Buffer.byteLength(p1, 'utf8') / 3.5);
comprobar(tokens > 2048, `supera los 2048 tokens que Haiku exige para cachear (va por ~${tokens})`, `~${tokens} tokens: por debajo del mínimo, la caché NO se activaría`);

// ── Frescura ────────────────────────────────────────────────────────────────
//
// La deriva silenciosa mas probable de todo este montaje: alguien confirma la
// direccion en clinica.json, reconstruye el sitio, despliega — y el asistente
// sigue contando la version vieja, porque su base de conocimiento se genera en
// un paso aparte. No rompe nada visible. Solo miente.
console.log('\n  FRESCURA');

const dirDatos = new URL('../src/data/', import.meta.url);
const generado = statSync(new URL('./conocimiento.generado.js', import.meta.url)).mtimeMs;
const masNuevo = readdirSync(dirDatos)
  .filter((f) => f.endsWith('.json'))
  .map((f) => ({ f, t: statSync(new URL(f, dirDatos)).mtimeMs }))
  .sort((a, b) => b.t - a.t)[0];

comprobar(
  generado >= masNuevo.t,
  'la base de conocimiento está al día con src/data/',
  `${masNuevo.f} se tocó después de generar. Corre \`npm run conocimiento\` desde la raíz del sitio.`,
);

// ── Cierre ──────────────────────────────────────────────────────────────────
console.log(`\n  ${total - fallos}/${total} en verde\n`);
process.exit(fallos ? 1 : 0);
