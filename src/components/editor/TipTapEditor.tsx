'use client';

import { useCallback, useEffect } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import LinkIcon from '@mui/icons-material/Link';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────

interface TipTapEditorProps {
  /** HTML string value */
  value: string;
  /** Called when content changes (HTML string) */
  onChange: (html: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Minimum editor height in px */
  minHeight?: number;
  /** Whether the editor has a validation error */
  error?: boolean;
  /** Unique id for accessibility */
  id?: string;
}

// ────────────────────────────────────────────
// Toolbar button
// ────────────────────────────────────────────

interface ToolbarBtnProps {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function ToolbarBtn({ label, icon, active = false, disabled = false, onClick }: Readonly<ToolbarBtnProps>) {
  return (
    <Tooltip title={label} arrow>
      <span>
        <IconButton
          size="small"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          sx={{
            borderRadius: 1,
            color: active ? 'primary.main' : 'text.secondary',
            bgcolor: active ? 'action.selected' : 'transparent',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );
}

// ────────────────────────────────────────────
// Toolbar
// ────────────────────────────────────────────

interface EditorToolbarProps {
  editor: Editor | null;
}

function EditorToolbar({ editor }: Readonly<EditorToolbarProps>) {
  const handleLink = useCallback(() => {
    if (!editor) return;

    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    const url = globalThis.prompt('Masukkan URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.25,
        px: 1,
        py: 0.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        flexWrap: 'wrap',
      }}
    >
      <ToolbarBtn
        label="Bold"
        icon={<FormatBoldIcon sx={{ fontSize: 18 }} />}
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarBtn
        label="Italic"
        icon={<FormatItalicIcon sx={{ fontSize: 18 }} />}
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      <ToolbarBtn
        label="Bullet List"
        icon={<FormatListBulletedIcon sx={{ fontSize: 18 }} />}
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolbarBtn
        label="Numbered List"
        icon={<FormatListNumberedIcon sx={{ fontSize: 18 }} />}
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      <ToolbarBtn
        label="Link"
        icon={<LinkIcon sx={{ fontSize: 18 }} />}
        active={editor.isActive('link')}
        onClick={handleLink}
      />

      <Box sx={{ flex: 1 }} />

      <ToolbarBtn
        label="Undo"
        icon={<UndoIcon sx={{ fontSize: 18 }} />}
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      />
      <ToolbarBtn
        label="Redo"
        icon={<RedoIcon sx={{ fontSize: 18 }} />}
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      />
    </Box>
  );
}

// ────────────────────────────────────────────
// Main component
// ────────────────────────────────────────────

/** Strip HTML tags to calculate plain text length */
export function stripHtmlLength(html: string): number {
  return stripHtml(html).length;
}

/** Strip HTML tags and return plain text */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

export default function TipTapEditor({
  value,
  onChange,
  placeholder = '',
  minHeight = 120,
  error = false,
  id,
}: Readonly<TipTapEditorProps>) {
  const theme = useTheme();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        code: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
    ],
    content: value,
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      // TipTap returns <p></p> for empty content
      onChange(html === '<p></p>' ? '' : html);
    },
    editorProps: {
      attributes: {
        ...(id ? { id } : {}),
        'aria-label': placeholder,
      },
    },
    immediatelyRender: false,
  });

  // Sync external value changes (e.g. form reset)
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const currentHtml = editor.getHTML();
    const normalizedCurrent = currentHtml === '<p></p>' ? '' : currentHtml;
    if (normalizedCurrent !== value) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: error ? 'error.main' : 'divider',
        borderRadius: '20px',
        overflow: 'hidden',
        transition: 'border-color 0.15s ease',
        '&:focus-within': {
          borderColor: error ? 'error.main' : 'primary.main',
          boxShadow: (t) =>
            `0 0 0 1px ${error ? t.palette.error.main : t.palette.primary.main}`,
        },
        // TipTap editor content styles
        '& .tiptap': {
          px: 1.75,
          py: 1.5,
          minHeight,
          outline: 'none',
          fontSize: theme.typography.body1.fontSize,
          lineHeight: theme.typography.body1.lineHeight,
          fontFamily: theme.typography.fontFamily,
          color: theme.palette.text.primary,
          '& p': { m: 0, mb: 0.75 },
          '& p:last-child': { mb: 0 },
          '& ul, & ol': { pl: 2.5, mb: 0.75 },
          '& li': { mb: 0.25 },
          '& a': {
            color: theme.palette.info.main,
            textDecoration: 'underline',
            cursor: 'pointer',
          },
          '& p.is-editor-empty:first-of-type::before': {
            content: 'attr(data-placeholder)',
            color: theme.palette.text.secondary,
            opacity: 0.6,
            pointerEvents: 'none',
            float: 'left',
            height: 0,
          },
        },
      }}
    >
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 1.5, py: 0.5 }}>
        <Typography variant="caption" color={error ? 'error' : 'text.secondary'}>
          {stripHtmlLength(value)}{' '}karakter
        </Typography>
      </Box>
    </Box>
  );
}
