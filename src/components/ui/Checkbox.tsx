import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, id, className, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <label htmlFor={inputId} className="flex cursor-pointer items-center gap-2.5 py-1">
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        className={cn(
          "h-4 w-4 shrink-0 rounded border border-border accent-accent focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg",
          className,
        )}
        {...props}
      />
      <span className="text-sm leading-tight text-text">{label}</span>
    </label>
  );
});
