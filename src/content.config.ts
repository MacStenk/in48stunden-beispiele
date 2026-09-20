import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Markdown ist die Quelle der Wahrheit: ein Ordner je Betrieb unter src/inhalte/.
const inhalte = defineCollection({
  loader: glob({ base: './src/inhalte', pattern: '*/*.md' }),
  schema: z.object({
    titel: z.string(),
    knopf: z.string().optional(),
  }),
});

// Alles Kundenspezifische (Name, Kontakt, Farben) je Betrieb in kunde.yml.
const kunden = defineCollection({
  loader: glob({ base: './src/inhalte', pattern: '*/kunde.yml' }),
  schema: z.object({
    name: z.string(),
    branche: z.string(),
    ort: z.string(),
    inhaber: z.string(),
    strasse: z.string(),
    plz_ort: z.string(),
    telefon: z.string(),
    email: z.string(),
    zeiten: z.string(),
    menue: z.array(z.object({ id: z.string(), text: z.string() })),
    farben: z.record(z.string()),
  }),
});

export const collections = { inhalte, kunden };
