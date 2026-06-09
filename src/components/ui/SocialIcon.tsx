/**
 * Brand-accurate social icons that lucide-react doesn't ship.
 * Stays inline so we don't pull a whole brand-icons dependency for two glyphs.
 */
import type { SVGProps } from "react";

export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      fill="currentColor"
      width="1em"
      height="1em"
      {...props}
    >
      <path d="M18.244 2H21.5l-7.36 8.41L23 22h-6.84l-5.36-7.07L4.6 22H1.34l7.88-9-7.88-11h6.99l4.86 6.43L18.24 2Zm-1.2 18h1.85L7.06 4H5.07l11.97 16Z" />
    </svg>
  );
}

export function PinterestIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      fill="currentColor"
      width="1em"
      height="1em"
      {...props}
    >
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.31-.088-.79-.167-2.005.035-2.868.182-.78 1.172-4.97 1.172-4.97s-.299-.6-.299-1.486c0-1.39.806-2.428 1.81-2.428.853 0 1.265.64 1.265 1.408 0 .858-.546 2.14-.828 3.328-.236.995.499 1.806 1.48 1.806 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.846 0-4.515 2.135-4.515 4.34 0 .859.331 1.78.745 2.281a.3.3 0 0 1 .069.288c-.076.315-.245.995-.277 1.134-.043.183-.144.222-.332.134-1.24-.578-2.016-2.39-2.016-3.847 0-3.135 2.278-6.014 6.566-6.014 3.447 0 6.124 2.456 6.124 5.74 0 3.424-2.159 6.18-5.157 6.18-1.008 0-1.954-.523-2.278-1.143l-.62 2.363c-.224.864-.829 1.946-1.234 2.605C9.954 21.842 10.96 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Z" />
    </svg>
  );
}
