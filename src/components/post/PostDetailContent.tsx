'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import type { Post } from '@/types';

// ────────────────────────────────────────────
// Section box reusable — Kritik (navy) / Solusi (hijau)
// ────────────────────────────────────────────

interface ContentSectionProps {
  icon: string;
  label: string;
  headerBg: string;
  headerText: string;
  children: React.ReactNode;
}

function ContentSection({
  icon,
  label,
  headerBg,
  headerText,
  children,
}: Readonly<ContentSectionProps>) {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: headerBg,
          color: headerText,
          px: 2.5,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography component="span" sx={{ fontSize: '1.1rem' }}>
          {icon}
        </Typography>
        <Typography variant="body1" fontWeight={700}>
          {label}
        </Typography>
      </Box>

      {/* Body */}
      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography
          variant="body1"
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: 1.8,
            color: 'text.primary',
          }}
        >
          {children}
        </Typography>
      </Box>
    </Box>
  );
}

// ────────────────────────────────────────────
// PostDetailContent
// ────────────────────────────────────────────

interface PostDetailContentProps {
  post: Post;
}

/**
 * PostDetailContent — Kritik (navy), Solusi (hijau),
 * opsional Estimasi Dampak (📊) & Referensi (🔗).
 *
 * Sesuai brief-pixel spec:
 * - Kritik Section: box, header navy #1B3A5C, ikon 📌
 * - Solusi Section: box, header hijau #2E7D4F, ikon 💡
 * - Estimasi Dampak: hanya tampil jika ada
 * - Referensi: hanya tampil jika ada — render sebagai link
 */
export default function PostDetailContent({ post }: Readonly<PostDetailContentProps>) {
  const hasImpact = Boolean(post.impact_estimate?.trim());
  const hasReferences = Boolean(post.references?.trim());

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ── Kritik ── */}
      <ContentSection
        icon="📌"
        label="Kritik"
        headerBg="#1B3A5C"
        headerText="#FFFFFF"
      >
        {post.criticism}
      </ContentSection>

      {/* ── Solusi ── */}
      <ContentSection
        icon="💡"
        label="Solusi"
        headerBg="#2E7D4F"
        headerText="#FFFFFF"
      >
        {post.solution}
      </ContentSection>

      {/* ── Estimasi Dampak (opsional) ── */}
      {hasImpact && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <Typography component="span" sx={{ fontSize: '1.1rem', mt: 0.1 }}>
            📊
          </Typography>
          <Box>
            <Typography
              variant="body2"
              fontWeight={700}
              color="text.secondary"
              sx={{ mb: 0.5 }}
            >
              Estimasi Dampak
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
              {post.impact_estimate}
            </Typography>
          </Box>
        </Box>
      )}

      {/* ── Referensi (opsional) ── */}
      {hasReferences && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <Typography component="span" sx={{ fontSize: '1.1rem', mt: 0.1 }}>
            🔗
          </Typography>
          <Box>
            <Typography
              variant="body2"
              fontWeight={700}
              color="text.secondary"
              sx={{ mb: 0.5 }}
            >
              Referensi
            </Typography>
            <Typography
              variant="body1"
              sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, wordBreak: 'break-word' }}
            >
              <ReferenceLinks text={post.references} />
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}

// ────────────────────────────────────────────
// Helper: render referensi sebagai clickable links
// ────────────────────────────────────────────

const URL_REGEX = /https?:\/\/[^\s,]+/g;

function ReferenceLinks({ text }: Readonly<{ text: string }>) {
  const parts = text.split(URL_REGEX);
  const urls = text.match(URL_REGEX);

  if (!urls) {
    return <>{text}</>;
  }

  const elements: React.ReactNode[] = [];
  for (let i = 0; i < parts.length; i++) {
    if (parts[i]) elements.push(parts[i]);
    if (urls[i]) {
      elements.push(
        <Link
          key={urls[i] + String(i)}
          href={urls[i]}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ wordBreak: 'break-all' }}
        >
          {urls[i]}
        </Link>,
      );
    }
  }

  return <>{elements}</>;
}
