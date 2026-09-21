// Compila src/data/*.json -> agente/conocimiento.generado.json. Cero dependencias.
//
//   npm run conocimiento
//
// El asistente NO lee los JSON del sitio en tiempo de ejecucion: `agente/` es un
// despliegue aparte y no comparte sistema de archivos con el sitio. Este script
// es el puente, y se corre a mano cuando cambian los datos — mismo trato que
// fuentes.css y tramas.css, que tambien son generados.
//
// Que este script exista tiene una segunda razon, mas importante que la tecnica:
// es el unico punto por donde un dato puede llegar al modelo. Si algo no pasa
// por aqui, el asistente no puede decirlo. Eso convierte el archivo generado en
// una superficie auditable de una sola pagina, en vez de "lo que sea que tenga
// el prompt".
//
// NO se lee propuesta/: contiene L 6,000, L 8,000 y $20, que son los precios de
// NUESTRA propuesta a CIMO, no de tratamientos. Confundirlos seria el peor fallo
// posible de este sistema. La comprobacion del final existe para eso.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const leer = (r) => JSON.parse(readFileSync(r, 'utf8'));

const clinica = leer('src/data/clinica.json');
const servicios = leer('src/data/servicios.json');
const faq = leer('src/data/faq.json');
const pendientes = leer('src/data/pendientes.json');
const respuestas = leer('src/data/respuestas.json');

const sede = clinica.sedes[0];
const d = sede.direccion;

// ── El bloque de hechos. Va DENTRO del prompt cacheado, asi que tiene que ser
//    estable byte a byte entre peticiones: nada de fechas, contadores ni orden
//    aleatorio. La hora actual se inyecta aparte, despues del punto de cache.
const bloques = [];

bloques.push(
  `# Datos verificados de CIMO`,
  ``,
  `Todo lo que sigue esta comprobado contra una fuente. Lo que no aparece aqui, NO SE SABE: no lo deduzcas ni lo rellenes.`,
  ``,
  `## Identidad`,
  `- Nombre: ${clinica.nombre} (${clinica.nombreCompleto})`,
  `- Lema, textual de su Instagram: «${clinica.lema}»`,
  `- Que son: ${clinica.descripcion}`,
  `- Empresa familiar.`,
);

bloques.push(
  ``,
  `## Contacto`,
  `- WhatsApp y telefono: ${clinica.telefono.display} (numero completo ${clinica.telefono.href})`,
  `- Correo: ${clinica.email}`,
  `- Instagram ${clinica.redes.instagram} · Facebook ${clinica.redes.facebook} · TikTok ${clinica.redes.tiktok}`,
  `- NO hay sistema de reservas en linea. Todas las citas se solicitan por WhatsApp y las confirma una persona.`,
);

// El horario es el unico dato de su categoria confirmado por el cliente.
const tramos = sede.horarios.map((t) => `${t.dias}: ${t.apertura} a ${t.cierre}`);
const cerrados = (sede.cerrado || []).map((c) => `${c.dias}: cerrado`);
bloques.push(
  ``,
  `## Horario (CONFIRMADO por la clinica)`,
  ...tramos.map((t) => `- ${t}`),
  ...cerrados.map((c) => `- ${c}`),
  `- Zona horaria: ${sede.zonaHoraria}`,
  // Se emite en 24 h porque es como esta el dato, pero en Honduras nadie dice
  // "diecinueve horas". El formateo de verdad vive en src/lib/horarios.ts y no
  // se duplica aqui: basta con remitir a la respuesta ya redactada.
  `- Al decirlo, usa el formato de 12 horas con «a. m.» y «p. m.», exactamente como en la pregunta frecuente «¿Que horario tienen?» de mas abajo. Nunca digas "19:00".`,
);

// La direccion es el caso delicado: se publica, pero SIEMPRE con el matiz.
bloques.push(
  ``,
  `## Direccion (publicada, pero SIN CONFIRMAR)`,
  `- ${d.completa}`,
  `- Referencia: ${d.referencia}. ${d.detalle}.`,
  sede.direccionPendiente
    ? `- REGLA OBLIGATORIA: en mayo de 2026 CIMO anuncio una mudanza sin decir a donde, y en septiembre hablo de una sucursal nueva. Las dos lecturas siguen abiertas. Da la direccion SIEMPRE acompanada de la advertencia de que conviene confirmarla por WhatsApp antes de ir. Nunca la des a secas.`
    : `- Direccion confirmada.`,
);

bloques.push(
  ``,
  `## Servicios (${servicios.length}, y no hay mas)`,
  ...servicios.map((s) => `- ${s.nombre}: ${s.descripcion}`),
);

for (const t of clinica.tecnologia) {
  bloques.push(
    ``,
    `## ${t.nombre}`,
    `- ${t.que}`,
    `- En la clinica desde ${t.desde}.`,
    ...t.promesa.map((p) => `- ${p.titulo}: ${p.texto}`),
  );
}

// FAQ ya redactada: es la voz exacta que debe imitar el asistente.
const contestadas = faq.filter((f) => !f.pendiente);
bloques.push(
  ``,
  `## Preguntas frecuentes ya redactadas (usa estas respuestas tal cual)`,
  ...contestadas.map((f) => `- P: ${f.pregunta}\n  R: ${f.respuesta}`),
);

// La capa que aporta la clinica. Nace vacia y es la que sube el techo.
const aprobadas = respuestas.respuestas || [];
if (aprobadas.length) {
  bloques.push(
    ``,
    `## Respuestas dadas por el equipo de CIMO`,
    ...aprobadas.map((r) => {
      const matiz = r.certeza === 'probable' ? ' (dilo con matiz: no esta confirmado del todo)' : '';
      return `- P: ${r.pregunta}\n  R: ${r.respuesta}${matiz}`;
    }),
  );
}

// ── Lo que no se sabe. Esta seccion es la mas importante del archivo: define
//    el perimetro de lo que el modelo NO puede contestar.
const huecosFaq = faq.filter((f) => f.pendiente);
const huecosPend = pendientes.filter((p) => ['precios', 'especialistas', 'brazo-medico', 'copan'].includes(p.id));

bloques.push(
  ``,
  `## Lo que NO se sabe — nunca lo inventes, siempre deriva a una persona`,
  ...huecosFaq.map((f) => `- ${f.pregunta} -> ${f.porQue}`),
  ...huecosPend.map((p) => `- ${p.titulo} -> ${p.detalle}`),
  `- De todo el equipo solo consta publicamente el nombre de la Dra. Marta Munoz, y ni siquiera su especialidad o numero de colegiado estan confirmados. NO menciones ningun otro nombre de doctor, ni le atribuyas una especialidad a nadie.`,
);

const pendientesDelEquipo = respuestas.porPreguntar || [];
if (pendientesDelEquipo.length) {
  bloques.push(
    ``,
    `Tampoco se sabe nada de esto, que la clinica todavia no ha contestado:`,
    ...pendientesDelEquipo.map((p) => `- ${p.pregunta}`),
  );
}

const texto = bloques.join('\n');

// ── Comprobacion: ninguna cifra de dinero puede haber llegado hasta aqui.
//    `\bL\.?\s?\d{2,}` no choca con "local 8" (minuscula, un digito) ni con el
//    codigo postal, que va sin prefijo.
const DINERO = [
  // Un solo \d, no \d{2,}: el separador de miles corta la racha y "L 6,000" se
  // colaba entero. La mayuscula distingue: "local 8" y "Lunes 10" no son dinero.
  [/\bL\.?\s?\d/, 'cifra en lempiras con prefijo L'],
  [/\bLps?\.?\s?\d/i, 'cifra en formato Lps.'],
  [/\$\s?\d/, 'cifra en dolares'],
  [/lempira/i, 'la palabra "lempira"'],
];
const encontrado = DINERO.filter(([re]) => re.test(texto));
if (encontrado.length) {
  console.error('\n  La base de conocimiento contiene dinero, y CIMO no tiene un solo precio publicado.');
  for (const [re, etiqueta] of encontrado) {
    console.error(`   - ${etiqueta}: ${JSON.stringify(texto.match(re)[0])}`);
  }
  console.error('\n  Casi seguro se colo algo de propuesta/, que son NUESTROS precios, no los de los tratamientos.\n');
  process.exit(1);
}

if (!existsSync('agente')) mkdirSync('agente');

// Se emite un MODULO, no un .json. Un import de JSON necesita atributos de
// importacion (`with { type: 'json' }`) y cada empaquetador los resuelve a su
// manera; un `export const` lo entiende Node, lo entiende esbuild y lo entiende
// el evaluador, sin configuracion ni sorpresas en el despliegue.
//
// Junto al texto viajan los pocos datos que el runtime necesita estructurados:
// los horarios para calcular si esta abierta AHORA, y el WhatsApp para armar el
// enlace de derivacion.
const modulo = `// GENERADO por scripts/conocimiento.mjs — no editar a mano.
// El proximo \`npm run conocimiento\` sobrescribe este archivo.
// Los datos se cambian en src/data/*.json.

export const texto = ${JSON.stringify(texto)};

export const horarios = ${JSON.stringify({ tramos: sede.horarios, cerrado: sede.cerrado || [], zonaHoraria: sede.zonaHoraria }, null, 2)};

export const whatsapp = ${JSON.stringify({ numero: clinica.whatsapp.numero, display: clinica.whatsapp.display, plantillas: clinica.whatsapp.plantillas }, null, 2)};
`;

writeFileSync('agente/conocimiento.generado.js', modulo);

const kb = Buffer.byteLength(texto, 'utf8');
console.log(`agente/conocimiento.generado.js escrito.`);
console.log(`  ${servicios.length} servicios · ${contestadas.length} preguntas redactadas · ${aprobadas.length} respuestas del equipo`);
console.log(`  ${huecosFaq.length + huecosPend.length} huecos declarados · ${pendientesDelEquipo.length} preguntas sin contestar por la clinica`);
console.log(`  ${(kb / 1024).toFixed(1)} KB de base de conocimiento (~${Math.round(kb / 3.5)} tokens)`);
if (!aprobadas.length) {
  console.log(`\n  respuestas.json esta vacio. El asistente funciona, pero su techo lo sube la clinica:`);
  console.log(`  cada respuesta que entre ahi es una consulta menos que termina en WhatsApp.`);
}
