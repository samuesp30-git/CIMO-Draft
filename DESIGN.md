# Sistema de diseño — CIMO

Centro Integral Médico Odontológico · Tegucigalpa.

Este sistema hereda la regla que ordena el sistema hermano de Dental Company HN:

> **Ningún color se elige. Se mide, y se verifica contra cada fondo donde
> aterriza.**

En CIMO la regla se extendió a la tipografía: el wordmark también se midió, y de
esa medición salen el peso, el tracking y la proporción del titular. Y se
extendió a la firma: la script se eligió comparando métricas contra el binario
original, no por nombre.

**Estado: sitio construido.** Cinco páginas más 404, `verificar` en verde,
barrido de contraste sin fallos. Medición de la paleta: 4 de septiembre de 2026.

---

## 0. Contexto mínimo

| | |
|---|---|
| Nombre | CIMO — Centro Integral Médico Odontológico |
| Naturaleza | Empresa familiar (declarado en su Facebook) |
| Sede en esta fase | Tegucigalpa — Blvd. Centroamérica, Torre Corporativo Centroamérica, 3.er piso, local 8 |
| Fuera de alcance | La Entrada, Copán (Col. Vanessa) — por decisión del cliente |
| Teléfono / WhatsApp | 9770-3774 · `50497703774` (real, verificado) |
| Correo | cimo.hn2020@gmail.com |
| Horario | L–V 9:00–19:00 · Sáb 9:00–17:00 · Dom cerrado (**confirmado**) |
| Web anterior | ninguna. El único enlace en su bio va a TikTok. |

Investigación completa en [`research/brief-cimo.md`](research/brief-cimo.md).

---

## 1. De dónde sale la paleta

Se descargó el logo de perfil y las ocho portadas de historias destacadas. Cada
imagen se clasificó píxel a píxel en HSL, descartando lo que no es color
(saturación < 25 %, o luminosidad fuera de 8–94 %), y se agruparon los tonos en
bandas de 10°.

**Portadas de marca** — las cinco que son gráficos, no fotos:

| portada | tono dominante | concentración |
|---|---|---|
| hl0 | 200° | 95.0 % |
| hl4 | 200° | 95.4 % |
| hl5 | 200° | 94.2 % |
| hl6 | 200° | 96.3 % |
| hl7 | 200° | 95.1 % |
| **logo** | **200°** | **81.8 %** (97.5 % contando 190–210°) |

Las otras tres portadas son fotografías: sus dominantes están en 10–40°, que son
tonos de piel. **No son material de marca y no se usaron.** Separarlas importa:
sin hacerlo, el oro `#ffb810` de una foto y el azul `#0050ff` de otra entran en
la paleta como si fueran decisiones de la clínica, y no lo son.

### La conclusión

**CIMO es una marca de un solo tono.** 200°, entre el 94 % y el 96 % de todo su
color saturado. La diferenciación viene del **valor** y del **blanco**, que ocupa
el 65 % del logo, no de meter tonos nuevos.

### Las dos anclas

| ancla | hex | HSL | de dónde sale |
|---|---|---|---|
| `--marca` | `#6EB8DD` | hsl(200 62% 65%) | relleno dominante del símbolo |
| `--ink` | `#293237` | hsl(201 15% 19%) | decil más oscuro del wordmark «CIMO» |

`--ink` es el hallazgo que hace que el sistema no se sienta frío: **el neutro
oscuro de CIMO no es gris, es azul desaturado en el mismo 201°**. Todos los
neutros llevan ese tinte.

### Reverificadas contra el logo en alta

Las dos anclas salieron de un JPEG de 150 × 150 px, que es lo único que había al
empezar. Después apareció el logo del cliente a **1148 × 1148**, en su versión
limpia, y se volvieron a medir sobre él separando las tres bandas de tinta:

| elemento | medido en alta | mi ancla |
|---|---|---|
| cruz (moda de 4 875 px) | `#75BADB` hsl(199 59% 66%) | `#6EB8DD` hsl(200 62% 65%) |
| wordmark, mitad izquierda (la C) | `#203742` hsl(199 34% 19%) | — |
| bajada, el texto pequeño | `#243033` hsl(191 18% 17%) | `#293237` hsl(201 15% 19%) |

**Las dos se sostienen.** El azul difiere en un grado de tono y tres puntos de
saturación: indistinguible. Y `--ink` cae justo entre el wordmark y la bajada,
más cerca de la bajada, que es el análogo real al texto corrido.

Una lectura intermedia daba `#28495C`, mucho más saturada, y habría hecho
cambiar el color de todo el texto del sitio. Era ruido: promediaba los píxeles
de antialias en vez del núcleo del trazo. **Se comprueba midiendo el núcleo —el
0.5 % más oscuro de cada banda— no el promedio de lo que parece oscuro.**

Del logo en alta salió además el **símbolo** utilizable (274 × 274, recortado y
ajustado al contenido), que es el que lleva la cabecera. El vectorial sigue
pendiente: por encima de unos 137 px de lado se empieza a ver.

---

## 2. Tokens de color

Contraste medido contra los **cuatro** fondos reales del sitio. Ninguna cifra
está estimada: todas salen de `node research/tokens.js`, que sale con código 1
si alguna baja de su mínimo. **Estado: FALLOS=0.**

Si cambia un color se cambia allí, se ejecuta `npm run tokens` y se copia la
salida. Esta tabla no se edita a mano.

| token | hex | origen | s/base | s/surf | s/suave | s/ink |
|---|---|---|---|---|---|---|
| `--base` | `#FFFFFF` | — | — | 1.09 | 1.19 | 13.08 |
| `--surface` | `#F1F6F9` | derivado | 1.09 | — | 1.09 | 12.01 |
| `--line` | `#DAE6EC` | derivado | 1.27 | 1.17 | 1.07 | 10.28 |
| `--marca` | `#6EB8DD` | **medido** | 2.20 | 2.02 | 1.85 | 5.96 |
| `--ink` | `#293237` | **medido** | 13.08 | 12.01 | 11.02 | — |
| `--ink-oscuro` | `#182025` | derivado | 16.51 | 15.16 | 13.91 | 1.26 |
| `--ink-marino` | `#1E3A47` | derivado | 11.99 | 11.01 | 10.11 | 1.09 |
| `--ink-soft` | `#4F6069` | derivado | 6.54 | 6.01 | 5.51 | 2.00 |
| `--ink-faint` | `#586973` | derivado | 5.70 | 5.24 | 4.81 | 2.29 |
| `--marca-oscuro` | `#4AA2CF` | derivado | 2.85 | 2.62 | 2.40 | 4.58 |
| `--marca-text` | `#2A6D8F` | derivado | 5.70 | 5.24 | 4.81 | 2.29 |
| `--marca-suave` | `#DFEEF6` | derivado | 1.19 | 1.09 | — | 11.02 |
| `--marca-tenue` | `#F4F9FB` | derivado | 1.06 | 1.03 | 1.12 | 12.32 |
| `--sobre-oscuro` | `#ABC2CD` | derivado | 1.85 | 1.70 | 1.56 | 7.06 |
| `--sobre-oscuro-suave` | `#84A2B0` | derivado | 2.70 | 2.48 | 2.28 | 4.84 |
| `--marca-sobre-oscuro` | `#4EA6D3` | derivado | 2.72 | 2.50 | 2.29 | 4.81 |
| `--firma-color` | `#1F5D7D` | derivado | 7.19 | 6.61 | 6.06 | 1.82 |
| `--firma-sobre-oscuro` | `#7EC3E6` | derivado | 1.94 | 1.78 | 1.63 | 6.75 |
| `--oro-relleno` | `#C9922A` | aprobado | 2.75 | 2.53 | 2.32 | 4.75 |
| `--oro-text` | `#8A6212` | aprobado | 5.47 | 5.03 | 4.61 | 2.39 |
| `--oro-sobre-oscuro` | `#C9922A` | aprobado | 2.75 | 2.53 | 2.32 | 4.75 |
| `--abierto` | `#177541` | derivado | 5.74 | 5.27 | 4.84 | 2.28 |
| `--error` | `#A3312A` | derivado | 6.93 | 6.37 | 5.84 | 1.89 |
| `--aviso` | `#8A6212` | derivado | 5.47 | 5.03 | 4.61 | 2.39 |
| `--desactivado` | `#6E7C83` | derivado | 4.31 | 3.96 | 3.63 | 3.04 |
| `--whatsapp` | `#25D366` | terceros | 1.98 | 1.82 | 1.67 | 6.59 |
| `--whatsapp-oscuro` | `#1FB857` | terceros | 2.61 | 2.40 | 2.20 | 5.01 |

Encima hay una capa de **alias semánticos** (`--cta-fondo`, `--text-seccion`,
`--surface-card`…) que es la que usan los componentes. Cambiar el papel de un
color se hace ahí, no reasignando el token de abajo.

### La regla que más se va a romper

**`--marca` da 2.20:1 sobre blanco.** Reprueba WCAG para texto por más del doble,
y es el color de la marca, así que es el que todo el mundo va a querer poner en
los títulos.

> **El azul claro rellena. `--marca-text` escribe.**

No es un consejo. `scripts/verificar.mjs` falla la compilación ante
`color: var(--marca)`, ante el hex literal, ante su `rgb()` y ante
`background-clip: text`.

### Por qué son cuatro fondos y no tres

`--marca-suave` (`#DFEEF6`) entró al conjunto **después** de que el barrido del
navegador encontrara un botón a 4.42:1 dentro de una tarjeta de ese color.
`--marca-text` pasaba contra blanco (5.24) y contra `--surface` (4.82), pero
nadie lo había medido contra el tercer fondo claro. Ver §9.

### El desactivado falla a propósito

`--desactivado` da 3.96 sobre surface. WCAG 1.4.3 exime los controles
inhabilitados, y el bajo contraste **es** la señal de que no se pueden usar. Está
anotado para que nadie lo «arregle» y rompa esa señal.

### El oro

**Aprobado por el cliente.** En la primera versión de este documento figuraba
como decisión pendiente; ya no lo es.

**El oro escribe RÓTULOS. Desde septiembre de 2026, en dos sitios:**

1. Los rótulos de sección en versalitas (`.versalita`).
2. Los rótulos de los campos del diálogo de agendar cita.

Hasta entonces el alcance era **uno solo** —«no aparece en ningún otro sitio»— y
el registro de componentes conserva el caso donde eso se hizo cumplir: en
`AccionesMapa`, «Cómo llegar» se dejó en `--ink` precisamente por esa regla.

Lo que NO cambió es el significado: el oro sigue queriendo decir «esto es un
rótulo». Por eso el **titular** del diálogo no lo lleva —va en `--ink` y en
Tinos 700— aunque en una primera versión sí lo llevó. Un titular en oro
convertía el color en decoración, y entonces el rótulo de sección dejaba de
señalar nada. **No se extiende a titulares ni a texto corrido.**

**El límite físico, que no es negociable.** El oro que brilla es `--oro-relleno`
(#C9922A) y sobre blanco da **2.75:1**: no puede escribir, solo rellenar. El que
escribe es `--oro-text` (#8A6212), 5.47:1 sobre blanco, y se lee como mostaza
oscura. Mientras el fondo sea claro no hay más oro disponible; el dorado solo se
ve dorado sobre `--ink`, donde `--oro-sobre-oscuro` da 4.75:1.

---

## 3. Tipografía

**Tres roles, tres familias.** Cada uno tiene su razón medida.

| rol | familia | dónde |
|---|---|---|
| `--font-wordmark` | **Jost 300** | solo el wordmark «CIMO» |
| `--font-titulo` / `--font` | **Times New Roman**, con **Tinos** como equivalente métrico | titulares y texto corrido |
| `--font-firma` | **Allison** (bajo el alias `Firma CIMO`) | el `<em>` de los titulares |
| `--font-datos` | Jost | cifras, controles, versalitas, navegación |

### El wordmark, medido

Se aisló la banda del wordmark del logo de 150 px y se perfilaron las columnas
con tinta para separar los glifos:

| glifo | ancho | hueco al siguiente |
|---|---|---|
| C | 14 px | 4 px |
| I | 2 px | 5 px |
| M | 16 px | 5 px |
| O | 16 px | — |

Altura de mayúscula: 17 px. De ahí salen tres cifras que son la especificación:

- **O / altura = 16/17 = 0.94.** Círculo casi perfecto: es una **geométrica**.
- **Trazo / altura = 2/17 = 0.118.** La I mide el trazo. Corresponde a **Light (300)**.
- **Tracking ≈ +0.1em.** Los huecos promedian 4.7 px donde una geométrica sin
  tracking daría ~2 px.

Por eso `Wordmark.astro` compone la marca **en tipo y nunca como imagen**: el
único logo disponible son 150 × 150 px, pero el wordmark no hace falta ampliarlo
si se puede escribir. El **símbolo** circular es otra cosa y va como `Marcador`
hasta que el cliente entregue el vectorial.

### Por qué el cuerpo es una serif y no la geométrica

La primera versión de este documento proponía Jost también para los titulares,
razonando que el titular debía hacer eco del logo. El sistema de diseño lo
cambió a Times/Tinos, y el cambio **está razonado**: la escala se subió un paso
entero porque Times tiene la altura de x más baja. Se respeta.

Times New Roman es fuente de sistema y no se puede redistribuir. **Tinos**
(Apache-2.0) es métricamente compatible —mismos anchos, mismas alturas—, así que
la maqueta no se mueve entre una máquina con Times y una sin ella. La pila pide
Times primero. Eso es todo el motivo de elegir Tinos, y por eso no se «mejora» a
otra serif.

### La firma

El wordmark del logo lleva un degradado horizontal, medido glifo a glifo:

| glifo | color | HSL |
|---|---|---|
| C | `#171E23` | hsl(205 21% 11%) |
| I | `#364346` | hsl(191 13% 24%) |
| M | `#7FA6B6` | hsl(197 27% 61%) |
| O | `#81A4B2` | hsl(197 24% 60%) |

Va de casi negro a azul de marca. Esa es la idea propia de CIMO, y en el sistema
se dice **partiendo el titular en dos voces**, no con un degradado literal: un
degradado en texto no tiene color computado que auditar y su mitad clara cae por
debajo de 4.5:1.

```css
h1, h2, h3            { color: var(--ink); font-weight: 400 }
h1 em, h2 em, h3 em   { font-family: var(--font-firma); color: var(--firma-color) }
```

El `<em>` dentro de un titular **no es énfasis, es la firma**. En el cuerpo sigue
siendo cursiva. Esa ambigüedad se resuelve autorando siempre por `Titular.astro`
y nunca a mano.

**La firma no lleva marcas ajenas.** «WhatsApp» tiene su propio logotipo;
ponerlo en una caligrafía decorativa lo deforma. El script se reserva para las
palabras de CIMO.

**El resalte no debe envolver: dos o tres palabras como mucho.** La firma se
compone a 1.92× el cuerpo del titular, así que sus líneas son mucho más altas
que las de la serif. Mientras cabe en una línea el titular se lee como una sola
frase; en cuanto el script se parte, el interlineado se descuadra y aparece un
hueco que parece un error de maquetación.

### Por qué Allison y no Brittany Signature

El prototipo usaba **Brittany Signature**. No se puede: su propio `Readme.txt`
dice *«ONLY for PERSONAL USE. NO COMMERCIAL USE ALLOWED»*. No es un matiz de
licencia web frente a licencia de escritorio — no está licenciada para uso
comercial en ningún medio, y el sitio de una clínica lo es.

La sustituta se eligió **midiendo**, con `scripts/comparar-firma.mjs`, que compara
seis candidatas de licencia abierta contra el binario original:

| fuente | trazo/x | ancho/x | x/May | distancia |
|---|---|---|---|---|
| *Brittany (referencia)* | *0.879* | *10.42* | *0.314* | — |
| **Allison** | 0.859 | 10.06 | 0.349 | **0.043** |
| Sacramento | 0.831 | 9.57 | 0.405 | 0.107 |
| Mrs Saint Delafield | 1.287 | 10.72 | 0.316 | 0.125 |
| Dancing Script | 0.825 | 10.63 | 0.461 | 0.138 |
| Great Vibes | 0.692 | 8.33 | 0.437 | 0.202 |
| Style Script | 0.445 | 6.63 | 0.620 | 0.458 |

Allison gana por un factor de dos sobre la segunda, y el espécimen rasterizado lo
confirma: comparte el trazo fino, el ritmo irregular y el aire de escritura
casual.

**`--firma-escala` vale 1.92, no 1.34.** Allison tiene x/em 0.220 contra 0.316 de
Brittany, o sea que se ve un 30 % más pequeña al mismo cuerpo. Al recalibrar
cuidado: lo que gobierna el tamaño aparente es la altura de x sobre el **em**, no
sobre la mayúscula. Con x/May el ajuste sale al revés —comprobado mirando el
espécimen, la métrica sola se habría equivocado de dirección.

Los `ascent-override` / `descent-override` los mide `scripts/fuentes.mjs` del
binario y los escribe en `src/styles/fuentes.css`. Sin ellos, una script a
`calc(--step-5 * 1.92)` dentro de un `h1` empuja el interlineado.

### Escala

```
--step--2  0.8125rem   versalitas
--step--1  0.9375rem   texto secundario, datos, navegación
--step-0   clamp(1rem, 0.96rem + 0.18vw, 1.0625rem)
--step-1   clamp(1.19rem, 1.12rem + 0.30vw, 1.33rem)
--step-2   clamp(1.41rem, 1.30rem + 0.52vw, 1.66rem)
--step-3   clamp(1.69rem, 1.49rem + 0.85vw, 2.07rem)     h3
--step-4   clamp(2.02rem, 1.71rem + 1.32vw, 2.59rem)     h2
--step-5   clamp(2.54rem, 1.90rem + 2.70vw, 3.88rem)     h1
```

---

## 4. Espaciado, radios y elevación

Múltiplos de 8: `--s-1` 0.5rem … `--s-7` 6rem. `--container: 74rem` ·
`--measure: 66ch`.

**Radios.** El logo es una insignia circular y su O tiene ratio 0.94: el lenguaje
de la marca es curvo. Un radio de 4 px lo contradice.

```
--radius:       10px    tarjetas, campos, imágenes
--radius-chip:  999px   SOLO el CTA principal y los chips
```

El `999px` es **un eco del círculo, no un estilo general**. Si todo es píldora el
eco deja de leerse.

**Manda el borde, no la sombra.** Solo lo que flota de verdad —el diálogo y los
dos botones flotantes— lleva sombra, **y sin borde**: borde nítido más sombra
difusa a la vez da la «tarjeta fantasma». Las sombras van tintadas con
`rgba(41,50,55,…)`, nunca negras. El icono de WhatsApp es la excepción: su
sombra es neutra oscura, porque un objeto verde bajo luz blanca proyecta sombra
gris, no verde.

Quedan tres tokens de sombra y ni uno más: `--sombra-dialogo`,
`--sombra-flotante` y `--sombra-whatsapp`. Hubo un cuarto, `--sombra-menu`,
heredado para un desplegable que esta cabecera decidió no tener; se borró. Un
token muerto no da error, solo hace creer que existe una pieza que no existe.

---

## 4b. Degradados, trama y movimiento

### La regla del degradado

**Un degradado no tiene color computado, así que el barrido del navegador no lo
ve.** Es el único sitio del sistema donde la verificación automática es ciega, y
por eso la regla es más estricta, no más laxa:

> Un degradado puede llevar texto encima **solo si sus dos extremos pasan
> contraste por separado.** Entonces todo punto intermedio pasa, porque la
> luminancia entre dos paradas es monótona.

| token | recorrido | ¿texto encima? |
|---|---|---|
| `--degradado-oscuro` | `--ink-marino` 11.99 → `--ink` 13.08 → `--ink-oscuro` 16.51 | **sí** |
| `--degradado-claro` | `--marca-suave` → `--marca-tenue` → `--base`, los tres fondos ya verificados | **sí** |
| `--degradado-marca` | `--ink` 13.08 → `--marca` **2.20** | **NO.** Solo rellenos ciegos |

`--ink-marino` (`#1E3A47`) existe únicamente para esto: es el **mismo valor** que
`--ink` con el doble de saturación, así que el degradado cambia de color sin
cambiar de contraste. Sigue en 199°, dentro de la banda de la marca.

**El color sólido va siempre debajo.** El atajo `background` deja
`background-color` en transparente: si el degradado no pinta, el texto blanco
queda sobre blanco. Se escriben separados —`background-color` y
`background-image`— y así además el barrido puede medir la superficie.

### La trama

Una retícula de puntos de 1 px cada 22, en `--firma-sobre-oscuro` al 9 %. **No es
grano de papel: es el lenguaje de la propia máquina.** Un iTero no fotografía la
boca, la reconstruye como nube de puntos. Va solo sobre superficies oscuras y
poco densas en texto; el pie la lleva **sin** trama porque ahí empieza a competir.

### El movimiento

**Un solo momento: la firma se escribe.** Allison es una caligrafía, o sea la
letra de una mano, y revelarla de izquierda a derecha con un barrido de
`clip-path` es literalmente lo que hace una mano al firmar. Es el único gesto que
tiene permiso para llamar la atención; todo lo demás sube medio centímetro y se
queda quieto. El mismo gesto se repite en los titulares de sección al entrar en
pantalla — repetir el gesto propio es coherencia; inventar uno distinto en cada
sección es decoración.

Tres reglas que lo sostienen:

- **Las entradas son CSS con `both`, no JavaScript.** Terminan siempre en el
  estado final aunque nada más se ejecute. El reparto por palabras del `h1` es
  una mejora encima, no un requisito.
- **La clase `revelar` la pone el script, nunca el HTML.** Esconder con CSS y
  confiar en que después venga alguien a revelar es como se queda un sitio en
  blanco. Si el script no corre, nadie esconde nada.
- **Una sola curva** (`--ease`) para todo. Varias curvas hacen que las
  animaciones parezcan de objetos distintos.

`prefers-reduced-motion` corta por los dos lados: el `@media` neutraliza las
duraciones y el script sale antes de tocar nada.

---

## 4c. Iconos de especialidad

Cuatro, dibujados a mano sobre rejilla de 24 en `src/lib/iconos.ts`, emitidos
por `Icono.astro` como SVG en línea. **No salen de una librería.** Lucide no
tiene molar, ni bracket, ni arco dental, y sus sustitutos genéricos —una
sonrisa, un escudo pelado, una chispa— son exactamente lo que hace que la
página de una clínica se lea como la de cualquier negocio del barrio.

### Un solo diente, compartido

Tres de los cuatro reutilizan **el mismo path de molar**, escalado y
trasladado. Eso —y no el grosor del trazo— es lo que hace que se lean como un
juego y no como cuatro dibujos sueltos. Es la propiedad que más barata resulta
de mantener y la primera que se pierde si algún día se añade un quinto icono
de otra procedencia.

### Sin relleno y sin color propio

`fill="none"`, `stroke="currentColor"`. Por eso los mismos cuatro archivos
salen en `--marca-text` de acento en la lista, y saldrían en blanco sobre la
franja oscura, sin duplicar nada. **Un icono en mapa de bits no puede hacer
esto**: llevaría el color cocido dentro y haría falta un juego por color y otro
por densidad de pantalla. A eso se suma el peso — unos 180 bytes en línea
frente a unos 10 KB por PNG a 2×, sobre un `dist` de 537 KB.

### El trazo se corrige con el tamaño

`Icono.astro` sube el trazo al bajar el cuerpo: 1.75 por encima de 30 px, 1.9
hasta 30, 2 a 22 o menos. Es la misma corrección óptica que hace una tipografía
entre cuerpo y titular; sin ella el icono se aclara junto al texto a tamaños
pequeños y se engorda a tamaños grandes.

### Se juzgan a 20 px, no a 48

Es la regla que más diseños mató, y todos se veían bien en la hoja grande:

| descartado | por qué |
|---|---|
| funda punteada sobre el diente, para el alineador | preciosa a 48 px; **bajo 32 las rayas se juntan** y queda un borrón |
| cepillo de dientes, en cuatro construcciones | se leyó como lupa, tenedor, enchufe y destornillador. El cabezal redondeado se vuelve círculo al reducir |

De ahí que «higiene y prevención» acabara siendo un **escudo con un diente
dentro**: aguanta los 20 px y además dice *prevención*, que es la mitad del
nombre del servicio. El escudo con un tick, que también aguanta, se descartó
por lo contrario: es el icono de «seguridad» de cualquier sitio web.

### El hueco es deliberado

«Ortodoncia invisible» **no lleva icono**: el arco dental no convenció al
cliente y no se sustituye por un dibujo cualquiera para rellenar. Por eso el
icono va **dentro del `<h2>`** y no en una columna propia — con columna, el
servicio sin icono deja un hueco sangrado que se lee como un fallo de carga; en
línea, ese titular simplemente empieza en el margen.

Por la misma razón los iconos **no están en las tres tarjetas del inicio**: ahí
el servicio sin icono es el primero de la fila, y dos de tres sí se lee como un
error. Entra cuando haya cuatro… o cinco.

`Icono.astro` **falla en la compilación** ante un nombre desconocido. Un icono
inexistente saldría como un hueco silencioso y nadie lo vería hasta que lo
viera el cliente.

---

## 4d. Fotografía

### Dónde está la línea

La regla no es «no se usan fotos de banco». Es más precisa, y la precisión
importa porque de ella depende qué se puede montar hoy y qué hay que esperar:

| tipo de imagen | ¿afirma algo? | ¿se usa? |
|---|---|---|
| consultorio, sala de espera, equipo | «así es nuestra clínica» | **no**, hasta que el cliente mande la suya |
| doctores, personal | «estas son las personas que te atienden» | **no** |
| antes/después, pacientes | «estos son nuestros resultados» | **no**, y además necesita consentimiento |
| primer plano de una sonrisa | habla del tratamiento, no de la sede | **sí** |
| textura, luz, abstracto | nada | **sí** |

Un primer plano anónimo de una sonrisa no le promete a nadie cómo es el local.
Una foto de un quirófano ajeno sí, y eso es lo que estaba prohibido desde el
principio. **La fotografía real sigue pendiente**: `pendientes.json` conserva el
hueco y `verificar` falla si alguien lo borra creyendo que una imagen de banco lo
cierra.

Toda imagen que no sea el logo vive declarada en `src/data/fotos.json` con su
licencia y su enlace de origen. La comprobación 22 de `verificar` falla ante
cualquier `img/` que aparezca en `dist` sin declarar — probada con cebo.

### Contraste sobre una fotografía

Una foto **no tiene color computado que auditar**. Es el agujero de los
degradados (§4b) pero peor: ahí había dos paradas conocidas entre las que
interpolar; aquí cada píxel es distinto y el peor caso es un píxel claro justo
debajo de una letra blanca.

**La regla: el texto nunca toca la foto.** Va sobre un velo de `--ink-oscuro`
con alfa conocido, y el alfa mínimo bajo el texto se elige por el peor caso —la
foto en blanco puro:

| alfa del velo | contraste garantizado con blanco |
|---|---|
| 0.72 | 5.40:1 |
| 0.80 | 6.92:1 |
| 0.90 | 9.55:1 |

La portada usa de 0.94 a 0.80 bajo el texto, así que pasa AA aunque la foto
fuera un rectángulo blanco. Y la sección lleva `background-color: var(--ink-oscuro)`
**aparte** de la imagen: si el `.webp` no carga, el texto cae sobre tinta sólida
y no sobre el blanco del papel.

**El oro no entra en una portada fotográfica.** `--oro-sobre-oscuro` da 4.75:1
contra `--ink` sólido, pero sobre el velo cae a 3.47:1 y no llega. Por eso la
portada no lleva rótulo de sección: no es una omisión, es que el único color que
podría escribirlo no aguanta ese fondo.

Nada de esto se da por bueno calculándolo. `npm run contraste` renderiza la
página, la vuelve a renderizar con el texto **invisible**, lee los píxeles que
quedan justo donde iban las letras y mide contra el más claro. Medido hoy:
**10.82:1** en el peor píxel real.

### Dos variantes de botón que el sistema no tenía

`claro` (blanco sólido, tinta encima) y `contorno-claro` (borde blanco al 55 %).
La única franja oscura que existía antes se resolvía con `marca`, que rellena de
azul; sobre una fotografía ese azul compite con la imagen y el botón deja de
leerse como el control principal.

### El recorte se decide mirando, no confiando

`sharp.strategy.attention` busca la zona de más interés visual. Encuadra de
maravilla un retrato — y por eso es la herramienta equivocada para una portada:
te planta los ojos a pantalla completa. Una portada no necesita el punto más
interesante de la foto, necesita una **composición**: el motivo a un lado y aire
al otro para que entre el titular.

Por eso el encuadre va escrito a mano en `fotos.json`, y **separado por
orientación**: `encuadre` para el apaisado y `encuadreAlto` para el vertical. En
una foto apaisada con la cara a la derecha, el recorte vertical hay que tirarlo
del este o sale un primer plano del pelo.

Y una foto vertical (0.67) no da portada apaisada: el recorte a 1600×1000 toma
una franja del 42 % y sale un macro de una boca, mire donde mire la gravedad.
Se comprueba con `aspecto = ancho/alto` antes de elegirla, no montando la página.

En móvil la portada **no ocupa la pantalla entera**: a 390×750 `cover` vuelve a
ampliar hasta dejar un macro borroso. A 34 rem la caja tiene casi el mismo
aspecto que el recorte vertical (0.72 contra 0.70) y la foto entra sin recortar.

### Capturar una página con animaciones de entrada

Las palabras del titular entran animadas. En una captura headless la animación
puede no haber terminado, **faltan palabras en la imagen y parece un fallo de
maquetación**. Pasó, y costó una vuelta entera. Para medir se neutraliza:

```css
*,*::before,*::after{animation:none!important;transition:none!important;opacity:1!important}
```

---

## 5. Cómo se verifica

```bash
npm run tokens      # la paleta en abstracto — FALLOS=0
npm run build
npm run verificar   # dist/ — 21 comprobaciones, cero dependencias
npm run captura     # capturas con Chrome headless
```

`verificar.mjs` hereda las nueve comprobaciones del sitio hermano (rutas
absolutas, enlaces rotos, recursos, metadatos, jerarquía de encabezados, icono de
WhatsApp, scripts externos, `alt`, peso) y añade doce propias: `--marca` nunca
como texto, hex literal en vez de token, rastro de CDN, número real, aviso de
dirección pendiente, **el mapa no afirma más de lo que se sabe**, coherencia de
fuentes, CSS hostil a `file://`, cero hojas externas, nada inventado, que cada
`Marcador` de `dist` cuadre con una entrada de `pendientes.json`, y **cero
voseo**.

**El sitio trata de tú, no de vos.** Decisión del cliente. Honduras vosea, así
que la forma sale sola al escribir y ya se había colado en nueve sitios,
conviviendo con el tuteo en la misma frase («Escribinos y **te** confirman»). La
comprobación busca la lista explícita de formas voseantes —no un patrón genérico
de vocal acentuada, que marcaría «estás», «más» o «además»— y falla la
compilación.

### El barrido de contraste necesita navegador

Va aparte, sobre lo **renderizado**, no sobre la paleta en abstracto. Estado
actual, con el diálogo abierto en contacto:

| página | elementos | fallos |
|---|---|---|
| index | 72 | 0 |
| servicios | 54 | 0 |
| invisalign | 56 | 0 |
| preguntas | 57 | 0 |
| contacto + diálogo | 112 | 0 |
| 404 | 34 | 0 |

Los diez «fallos» que salen en contacto con el diálogo abierto son los nueve días
inhabilitados del calendario y el botón de enviar antes de elegir día: todos
`disabled`, todos la exención de WCAG 1.4.3. El barrido tiene que filtrarlos, o
denuncia como error justo la señal de que un control no se puede usar.

### El panel del navegador no sirve para juzgar tipografía

Renderiza las páginas locales como instantáneas `data:`, y bajo un `data:` URL
las rutas relativas de las fuentes no resuelven: se ve todo con las caras de
reserva y parece que la tipografía está mal puesta. **Sirve para color computado;
no para ver.** Para ver, `npm run captura`, que usa Chrome headless.

Dos trampas de esa captura, las dos ya sufridas:

- **`--screenshot` resuelve contra el directorio de Chrome, no contra el tuyo.**
  Con ruta relativa falla y **devuelve código de salida 0**, así que parece que
  ha funcionado. Ruta absoluta siempre.
- **La ruta del proyecto lleva un espacio** (`CIMO Draft`). Hay que codificarlo
  como `%20` o Chrome corta la URL ahí y abre una página en blanco sin avisar.

En Windows, Chrome no reduce la ventana por debajo de ~500 px: `--window-size=375`
da una captura recortada que **parece** desborde y no lo es. Para anchos de móvil
se mide `scrollWidth` contra `innerWidth`. Estado actual: 345 contra 360 en las
seis páginas, sin desbordamiento.

---

## 6. Restricciones que no son de estilo pero mandan sobre él

- **El sitio abre desde `file://` con doble clic.** Cero rutas absolutas, cero
  scripts externos, cero fuentes de CDN. Es lo que lo hace demostrable delante
  del cliente sin depender de su wifi.
- **`astro.config.mjs` se hereda literal.** Sus tres ajustes
  (`inlineStylesheets: 'always'`, `format: 'file'`, y el `assetsInlineLimit` que
  devuelve `true` para `.js`) vienen de un fallo real en el sitio hermano: el
  script del calendario superó los 4 KB por defecto de Vite y las páginas
  empezaron a pedir `/_astro/*.js` con ruta absoluta, **sin ningún error
  visible**. No se «limpia».
- **Un `<script>` de Astro que importe de otro módulo deja de incrustarse.** Por
  eso `AgendarCita.astro` precalcula los tramos horarios en el frontmatter y los
  pasa por un `data-` atributo en vez de importar la librería en cliente.
- **`mask-image` no funciona bajo `file://`.** Cada archivo es un origen opaco, la
  máscara se bloquea y **el elemento desaparece entero, sin error en consola**.
  Lo mismo vale para `<use href>` a otro archivo, `canvas` con `drawImage` y
  `feImage`. `verificar.mjs` los falla.
- **El icono de WhatsApp es un icono flotante, nunca un botón**, y es la única
  entrada a WhatsApp aparte del envío del diálogo. La excepción son los enlaces
  de contacto explícitos, que se marcan con `data-wa-contacto` para que el
  verificador sepa que son deliberados.
- **Nada inventado**: ni reseñas, ni precios, ni fotos, ni nombres de
  especialistas, ni coordenadas. Lo que no se sabe se marca con `Marcador` y se
  declara en `pendientes.json`.
- **El mapa no puede afirmar más de lo que se sabe.** Es la versión afinada de la
  regla anterior, que prohibía el mapa entero mientras `coordenadas` fuese
  `null`. Prohibía de más: lo que no se sabe no es *dónde dice la clínica que
  está* —eso lo publicó ella— sino si sigue ahí después de la mudanza. Así que el
  embebido consulta a Google **por la dirección publicada**, que no afirma nada
  que CIMO no haya dicho; unas coordenadas escritas a mano sí lo harían, porque
  afirman una precisión que nadie ha comprobado. `verificar.mjs` falla ante un
  par lat/lng sin `coordenadas` confirmadas, y falla también si el aviso de
  mudanza no está en la misma página que el mapa.
- **Bajo `file://` no hay red, y el mapa lo asume.** El respaldo —dirección y
  enlace a Google Maps— se dibuja siempre debajo del iframe. Si el mapa carga, lo
  tapa; si no, el visitante lee la dirección en vez de mirar un rectángulo gris.
  Sin una línea de JavaScript. Es exactamente el caso de la demo en USB.

---

## 7. Arquitectura

Seis pantallas del prototipo → **cinco páginas**, porque con una sola sede una
página «Ubicaciones» aparte se queda en nada:

```
index.html       portada, cinco servicios, franja de Invisalign
servicios.html   los cinco con anclas #slug
invisalign.html  página propia — 4 de 12 posts recientes lo promocionan
preguntas.html   6 respondidas + 5 listadas sin responder
contacto.html    dirección, horario, vías de contacto, diálogo de cita
404.html
```

**Disparador para partir contacto:** cuando entre la sede de La Entrada, Copán.
Ahí sí hay dos direcciones y dos mapas, y `ubicaciones.html` se justifica sola.
`clinica.json` ya tiene `sedes[]` como array de una entrada para que eso sea
añadir un elemento y no migrar un esquema.

**El estado de React se eliminó, no se emuló:** las vistas son páginas, el
acordeón es `<details name="faq">`, los chips de filtro pasaron a ser anclas
(con cinco servicios visibles a la vez, un filtro es un control que parece hacer
algo y no hace nada), y la fecha de la cita vive en el script del diálogo.

**El diálogo pide día, no hora**, y dice «solicitar», nunca «reservar». El sitio
no conoce la agenda de la clínica; un calendario que deja elegir las 3:15 promete
algo que nadie puede cumplir.

---

## 8. Pendiente del cliente

- [ ] **Confirmar la dirección** tras la mudanza anunciada en mayo de 2026. Es lo
      más urgente: el trabajo principal del sitio es que la gente llegue. Mientras
      tanto **sí hay mapa**, pero consultando a Google por la dirección publicada
      en vez de por coordenadas, y con el aviso de mudanza al lado. Ver §6.
- [ ] **Logo vectorial.** Solo hay 150 × 150 px. El wordmark se compone en tipo;
      el símbolo circular no.
- [ ] **Fotografía propia** de la clínica y del equipo.
- [ ] **Nómina de especialistas** — solo consta la Dra. Marta Muñoz.
- [ ] **Consentimiento por escrito** para los casos antes/después.
- [ ] **¿Existe el brazo médico?** El nombre lo dice, el contenido público no.
- [ ] **Precios o financiamiento, y seguros aceptados.**
- [ ] **Dominio.** No hay ninguno registrado; se usa `cimo.hn` provisionalmente.
- [ ] **Texto completo de la presentación** — la intro de su Facebook llega truncada.

La lista viva está en `src/data/pendientes.json`, y `verificar.mjs` comprueba que
cada `Marcador` del sitio corresponde a una entrada suya.

---

## 9. Errores de este proyecto que conviene no repetir

### `::details-content` rompio el acordeon en silencio

Animar un `<details>` sin JavaScript se puede —`::details-content` mas
`interpolate-size: allow-keywords`— y es la via elegante. Aqui **dejo las
respuestas recortadas a cero**: el acordeon abria y no se veia nada.

Lo grave no es el fallo, es que *nada lo delataba*: compilaba, `verificar` salia
en verde y la pagina se veia normal hasta que alguien pulsaba. Solo aparecio
midiendo la caja del `<details>` en el navegador — 187 px con la transicion
quitada, 109 px con ella puesta.

Se hace con un script que anima la altura y toma el control del toggle. Sin
JavaScript, o con `prefers-reduced-motion`, `<details>` hace lo suyo de siempre.
**No se reintenta la via CSS sin esa medicion delante.**

### El navegador congela las animaciones cuando el panel esta oculto

Medir una animacion con el panel en segundo plano da siempre el mismo resultado:
que no anima. No es la animacion, es que `document.visibilityState` es `hidden`
y el compositor no avanza. Se comprueba que la animacion EXISTE —duracion,
curva, fotogramas, `playState`— en vez de cronometrar sus alturas.

### Dos recortes encadenados se comen el encuadre

Una imagen generada a 1600x1000 (1.60) y mostrada en una caja de 1.82 la recorta
**otra vez**, y las dos ampliaciones se multiplican: en la portada desaparecio el
cielo entero de la foto. El asset se genera al aspecto al que se va a mostrar
—1600x900— para que a `cover` casi no le quede nada que hacer.

### La firma se partia solo en movil

`display: inline-block` en el `<em>` del titular: asi la frase en script cae
ENTERA a la linea siguiente en vez de romperse por un espacio. En escritorio no
pasaba, asi que mirar una sola anchura no basta. §3 lo pedia desde el principio;
faltaba la linea que lo hace cumplir.

### Un JPEG en escala de grises se decodifica a TRES canales

Los iconos de especialidad se generan usando el brillo de la lamina como canal
alfa. La mascara se sacaba en dos pasos —codificar el recorte en gris a un
buffer, volver a abrirlo y pedirle `raw()`—, y se le declaraba a `joinChannel`
un solo canal. Pero sharp decodifica un JPEG gris a sRGB de tres canales, asi
que el buffer venia tres veces mas largo y el alfa se leia con el paso
equivocado: los cinco iconos salieron como rayas horizontales.

Se pide `raw()` al final de la MISMA cadena, sin buffer codificado en medio, y
se comprueba `info.channels === 1` antes de seguir. La forma del fallo —rayas
horizontales regulares— es la firma clasica de un desajuste de stride, y
conviene reconocerla: no es un problema de color ni de la curva, es que se esta
leyendo la memoria mal.

### `window.open` con `noopener` devuelve null aunque abra

El diagnostico de «se bloqueo la emergente» del dialogo de cita era
`const abierta = window.open(url, '_blank', 'noopener')`. Con `noopener` en las
opciones **la especificacion obliga a devolver null**, se haya abierto la
ventana o no. La comprobacion no detectaba nada: daba fallo SIEMPRE. WhatsApp
abria con el mensaje ya escrito y el dialogo respondia «No se pudo abrir
WhatsApp», justo en el momento en que el visitante acababa de pedir su cita.

Se abre en blanco —eso si devuelve la ventana—, se corta el `opener` a mano y
solo entonces se carga la url. Se conservan las dos cosas: saber de verdad si el
navegador bloqueo la emergente, y no filtrar el opener.

**Lo que enseña el caso**, mas alla de la API: el comentario que acompanaba a
esa linea decia «COMPROBADO, no supuesto». Y era cierto a medias — se habia
comprobado el caso del bloqueo, no el del exito. Una comprobacion que solo se
prueba por el lado que falla no distingue nada. Hay que ejercitar **las dos
ramas**, o el codigo esta afirmando algo que nadie midio.


**Medir contra menos fondos de los que hay.** Es la lección del sistema hermano,
que allí costó dos fallos con año y medio entre medias. Aquí volvió a pasar dos
veces:

1. `--ink-faint` salió a `#687D87`: 4.31 sobre blanco pero **3.96 sobre
   `--surface`**. Corregido durante la construcción.
2. Con tres fondos ya en el conjunto, el barrido del navegador encontró un botón
   a **4.42:1** dentro de una tarjeta `--marca-suave`. Ese cuarto fondo claro no
   estaba en la lista. `--marca-text` y `--ink-faint` se oscurecieron a `#2A6D8F`
   y `#586973`, y ahora el conjunto son cuatro.

**El corolario sigue vigente:** el script de tokens ordena, pero solo el barrido
sobre lo renderizado ve dónde aterriza de verdad cada color. Hay que ejecutarlo,
no solo tenerlo escrito.

**Ponerle `display` a un elemento que el navegador oculta por estado.** La peor
de esta tanda, y cayó dos veces seguidas en el mismo archivo. Al convertir el
diálogo en columna flexible para anclar sus botones:

```css
.dialogo { display: flex }   /* gana a  dialog:not([open]) { display:none } */
.paso    { display: flex }   /* gana a  [hidden]           { display:none } */
```

Una regla de autor gana **siempre** a la hoja del navegador, pase lo que pase con
la especificidad. Resultado: el paso «enviado» ocupaba media ventana y empujaba
el botón de enviar al centro, y —mucho peor— **el diálogo entero se pintaba
abierto al final de las seis páginas**. Compilaba. `verificar` salía en verde.
Se vio mirando una captura. Cada vez que se le pone `display` a algo que el
navegador oculta por estado hay que devolver la ocultación a mano:

```css
.dialogo:not([open]) { display: none }
.paso[hidden]        { display: none }
```

Es la misma lección que la del `:global()`: **el compilador no sabe lo que
querías, y el verificador solo comprueba lo que se le enseñó a comprobar. Mirar
la página renderizada no es opcional.**

**Una red de seguridad que apaga la función que protege.** El revelado al
desplazar llevaba un temporizador: a los tres segundos quitaba la clase
`revelar` «por si acaso». Efecto real: quien se queda leyendo la portada diez
segundos ya no veía animarse ninguna sección. La red no protegía de nada —el
guardia de arriba ya garantizaba que sin JavaScript no se esconde nada— y
desactivaba el efecto entero. **Antes de añadir una salvaguarda hay que
preguntarse de qué protege exactamente y qué rompe mientras tanto.**

**`IntersectionObserver` no avisa de lo que nunca intersecó.** Solo notifica
CAMBIOS de estado. Una sección que pasa de estar debajo de la ventana a estar
encima —un enlace a un ancla, la tecla Fin, una rueda rápida— nunca llega a
intersecar: los dos estados son «fuera», no hay cambio, no hay aviso, y la
sección se quedaba a opacidad 0 **para siempre**. Con tres elementos por página,
medir la posición en cada fotograma de desplazamiento cuesta nada y no tiene ese
punto ciego. Se descubrió probando el salto al final, no leyendo el código.

**Traerse un componente del sitio hermano con su marca puesta.**
`SubirArriba.astro` llegaba con `box-shadow: … rgba(18, 41, 74, …)`. Ese
`#12294A` es el azul marino de DentCo: durante meses el botón flotante de CIMO
proyectó la sombra de otra clínica. No lo cazó ninguna revisión de color, porque
el hex vivía dentro de un `rgba()` en un componente y ningún token lo declaraba.
Ahora es `--sombra-flotante`, con la tinta de CIMO. Y de paso llevaba borde de
1 px **y** sombra ancha a la vez, que es exactamente la «tarjeta fantasma» que
§4 prohíbe: al copiar un componente hay que releerlo contra las reglas propias,
no solo comprobar que compila.

**`:global()` tiene que empezar en el último elemento de la plantilla.** El
calendario crea celdas *y* botones con `createElement`, así que ninguno recibe el
atributo de encapsulado de Astro. `.cal td :global(button)` compila a
`td[data-astro-cid-X] button`, y ese `td` no existe: la regla no aplica y salen
botones con el estilo por defecto del navegador —`2px outset` negro— sin que nada
se queje. Lo correcto es `.cal table :global(td button)`, porque `<table>` sí está
en la plantilla. **Lo cazó mirar la captura, no el verificador.**

**Elegir tipografía por el nombre.** La métrica ordenó bien las seis candidatas a
firma, pero el ajuste de escala salió al revés hasta que se miró el espécimen: se
había usado x/mayúscula donde gobierna x/em.

**Repetir un hex en vez de usar el token.** `#1FB857`, el hover de WhatsApp,
estaba escrito a mano en dos archivos. No daba error: simplemente eran dos copias
que al cambiar una se habrían separado. Ahora es `--whatsapp-oscuro`.

---

## Anexos

| archivo | qué es |
|---|---|
| `research/brief-cimo.md` | la investigación: contacto, servicios, oportunidades |
| `research/tokens.js` | genera y verifica los tokens. `npm run tokens` |
| `scripts/verificar.mjs` | audita `dist/`. `npm run verificar` |
| `scripts/fuentes.mjs` | prepara los `.woff2` y escribe `fuentes.css` |
| `scripts/comparar-firma.mjs` | la comparación que eligió Allison |
| `scripts/captura.mjs` | capturas con Chrome headless |
| `src/data/pendientes.json` | los huecos declarados, en datos y no en prosa |

---

## Apéndice — componentes que se retiraron del andamiaje

Del sitio hermano se copiaron cinco componentes que al final no se usan, y se
borraron en vez de dejarlos: **leen `clinica.json` con el esquema de DentCo (una
`direccion` suelta, no `sedes[]`), así que importarlos hoy rompe la
compilación.** Dejar código muerto que además no compila es peor que no tenerlo:
alguien lo importa creyendo que funciona.

| componente | estado | nota |
|---|---|---|
| `MapaMarco` | **vuelto**, reescrito | ver §6: consulta por dirección, no por coordenadas |
| `AccionesMapa` | **vuelto**, reescrito | «Cómo llegar» va en `--ink`, no en oro: el oro tiene un solo papel |
| `EstadoApertura` | **vuelto** como `BarraHorario` | el cliente pidió el indicador en vivo; es la barra de arriba |
| `Acordeon` | no se usa | las preguntas usan `<details name="faq">` nativo, que aporta teclado y lector de pantalla gratis |
| `Imagen` | no se usa | todavía no hay ninguna fotografía |

Los tres que volvieron **no se copiaron**: se reescribieron contra `sedes[]` y
contra los tokens de CIMO. Lo que se heredó del sitio hermano es la *decisión* —el
respaldo dibujado siempre debajo del iframe, el menú nativo de compartir— no el
archivo.

Se recuperan de `C:\Users\Darwin\Dentco\src\components\` y se adaptan a
`sedes[]`.

### Un token a 4.75:1 no puede llevar NADA encima

Al meter la trama de figuras en la banda oscura, el calculo de alfa maxima
devolvio **0**. No era un fallo del calculo: es que `--oro-sobre-oscuro` da
4.75:1 sobre `--ink` y `--marca-sobre-oscuro` 4.81:1, o sea que estan a 0.0045 y
0.0064 de luminancia del suelo de 4.5. **Cualquier textura que se vea los
tumba.** La alfa maxima que los respetaria es 0.02, que es invisible.

La leccion no es sobre tramas. Es que un token aprobado por los pelos deja de
ser un color y pasa a ser una **restriccion sobre todo lo que puede haber detras
de el**: ni degradado, ni textura, ni foto, ni un tinte del 3 %. Cuando se
aprueba un color a 4.7 hay que anotar que su fondo queda congelado.

Aqui se resolvio tapando, no bajando: `--velo-trama` cubre con `--ink` solido la
columna donde va el texto, asi que debajo de las letras el fondo es exactamente
el color contra el que se midio el token. Es **mas estricto** que lo que ya
habia: `--trama-puntos` si corre por debajo del rotulo de oro en `.promesa`.

### Una lamina de figuras se mide, no se estira

Haikei entrega PNG de 500x333. Puestos de fondo en una banda de 1400 px, el
trazo de 2 px se convierte en 5,6 px borrosos y la textura se lee como un fondo
pixelado. Lo que se hace es **recuperar la geometria**: ajuste algebraico de
circunferencia (Kasa) sobre cada componente conexo, que devuelve centro y radio
con un residuo de 0.50 px — el error de cuantizacion de una curva rasterizada, o
sea ajuste exacto. Luego se reescribe como SVG incrustado: 1,4 KB, nitido a
cualquier ancho, cero peticiones.

Dos detalles que hacen que funcione:

- **El ajuste algebraico acepta arcos parciales.** Las figuras que el borde
  corta conservan su centro verdadero, aunque caiga fuera del lienzo. Con la
  caja envolvente saldrian descentradas.
- **Por eso el mosaico puede cerrarse.** Cada figura se dibuja tambien desplazada
  ±ancho y ±alto, asi que la que se sale por la derecha vuelve a entrar por la
  izquierda. El recorte de Haikei deja de ser un corte y pasa a ser continuidad,
  y la trama repite sin costura a cualquier anchura.

El residuo tambien **clasifica la figura**: ajustar un hexagono como
circunferencia da un residuo que crece con el radio (0.98 px), y un circulo de
verdad se queda plano en 0.50. Sirve para detectar que se esta mirando antes de
elegir el ajuste bueno.
