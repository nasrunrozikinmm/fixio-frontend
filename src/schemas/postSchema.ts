import { z } from 'zod';

/**
 * Zod schema — validasi form "Buat Post".
 *
 * Sesuai brief-pixel spec:
 * - Judul: required, min 10, max 150
 * - Sektor: required
 * - Wilayah: required
 * - Kritik: required, min 50, max 1000
 * - Solusi: required, min 50, max 1000
 * - Estimasi Dampak: optional
 * - Referensi: optional
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
    .min(50, 'Kritik minimal 50 karakter')
    .max(1000, 'Kritik maksimal 1000 karakter'),
  solution: z
    .string()
    .min(1, 'Solusi wajib diisi')
    .min(50, 'Solusi minimal 50 karakter')
    .max(1000, 'Solusi maksimal 1000 karakter'),
  impact_estimate: z
    .string()
    .max(500, 'Estimasi dampak maksimal 500 karakter'),
  references: z
    .string()
    .max(500, 'Referensi maksimal 500 karakter'),
});

export type PostFormData = z.infer<typeof postSchema>;
