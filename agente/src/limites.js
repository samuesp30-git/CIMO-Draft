// Contencion del endpoint. Es publico: cualquiera puede escribirle en bucle.
//
// IMPORTANTE, y no hay que enganarse con esto: el limite de verdad NO esta
// aqui. Esta en el limite de gasto de la consola de Anthropic, que es lo unico
// que no se puede esquivar. Lo de este archivo vive en memoria del proceso, y
// una funcion de Vercel puede arrancar instancias nuevas o reciclarlas; un
// atacante repartido entre instancias pasa por encima. Sirve para lo que pasa
// de verdad todos los dias —alguien pegando F5, un bot torpe, una pestana
// abierta desde ayer— no para un ataque dirigido.
//
// Cuando el trafico justifique algo serio, esto se cambia por Upstash Redis sin
// tocar nada mas: la firma de `permitir()` ya es la que haria falta.

const VENTANA_MS = 10 * 60 * 1000;
const MAX_POR_VENTANA = 20;

export const MAX_LARGO_MENSAJE = 600;
export const MAX_TURNOS = 12;

/** @type {Map<string, number[]>} */
const visitas = new Map();

/**
 * @param {string} clave Normalmente la IP.
 * @returns {{ ok: boolean, esperaSegundos?: number }}
 */
export function permitir(clave) {
  const ahora = Date.now();
  const corte = ahora - VENTANA_MS;

  // Barrido perezoso: sin temporizadores y sin fugas, porque solo se recorre lo
  // que ya esta en el mapa cuando alguien llama.
  for (const [k, marcas] of visitas) {
    const vivas = marcas.filter((t) => t > corte);
    if (vivas.length) visitas.set(k, vivas);
    else visitas.delete(k);
  }

  const marcas = visitas.get(clave) ?? [];
  if (marcas.length >= MAX_POR_VENTANA) {
    const esperaSegundos = Math.ceil((marcas[0] + VENTANA_MS - ahora) / 1000);
    return { ok: false, esperaSegundos };
  }

  marcas.push(ahora);
  visitas.set(clave, marcas);
  return { ok: true };
}

/**
 * Valida el cuerpo de la peticion. Devuelve el error, o null si esta bien.
 *
 * @param {any} cuerpo
 * @returns {string | null}
 */
export function validar(cuerpo) {
  if (!cuerpo || typeof cuerpo !== 'object') return 'Cuerpo inválido.';

  const { mensaje, historial } = cuerpo;

  if (typeof mensaje !== 'string' || !mensaje.trim()) return 'Falta el mensaje.';
  if (mensaje.length > MAX_LARGO_MENSAJE) return `El mensaje es muy largo (máximo ${MAX_LARGO_MENSAJE} caracteres).`;

  if (historial !== undefined) {
    if (!Array.isArray(historial)) return 'El historial tiene que ser una lista.';
    if (historial.length > MAX_TURNOS * 2) return 'La conversación es muy larga. Mejor sigue por WhatsApp.';
    for (const t of historial) {
      if (!t || typeof t !== 'object') return 'Turno inválido en el historial.';
      if (t.rol !== 'usuario' && t.rol !== 'asistente') return 'Rol inválido en el historial.';
      if (typeof t.texto !== 'string' || t.texto.length > 4000) return 'Turno inválido en el historial.';
    }
  }

  return null;
}
