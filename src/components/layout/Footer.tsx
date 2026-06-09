import { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { XIcon, PinterestIcon } from "@/components/ui/SocialIcon";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { validateNewsletter, sanitizeEmail } from "@/lib/validation";
import { toast } from "sonner";

export function Footer() {
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  async function onSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const raw = String(data.get("email") ?? "");
    const err = validateNewsletter(raw);
    setError(err);
    if (err) return;
    setSubmitting(true);
    try {
      // Backend wires in Plan 4; simulate async work for UX
      await new Promise((resolve) => setTimeout(resolve, 400));
      toast.success("Thanks for joining. We'll be in touch.");
      const formEl = e.currentTarget as HTMLFormElement;
      formEl.reset();
      // Cast to expose dataset/etc. without losing types
      void sanitizeEmail(raw);
    } catch {
      toast.error("Couldn't subscribe right now. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <footer className="border-t border-border bg-bg-elevated">
      <div className="container-page grid grid-cols-1 gap-12 py-16 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Link
            to="/"
            aria-label="Studio JayJo — home"
            className="inline-flex items-center gap-3"
          >
            <BrandLogo sizeClass="h-12 w-12" />
            <span className="font-display text-2xl tracking-tight text-text">Studio JayJo</span>
          </Link>
          <p className="max-w-prose text-text-muted">
            Original art, prints, and curated wall galleries — made in warm pigments and quiet
            compositions.
          </p>
          <form onSubmit={onSubscribe} noValidate className="flex max-w-sm flex-col gap-2">
            <div className="flex gap-2">
              <Input
                name="email"
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                inputMode="email"
                placeholder="you@studio.com"
                aria-label="Email"
                error={error}
                onChange={() => error && setError(undefined)}
              />
              <Button type="submit" variant="primary" size="md" disabled={submitting}>
                {submitting ? "…" : "Join"}
              </Button>
            </div>
          </form>
        </div>
        <nav aria-label="Shop">
          <p className="eyebrow mb-3">Shop</p>
          <ul className="space-y-2 text-text-muted">
            <li><Link to="/shop" className="hover:text-text">All</Link></li>
            <li><Link to="/shop?kind=original" className="hover:text-text">Originals</Link></li>
            <li><Link to="/shop?kind=print" className="hover:text-text">Prints</Link></li>
            <li><Link to="/galleries" className="hover:text-text">Wall Galleries</Link></li>
          </ul>
        </nav>
        <nav aria-label="Studio">
          <p className="eyebrow mb-3">Studio</p>
          <ul className="space-y-2 text-text-muted">
            <li><Link to="/about" className="hover:text-text">About</Link></li>
            <li><Link to="/work-with-us" className="hover:text-text">Work With Us</Link></li>
            <li><a href="mailto:hello@studiojayjo.com" className="hover:text-text">hello@studiojayjo.com</a></li>
          </ul>
        </nav>
        <nav aria-label="Follow">
          <p className="eyebrow mb-3">Follow</p>
          <ul className="space-y-2.5 text-text-muted">
            <li>
              <a
                href="https://instagram.com/studiojayjo"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 hover:text-text"
                aria-label="Instagram"
              >
                <Instagram size={16} /> Instagram
              </a>
            </li>
            <li>
              <a
                href="https://pinterest.com/studiojayjo"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 hover:text-text"
                aria-label="Pinterest"
              >
                <PinterestIcon className="text-base" /> Pinterest
              </a>
            </li>
            <li>
              <a
                href="https://x.com/studiojayjo"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 hover:text-text"
                aria-label="X (Twitter)"
              >
                <XIcon className="text-sm" /> X
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-text-muted md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} Studio JayJo</p>
          <p>Made with warm pigments.</p>
        </div>
      </div>
    </footer>
  );
}
