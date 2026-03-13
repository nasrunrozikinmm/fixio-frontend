'use client';

import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Controller, type Control, type FieldErrors, type UseFormWatch } from 'react-hook-form';
import { TipTapEditor, stripHtmlLength } from '@/components/editor';
import ImageUploader from '@/components/post/ImageUploader';
import type { PostFormData } from '@/schemas/postSchema';
import type { Sector, Region } from '@/types';

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────

function charCounter(current: number, max: number) {
  return `${current}/${max}`;
}

// ────────────────────────────────────────────
// Props
// ────────────────────────────────────────────

export interface PostFormFieldsProps {
  control: Control<PostFormData>;
  errors: FieldErrors<PostFormData>;
  watch: UseFormWatch<PostFormData>;
  sectors: Sector[];
  sectorsLoading: boolean;
  regions: Region[];
  regionsLoading: boolean;
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * PostFormFields — Shared form fields for create & edit post pages.
 *
 * Renders: title, sector, region, criticism (TipTap), solution (TipTap),
 * impact_estimate, references. Parent controls useForm and actions.
 */
export default function PostFormFields({
  control,
  errors,
  watch,
  sectors,
  sectorsLoading,
  regions,
  regionsLoading,
}: Readonly<PostFormFieldsProps>) {
  const sectorId = watch('sector_id');
  const regionId = watch('region_id');

  const selectedSector = useMemo(
    () => sectors.find((s) => s.id === sectorId) ?? null,
    [sectors, sectorId],
  );
  const selectedRegion = useMemo(
    () => regions.find((r) => r.id === regionId) ?? null,
    [regions, regionId],
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ── Info banner ── */}
      <Alert
        severity="info"
        icon={<InfoOutlinedIcon />}
        sx={{ borderRadius: 2 }}
      >
        Post akan di-review moderator sebelum ditampilkan ke publik.
      </Alert>

      {/* ── Judul ── */}
      <Controller
        name="title"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Judul"
            placeholder="Judul aspirasi Anda (min. 10 karakter)"
            fullWidth
            error={Boolean(errors.title)}
            helperText={errors.title?.message ?? charCounter(field.value.length, 150)}
            slotProps={{ htmlInput: { maxLength: 150 } }}
          />
        )}
      />

      {/* ── Gambar (opsional) ── */}
      <Box>
        <FormLabel sx={{ mb: 0.5, display: 'block' }}>
          Gambar (opsional — maks. 5)
        </FormLabel>
        <Controller
          name="images"
          control={control}
          render={({ field }) => (
            <ImageUploader
              value={field.value ?? []}
              onChange={field.onChange}
              error={errors.images?.message}
            />
          )}
        />
      </Box>

      {/* ── Sektor + Wilayah (side by side) ── */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Controller
          name="sector_id"
          control={control}
          render={({ field }) => (
            <Autocomplete<Sector, false>
              options={sectors}
              getOptionLabel={(option) => option.name}
              loading={sectorsLoading}
              value={selectedSector}
              onChange={(_e, newValue) => {
                field.onChange(newValue?.id ?? '');
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Sektor"
                  placeholder="Pilih sektor"
                  error={Boolean(errors.sector_id)}
                  helperText={errors.sector_id?.message}
                />
              )}
            />
          )}
        />

        <Controller
          name="region_id"
          control={control}
          render={({ field }) => (
            <Autocomplete<Region, false>
              options={regions}
              getOptionLabel={(option) => option.name}
              loading={regionsLoading}
              value={selectedRegion}
              onChange={(_e, newValue) => {
                field.onChange(newValue?.id ?? '');
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Wilayah"
                  placeholder="Pilih wilayah"
                  error={Boolean(errors.region_id)}
                  helperText={errors.region_id?.message}
                />
              )}
            />
          )}
        />
      </Stack>

      {/* ── Kritik ── */}
      <Box>
        <FormLabel error={Boolean(errors.criticism)} sx={{ mb: 0.5, display: 'block' }}>
          Kritik
        </FormLabel>
        <Controller
          name="criticism"
          control={control}
          render={({ field }) => (
            <TipTapEditor
              id="criticism"
              value={field.value}
              onChange={field.onChange}
              placeholder="Jelaskan permasalahan kebijakan yang ingin Anda kritisi (min. 50 karakter)"
              minHeight={160}
              error={Boolean(errors.criticism)}
            />
          )}
        />
        <FormHelperText error={Boolean(errors.criticism)}>
          {errors.criticism?.message ?? charCounter(stripHtmlLength(watch('criticism')), 5000)}
        </FormHelperText>
      </Box>

      {/* ── Solusi ── */}
      <Box>
        <FormLabel error={Boolean(errors.solution)} sx={{ mb: 0.5, display: 'block' }}>
          Solusi
        </FormLabel>
        <Controller
          name="solution"
          control={control}
          render={({ field }) => (
            <TipTapEditor
              id="solution"
              value={field.value}
              onChange={field.onChange}
              placeholder="Berikan solusi konkret untuk permasalahan di atas (min. 50 karakter)"
              minHeight={160}
              error={Boolean(errors.solution)}
            />
          )}
        />
        <FormHelperText error={Boolean(errors.solution)}>
          {errors.solution?.message ?? charCounter(stripHtmlLength(watch('solution')), 5000)}
        </FormHelperText>
      </Box>

      {/* ── Estimasi Dampak (opsional) ── */}
      <Controller
        name="impact_estimate"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Estimasi Dampak (opsional)"
            placeholder="Perkiraan dampak positif dari solusi yang diusulkan"
            fullWidth
            multiline
            minRows={2}
            error={Boolean(errors.impact_estimate)}
            helperText={errors.impact_estimate?.message ?? charCounter(field.value?.length ?? 0, 500)}
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />
        )}
      />

      {/* ── Referensi (opsional) ── */}
      <Controller
        name="references"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Referensi (opsional)"
            placeholder="Link sumber data atau artikel pendukung"
            fullWidth
            error={Boolean(errors.references)}
            helperText={errors.references?.message ?? charCounter(field.value?.length ?? 0, 500)}
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />
        )}
      />
    </Box>
  );
}
