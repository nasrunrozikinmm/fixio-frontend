'use client';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

// ────────────────────────────────────────────
// RichTextContent — safe HTML renderer for stored rich text
// ────────────────────────────────────────────

interface RichTextContentProps {
  /** HTML string to render */
  html: string;
}

/**
 * Renders sanitized HTML content from TipTap editor.
 * Backend sanitizes via bluemonday before storage,
 * so dangerouslySetInnerHTML is safe here.
 */
export default function RichTextContent({ html }: Readonly<RichTextContentProps>) {
  const theme = useTheme();

  if (!html?.trim()) return null;

  return (
    <Box
      dangerouslySetInnerHTML={{ __html: html }}
      sx={{
        fontSize: theme.typography.body1.fontSize,
        lineHeight: 1.8,
        fontFamily: theme.typography.fontFamily,
        color: 'text.primary',
        wordBreak: 'break-word',
        '& p': { m: 0, mb: 1 },
        '& p:last-child': { mb: 0 },
        '& ul, & ol': { pl: 3, mb: 1 },
        '& li': { mb: 0.5 },
        '& strong': { fontWeight: 700 },
        '& em': { fontStyle: 'italic' },
        '& a': {
          color: 'info.main',
          textDecoration: 'underline',
          wordBreak: 'break-all',
          '&:hover': { opacity: 0.8 },
        },
      }}
    />
  );
}
