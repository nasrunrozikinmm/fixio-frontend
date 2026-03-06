'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useLoginModal } from '@/lib/LoginModalContext';

/**
 * HeroSection — Modern gradient banner pada Home page.
 *
 * Sesuai brief-pixel.md:
 * - Tagline "Kritik Cerdas. Solusi Nyata."
 * - Sub-text deskripsi platform
 * - CTA primary "Sampaikan Idemu" → /post/new (auth guard)
 * - CTA secondary "Lihat Aspirasi" → scroll to feed / /explore
 * - Background: multi-layer gradient + mesh-style orbs + subtle noise
 */
export default function HeroSection() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { openLoginModal } = useLoginModal();

  const handleCreatePost = () => {
    if (isAuthenticated) {
      router.push('/post/new');
    } else {
      openLoginModal();
    }
  };

  const handleExplore = () => {
    const feedEl = document.getElementById('post-feed');
    if (feedEl) {
      feedEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/explore');
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        // Multi-stop gradient: deep navy → teal → blue → indigo
        background:
          'linear-gradient(135deg, #0F2027 0%, #1B3A5C 25%, #1A5276 50%, #2D5F8A 75%, #1E3A5F 100%)',
        color: '#FFFFFF',
        py: { xs: 6, sm: 8, md: 10 },
        mb: { xs: 3, md: 4 },
        borderRadius: { xs: 0, md: 3 },
      }}
    >
      {/* ── Decorative gradient orb — top-right ── */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: -60, md: -80 },
          right: { xs: -40, md: -20 },
          width: { xs: 280, md: 420 },
          height: { xs: 280, md: 420 },
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(59,130,246,0.35) 0%, rgba(59,130,246,0) 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Decorative gradient orb — bottom-left (green accent) ── */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: -50, md: -70 },
          left: { xs: -30, md: 60 },
          width: { xs: 200, md: 300 },
          height: { xs: 200, md: 300 },
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(46,125,79,0.25) 0%, rgba(46,125,79,0) 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Subtle dot-grid pattern overlay ── */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.04,
          backgroundImage:
            'radial-gradient(circle, #FFFFFF 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
        }}
      />

      {/* ── Content ── */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ maxWidth: 640 }}>
          {/* Badge / label */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              bgcolor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 5,
              px: 2,
              py: 0.5,
              mb: 2.5,
              fontSize: '0.8rem',
              fontWeight: 500,
              letterSpacing: 0.3,
            }}
          >
            <Box
              component="span"
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: '#10B981',
                boxShadow: '0 0 6px rgba(16,185,129,0.6)',
              }}
            />
            Forum Kebijakan Publik
          </Box>

          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 800,
              lineHeight: 1.15,
              mb: 2,
              letterSpacing: '-0.02em',
              // gradient text highlight on the key word
              '& .accent': {
                background: 'linear-gradient(90deg, #10B981 0%, #3B82F6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              },
            }}
          >
            Kritik Cerdas.{' '}
            <span className="accent">Solusi Nyata.</span>
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: { xs: '1rem', sm: '1.1rem' },
              lineHeight: 1.7,
              mb: 4,
              maxWidth: 520,
            }}
          >
            Suarakan kritik Anda terhadap kebijakan publik secara terstruktur,
            dan ajukan solusi konkret untuk Indonesia yang lebih baik.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<EditNoteIcon />}
              onClick={handleCreatePost}
              sx={{
                px: 3.5,
                py: 1.5,
                fontSize: '0.95rem',
                fontWeight: 700,
                borderRadius: 2,
                boxShadow: '0 4px 14px rgba(46,125,79,0.4)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(46,125,79,0.5)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Sampaikan Idemu
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<ExploreOutlinedIcon />}
              onClick={handleExplore}
              sx={{
                px: 3.5,
                py: 1.5,
                fontSize: '0.95rem',
                fontWeight: 600,
                borderRadius: 2,
                borderColor: 'rgba(255,255,255,0.3)',
                color: '#FFFFFF',
                backdropFilter: 'blur(4px)',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.6)',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Lihat Aspirasi
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
