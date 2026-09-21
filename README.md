# Sitio de CIMO

Centro Integral Médico Odontológico — Tegucigalpa.

Sitio estático en Astro. **Abre desde `file://` con doble clic**, sin servidor y
sin red: se le puede enseñar al cliente desde una memoria USB.

```bash
npm install
npm run fuentes     # prepara los .woff2 (solo hace falta una vez)
npm run build
npm run verificar
```

Y después, doble clic en `dist/index.html`.

---

## Comandos

| comando | qué hace |
|---|---|
| `npm run dev` | servidor de desarrollo en el puerto 4322 |
| `npm run build` | compila a `dist/` |
| `npm run verificar` | audita `dist/`: 22 comprobaciones, cero dependencias |
| `npm run conocimiento` | compila `src/data/` → base de conocimiento del asistente |
| `npm run tokens` | recalcula la paleta y sus contrastes. Sale con 1 si algo falla |
| `npm run fuentes` | copia los `.woff2` y regenera `src/styles/fuentes.css` |
| `npm run contraste` | mide el contraste REAL del texto de la portada sobre la foto |
| `npm run fotos <carpeta>` | recorta y convierte a WebP las fotos declaradas en `fotos.json` |
| `npm run captura` | capturas con Chrome headless. `-- 375` para otro ancho |
| `node scripts/comparar-firma.mjs` | la comparación tipográfica que eligió la script |

---

## Estructura

```
src/
├─ data/              todo el texto de negocio vive aquí, no en los .astro
│  ├─ clinica.json    sede, horario, WhatsApp, plantillas de mensaje
│  ├─ servicios.json  los cinco, con la fuente de cada uno
│  ├─ faq.json        6 con respuesta + 5 declaradas sin responder
│  ├─ pendientes.json los huecos que faltan del cliente
│  ├─ respuestas.json las preguntas recurrentes que redacta el equipo de CIMO
│  └─ fotos.json      cada imagen con su licencia y su enlace de origen
├─ styles/
│  ├─ tokens.css      colores, tipografía, espaciado, base
│  └─ fuentes.css     GENERADO por scripts/fuentes.mjs — no editar
├─ lib/               horarios.ts · whatsapp.ts · iconos.ts
├─ components/        Titular, Wordmark, Boton, Icono, Marcador, AgendarCita…
├─ layouts/Base.astro
└─ pages/             index · servicios · invisalign · preguntas · contacto · 404

agente/               el asistente de IA. Proyecto de Vercel APARTE — ver agente/README.md
```

**Las reglas de diseño están en [`DESIGN.md`](DESIGN.md)** y no son decorativas:
cada una existe porque su fallo ya ocurrió. Léelo antes de tocar un color o una
fuente.

---

## Lo que hay que saber antes de tocar nada

**El sitio tiene que seguir abriendo desde `file://`.** Eso prohíbe: rutas que
empiecen por `/`, `<script src>` externos, fuentes de CDN, `mask-image` y `<use
href>` a otro archivo. `npm run verificar` falla si aparece cualquiera.

**`astro.config.mjs` no se «limpia».** Sus tres ajustes vienen de fallos reales;
el comentario del archivo los explica.

**El azul de marca no escribe.** `#6EB8DD` da 2.20:1 sobre blanco. Para texto
está `--marca-text`. El verificador falla la compilación si se usa mal.

**Nada inventado.** No hay reseñas (CIMO tiene cero públicas), ni precios, ni
nombres de doctores más allá de la Dra. Marta Muñoz, ni coordenadas de una
dirección sin confirmar. Lo que falta se marca con `<Marcador>` y se declara en
`pendientes.json`; el verificador comprueba que ambas listas cuadren.

**Con las fotos la regla es más fina, y está en `DESIGN.md` §4d.** No se usa
ninguna imagen que afirme algo sobre la clínica —consultorio, equipo, pacientes,
antes/después— porque enseñar un local ajeno promete algo que el paciente no va a
encontrar. Sí se usan imágenes que no afirman nada: un primer plano de una
sonrisa habla del tratamiento, no de la sede. Cada una vive en `fotos.json` con
licencia y enlace de origen, y `verificar` falla ante cualquier imagen sin
declarar. **La fotografía real sigue pendiente**: una foto de banco no cierra ese
hueco, y el verificador también comprueba eso.

**Texto sobre una foto: nunca directo.** Una fotografía no tiene color computado
que auditar. El texto va sobre un velo de alfa conocido, calculado para el peor
caso, y `npm run contraste` lo mide en píxeles reales en vez de creerse la
cuenta.

**Los iconos se dibujan, no se importan.** Los cuatro de especialidad viven en
`src/lib/iconos.ts` como SVG en línea con `currentColor`, y tres comparten el
mismo path de molar. Se juzgan **a 20 px**: ahí murieron una funda punteada y
cuatro versiones de un cepillo de dientes. El razonamiento entero está en
`DESIGN.md` §4c. «Ortodoncia invisible» va sin icono a propósito.

**El sitio trata de tú, no de vos.** Decisión del cliente. Honduras vosea, así
que la forma sale sola al escribir: `verificar` la caza en `dist/` y falla.

---

## El asistente de IA

Abajo a la izquierda hay un chat que responde lo verificado y pasa a WhatsApp
todo lo demás. **El backend vive en [`agente/`](agente/README.md), que es un
proyecto de Vercel aparte**: este despliegue es hosting estático puro y el sitio
tiene que seguir abriendo desde `file://`.

Por eso, **bajo `file://` el widget se retira entero** en vez de enseñar un botón
muerto. La demo por USB queda igual que antes; el chat se enseña desde la URL de
Vercel.

Lo que hay que saber si se tocan los datos de la clínica:

```bash
npm run conocimiento    # después de editar cualquier src/data/*.json
```

El asistente NO lee los JSON en tiempo de ejecución —se despliega aparte— así que
ese paso es el único puente. Si se olvida, el sitio dice una cosa y el asistente
otra, sin que nada falle a la vista. `agente/npm run probar` lo detecta.

**La regla de «nada inventado» se le aplica con más fuerza que al sitio**, porque
un generador de texto es justo lo que más la amenaza. Tiene dos capas: el prompt,
y un guardia que revisa la respuesta antes de enviarla y la bloquea si contiene
una cifra de dinero o un nombre de doctor que no sea el de la Dra. Marta Muñoz —
el mismo criterio que `verificar.mjs` §18. `agente/npm run evaluar` mide si el
prompt aguanta sin que el guardia tenga que intervenir.

---

## Contenido pendiente del cliente

Lo urgente: **confirmar la dirección**. En mayo de 2026 la clínica anunció una
mudanza y no se ha podido verificar el local definitivo. El mapa sí está —en el
inicio y en contacto— pero **consulta a Google por la dirección publicada, no por
coordenadas**: unas coordenadas escritas a mano afirmarían una precisión que
nadie ha comprobado. Al lado va el aviso de la mudanza, y `verificar` falla si se
separan. Cuando el cliente confirme el local, se rellena `coordenadas` en
`clinica.json` y el mapa pasa solo al punto exacto.

El resto —logo vectorial, fotografía, nómina de especialistas, consentimiento
para los casos, precios, seguros, dominio— está en `src/data/pendientes.json` con
el detalle de qué bloquea cada uno.

**Fuera de alcance por decisión del cliente:** la sede de La Entrada, Copán.
`clinica.json` ya tiene `sedes[]` como array para que añadirla sea un elemento
más, no una migración.

---

## Publicación

El borrador está en **https://cimo-hn.vercel.app** (proyecto `cimo-hn`). Se sube
`dist/` ya compilado —`.vercelignore` excluye todo lo demás— para que el cliente
vea exactamente lo que se verificó aquí, sin depender de una compilación en un
servidor ajeno.

```bash
npm run build && npm run verificar && vercel deploy --prod --yes
```

> **ANTES DEL LANZAMIENTO REAL: quitar el `X-Robots-Tag` de `vercel.json`.**
> Ahora mismo el sitio sale con `noindex, nofollow` a propósito, porque es un
> borrador **con la dirección sin confirmar**: si Google lo indexa, la clínica
> acaba apareciendo en búsquedas con una dirección posiblemente equivocada, que
> es peor que no aparecer. Mientras esa cabecera siga puesta, el sitio **no se
> indexa nunca**. Los canónicos apuntan además a `https://cimo.hn/`, que todavía
> no existe.

---

## Estado

| | |
|---|---|
| Páginas | 5 + 404 |
| Contraste de la portada sobre la foto | 10.82:1 medido en el peor píxel |
| Peso de `dist` | 946 KB |
| Peso de `index.html` | 82.1 KB — de los que ~16 KB son el widget del asistente, en línea en las 6 páginas |
| JS en línea por página | 13.9 KB de un presupuesto de 25 KB |
| `npm run verificar` | en verde, sin avisos |
| `agente/npm run probar` | 50/50 |
| `npm run tokens` | FALLOS=0 |
| Barrido de contraste | 0 fallos en las 6 páginas y con el diálogo abierto |
| Desbordamiento a 360 px | ninguno (360 de 360) |
| Detector de patrones | 16 hallazgos, todos revisados (eran 33) |
| Crítica de diseño | 26/36 · `.impeccable/critique/` |
