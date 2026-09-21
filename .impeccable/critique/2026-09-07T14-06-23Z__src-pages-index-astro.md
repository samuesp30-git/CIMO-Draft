---
target: src/pages/index.astro
total_score: 26
max_score: 36
na_heuristics: 7
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\Darwin\\CIMO Draft\\src\\pages\\index.astro"
target_fingerprint: "sha256:a267fd0bc702020c23a91e4dd06bb53bb2e4d4d2b69eec262cc7bbda392948ff"
target_path: "C:\\Users\\Darwin\\CIMO Draft\\src\\pages\\index.astro"
timestamp: 2026-09-07T14-06-23Z
slug: src-pages-index-astro
---
Método: dual-agente (A: revisión de diseño · B: evidencia mecánica), en subagentes aislados y en paralelo.

**Salvedad de anclaje:** la evaluación A corrió limpia — contexto nuevo, con prohibición explícita de ejecutar cualquier detector. Pero el contexto padre (yo) ya había visto la salida del detector antes de empezar la crítica, porque el enrutado del menú sin argumento me la hizo correr. Mi síntesis no está del todo virgen. La evaluación A sí.

---

## Puntuación de salud del diseño

Superficie: **Persuade** (el visitante decide si confía en esta clínica y le escribe).

| # | Heurística | Puntos | Problema principal |
|---|---|---|---|
| 1 | Visibilidad del estado | 3 | La barra de abierto/cerrado y `aria-current` son excelentes. Pero elegir día actualiza un `<p>` sin `role="status"`, y el panel «Listo» afirma «Se abrió WhatsApp» sin haber comprobado que `window.open` devolviera algo. |
| 2 | Correspondencia con el mundo real | 3 | «Solicitar» y no «reservar»; «la hora la confirma la clínica»; horas como «9 a. m. — 7 p. m.». Genuinamente fluido. Se rompe en el peor sitio: el rótulo del diferenciador es `INVISALIGN · ITERO 5D PLUS`, jerga de proveedor que la página nunca traduce. |
| 3 | Control y libertad | 3 | X, Cancelar y Esc funcionan. No hay cierre al pulsar el fondo, y la flecha de mes borra el día elegido en silencio y vuelve a inhabilitar el envío. |
| 4 | Consistencia y estándares | 3 | La disciplina de tokens es real. Dos tratamientos para la misma acción en una pantalla: `Boton variante="texto"` («Ver servicios →») y un enlace subrayado pelado («Ver los cinco servicios»). Los rótulos del pie son `<h2>`, el mismo nivel que los títulos de sección. |
| 5 | Prevención de errores | 3 | Lo mejor de la construcción: días pasados, domingos, hoy-después-de-cerrar y más de tres meses, todos inhabilitados; el envío exige día elegido. Un hueco barato: el campo de nombre no tiene restricción, así que en blanco manda «Nombre: Sin nombre». |
| 6 | Reconocer antes que recordar | 3 | Cinco enlaces visibles, sin hamburguesa. A 375 px «Contacto» queda cortado 31 px dentro de un desplazamiento horizontal sin señalar, y el diálogo no muestra el horario mientras eliges día. |
| 7 | Flexibilidad y eficiencia | n/a | Un folleto de cinco páginas con una única conversión no tiene tarea repetida que acelerar. |
| 8 | Diseño estético y minimalista | 3 | Limpio, generoso, un acento con un solo trabajo. Descuenta que el objeto más grande sobre el pliegue sea un rectángulo punteado vacío, y que una franja blanca de 64 px separe la banda oscura de Invisalign del pie oscuro. |
| 9 | Recuperación de errores | 3 | «No se pudo copiar. La dirección está aquí al lado.» es un mensaje de error modélico. Pero el titular «Listo» afirma un éxito que no comprobó, y no hay forma de reintentar el envío. |
| 10 | Ayuda y documentación | 2 | `preguntas.html` existe con 6 respuestas y está en la navegación, pero el inicio no asoma ni una sola pregunta en el momento de decidir, y la única ayuda contextual del diálogo es una línea. |
| **Total** | | **26 / 36** | **72 % — Bien**, en el borde bajo de la banda. |

---

## Veredicto de especificidad

**Evaluación sin anclaje (A):** la capa de marca está autorada; la capa de producto no.

La paleta es un solo tono medido (200°) sacado del logo, los neutros llevan tinte 201° para que ningún gris salga sucio, el titular parte en dos voces con Allison de firma, y el oro está racionado a un solo trabajo. A eso no se llega por accidente y ninguna plantilla lo trae. Pero eso es identidad, no categoría: un despacho de abogados o un fisioterapeuta podrían vestir la misma construcción de titular sin cambiar nada.

Lo que sí está autorado *para un negocio local* —no para odontología— es la barra viva «Abierto ahora · cierra a las 7 p. m.» calculada en `America/Tegucigalpa`, el diálogo que pide **día** y dice **«solicitar»**, y el aviso «Confirma antes de venir» soldado al mapa. Honesto, específico y raro. Cambia «odontología» por «fisioterapia» y los tres siguen funcionando igual.

Lo que es *dental* en esta página es exactamente una frase —«Mira cómo va a quedar tu sonrisa»— y la composición la trata como lo menos importante: penúltima banda, una línea de titular más «El escáner llegó a la clínica en julio de 2026», sin imagen, sin diagrama, sin mecanismo. Mientras tanto la composición es la plantilla por defecto del negocio local: héroe 1.1fr/0.9fr con texto a la izquierda e imagen a la derecha, tres tarjetas iguales en fila, dos columnas de horario y mapa, banda oscura de CTA, pie de cuatro columnas. Nada en esa disposición sabe qué es una boca.

Y el objeto más grande de la primera pantalla es un rectángulo punteado de 340 px que dice `FOTOGRAFÍA DE PORTADA PENDIENTE DEL CLIENTE`. La ausencia de foto es culpa del cliente; **maquetar un rectángulo vacío de 340 px y parar ahí es culpa del diseño.** La historia del iTero en tres pasos no necesita ningún material del cliente y ya está en `clinica.json → tecnologia`.

**Veredicto: parcialmente autorado.** Sistema de marca distintivo, composición intercambiable de categoría, y el diferenciador enterrado en la banda más callada de la página.

**Barrido determinista (B):** el detector corrió **sin banner de degradado** esta vez (antes de actualizar sí lo daba y por eso los 8 hallazgos que vi al principio eran un recuento por lo bajo). Sobre `dist/`: **33 hallazgos, 8 reglas distintas**, código de salida 2. Sobre `src/`: 1.

| Regla | Nº | Lectura |
|---|---|---|
| `low-contrast` | 6 | **Falso positivo, confirmado.** Los seis son `#6e7c83` sobre `#f1f6f9`, o sea `--desactivado`. Rastreado a tres selectores, los tres `:disabled`. Exención WCAG 1.4.3, deliberada y documentada. |
| `hero-eyebrow-chip` | 6 | Real y a la vez es el sistema. Ver más abajo. |
| `undersized-ui-text` | 6 | **Real.** Texto de 9 px, uno por página. |
| `gpt-thin-border-wide-shadow` | 6 | **Falso positivo**, pero destapa algo. Ver más abajo. |
| `cramped-padding` | 3 | Probable falso positivo: el `padding-block` vive en `.contenedor`, no en la `<section>`. |
| `side-tab` | 2 | Real como patrón; deliberado como decisión. |
| `all-caps-body` | 2 | Los rótulos dorados en versalitas. |
| `flat-type-hierarchy` | 2 | **Real, y coincide con A por otro camino.** Ver más abajo. |

**Superposición en el navegador:** la inyección funcionó. Servidor en el 8400, `detect.js` inyectado en inicio, contacto e invisalign, consola leída, servidor parado y puerto liberado. Reglas vivas adicionales: `kicker-above-heading` (×3 en inicio), `ai-color-palette` («cian neón sobre fondo oscuro» — a mi juicio falso positivo: `#7EC3E6` es un azul cielo suave, no neón) y `body-text-viewport-edge`.

**Nota honesta:** la superposición ya no está visible en tu navegador. El agente paró el servidor al terminar, como manda el procedimiento.

---

## Impresión general

El sitio no está mal hecho. Está **bien construido y tímidamente compuesto**, y el diagnóstico interesante no es ningún defecto suelto: es que la disciplina se gastó entera en la capa que no se ve —medir el color, verificar el contraste, honrar `file://`, no inventar nada— y no llegó a la capa que decide. Cero fallos de contraste en seis páginas y en el diálogo abierto. Cero desbordamiento a 360 px. Un solo `h1` por página, sin saltos de nivel. Ni un `img` sin `alt`. Movimiento reducido cubierto con `!important` sobre el selector universal. Eso es un suelo que la mayoría de los sitios no alcanza.

Y encima de ese suelo, la primera pantalla dedica el 45 % a un rectángulo punteado que anuncia que el negocio no está terminado, mientras lo único que ninguna clínica de Tegucigalpa puede copiar —una máquina que te enseña tu sonrisa antes de empezar— espera en la penúltima banda, sin imagen, bajo un rótulo escrito en el idioma comercial de Align Technology.

**La oportunidad más grande, en una frase: intercambiar los trabajos del rectángulo vacío y de la banda de Invisalign.** No necesita nada del cliente.

---

## Lo que funciona

1. **La barra de horario en vivo.** Contesta la pregunta más frecuente de un visitante antes de que la formule, calcula en la zona de la clínica y no en la del visitante —correcto: quieres saber si CIMO está abierta, no si lo estaría en tu ciudad— y su estado sin JavaScript es el horario completo, que es cierto a cualquier hora. Un sitio estático que hubiera fijado «Abierto ahora» en la compilación estaría mintiendo la mayor parte del día. La decisión de **no** hacerla pegajosa es igual de buena: cobra sus píxeles una vez y se aparta.

2. **El diálogo pide día, no hora, y nunca dice «reservar».** Alinea lo que la interfaz promete con lo que una clínica sin sistema de reservas puede cumplir. Un selector de franjas horarias aquí fabrica una ausencia y quema la relación en la primera visita. Muy pocos sitios de folleto tienen la disciplina de prometer de menos justo en su punto de conversión.

3. **El respaldo del mapa, dibujado permanentemente *debajo* del iframe.** Sin red —USB, iframe de terceros bloqueado— el visitante lee una dirección real y tiene un enlace que funciona, en vez de un rectángulo gris. Cero JavaScript, cero parpadeo. Es el caso raro de un estado de error mejor diseñado que el camino feliz.

---

## Problemas prioritarios

### [P1] El botón de enviar del diálogo queda fuera de pantalla en móvil, sin ninguna señal de que hay que desplazar

**Verificado por mí, no solo reportado.** A 375 × 812: el diálogo mide 774 px de alto y su contenido 922 — 148 px por debajo del borde. `[data-enviar]` («Solicitar por WhatsApp») empieza en 805 y el diálogo acaba en 793. **Invisible.**

*Por qué importa:* esta audiencia llega de Instagram, o sea que llega en teléfono. En el momento de máxima intención el visitante ve un modal hecho solo de campos y ningún control para terminar. La línea «Día elegido» sobrevive por 35 px, así que técnicamente ve que su toque hizo algo — pero no ve cómo enviarlo. Cierra. En la práctica se comporta como P0 para cualquiera con un teléfono.

*Matiz que corrijo de la evaluación A:* el diálogo **sí** tiene `overflow-y: auto`, así que se puede desplazar. No está atrapado. Lo que falta es la señal de que hay que hacerlo, y que el botón esté siempre a la vista.

*Arreglo:* `.dialogo` a `display:flex; flex-direction:column; max-height:90dvh`, el desplazamiento sobre la región `[data-paso="formulario"]`, y `.acciones` fijada abajo con `position:sticky; bottom:0; background:var(--base); box-shadow:0 -1px 0 var(--line)`. Mover `<p class="elegido">` dentro de esa región fija, para que el día elegido y el botón que lo envía estén siempre juntos en pantalla.

*Comando:* `$impeccable adapt`

### [P1] El diferenciador es una banda de texto; el héroe es un 45 % de rectángulo vacío

*Por qué importa:* el iTero 5D Plus enseñando la sonrisa terminada antes de empezar es lo único que ningún competidor de Tegucigalpa puede copiar, y se entrega como un titular más «El escáner llegó a la clínica en julio de 2026» — un *cuándo*, no un *qué* ni un *por qué*. Mientras tanto el objeto dominante de la primera pantalla anuncia un negocio sin terminar.

*Arreglo:* intercambiar sus trabajos. Sustituir el `<Marcador alto={340}>` de la columna derecha del héroe por un panel tipográfico de tres pasos sobre `--marca-suave`, dentro del mismo radio de 10 px: *Escaneo → Simulación → Tu sonrisa antes de empezar*, en `--font-datos` con las cifras en `--marca-text`. Todas las palabras existen ya en `clinica.json → tecnologia`: no inventa nada, no necesita material del cliente y no viola ninguna regla de §6. La banda `.franja` se queda con el CTA que ya tiene.

*Comando:* `$impeccable bolder`

### [P1] El CTA de cabecera mide 33 px de alto y «Contacto» queda cortado a 375 px

Las dos evaluaciones coinciden aquí de forma independiente. B midió a 375 px: `button.btn.cta` «Agendar cita» a **115 × 33**; enlaces de navegación a **38** de alto; la fila de navegación desplaza 358 px dentro de 327 visibles, o sea que «Contacto» —la página cuyo trabajo entero es convertir— queda cortada 31 px sin degradado, flecha ni nada que diga que la fila se mueve.

*Precisión que debo hacer, porque B midió contra el criterio equivocado:* los 44 px son WCAG 2.5.5, que es **AAA**. El criterio AA es 2.5.8, que pide **24 px**. Contra AA, el CTA de 33 px y la navegación de 38 px **pasan**; los enlaces del pie a 23 px de alto se quedan a un pelo por debajo. Así que esto no es un incumplimiento AA salvo en el pie. Sigue siendo un problema de diseño: el control más importante del sitio, por debajo del mínimo cómodo para un pulgar y colocado en la parte más alta de la pantalla, que es donde peor llega.

*Arreglo:* `min-height:2.75rem` en `.btn.sm`, `padding-block:var(--s-2)` en `.nav a`. Para la navegación, quitar el `overflow-x:auto` por debajo de 60rem y dejar que los cinco enlaces envuelvan a dos filas (3+2 caben a 375 px). Si se conserva la fila única, un `::after` en el borde derecho con `linear-gradient` — que sí funciona bajo `file://`, al contrario que `mask-image`.

*Comando:* `$impeccable adapt`

### [P2] Peticiones anónimas, y un éxito afirmado sin comprobar

Dos fallos en la carga útil de la conversión, o sea justo donde más caro sale:

- El campo de nombre no tiene restricción: en blanco, el mensaje sale como `Nombre: Sin nombre` y la clínica recibe una petición de cita que no puede atribuir a nadie.
- Si el navegador bloquea la ventana emergente —por defecto en Safari de iOS para mucha gente—, `window.open` devuelve `null` y la interfaz **cambia igualmente al panel «Listo — Se abrió WhatsApp con tu solicitud escrita»**. Afirma un éxito que nunca comprobó. La frase de respaldo la rescata; el titular es falso.
- El párrafo `[data-elegido]` no tiene `role="status"`, así que quien usa lector de pantalla no se entera de que su día se registró ni de que el botón de enviar se acaba de habilitar. La etiqueta del mes sí tiene `aria-live`; la selección de día, que importa mucho más, no.

*Arreglo:* condicionar `enviar.disabled` también a `nombre.value.trim()`, con una pista bajo el campo («Para que sepan a quién contestar»). `role="status"` en `.elegido`. Y comprobar el valor de retorno de `window.open`: si es `null`, titular «No se pudo abrir WhatsApp» con el enlace `tel:` promovido.

*Comando:* `$impeccable harden`

### [P2] «Lo que se ofrece hoy», tres tarjetas definitorias, y odontopediatría escondida

*Por qué importa:* «se ofrece» es pasivo e institucional en un sitio que dice «tú» en todas las demás frases, y «hoy» se lee como una disculpa por tener contenido incompleto. Las tres tarjetas definen el servicio en vez de decirle al visitante si es para él —«Brackets — Ortodoncia convencional.» es intercambiable con «Nómina — Gestión mensual de planilla.»— y **la que decide si un padre trae a su hijo, odontopediatría, no está entre las tres**: está detrás de «Ver los cinco servicios».

*Arreglo:* renderizar los cinco (`servicios.map`) — la rejilla ya colapsa y cinco cuestan una fila más — o reordenar `servicios.json` para que las tres sean ortodoncia invisible, odontopediatría e higiene. Reescribir el `<Titular>` a `previo="Servicios" resalte="hacemos"` sobre «Lo que», y cada segunda línea de definición a resultado.

*Comando:* `$impeccable clarify`

---

## Banderas rojas por persona

Seleccionadas de la tabla para **página de aterrizaje / marketing**.

**Jordan — primera vez, se confunde.** El rótulo sobre el diferenciador dice `INVISALIGN · ITERO 5D PLUS`. No sabe qué es un iTero 5D Plus y la página nunca se lo dice; el único texto debajo le cuenta *cuándo* llegó algo que no entiende. **Y no puede averiguar quién la va a atender**: no hay nombre, ni cara, ni credencial en toda la página — y la Dra. Marta Muñoz es pública, o sea que es contenido disponible sin usar. Para «dejar los dientes de mi hijo en manos de un desconocido», la página ni siquiera ofrece un desconocido al que mirar. Abre el diálogo y el segundo campo le presenta seis opciones antes de haberle explicado qué implica ninguna. Después de «Listo», nada le dice cuándo contestará un humano.

**Riley — pone a prueba los bordes.** Elige el 12 de septiembre, avanza a octubre para comprobar, vuelve: la selección desapareció y el envío está inhabilitado otra vez, sin que nada la avisara antes de descartar su decisión. Bloquea ventanas emergentes: la interfaz afirma «Se abrió WhatsApp» igualmente. Deja el nombre en blanco: sale «Sin nombre». Pulsa Intro en el campo de nombre: nada, porque los campos están fuera del `<form method="dialog">`, que solo envuelve el botón de cerrar — **no hay ningún camino de envío por teclado**. Pulsa el fondo esperando que cierre: no cierra. Abre desde `file://`, que es el escenario declarado de la demo: el respaldo del mapa salta bien, pero «Cómo llegar» y «Abrir en Google Maps» apuntan a Google en una máquina sin red, y nada en ese panel lo dice.

**Casey — en el móvil, distraída.** Toca «Agendar cita» en la cabecera: 33 px de alto en lo más alto de la pantalla. En el diálogo, el botón de enviar está 148 px por debajo del borde visible sin señal de desplazamiento. **Y el icono verde flotante es lo más fácil de tocar de toda la página** — 56 px, fijo, en la zona del pulgar. Así que el camino que de verdad toma es el enlace crudo de WhatsApp, que manda «Hola, me gustaría información sobre sus servicios.» sin nombre, sin servicio y sin día. El flujo mejor diseñado del sitio —calendario con zona horaria, nueve reglas de días inhabilitados, ventana de tres meses— es al que su mano llega con menos probabilidad, y el fácil tira toda esa información a la basura.

---

## Observaciones menores

**Donde los tres coinciden, y vale la pena empezar por ahí.** El detector marcó `flat-type-hierarchy` («body 13 px, h2 13 px, h3 13 px; escalón 1.00:1») y `undersized-ui-text` («texto funcional de 9 px: *Centro Integral Médico Odontológico*»), y la evaluación A anotó por su cuenta que los rótulos del pie son `<h2>`. **Son el mismo defecto visto por tres caminos:** el pie usa `<h2>` para etiquetas de 13 px, lo que aplana el esquema del documento y hace que la escala tipográfica medida no aparezca por ningún lado; y la bajada del wordmark cae a 9 px por un `Math.max(9, …)` escrito a mano en `Wordmark.astro:23`. Los dos son de una línea: `<h2>` → `<h3>` o `<p>` en el pie, y subir el suelo de 9 a 11 px.

- **`--sombra-menu` es un token muerto.** El detector lo marcó como «borde de 1 px + sombra de 34 px de desenfoque» en las seis páginas. Lo verifiqué: el único uso real es `--sombra-dialogo`, en el diálogo; `--sombra-menu` no lo usa nadie. Sobrevive de un menú desplegable que la cabecera decidió no tener. Que el detector lo cace como si estuviera aplicado es un falso positivo — pero el token debería borrarse igual, y este proyecto tiene una sección entera de `DESIGN.md` sobre no dejar código muerto.
- **El rótulo dorado en versalitas es a la vez el sistema y el patrón delator.** `hero-eyebrow-chip` salta en las seis páginas y `kicker-above-heading` tres veces solo en el inicio. En `DESIGN.md` el oro tiene un rol único aprobado por el cliente, así que no es un accidente. Pero conviene saber que la construcción «etiqueta pequeña en mayúsculas espaciadas encima del titular» es hoy uno de los tells más reconocibles de interfaz generada. Si el oro se queda, que al menos no sea en las seis páginas con la misma forma.
- **Tinos nunca se carga en Windows, y aun así se precarga.** B midió `Tinos: unloaded` en las seis páginas. No es un fallo: la pila pide `'Times New Roman'` primero y Times está en el sistema, que es exactamente lo que `DESIGN.md` explica. Pero `Base.astro` lleva un `<link rel="preload">` de `tinos-latin-400-normal.woff2`, así que en Windows y en Mac se descarga una fuente que nunca se usa y el navegador avisa en consola. En Android sí se usa —y Android es la audiencia real— así que no es peso desperdiciado del todo. Merece una decisión consciente, no la de ahora.
- **El foco sí está resuelto.** B midió `outline-style: none` en los 34 elementos enfocables y eso da miedo leerlo, pero es artefacto del método: `el.focus()` por JavaScript no activa `:focus-visible` en Chromium. Verificado en el código: `tokens.css:283` define `:focus-visible { outline: 2px solid var(--marca-text); outline-offset: 2px }`, y `AgendarCita.astro` lo refuerza en los campos. **No es un defecto.**
- `Marcador.astro` emite `role="img"` con `aria-label="Contenido pendiente: …"`. Correcto para la demo; el día que esto se publique le está anunciando un hueco de producción a quien usa lector de pantalla.
- Dos tratamientos visuales para «ir a servicios» en la misma pantalla: `Boton variante="texto"` y un enlace subrayado pelado.
- `og:image` se omite a propósito y el razonamiento de `Base.astro` es bueno — pero **WhatsApp es el canal de distribución**, así que cada vez que alguien comparta el sitio sale un enlace de texto pelado. Un 1200×630 compuesto con el wordmark en Jost y `--marca` no necesita nada del cliente.
- El calendario no tiene foco móvil con flechas: llegar al día 25 son unos 25 tabuladores, y el día elegido no lleva `aria-pressed`.
- Una franja blanca de 64 px separa la banda oscura de Invisalign del pie oscuro: dos bloques oscuros con una rendija clara en medio se lee como una costura, no como una decisión.

---

## Preguntas que conviene hacerse

1. Lo único que CIMO tiene y ninguna otra clínica de Tegucigalpa puede copiar es una máquina que le enseña al paciente su sonrisa terminada antes de comprometerse. ¿Por qué es la penúltima banda de la página, en una línea de texto sin imagen, mientras un rectángulo punteado esperando una foto que el cliente no ha mandado ocupa el 45 % de la primera pantalla?
2. Toda tu audiencia llega de Instagram, donde ya ha visto doce publicaciones de bocas reales. Esta página tiene cero imágenes. El consentimiento de los casos, la fotografía y el logo vectorial son trabajo del cliente — pero un diagrama del iTero en tres pasos es tuyo y no necesita nada de ellos. ¿«No hay fotografía» es un hueco de contenido, o una decisión de diseño que todavía no has tomado?
3. El icono flotante de WhatsApp es el objeto más fácil de tocar de la página y manda «Hola, me gustaría información sobre sus servicios.» El diálogo de cita costó un calendario, una zona horaria, una ventana de tres meses y nueve reglas de días inhabilitados — y vive detrás de una píldora de 33 px arriba del todo. ¿Cuál de los dos quieres que use la gente, y la maqueta está de acuerdo con tu respuesta?
4. «Confirma antes de venir — todavía no se ha podido verificar la dirección definitiva» es la frase más creíble de la página precisamente porque nadie finge eso. ¿Qué más no sabe esta clínica, y decirlo en voz alta compraría el mismo crédito?
5. Dale esta misma composición a un fisioterapeuta, a un contador y a un notario de la misma torre. ¿Cuál de los tres tiene que cambiar la maqueta? Si la respuesta honesta es ninguno, ¿qué está haciendo la composición por una clínica dental que no haría una plantilla?
