import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { MobileNav } from "@/components/layout/MobileNav";
import { CartButton } from "@/components/checkout/CartButton";
import { useFavorites } from "@/store/favorites";
import { cn } from "@/lib/cn";

const nav = [
  { to: "/shop", label: "Shop" },
  { to: "/galleries", label: "Wall Galleries" },
  { to: "/about", label: "About" },
  { to: "/work-with-us", label: "Work With Us" },
];

function useTransparentHeader() {
  const location = useLocation();
  const [atTop, setAtTop] = useState(true);
  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return location.pathname === "/" && atTop;
}

export function Header({ onOpenCart }: { onOpenCart: () => void }) {
  const favCount = useFavorites((s) => s.slugs.length);
  const transparent = useTransparentHeader();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-colors duration-300",
        transparent
          ? "bg-transparent text-bg"
          : "border-b border-border bg-bg/85 text-text backdrop-blur",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link
          to="/"
          className={cn(
            "font-display text-xl tracking-tight transition-colors",
            transparent ? "text-bg" : "text-text",
          )}
        >
          Studio JayJo
        </Link>
        <nav aria-label="Primary" className="hidden gap-6 md:flex">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn(
                  "text-sm transition-colors",
                  transparent
                    ? "text-bg/80 hover:text-bg"
                    : "text-text-muted hover:text-text",
                  isActive && (transparent ? "text-bg" : "text-text"),
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle transparent={transparent} />
          <Link
            to="/favorites"
            aria-label={`Favorites${favCount ? ` (${favCount})` : ""}`}
            className={cn(
              "relative inline-flex h-10 w-10 items-center justify-center rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
              transparent
                ? "text-bg/85 hover:bg-bg/15 hover:text-bg focus-visible:ring-offset-transparent"
                : "text-text-muted hover:bg-bg-elevated hover:text-text focus-visible:ring-offset-bg",
            )}
          >
            <Heart size={18} />
            {favCount > 0 && (
              <span
                aria-hidden
                className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-fig px-1 text-xs text-bg"
              >
                {favCount}
              </span>
            )}
          </Link>
          <CartButton onClick={onOpenCart} transparent={transparent} />
          <MobileNav links={nav} transparent={transparent} />
        </div>
      </div>
    </header>
  );
}
