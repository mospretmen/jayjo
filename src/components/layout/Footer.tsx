import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-bg-elevated">
      <div className="container-page grid grid-cols-1 gap-12 py-16 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <p className="font-display text-2xl text-text">Studio JayJo</p>
          <p className="max-w-prose text-text-muted">
            Original art, prints, and curated wall galleries — made in warm pigments and quiet
            compositions.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              const email = String(data.get("email") ?? "");
              if (!email) return;
              // Newsletter backend wires in Plan 4
              toast.success("Thanks for joining. We'll be in touch.");
              (e.currentTarget as HTMLFormElement).reset();
            }}
            className="flex max-w-sm gap-2"
          >
            <Input name="email" type="email" required placeholder="you@studio.com" aria-label="Email" />
            <Button type="submit" variant="primary" size="md">
              Join
            </Button>
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
          <ul className="space-y-2 text-text-muted">
            <li>
              <a href="https://instagram.com/studiojayjo" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-text">
                <Instagram size={16} /> Instagram
              </a>
            </li>
            <li>
              <a href="https://pinterest.com/studiojayjo" target="_blank" rel="noreferrer" className="hover:text-text">
                Pinterest
              </a>
            </li>
            <li>
              <a href="https://tiktok.com/@studiojayjo" target="_blank" rel="noreferrer" className="hover:text-text">
                TikTok
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
