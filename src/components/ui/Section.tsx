import { cn } from "@/lib/cn";

type SectionProps<E extends keyof JSX.IntrinsicElements = "section"> = {
  as?: E;
} & React.HTMLAttributes<HTMLElement>;

export function Section({
  className,
  children,
  as: Tag = "section",
  ...props
}: SectionProps) {
  const Component = Tag as keyof JSX.IntrinsicElements;
  return (
    // @ts-expect-error — polymorphic element typing
    <Component className={cn("container-page py-16 md:py-24", className)} {...props}>
      {children}
    </Component>
  );
}
