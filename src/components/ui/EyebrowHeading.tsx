import { cn } from "@/lib/cn";

interface EyebrowHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  level?: 1 | 2 | 3;
  className?: string;
}

export function EyebrowHeading({
  eyebrow,
  title,
  description,
  level = 2,
  className,
}: EyebrowHeadingProps) {
  const Heading = (`h${level}` as keyof JSX.IntrinsicElements);
  return (
    <div className={cn("max-w-prose space-y-3", className)}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Heading className="font-display text-3xl text-text md:text-4xl lg:text-5xl">{title}</Heading>
      {description && <p className="text-text-muted">{description}</p>}
    </div>
  );
}
