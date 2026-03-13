'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// ────────────────────────────────────────────
// Tips data
// ────────────────────────────────────────────

const WRITING_TIPS = [
  'Gunakan judul yang spesifik dan jelas.',
  'Jelaskan kritik dengan data atau fakta konkret.',
  'Tawarkan solusi yang realistis dan terukur.',
  'Sertakan estimasi dampak (siapa, berapa, kapan).',
  'Tambahkan referensi sumber untuk kredibilitas.',
  'Gunakan gambar atau infografis pendukung.',
] as const;

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * WritingGuide — Tips menulis aspirasi yang baik.
 *
 * Displayed in the right sidebar of post create/edit pages.
 */
export default function WritingGuide() {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        p: 2,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1.5 }}>
        <LightbulbOutlinedIcon sx={{ fontSize: 18, color: 'warning.main' }} />
        <Typography variant="body2" fontWeight={600}>
          Tips Menulis
        </Typography>
      </Stack>

      <Stack spacing={1}>
        {WRITING_TIPS.map((tip) => (
          <Stack key={tip} direction="row" spacing={0.75} alignItems="flex-start">
            <CheckCircleOutlineIcon
              sx={{ fontSize: 14, color: 'success.main', mt: '2px', flexShrink: 0 }}
            />
            <Typography variant="caption" sx={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
              {tip}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
