// Registro de iconos: nombre -> marcado interno del <svg>.
//
// Dibujados a mano sobre rejilla de 24, no tomados de una librería: Lucide no
// tiene molar, ni bracket, ni arco dental, y sus sustitutos genéricos —una
// sonrisa, un escudo, una chispa— son justamente lo que hace que la página de
// una clínica se lea como la de cualquier negocio.
//
// TRES REGLAS QUE LOS SOSTIENEN COMO CONJUNTO:
//
//  1. Un solo path de diente, compartido. Tres de los cuatro iconos lo
//     reutilizan escalado. Es lo que hace que el juego se lea como un juego y
//     no como cuatro dibujos sueltos.
//  2. Sin relleno y sin color propio: `currentColor` y trazo. Por eso los
//     mismos cuatro archivos salen en --ink en la lista, en --marca-text de
//     acento y en blanco sobre el panel oscuro, sin duplicar nada.
//  3. Se comprueban a 20 px, no a 48. Ahí se cayeron dos diseños:
//     - una funda punteada sobre el diente (preciosa a 48, un borrón bajo 32:
//       las rayas se juntan);
//     - un cepillo de dientes, en cuatro construcciones distintas, que siempre
//       se leyó como lupa, tenedor o destornillador. De ahí que «higiene y
//       prevención» sea un escudo: aguanta los 20 px y además dice PREVENCIÓN.
//
// Nada de <use href> a otro archivo ni de mask-image: bajo file:// cada archivo
// es origen opaco y el elemento desaparece entero, sin error en consola.

const DIENTE =
  'M12 3.6c-3.4 0-5.7 1.8-5.7 4.5 0 1.7.5 2.9.9 4.2.5 1.9.6 3.9 1 5.9.2 1.2.5 2.1 1.3 2.1' +
  '.9 0 1.1-1 1.3-2.4.2-1.4.3-2.9 1.2-2.9s1 1.5 1.2 2.9c.2 1.4.4 2.4 1.3 2.4.8 0 1.1-.9 1.3-2.1' +
  '.4-2 .5-4 1-5.9.4-1.3.9-2.5.9-4.2 0-2.7-2.3-4.5-5.7-4.5Z';

export const ICONOS: Record<string, string> = {
  // Tres brackets ensartados en el arco. El alambre entero de lado a lado: si
  // se corta a la altura de los brackets, se lee como una cremallera.
  brackets:
    '<path d="M1.8 12h20.4"/>' +
    '<rect x="3" y="9.2" width="5.6" height="5.6" rx="1.4"/>' +
    '<rect x="9.2" y="9.2" width="5.6" height="5.6" rx="1.4"/>' +
    '<rect x="15.4" y="9.2" width="5.6" height="5.6" rx="1.4"/>',

  // Escudo con el diente dentro. El escudo solo, con un tick, sería el icono de
  // «seguridad» de cualquier sitio; el diente lo ata a esta clínica.
  escudo:
    '<path d="M12 21.4c4.6-2.2 7-5.7 7-9.6V5.6L12 2.8 5 5.6v6.2c0 3.9 2.4 7.4 7 9.6Z"/>' +
    `<g transform="translate(12 11.6) scale(.42) translate(-12 -12)"><path d="${DIENTE}"/></g>`,

  // Dos dientes a distinta escala. La diferencia de tamaño es lo que dice
  // «niño»; una carita sonriente en el diente lo diría infantilizando al padre,
  // que es quien lee la página.
  dientes:
    `<g transform="translate(-1.1 2.4) scale(.76)"><path d="${DIENTE}"/></g>` +
    `<g transform="translate(11.2 9.4) scale(.47)"><path d="${DIENTE}"/></g>`,

  // Diente con destello. El destello va FUERA del contorno, arriba a la
  // derecha: encima del diente se cruza con el trazo y a 20 px se emborrona.
  brillo:
    `<g transform="translate(-1.4 .6) scale(.9)"><path d="${DIENTE}"/></g>` +
    '<path d="M19.6 3.1l.78 1.92 1.92.78-1.92.78-.78 1.92-.78-1.92-1.92-.78 1.92-.78z"/>',
};

export type NombreIcono = keyof typeof ICONOS;
