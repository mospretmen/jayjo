import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Toaster } from "@/components/ui/Toaster";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { PageTransition } from "@/components/motion/PageTransition";
import { CartDrawer } from "@/components/checkout/CartDrawer";

export function RootLayout() {
  const [cartOpen, setCartOpen] = useState(false);
  return (
    <ThemeProvider>
      <a href="#main" className="skip-link">Skip to content</a>
      <Header onOpenCart={() => setCartOpen(true)} />
      <main id="main">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <Toaster />
    </ThemeProvider>
  );
}
