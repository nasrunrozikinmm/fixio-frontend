'use client';

import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';

// ────────────────────────────────────────────
// Props
// ────────────────────────────────────────────

interface ImageGalleryProps {
  /** Array of image URLs */
  images: string[];
  /**
   * Display variant:
   * - 'card' — compact horizontal scroll for PostCard (max-height 200px)
   * - 'detail' — larger display for detail page (max-height 400px)
   */
  variant?: 'card' | 'detail';
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * ImageGallery — Responsive image gallery with lightbox.
 *
 * - Single image: full width with rounded corners
 * - Multiple images: horizontal scroll
 * - Click to open fullscreen lightbox with arrows
 */
export default function ImageGallery({
  images,
  variant = 'card',
}: Readonly<ImageGalleryProps>) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const goNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) =>
      prev !== null ? (prev + 1) % images.length : null,
    );
  }, [images.length]);

  const goPrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) =>
      prev !== null ? (prev - 1 + images.length) % images.length : null,
    );
  }, [images.length]);

  if (images.length === 0) return null;

  const maxHeight = variant === 'detail' ? 400 : 200;
  const borderRadius = variant === 'detail' ? 2 : 1.5;

  // Single image — full width
  if (images.length === 1) {
    return (
      <>
        <Box
          onClick={(e) => openLightbox(0, e)}
          sx={{
            borderRadius,
            overflow: 'hidden',
            cursor: 'pointer',
            maxHeight,
            '&:hover': { opacity: 0.92 },
          }}
        >
          <Box
            component="img"
            src={images[0]}
            alt="Post image"
            loading="lazy"
            sx={{
              width: '100%',
              maxHeight,
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </Box>
        <LightboxDialog
          images={images}
          index={lightboxIndex}
          onClose={closeLightbox}
          onNext={goNext}
          onPrev={goPrev}
        />
      </>
    );
  }

  // Multiple images — horizontal scroll
  return (
    <>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          pb: 0.5,
          '&::-webkit-scrollbar': { height: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 },
        }}
      >
        {images.map((url, index) => (
          <Box
            key={url}
            onClick={(e) => openLightbox(index, e)}
            sx={{
              scrollSnapAlign: 'start',
              flexShrink: 0,
              borderRadius,
              overflow: 'hidden',
              cursor: 'pointer',
              '&:hover': { opacity: 0.92 },
            }}
          >
            <Box
              component="img"
              src={url}
              alt={`Post image ${index + 1}`}
              loading="lazy"
              sx={{
                height: maxHeight,
                width: 'auto',
                maxWidth: variant === 'detail' ? 500 : 280,
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </Box>
        ))}
      </Stack>
      <LightboxDialog
        images={images}
        index={lightboxIndex}
        onClose={closeLightbox}
        onNext={goNext}
        onPrev={goPrev}
      />
    </>
  );
}

// ────────────────────────────────────────────
// Lightbox Dialog
// ────────────────────────────────────────────

interface LightboxDialogProps {
  images: string[];
  index: number | null;
  onClose: () => void;
  onNext: (e: React.MouseEvent) => void;
  onPrev: (e: React.MouseEvent) => void;
}

function LightboxDialog({
  images,
  index,
  onClose,
  onNext,
  onPrev,
}: Readonly<LightboxDialogProps>) {
  if (index === null) return null;

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
            maxWidth: '90vw',
            maxHeight: '90vh',
          },
        },
        backdrop: {
          sx: { bgcolor: 'rgba(0,0,0,0.85)' },
        },
      }}
    >
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Close button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: -40,
            right: 0,
            color: 'common.white',
            zIndex: 1,
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Prev arrow */}
        {images.length > 1 && (
          <IconButton
            onClick={onPrev}
            sx={{
              position: 'absolute',
              left: -48,
              color: 'common.white',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
            }}
          >
            <ChevronLeftIcon fontSize="large" />
          </IconButton>
        )}

        {/* Image */}
        <Box
          component="img"
          src={images[index]}
          alt={`Image ${index + 1} of ${images.length}`}
          sx={{
            maxWidth: '85vw',
            maxHeight: '85vh',
            objectFit: 'contain',
            borderRadius: 1,
          }}
        />

        {/* Next arrow */}
        {images.length > 1 && (
          <IconButton
            onClick={onNext}
            sx={{
              position: 'absolute',
              right: -48,
              color: 'common.white',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
            }}
          >
            <ChevronRightIcon fontSize="large" />
          </IconButton>
        )}

        {/* Counter */}
        {images.length > 1 && (
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              bottom: -28,
              color: 'common.white',
              fontWeight: 600,
            }}
          >
            {index + 1} / {images.length}
          </Typography>
        )}
      </Box>
    </Dialog>
  );
}
