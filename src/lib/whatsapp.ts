// Construccion de enlaces de WhatsApp.
//
// wa.me es un enlace normal: sin backend, sin API de Meta, sin cuenta Business
// y sin coste por mensaje. Lo unico que se puede llevar es el texto inicial, y
// ahi esta todo el valor: un mensaje que ya dice de donde viene el visitante
// llega a la clinica con la intencion resuelta.

/** Rellena {marcadores} de una plantilla. Un marcador sin valor se deja intacto. */
export function rellenar(plantilla: string, valores: Record<string, string>): string {
  return plantilla.replace(/\{(\w+)\}/g, (original, clave) => valores[clave] ?? original);
}

/**
 * Enlace wa.me con el texto ya codificado.
 *
 * El salto de linea real sobrevive a encodeURIComponent como %0A y WhatsApp lo
 * respeta, asi que las plantillas de varias lineas llegan formateadas.
 */
export function enlaceWhatsApp(numero: string, mensaje: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
