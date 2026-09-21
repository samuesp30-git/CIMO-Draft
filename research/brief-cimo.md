# CIMO — Brief de investigación previo al sitio web

**Fuentes:** Instagram [@cimo.hn](https://www.instagram.com/cimo.hn/) (3,365 seguidores) · Facebook [/cimohn](https://www.facebook.com/cimohn/) (807 seguidores, categoría "General Dentist") · TikTok [@cimo491](https://www.tiktok.com/@cimo491)
**Fecha de extracción:** 4 de septiembre de 2026
**Estado web actual:** no existe sitio. El único enlace en bio apunta a TikTok.

---

## 1. Identidad del negocio

| Campo | Dato |
|---|---|
| Nombre legal/comercial | CIMO — Centro Integral Médico Odontológico |
| Tagline actual (bio IG) | "Transformando sonrisas y cuidando tu bienestar" |
| Sub-línea | "Especialistas en salud bucal" |
| Naturaleza | Empresa familiar (declarado en la intro de Facebook) |
| Teléfono / WhatsApp | **9770-3774** (único número en todas las publicaciones) |
| Correo | cimo.hn2020@gmail.com |
| Antigüedad visible | Publicaciones desde al menos marzo 2024 |

### Sedes (dos)

1. **Tegucigalpa** — Boulevard Centroamérica, Torre Corporativo Centroamérica (entre CCIT Cámara de Comercio y CEUTEC), 3.er piso, local 8. CP 11101.
2. **La Entrada, Copán** — Colonia Vanessa, calle adoquinada, 2.º pasaje sin salida.

> Nota: en mayo 2026 publicaron un reel de mudanza ("Cerramos una puerta llena de recuerdos… Próximamente"). Confirmar con el cliente si la dirección de Tegucigalpa sigue vigente antes de publicarla.

---

## 2. Colores — medidos, no elegidos

Muestreo por píxel del logo de perfil y de las 8 portadas de historias destacadas. El resultado es notablemente consistente: **una sola familia de azul cian a lo largo de toda la marca.**

| Origen | Hex dominante | % de píxeles saturados |
|---|---|---|
| Cruz del logo | `#6EB8DD` | pico principal |
| Portadas destacadas (6 de 8) | `#78B8D8` / `#70B8E0` | 24–32 % |
| Sombras del logo | `#4898C8`, `#50A0D0` | — |
| Contorno / neutro oscuro | `#384850` | — |
| Fondo del logo | blanco | 65 % del total |

En HSL, `#6EB8DD` ≈ **hsl(200, 60 %, 65 %)**. Ese 200° es el eje de toda la identidad.

### Escala derivada (con contraste verificado)

| Token | Hex | vs. blanco | Uso |
|---|---|---|---|
| `blue-50` | `#F3F9FC` | 1.06 | fondos de sección |
| `blue-100` | `#DFEFF6` | 1.18 | tarjetas, chips |
| `blue-200` | `#B6DAEC` | 1.48 | bordes, divisores |
| **`blue-300`** | **`#70B8DB`** | **2.19** | **color de marca — solo relleno, NUNCA texto** |
| `blue-400` | `#4AA2CF` | 2.85 | ilustraciones, iconos grandes |
| `blue-500` | `#2B87B6` | 4.00 | hover de botón |
| `blue-600` | `#1E6D94` | 5.72 | botones primarios, texto grande |
| **`blue-700`** | **`#155575`** | **8.11** | **texto de marca, enlaces, títulos** |
| `blue-800` | `#0E3F58` | 11.23 | footer, secciones oscuras |
| `blue-900` | `#0C2F40` | 14.03 | fondos oscuros |

`blue-300` reproduce el color medido del logo con un desvío imperceptible (2.19 vs. 2.20 de contraste).

### Neutros

| Token | Hex | vs. blanco |
|---|---|---|
| `ink` | `#1A2B33` | 14.61 — texto de cuerpo |
| `ink-muted` | `#3D5560` | 7.87 — texto secundario |
| `ink-soft` | `#6B8894` | 3.77 — solo texto grande / metadatos |
| `line` | `#E3EAEE` | 1.22 — bordes |
| `paper` | `#F7FAFC` | 1.05 — fondo alterno |

### Acento

La marca **no tiene** un segundo color. Recomiendo introducir uno solo, y con propósito:

- **`#C9922A`** (dorado, 2.75 vs. blanco / 5.31 vs. tinta) para el CTA de "Agendar cita" — separa la acción del azul ambiental y da un registro de clínica premium coherente con Invisalign.
- **`#128C7E`** (verde WhatsApp accesible, 4.14 vs. blanco) reservado exclusivamente al botón de WhatsApp. No usarlo en ningún otro lado.

### La trampa a evitar

`#6EB8DD` sobre blanco da **2.2:1**. Reprueba WCAG para texto por un margen amplio. Cualquier plantilla que ponga el color de marca como color de texto va a producir una web que se ve lavada y que no pasa auditoría. La regla: **el azul claro llena, el azul 700 escribe.**

---

## 3. Personas identificadas

| Nombre | Rol | Evidencia |
|---|---|---|
| **Dra. Marta Muñoz** | Odontóloga | Reel del 27 jun 2026: "La Dra. Marta Muñoz te explica cómo la confianza puede cambiar tu experiencia" |

Es el **único** nombre propio del equipo publicado en las fuentes accesibles. La historia destacada "Especialistas 🦷" casi con seguridad contiene al resto, pero Instagram exige sesión iniciada para verla.

**Acción:** pedirle al cliente la lista completa — nombre, especialidad, número de colegiado y foto. Es el dato que más falta para construir la página.

### Otras personas mencionadas

- **Ludis Hernández Díaz** — paciente que viajó desde Estados Unidos para tratarse en CIMO. Testimonio publicado el 9 mayo 2026.
- **@alejandra_rubio_hn** — colaboración con creadora de contenido (25 jun 2026). Existe una historia destacada llamada "Alianzas🤝".

---

## 4. Servicios y tecnología

### Confirmado en publicaciones

- **Invisalign®** — ortodoncia invisible. Es su producto estrella: 4 de las 12 publicaciones recientes lo promocionan.
- **Escáner intraoral iTero 5D Plus** — incorporado en julio 2026. Permite simular la sonrisa final antes de empezar el tratamiento.
- **Ortodoncia con brackets** — el contraste "brackets vs. alineadores" es un tema recurrente.
- **Higiene y profilaxis dental** — contenido educativo sobre técnica de cepillado.
- **Odontopediatría** — publicaciones con pacientes menores.
- **Rehabilitación / estética dental** — casos antes-y-después de reconstrucción completa.

### Implícito por el nombre, a confirmar

El nombre dice "Médico Odontológico", pero **todo el contenido público es odontológico**. Facebook los clasifica como "General Dentist". Hay que preguntar si el brazo médico existe hoy o si es aspiracional — cambia por completo la arquitectura del sitio.

---

## 5. Lo que la investigación revela como oportunidad

1. **Turismo dental.** Ya tienen al menos un caso documentado de una paciente que viajó desde EE. UU. Con la diáspora hondureña en Estados Unidos, esto no es un nicho marginal: es potencialmente el segmento de mayor ticket. Ninguna clínica dental hondureña que revisé lo trabaja seriamente en web.
2. **Invisalign + iTero es un diferenciador real y caro.** El escáner es de julio 2026 — es nuevo. Merece su propia página, no una línea en una lista de servicios.
3. **Cero reseñas.** Facebook marca "0 reviews" y no aparecen en directorios. Es la debilidad más grande: 3,365 seguidores y ninguna prueba social indexable.
4. **Las historias destacadas ya son el mapa del sitio.** Casos · Alianzas · Pacientes · Especialistas · Horario · Ubicación · Servicios · Reseñas. El cliente ya organizó su propia información — el sitio debería respetar esa estructura, no inventar otra.
5. **Sin sitio web, el 100 % del tráfico depende del algoritmo de Instagram.** No tienen activo propio ni forma de aparecer en "dentista Tegucigalpa" en Google.

---

## 6. Datos que faltan y hay que pedirle al cliente

- [ ] Horarios de atención de cada sede (está en la historia "Horario", inaccesible sin sesión)
- [ ] Nómina completa de especialistas con especialidad y número de colegiado
- [ ] Confirmación de la dirección de Tegucigalpa tras la mudanza de mayo 2026
- [ ] ¿Existe el componente médico o son solo odontológicos?
- [ ] Rangos de precio o política de financiamiento (los testimonios mencionan "precios justos")
- [ ] Archivos vectoriales del logo — el único disponible públicamente es de 150 × 150 px
- [ ] ¿Aceptan seguros? ¿Cuáles?
- [ ] ¿Hay número o WhatsApp separado para la sede de Copán?

---

## Anexos

- `assets/cimo-logo-ig-150.jpg` — logo extraído del perfil (150 × 150, la máxima resolución pública)
- `palette.js` — script que genera y verifica los contrastes de la escala
