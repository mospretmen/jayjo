import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { cn } from "@/lib/cn";

interface MobileNavProps {
  links: Array<{ to: string; label: string }>;
  transparent?: boolean;
}

export function MobileNav({ links, transparent = false }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 md:hidden",
            transparent
              ? "text-bg/85 hover:bg-bg/15 hover:text-bg focus-visible:ring-offset-transparent"
              : "text-text-muted hover:bg-bg-elevated hover:text-text focus-visible:ring-offset-bg",
          )}
        >
          <Menu size={20} />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-text/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xs flex-col border-l border-border bg-bg/90 shadow-[var(--shadow-card-hover)] backdrop-blur-lg data-[state=open]:animate-in data-[state=open]:slide-in-from-right"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <Dialog.Title asChild>
              <span className="inline-flex items-center">
                <BrandLogo sizeClass="h-10 w-10" />
              </span>
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-text-muted outline-none transition hover:bg-bg-elevated hover:text-text focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              <X size={18} />
            </Dialog.Close>
          </div>
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 py-6">
            <ul className="space-y-1">
              {links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={cn(
                      "block rounded-md px-3 py-3 font-display text-xl text-text transition",
                      location.pathname === link.to
                        ? "bg-bg-elevated"
                        : "hover:bg-bg-elevated",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-t border-border px-5 py-5 text-sm text-text-muted">
            <a href="mailto:hello@studiojayjo.com" className="hover:text-text">
              hello@studiojayjo.com
            </a>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
