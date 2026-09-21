// Si la clinica esta abierta AHORA MISMO.
//
// Esto NO puede vivir en el prompt cacheado: cambia en cada peticion y meterlo
// ahi invalidaria la cache constantemente, que es la diferencia entre pagar
// ~$0.012 por conversacion y pagar diez veces eso. Va en un bloque aparte,
// DESPUES del punto de cache.
//
// El sitio tiene su propio formateador en src/lib/horarios.ts y este no lo
// importa: `agente/` es un despliegue independiente y no comparte build con el
// sitio. Lo que se repite aqui es solo `comoHora`, cuatro lineas; el calculo de
// abierto/cerrado es nuevo, porque el sitio no lo necesitaba.

/**
 * @typedef {{ dias: string, dow: number[], apertura: string, cierre: string }} Tramo
 * @typedef {{ tramos: Tramo[], cerrado: { dias: string, dow: number[] }[], zonaHoraria: string }} Horarios
 */

const NOMBRE_DIA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DOW = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** "09:30" → "9:30 a. m."  ·  "19:00" → "7 p. m." */
function comoHora(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const sufijo = h >= 12 ? 'p. m.' : 'a. m.';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12} ${sufijo}` : `${h12}:${String(m).padStart(2, '0')} ${sufijo}`;
}

const enMinutos = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Hora local de la clinica, sin depender de la zona del servidor. Honduras no
 * cambia de hora, pero se resuelve con Intl igual: un servidor en UTC y otro en
 * Frankfurt tienen que dar lo mismo.
 */
function momentoLocal(zona, ahora) {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: zona,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(ahora);

  const buscar = (t) => partes.find((p) => p.type === t)?.value ?? '';
  // Algunas versiones de ICU devuelven "24" para la medianoche.
  const hora = Number(buscar('hour')) % 24;
  return { dow: DOW[buscar('weekday')] ?? 0, minutos: hora * 60 + Number(buscar('minute')) };
}

/**
 * Frase corta para inyectar en el prompt. No decide nada por su cuenta: solo le
 * dice al modelo que hora es y si la puerta esta abierta, para que no tenga que
 * deducirlo — los modelos son notoriamente malos calculando eso.
 *
 * @param {Horarios} h
 * @param {Date} [ahora]
 * @returns {string}
 */
export function estadoAhora(h, ahora = new Date()) {
  const { dow, minutos } = momentoLocal(h.zonaHoraria, ahora);
  const hoy = h.tramos.find((t) => t.dow.includes(dow));
  const dia = NOMBRE_DIA[dow];
  const hh = String(Math.floor(minutos / 60)).padStart(2, '0');
  const mm = String(minutos % 60).padStart(2, '0');
  const cabecera = `Ahora mismo en Tegucigalpa es ${dia} y son las ${comoHora(`${hh}:${mm}`)}.`;

  if (!hoy) {
    return `${cabecera} La clinica esta CERRADA hoy (${dia} no se trabaja). Vuelve a abrir el ${siguienteApertura(h, dow)}.`;
  }

  const abre = enMinutos(hoy.apertura);
  const cierra = enMinutos(hoy.cierre);

  if (minutos < abre) {
    return `${cabecera} La clinica todavia NO ha abierto: hoy abre a las ${comoHora(hoy.apertura)}.`;
  }
  if (minutos >= cierra) {
    return `${cabecera} La clinica ya CERRO por hoy (cerro a las ${comoHora(hoy.cierre)}). Vuelve a abrir el ${siguienteApertura(h, dow)}.`;
  }
  return `${cabecera} La clinica esta ABIERTA ahora, hasta las ${comoHora(hoy.cierre)}.`;
}

function siguienteApertura(h, dowHoy) {
  for (let i = 1; i <= 7; i++) {
    const dow = (dowHoy + i) % 7;
    const tramo = h.tramos.find((t) => t.dow.includes(dow));
    if (tramo) {
      const cuando = i === 1 ? 'mañana' : NOMBRE_DIA[dow];
      return `${cuando} a las ${comoHora(tramo.apertura)}`;
    }
  }
  return 'próximo día hábil';
}
