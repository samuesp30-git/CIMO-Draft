// POST /api/chat — el unico endpoint del widget web.
//
// Vive en un proyecto de Vercel aparte del sitio, y no por gusto: el sitio de
// CIMO es estatico, se sube ya compilado (`.vercelignore` excluye el codigo
// fuente) y su eje es que abra desde file:// con doble clic. Meter una funcion
// dentro obligaria a instalar un adapter, pasar a output:'server' y rehacer el
// despliegue entero. Asi el sitio sigue siendo exactamente lo que era.
//
// Contrato:
//   peticion  { mensaje: string, historial?: [{rol, texto}] }
//   respuesta { texto: string, accion: {tipo,etiqueta,url} | null }

import { responder } from '../src/responder.js';
import { permitir, validar } from '../src/limites.js';

const ORIGENES = (process.env.ORIGENES_PERMITIDOS ?? 'https://cimo.hn,https://www.cimo.hn,https://cimo-hn.vercel.app,http://localhost:4321')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

function cabeceras(origen) {
  const h = {
    'content-type': 'application/json; charset=utf-8',
    // Nada de esto se cachea: cada respuesta es de una conversacion.
    'cache-control': 'no-store',
    vary: 'Origin',
  };
  if (origen && ORIGENES.includes(origen)) {
    h['access-control-allow-origin'] = origen;
    h['access-control-allow-methods'] = 'POST, OPTIONS';
    h['access-control-allow-headers'] = 'content-type';
    h['access-control-max-age'] = '86400';
  }
  return h;
}

const json = (datos, estado, origen) =>
  new Response(JSON.stringify(datos), { status: estado, headers: cabeceras(origen) });

export default async function handler(request) {
  const origen = request.headers.get('origin');

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cabeceras(origen) });
  }
  if (request.method !== 'POST') {
    return json({ error: 'Solo POST.' }, 405, origen);
  }
  // Un origen desconocido se rechaza en el servidor. El navegador ya lo
  // bloquearia por CORS, pero CORS no protege de un cliente que no sea un
  // navegador — y es justo ese el que quemaria la cuota.
  if (origen && !ORIGENES.includes(origen)) {
    return json({ error: 'Origen no permitido.' }, 403, origen);
  }

  let cuerpo;
  try {
    cuerpo = await request.json();
  } catch {
    return json({ error: 'JSON inválido.' }, 400, origen);
  }

  const problema = validar(cuerpo);
  if (problema) return json({ error: problema }, 400, origen);

  // x-forwarded-for puede traer una cadena de saltos; el cliente es el primero.
  const ip = (request.headers.get('x-forwarded-for') ?? 'desconocida').split(',')[0].trim();
  const paso = permitir(ip);
  if (!paso.ok) {
    return json(
      {
        error: 'Has escrito bastante seguido. Espera un momento, o sigue por WhatsApp si es urgente.',
        esperaSegundos: paso.esperaSegundos,
      },
      429,
      origen,
    );
  }

  try {
    const { texto, accion, uso } = await responder({
      historial: cuerpo.historial ?? [],
      mensaje: cuerpo.mensaje.trim(),
    });

    // A los registros de Vercel. `cacheLeida` en 0 a partir de la segunda
    // peticion significa que algo volatil se colo en el prompt cacheado, y eso
    // multiplica la factura por diez sin romper nada visible.
    console.log(`[chat] entrada=${uso.entrada} salida=${uso.salida} cache_leida=${uso.cacheLeida} cache_escrita=${uso.cacheEscrita}`);

    return json({ texto, accion }, 200, origen);
  } catch (e) {
    console.error('[chat] fallo al responder:', e);
    return json(
      { error: 'No pude responder en este momento. Escríbenos por WhatsApp y te atendemos.' },
      502,
      origen,
    );
  }
}
