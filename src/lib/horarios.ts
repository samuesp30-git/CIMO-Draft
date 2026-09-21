// Formato y calculo de horarios. Fuente unica.
//
// El formateo de horas estaba duplicado en Footer.astro y EstadoApertura.astro,
// y contact.astro no usaba ninguno de los dos: imprimia "09:30 – 19:00" crudo
// mientras el pie de la misma pagina decia "9:30 a. m. – 7 p. m.". Dos formatos
// para el mismo dato en la misma pantalla.

export type Tramo = {
  dias: string;
  dow: number[];
  apertura: string;
  cierre: string;
};

/** "09:30" → "9:30 a. m."  ·  "19:00" → "7 p. m." */
export function comoHora(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const sufijo = h >= 12 ? 'p. m.' : 'a. m.';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12} ${sufijo}` : `${h12}:${String(m).padStart(2, '0')} ${sufijo}`;
}

/** "09:30" → 570. Para comparar horas sin construir fechas. */
export function enMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** "09:30 a. m. – 7 p. m." */
export function comoRango(tramo: Tramo): string {
  return `${comoHora(tramo.apertura)} – ${comoHora(tramo.cierre)}`;
}

export const NOMBRE_DIA = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
] as const;
