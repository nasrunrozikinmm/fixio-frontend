import { z } from 'zod';
import { stripHtmlLength } from '@/components/editor';

// ────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────

/** Max raw HTML length for rich-text fields */
const RICH_TEXT_MAX = 5_000;
/** Min plain-text characters (after stripping HTML tags) */
const RICH_TEXT_MIN_PLAIN = 50;

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────

/** Zod refinement: validates minimum plain-text length for HTML content */
function richTextMin(label: string) {
  return (val: string, ctx: z.RefinementCtx) => {
    if (stripHtmlLength(val) < RICH_TEXT_MIN_PLAIN) {
      ctx.addIssue({
        code: 'custom',
        message: `${label} minimal ${RICH_TEXT_MIN_PLAIN} karakter (teks saja)`,
      });
    }
  };
}

// ────────────────────────────────────────────
// Schema
// ────────────────────────────────────────────

/**
 * Zod schema — validasi form "Buat Post".
 *
 * Rich-text fields (criticism, solution) store HTML.
 * Max is validated against raw HTML length; min is
 * validated against stripped plain-text length.
 */
export const postSchema = z.object({
  title: z
    .string()
    .min(1, 'Judul wajib diisi')
    .min(10, 'Judul minimal 10 karakter')
    .max(150, 'Judul maksimal 150 karakter'),
  sector_id: z
    .string()
    .min(1, 'Sektor wajib dipilih'),
  region_id: z
    .string()
    .min(1, 'Wilayah wajib dipilih'),
  criticism: z
    .string()
    .min(1, 'Kritik wajib diisi')
    .max(RICH_TEXT_MAX, `Kritik maksimal ${RICH_TEXT_MAX} karakter`)
    .superRefine(richTextMin('Kritik')),
  solution: z
    .string()
    .min(1, 'Solusi wajib diisi')
    .max(RICH_TEXT_MAX, `Solusi maksimal ${RICH_TEXT_MAX} karakter`)
    .superRefine(richTextMin('Solusi')),
  impact_estimate: z
    .string()
    .max(500, 'Estimasi dampak maksimal 500 karakter'),
  references: z
    .string()
    .max(500, 'Referensi maksimal 500 karakter'),
  images: z
    .array(z.string().url('URL gambar tidak valid'))
    .max(5, 'Maksimal 5 gambar'),
});

export type PostFormData = z.infer<typeof postSchema>;
