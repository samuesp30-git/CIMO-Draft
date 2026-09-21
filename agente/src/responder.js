// El nucleo. Historial -> respuesta. Lo comparten el widget web y, cuando
// llegue, el webhook de WhatsApp: lo unico que cambia entre canales es el
// transporte y donde vive el historial, no el cerebro.
//
// NO va en streaming, y es una decision, no una simplificacion: sin streaming
// la respuesta completa pasa por `revisar()` ANTES de salir. Con streaming no
// se puede retirar un precio que ya se envio. En una clinica sin un solo precio
// publicado, poder frenar el texto vale mas que ver aparecer las letras — y con
// Haiku sobre un prompt cacheado la respuesta entera llega en un segundo y pico.

import Anthropic from '@anthropic-ai/sdk';
import { texto as CONOCIMIENTO, horarios, whatsapp } from '../conocimiento.generado.js';
import { construirPrompt } from './prompt.js';
import { estadoAhora } from './reloj.js';
import { HERRAMIENTAS, ejecutar } from './herramientas.js';

const MODELO = 'claude-haiku-4-5';
const MAX_TOKENS = 1024;   // son respuestas de dos o tres frases; 1024 sobra
const MAX_VUELTAS = 2;     // llamada a herramienta + cierre. Mas seria un bucle

// Se arma una sola vez, al cargar el modulo: es el prefijo cacheado y tiene que
// ser identico byte a byte en cada peticion.
const PROMPT = construirPrompt(CONOCIMIENTO);

// El cliente se crea en la primera llamada, no al cargar el modulo: sin clave
// el constructor revienta, y eso impediria importar `revisar()` —que es logica
// pura— desde una prueba que no toca la red. Efectos al cargar un modulo: no.
let _cliente = null;
const cliente = () => (_cliente ??= new Anthropic());

// ── El guardia de salida ────────────────────────────────────────────────────
//
// Es la ultima linea, no la primera: la primera es el prompt. Existe porque un
// modelo pequeno bajo insistencia puede acabar soltando una cifra "aproximada",
// y aqui eso no es un error de estilo — es un paciente que llega esperando un
// precio que nadie prometio.

const DINERO = [
  // "L 6,000" y "L. 8000". Un solo \d y no \d{2,}: el separador de miles corta
  // la racha de digitos y "L 6,000" se colaba entero. Distingue mayuscula a
  // proposito — "local 8" y "Lunes 10" no son dinero, y \bL no engancha la L
  // de "XL" porque el limite de palabra cae antes de la X.
  /\bL\.?\s?\d/,
  /\bLps?\.?\s?\d/i,        // "Lps. 5000", como se escribe en Honduras
  /\$\s?\d/,                // "$20"
  /\d[\d.,]*\s*lempiras?/i, // "5000 lempiras"
];

/** Nombres de doctor distintos del unico verificado. Mismo criterio que verificar.mjs §18. */
function doctoresInventados(texto) {
  const fuera = [];
  for (const m of texto.matchAll(/\bDra?\.\s*([A-ZÁÉÍÓÚÑ][\wáéíóúñ]*)/g)) {
    if (!/^(Marta|Mu(ñ|n)oz)$/i.test(m[1])) fuera.push(m[0]);
  }
  return fuera;
}

/**
 * Revisa la respuesta antes de que salga. Devuelve el motivo del veto, o null.
 * Exportada para que evaluar.mjs use exactamente el mismo criterio.
 */
export function revisar(texto) {
  const dinero = DINERO.find((re) => re.test(texto));
  if (dinero) return `cifra de dinero: ${JSON.stringify(texto.match(dinero)[0])}`;

  const doctores = doctoresInventados(texto);
  if (doctores.length) return `nombre de doctor no verificado: ${doctores.join(', ')}`;

  return null;
}

const RESPUESTA_VETADA =
  'Eso prefiero que te lo confirme alguien de la clínica, para no darte un dato equivocado. Escríbeles por WhatsApp y te responden.';

// ── El nucleo ───────────────────────────────────────────────────────────────

/**
 * @param {{ historial?: {rol: 'usuario'|'asistente', texto: string}[], mensaje: string }} entrada
 * @returns {Promise<{ texto: string, accion: import('./herramientas.js').Accion | null, uso: object }>}
 */
export async function responder({ historial = [], mensaje }) {
  const mensajes = historial.map((t) => ({
    role: t.rol === 'usuario' ? 'user' : 'assistant',
    content: t.texto,
  }));
  mensajes.push({ role: 'user', content: mensaje });

  const peticion = {
    model: MODELO,
    max_tokens: MAX_TOKENS,
    system: [
      // El bloque cacheado: prompt + base de conocimiento. Congelado.
      { type: 'text', text: PROMPT, cache_control: { type: 'ephemeral' } },
      // Lo volatil va DESPUES del punto de cache, asi no la invalida.
      { type: 'text', text: estadoAhora(horarios) },
    ],
    tools: HERRAMIENTAS,
    messages: mensajes,
  };

  let respuesta = await cliente().messages.create(peticion);
  let accion = null;
  let vueltas = 0;

  while (respuesta.stop_reason === 'tool_use' && vueltas < MAX_VUELTAS) {
    vueltas++;
    const resultados = [];

    for (const bloque of respuesta.content) {
      if (bloque.type !== 'tool_use') continue;
      const r = ejecutar(bloque.name, bloque.input ?? {}, whatsapp);
      accion = r.accion;
      resultados.push({ type: 'tool_result', tool_use_id: bloque.id, content: r.paraElModelo });
    }

    mensajes.push({ role: 'assistant', content: respuesta.content });
    mensajes.push({ role: 'user', content: resultados });
    respuesta = await cliente().messages.create({ ...peticion, messages: mensajes });
  }

  const uso = {
    entrada: respuesta.usage.input_tokens,
    salida: respuesta.usage.output_tokens,
    cacheEscrita: respuesta.usage.cache_creation_input_tokens ?? 0,
    cacheLeida: respuesta.usage.cache_read_input_tokens ?? 0,
  };

  // Una negativa del clasificador de seguridad llega con 200 y sin texto util.
  if (respuesta.stop_reason === 'refusal') {
    return { texto: RESPUESTA_VETADA, accion: derivacionPorDefecto(), uso };
  }

  const texto = respuesta.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();

  if (!texto) {
    // Se quedo sin vueltas o solo pidio herramientas. Raro, pero no se deja
    // a la persona con un globo vacio.
    return {
      texto: 'Mejor que esto lo veas con alguien de la clínica. Escríbeles por WhatsApp y te atienden.',
      accion: accion ?? derivacionPorDefecto(),
      uso,
    };
  }

  const veto = revisar(texto);
  if (veto) {
    // A los registros de Vercel: si esto aparece, el prompt necesita trabajo o
    // el modelo se queda corto para el encargo.
    console.warn(`[guardia] respuesta vetada — ${veto}\n${texto}`);
    return { texto: RESPUESTA_VETADA, accion: accion ?? derivacionPorDefecto(), uso, vetada: veto };
  }

  return { texto, accion, uso };
}

function derivacionPorDefecto() {
  return ejecutar('derivar_a_humano', { motivo: '', resumen: '' }, whatsapp).accion;
}
