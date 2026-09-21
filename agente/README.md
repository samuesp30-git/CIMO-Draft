# Asistente de CIMO

Responde preguntas de pacientes con lo que está verificado, y pasa a una persona
todo lo demás. Hoy atiende el widget del sitio web; el núcleo ya está preparado
para que WhatsApp sea un segundo adaptador.

**Es un proyecto de Vercel aparte del sitio, y eso no es opcional.** El sitio de
CIMO es estático, se despliega ya compilado (`.vercelignore` excluye el código
fuente) y su eje es que abra desde `file://` con doble clic. Meter una función
dentro obligaría a instalar un adapter, pasar a `output: 'server'` y rehacer el
despliegue entero — rompiendo justo lo que hace vendible el proyecto.

---

## Puesta en marcha

```bash
npm install
export ANTHROPIC_API_KEY=sk-ant-...      # PowerShell: $env:ANTHROPIC_API_KEY="sk-ant-..."
npm run probar                            # gratis, sin red
npm run evaluar                           # ~$0.30, llama al modelo de verdad
```

**Lo primero de todo, antes de desplegar: pon un límite de gasto en la consola
de Anthropic.** El endpoint es público y es el único tope que no se puede
esquivar. Lo de `src/limites.js` vive en memoria del proceso y sirve para lo que
pasa todos los días —alguien pegando F5, un bot torpe—, no para un ataque.

### Desplegar

```bash
vercel deploy --prod --yes               # desde dentro de agente/
```

Variables de entorno del proyecto en Vercel:

| variable | para qué |
|---|---|
| `ANTHROPIC_API_KEY` | obligatoria |
| `ORIGENES_PERMITIDOS` | lista separada por comas. Por defecto: `cimo.hn`, `www.cimo.hn`, `cimo-hn.vercel.app`, `localhost:4321` |

Y en el sitio, `PUBLIC_AGENTE_URL` apuntando a este despliegue (por defecto
`https://cimo-agente.vercel.app/api/chat`). Se lee **al compilar**, así que al
cambiarla hay que reconstruir el sitio.

---

## Comandos

| comando | qué hace |
|---|---|
| `npm run probar` | 50 comprobaciones de la fontanería. Gratis, sin red, instantáneo |
| `npm run evaluar` | 32 casos adversarios contra el modelo. Cuesta ~$0.30 |
| `npm run evaluar precio` | filtra por id o grupo |

Los dos salen con código 1 si algo falla. `probar` tiene que estar en verde
antes de gastar un centavo en `evaluar`: casi todos los fallos son de
fontanería, no de modelo.

---

## Cómo está armado

```
conocimiento.generado.js   GENERADO desde src/data/ del sitio. No editar
src/
├─ prompt.js               el prompt del sistema. Congelado: es el prefijo cacheado
├─ responder.js            NÚCLEO: historial → respuesta. Lo compartirán los dos canales
├─ herramientas.js         derivar_a_humano · registrar_interes
├─ reloj.js                si la clínica está abierta AHORA
└─ limites.js              validación y freno por IP
api/chat.js                POST. CORS, validación, y a responder()
```

El modelo es **`claude-haiku-4-5`**, sin `thinking` y sin `effort` (Haiku no
admite `effort`). Elegido por coste: ~$0.012 por conversación, unos $6 al mes con
500 conversaciones.

### Tres decisiones que parecen raras y no lo son

**No hay streaming.** Sin él, la respuesta completa pasa por `revisar()` antes
de salir; con streaming no se puede retirar un precio que ya se envió. En una
clínica sin un solo precio publicado, poder frenar el texto vale más que ver
aparecer las letras — y con Haiku sobre un prompt cacheado la respuesta entera
llega en un segundo y pico.

**La hora va fuera del bloque cacheado.** El prompt y la base de conocimiento
son el prefijo cacheado y tienen que ser idénticos byte a byte entre peticiones.
La hora de Tegucigalpa va en un segundo bloque, después del punto de caché.
Meterla dentro no rompe nada visible: solo multiplica la factura por diez. Los
registros imprimen `cache_leida` en cada petición justamente para eso.

**Es JavaScript, no TypeScript.** Sin paso de compilación, el evaluador importa
exactamente el módulo que se despliega. Los tipos van en JSDoc.

---

## La base de conocimiento

Se compila **desde el sitio**, no desde aquí:

```bash
cd ..  &&  npm run conocimiento
```

Lee `src/data/{clinica,servicios,faq,pendientes,respuestas}.json` y escribe
`conocimiento.generado.js`. Falla con código 1 si detecta una cifra de dinero —
`propuesta/` contiene L 6,000, L 8,000 y $20, que son los precios de *nuestra
propuesta a CIMO*, no de tratamientos, y confundirlos sería el peor fallo posible
de este sistema.

`npm run probar` comprueba que el archivo generado no se haya quedado atrás
respecto a `src/data/`. Esa es la deriva silenciosa más probable de todo el
montaje: alguien confirma la dirección, reconstruye el sitio, despliega, y el
asistente sigue contando la versión vieja.

### Lo que sube el techo del asistente no es código

`src/data/respuestas.json` nace **vacío a propósito**. Es la única fuente que no
sale de una publicación pública: la redacta el equipo de CIMO. Su lista
`porPreguntar` tiene las diez preguntas que hoy el asistente no puede contestar
—duración del tratamiento, formas de pago, urgencias, edad mínima de los niños—
y cada una que se conteste es una consulta menos que termina en WhatsApp.

El guion largo para recoger esto ya existe:
`Cimo Vault/wiki/proyecto/Entrevista 2026-09-22.md`.

---

## Qué contesta y qué no

**Contesta:** horario (con abierto/cerrado en vivo), los cinco servicios, qué es
Invisalign, el escáner iTero, que atienden niños, cómo agendar, teléfono y redes.

**Declina y deriva:** precios, seguros, formas de pago, quién atiende y su
especialidad, la sede de Copán, los términos de Smart Fit, y todo lo de
`porPreguntar`.

**La dirección es caso aparte:** se da siempre con el matiz de que conviene
confirmarla, porque la mudanza anunciada en mayo de 2026 sigue sin resolverse.

**Nunca:** diagnostica, recomienda tratamiento, estima urgencia, inventa una
cifra o un nombre, ni confirma una cita.

Hay dos capas para eso, y el orden importa: **el prompt** es la defensa, y
**`revisar()` en `responder.js`** es la red. Si la red salta, `evaluar` lo cuenta
como fallo aunque la respuesta que salió fuera segura — significa que el prompt
no aguantó.

---

## Fase 2 — WhatsApp

El núcleo está listo; falta el adaptador. Los dos bloqueos no son técnicos:

1. **Permiso del cliente.** El 9770-3774 es el número real de CIMO y hoy lo
   contesta una persona.
2. **Qué número.** Meta ofrece *Coexistence* (la app de WhatsApp Business y la
   API en el mismo número, conservando el historial), pero la elegibilidad la
   decide Meta. Si no califica: número nuevo dedicado, o migrar el actual —y
   migrar significa perder el historial y no poder volver a usarlo en la app.

Lo técnico que cambia respecto a la web: verificar la firma
`X-Hub-Signature-256` de Meta (sin eso cualquiera postea al webhook), responder
200 de inmediato y procesar después (Meta reintenta), y guardar el historial por
número con TTL — ahí sí hace falta almacenamiento.

Coste de Meta: **cero** para conversaciones de servicio. Desde noviembre de 2024
no cobra los mensajes que inicia el paciente ni las respuestas dentro de la
ventana de 24 horas, sin tope mensual.
