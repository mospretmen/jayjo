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
    <label htmlFor={inputId} className="inline-flex cursor-pointer items-center gap-2">
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        className={cn(
          "h-4 w-4 rounded border border-border text-accent focus:ring-accent",
          className,
        )}
        {...props}
      />
      <span className="text-sm text-text">{label}</span>
    </label>
  );
});
