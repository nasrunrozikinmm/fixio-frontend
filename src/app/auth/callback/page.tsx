"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "@/hooks/useAuth";

/**
 * OAuth Callback Page
 *
 * After Google OAuth, the backend redirects here:
 *   /auth/callback?token=<jwt>
 *
 * The JWT is already set as an HTTP-only cookie by the backend.
 * AuthProvider's useGetMeQuery() fires on mount and picks up the cookie.
 * We wait until auth resolves, then redirect to home.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Wait until auth finishes loading, then redirect to home
    if (!loading) {
      router.replace("/");
    }
  }, [loading, isAuthenticated, router]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        gap: 2,
      }}
    >
      <CircularProgress color="primary" />
      <Typography variant="body1" color="text.secondary">
        Sedang memproses login...
      </Typography>
    </Box>
  );
}
