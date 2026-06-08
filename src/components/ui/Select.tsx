import { forwardRef, useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, id, className, children, ...props },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-sm text-text">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={cn(
          "block w-full appearance-none rounded-md border bg-bg-elevated px-3 py-2.5 text-text outline-none focus:border-accent",
          error ? "border-fig" : "border-border",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-fig">{error}</p>}
    </div>
  );
});
