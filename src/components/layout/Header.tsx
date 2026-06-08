import { Link, NavLink } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useFavorites } from "@/store/favorites";
import { cn } from "@/lib/cn";

const nav = [
  { to: "/shop", label: "Shop" },
  { to: "/galleries", label: "Wall Galleries" },
  { to: "/about", label: "About" },
  { to: "/work-with-us", label: "Work With Us" },
];

export function Header() {
  const favCount = useFavorites((s) => s.slugs.length);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link to="/" className="font-display text-xl tracking-tight text-text">
          Studio JayJo
        </Link>
        <nav aria-label="Primary" className="hidden gap-6 md:flex">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn(
                  "text-sm text-text-muted transition hover:text-text",
                  isActive && "text-text",
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            to="/favorites"
            aria-label={`Favorites${favCount ? ` (${favCount})` : ""}`}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-text-muted hover:bg-bg-elevated hover:text-text"
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
          <Link
            to="/cart"
            aria-label="Cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-text-muted hover:bg-bg-elevated hover:text-text"
          >
            <ShoppingBag size={18} />
          </Link>
        </div>
      </div>
    </header>
  );
}
