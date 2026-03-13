import type { Metadata } from "next";

import StoreProvider from "@/lib/StoreProvider";
import ThemeRegistry from "@/lib/ThemeRegistry";
import { LoginModalProvider } from "@/lib/LoginModalContext";
import AuthProvider from "@/lib/AuthProvider";
import LoginModal from "@/components/auth/LoginModal";
import Navbar from "@/components/layout/Navbar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export const metadata: Metadata = {
  title: "Fixio — Forum Kritik & Solusi Kebijakan Publik",
  description:
    "Platform digital untuk menyuarakan kritik terhadap kebijakan publik secara terstruktur, beserta solusi konkret.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap"
        />
      </head>
      <body>
        <StoreProvider>
          <ThemeRegistry>
            <LoginModalProvider>
              <AuthProvider>
                <Navbar />
                <main className="app-main">{children}</main>
                <MobileBottomNav />
                <LoginModal />
              </AuthProvider>
            </LoginModalProvider>
          </ThemeRegistry>
        </StoreProvider>
      </body>
    </html>
  );
}
