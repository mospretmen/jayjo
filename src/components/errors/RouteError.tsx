import { Button } from "@/components/ui/Button";

interface RouteErrorProps {
  error: Error;
  reset: () => void;
}

export function RouteError({ error, reset }: RouteErrorProps) {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <h2 className="font-display text-3xl text-text">Something didn&apos;t load.</h2>
      <p className="max-w-prose text-text-muted">
        {error.message || "We hit a snag rendering this page. Please try again."}
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="primary">
          Try again
        </Button>
        <Button variant="ghost" onClick={() => (window.location.href = "/")}>
          Go home
        </Button>
        <a
          href="mailto:hello@studiojayjo.com"
          className="inline-flex h-11 items-center text-sm text-text underline-offset-4 hover:underline"
        >
          Contact us
        </a>
      </div>
    </div>
  );
}
