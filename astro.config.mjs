// @ts-check
import { defineConfig } from 'astro/config';

// Ver DESIGN.md §7 "Restricciones que no son de estilo pero mandan sobre el".
// Esta configuracion se hereda LITERAL del sitio hermano (C:\Users\Darwin\Dentco);
// sus tres ajustes salen de fallos reales, no de preferencias. No se "limpia".
//
// Restriccion clave: el sitio tiene que abrir con doble clic desde
// file:// sin servidor, para poder ensenarselo al cliente sin depender de su
// wifi. Eso obliga a que
// NINGUN href ni src salga con "/" inicial. Como Astro emite las hojas de
// estilo externas con ruta absoluta desde la raiz, se fuerza el inlining
// para que no haya ningun <link> que resolver. Las imagenes y fuentes van
// en public/ y se referencian relativas ("img/...", "fonts/...").
export default defineConfig({
  // PENDIENTE DEL CLIENTE: CIMO no tiene dominio registrado. Se usa el que
  // corresponde a su usuario de Instagram (@cimo.hn) porque `site` solo alimenta
  // la URL canonica y los datos estructurados; el sitio se sirve desde file://
  // mientras tanto. Confirmar antes de publicar.
  site: 'https://cimo.hn',
  output: 'static',
  compressHTML: true,
  build: {
    // Emite about.html en vez de about/index.html: conserva exactamente los
    // nombres de archivo del sitio actual y con ellos el SEO ya indexado.
    format: 'file',
    inlineStylesheets: 'always',
  },
  vite: {
    build: {
      // Astro incrusta un <script> en el HTML solo si cumple DOS condiciones:
      // que no importe de ningun otro modulo, y que quepa en este limite. La
      // segunda estaba puesta en el valor por defecto de Vite, 4 KB, y es una
      // trampa silenciosa: el dia que el calendario paso de 4 KB, las 15
      // paginas empezaron a pedir /_astro/AgendarCita...js con ruta absoluta y
      // dejaron de funcionar desde file:// sin que nada se quejara. Aqui se
      // levanta el techo solo para el JavaScript.
      //
      // Devolver undefined para todo lo demas conserva el criterio normal de
      // Vite: si algun dia una imagen o una fuente pasa por su tuberia, no se
      // convertira en un data: URI gigante dentro del HTML.
      //
      // La regla de los imports sigue en pie y es la que de verdad importa:
      // Astro no incrusta un modulo con imports por muy pequeno que sea.
      assetsInlineLimit(rutaDelArchivo) {
        if (rutaDelArchivo.endsWith('.js')) return true;
        return undefined;
      },
    },
  },
});
