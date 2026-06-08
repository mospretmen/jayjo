import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Toaster } from "@/components/ui/Toaster";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { PageTransition } from "@/components/motion/PageTransition";

export function RootLayout() {
  return (
    <ThemeProvider>
      <a href="#main" className="skip-link">Skip to content</a>
      <Header />
      <main id="main">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <Toaster />
    </ThemeProvider>
  );
}
