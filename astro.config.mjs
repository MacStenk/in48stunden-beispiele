import { defineConfig } from 'astro/config';

export default defineConfig({
  // Ein Ordner je Seite (/seite/index.html), keine Skripte ohne Bedarf.
  build: { format: 'directory' },
});
