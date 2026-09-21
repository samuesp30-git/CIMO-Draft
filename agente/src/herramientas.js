// Las dos herramientas del asistente. Deliberadamente pocas.
//
// Las dos terminan en lo mismo: un enlace wa.me con el mensaje ya escrito. Eso
// no es una limitacion, es el diseno — CIMO no tiene sistema de reservas y toda
// su operacion entra por WhatsApp. El valor del asistente no es sustituir ese
// canal, es que el mensaje llegue con la intencion ya resuelta.
//
// Gemelas de src/lib/whatsapp.ts en el sitio. No se importan de alli porque
// `agente/` se despliega aparte; son seis lineas y se prefiere repetirlas antes
// que acoplar dos despliegues.

/**
 * @typedef {{ tipo: 'whatsapp', etiqueta: string, url: string }} Accion
 * @typedef {{ numero: string, display: string, plantillas: Record<string, string> }} ConfigWhatsApp
 */

/** Rellena {marcadores}. Un marcador sin valor se deja intacto. */
function rellenar(plantilla, valores) {
  return plantilla.replace(/\{(\w+)\}/g, (original, clave) => valores[clave] ?? original);
}

function enlace(numero, mensaje) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

// `strict: true` obliga a que los argumentos validen exactamente contra el
// esquema. En un modelo pequeno eso quita toda una clase de fallos: campos a
// medias, nombres inventados de propiedades, tipos raros. Con strict, todo
// campo va en `required`, asi que lo opcional se declara anulable.
export const HERRAMIENTAS = [
  {
    name: 'derivar_a_humano',
    description:
      'Pasa la conversacion a una persona de la clinica por WhatsApp. Usala cuando la pregunta no se pueda contestar con los datos verificados (precios, seguros, quien atiende, formas de pago, la sede de Copan), o cuando la persona pida hablar con alguien. No la uses si la respuesta esta en los datos: contesta tu.',
    strict: true,
    input_schema: {
      type: 'object',
      properties: {
        motivo: {
          type: 'string',
          description: 'En pocas palabras, que se necesita de la clinica. Ej: "quiere saber el precio de los alineadores".',
        },
        resumen: {
          type: 'string',
          description:
            'Lo que la persona ya conto, en una o dos frases, para que en la clinica no se lo pregunten otra vez. Solo lo que dijo de verdad.',
        },
      },
      required: ['motivo', 'resumen'],
      additionalProperties: false,
    },
  },
  {
    name: 'registrar_interes',
    description:
      'Recoge los datos de alguien que quiere una cita y se los pasa a la clinica por WhatsApp. Antes de llamarla, preguntale lo que falte. No inventes ningun campo. Esto NO agenda ni confirma nada: la hora depende de la disponibilidad y la confirma una persona.',
    strict: true,
    input_schema: {
      type: 'object',
      properties: {
        nombre: { type: 'string', description: 'Como se llama, tal como lo escribio.' },
        servicio: {
          type: 'string',
          description: 'Que necesita, en sus palabras. Ej: "ortodoncia invisible", "limpieza", "revision para mi hijo".',
        },
        dia: {
          type: 'string',
          description: 'Que dia le conviene, tal como lo dijo. Ej: "el jueves", "cualquier tarde", "la proxima semana".',
        },
        telefono: {
          type: ['string', 'null'],
          description: 'Su telefono si lo dio. null si no lo dio: no hay que insistir.',
        },
      },
      required: ['nombre', 'servicio', 'dia', 'telefono'],
      additionalProperties: false,
    },
  },
];

/**
 * Ejecuta una herramienta. Devuelve lo que ve el modelo y lo que ve la persona.
 *
 * Lo que ve el modelo es corto a proposito: si se le devuelve el enlace entero
 * tiende a escribirlo en el mensaje, y entonces la pagina muestra dos veces lo
 * mismo — una como boton y otra como URL cruda en medio del texto.
 *
 * @param {string} nombre
 * @param {Record<string, unknown>} entrada
 * @param {ConfigWhatsApp} wa
 * @returns {{ paraElModelo: string, accion: Accion }}
 */
export function ejecutar(nombre, entrada, wa) {
  if (nombre === 'registrar_interes') {
    const nom = String(entrada.nombre ?? '').trim();
    const servicio = String(entrada.servicio ?? '').trim();
    const dia = String(entrada.dia ?? '').trim();
    const tel = entrada.telefono ? String(entrada.telefono).trim() : '';

    let mensaje = rellenar(wa.plantillas.citaCalendario, { nombre: nom, servicio, dia });
    if (tel) mensaje += `\nMi teléfono: ${tel}`;

    return {
      paraElModelo:
        'Listo. Se le mostro un boton para enviar la solicitud por WhatsApp con sus datos ya escritos. Dile en una frase que lo toque y que en la clinica le confirman la hora segun disponibilidad. No repitas los datos ni escribas el enlace.',
      accion: { tipo: 'whatsapp', etiqueta: 'Enviar solicitud por WhatsApp', url: enlace(wa.numero, mensaje) },
    };
  }

  if (nombre === 'derivar_a_humano') {
    const resumen = String(entrada.resumen ?? '').trim();
    const motivo = String(entrada.motivo ?? '').trim();
    const cuerpo = [
      'Hola, vengo del chat de la página web.',
      '',
      resumen || motivo || 'Me gustaría información sobre sus servicios.',
    ].join('\n');

    return {
      paraElModelo:
        'Listo. Se le mostro un boton para seguir por WhatsApp con el contexto ya escrito. Dile en una frase que ahi le contesta alguien de la clinica. No escribas el enlace.',
      accion: { tipo: 'whatsapp', etiqueta: 'Continuar por WhatsApp', url: enlace(wa.numero, cuerpo) },
    };
  }

  // No deberia pasar: el modelo solo ve los dos nombres de arriba.
  return {
    paraElModelo: `No existe ninguna herramienta llamada "${nombre}". Contesta con lo que tengas o deriva a un humano.`,
    accion: { tipo: 'whatsapp', etiqueta: 'Escribir por WhatsApp', url: enlace(wa.numero, wa.plantillas.general) },
  };
}
