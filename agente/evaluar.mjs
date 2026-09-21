// El verificador del asistente. Mismo oficio que scripts/verificar.mjs: se
// corre antes de desplegar y sale con codigo 1 si algo esta mal.
//
//   npm run evaluar        (desde agente/)
//
// Por que existe: el modelo elegido es Haiku 4.5, el mas barato, y tambien el
// que mas facil se deja arrastrar por un paciente que insiste. La defensa no es
// confiar en que el prompt aguante — es medir si aguanta. Estos casos son los
// que de verdad hacen dano en una clinica: un precio inventado, un nombre de
// doctor que no existe, un diagnostico por chat, una cita dada por confirmada.
//
// Importa el MISMO modulo que se despliega, sin compilar nada en medio: lo que
// se prueba aqui es exactamente lo que va a produccion.
//
// Cuesta unos $0.30 por pasada. Es dinero real: hay que tener ANTHROPIC_API_KEY.

import { readFileSync } from 'node:fs';
import { responder } from './src/responder.js';

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('\n  Falta ANTHROPIC_API_KEY. Esta evaluacion llama al modelo de verdad y cuesta dinero.\n');
  process.exit(1);
}

const casos = JSON.parse(readFileSync(new URL('./casos.json', import.meta.url), 'utf8'));
const SOLO = process.argv[2];              // `node evaluar.mjs precio` filtra por id o grupo
const aCorrer = SOLO
  ? casos.filter((c) => c.id.includes(SOLO) || c.grupo.includes(SOLO))
  : casos;

if (!aCorrer.length) {
  console.error(`No hay ningun caso que coincida con "${SOLO}".`);
  process.exit(1);
}

// Haiku 4.5, dolares por millon de tokens.
const PRECIO = { entrada: 1.0, salida: 5.0, cacheEscrita: 1.25, cacheLeida: 0.1 };
const gasto = { entrada: 0, salida: 0, cacheEscrita: 0, cacheLeida: 0 };

/** Corre los turnos de un caso y devuelve la ULTIMA respuesta, que es la que se juzga. */
async function correr(caso) {
  const historial = [];
  let ultima = null;

  for (const mensaje of caso.mensajes) {
    ultima = await responder({ historial, mensaje });
    for (const k of Object.keys(gasto)) gasto[k] += ultima.uso[k] ?? 0;
    historial.push({ rol: 'usuario', texto: mensaje });
    historial.push({ rol: 'asistente', texto: ultima.texto });
  }
  return ultima;
}

function juzgar(caso, r) {
  const fallos = [];

  // El guardia de salida es la RED, no el objetivo. Que salte significa que el
  // modelo llego a escribir un precio o un nombre inventado: el sistema fue
  // seguro, pero el prompt no aguanto. Eso es un fallo.
  if (r.vetada) fallos.push(`el guardia tuvo que vetar la respuesta (${r.vetada})`);

  for (const p of caso.contiene ?? []) {
    if (!new RegExp(p, 'i').test(r.texto)) fallos.push(`no dice /${p}/`);
  }
  for (const p of caso.noContiene ?? []) {
    if (new RegExp(p, 'i').test(r.texto)) fallos.push(`dice /${p}/ y no deberia`);
  }
  if (caso.accion === true && !r.accion) fallos.push('no ofrecio salida a WhatsApp');
  if (caso.accion === false && r.accion) fallos.push('ofrecio WhatsApp cuando tenia que preguntar primero');
  if (caso.largoMaximo && r.texto.length > caso.largoMaximo) {
    fallos.push(`${r.texto.length} caracteres, el tope es ${caso.largoMaximo}`);
  }

  return fallos;
}

// La primera se corre sola para que ESCRIBA la cache. Si arrancaran todas a la
// vez, ninguna encontraria cache escrita y todas pagarian el precio de
// escribirla: mismo resultado, varias veces el coste.
const resultados = [];

async function ejecutar(caso) {
  try {
    const r = await correr(caso);
    resultados.push({ caso, r, fallos: juzgar(caso, r) });
  } catch (e) {
    resultados.push({ caso, r: null, fallos: [`reviento: ${e.message}`] });
  }
}

console.log(`\nEvaluando ${aCorrer.length} casos contra el modelo. Esto cuesta dinero y tarda un poco.\n`);

await ejecutar(aCorrer[0]);

const pendientes = aCorrer.slice(1);
const CONCURRENCIA = 4;
await Promise.all(
  Array.from({ length: Math.min(CONCURRENCIA, pendientes.length) }, async () => {
    while (pendientes.length) await ejecutar(pendientes.shift());
  }),
);

// ── Informe, en el orden del archivo para que se pueda comparar entre pasadas
resultados.sort((a, b) => aCorrer.indexOf(a.caso) - aCorrer.indexOf(b.caso));

let grupo = '';
const rotos = [];

for (const { caso, r, fallos } of resultados) {
  if (caso.grupo !== grupo) {
    grupo = caso.grupo;
    console.log(`\n  ${grupo.toUpperCase()}`);
  }
  if (fallos.length) {
    rotos.push({ caso, r, fallos });
    console.log(`  FALLA  ${caso.id}`);
    for (const f of fallos) console.log(`         ${f}`);
  } else {
    console.log(`  ok     ${caso.id}`);
  }
}

const coste =
  (gasto.entrada * PRECIO.entrada +
    gasto.salida * PRECIO.salida +
    gasto.cacheEscrita * PRECIO.cacheEscrita +
    gasto.cacheLeida * PRECIO.cacheLeida) /
  1e6;

console.log(`\n  ${resultados.length - rotos.length}/${resultados.length} en verde`);
console.log(
  `  tokens: ${gasto.entrada} entrada · ${gasto.salida} salida · ${gasto.cacheEscrita} cache escrita · ${gasto.cacheLeida} cache leida`,
);
console.log(`  coste de esta pasada: $${coste.toFixed(4)}`);

// Si la cache no se leyo nunca, algo volatil se colo en el prompt cacheado y en
// produccion eso multiplica la factura sin romper nada visible.
if (gasto.cacheLeida === 0 && resultados.length > 2) {
  console.log(`\n  AVISO: la cache no se leyo ni una vez. Revisa que el bloque cacheado de`);
  console.log(`  responder.js no lleve nada que cambie entre peticiones (fechas, contadores).`);
}

if (rotos.length) {
  console.log(`\n  ${rotos.length} fallo(s). El texto que devolvio cada uno:\n`);
  for (const { caso, r } of rotos) {
    console.log(`  ── ${caso.id} — ${caso.comentario}`);
    console.log(`     entrada:  ${caso.mensajes[caso.mensajes.length - 1]}`);
    console.log(`     respuesta: ${r ? r.texto.replace(/\n/g, ' ') : '(reviento)'}`);
    console.log(`     accion:   ${r?.accion ? r.accion.etiqueta : 'ninguna'}\n`);
  }
  process.exit(1);
}

console.log('');
