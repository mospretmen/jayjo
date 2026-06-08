import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      theme="light"
      toastOptions={{
        className: "rounded-md border border-border bg-bg-elevated text-text",
      }}
    />
  );
}
