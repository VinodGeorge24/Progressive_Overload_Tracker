import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  alt?: string;
  decorative?: boolean;
}

export function BrandLogo({
  className,
  alt = "Lift Tracker logo",
  decorative = false,
}: BrandLogoProps) {
  return (
    <img
      src="/lift-tracker-logo.svg"
      alt={decorative ? "" : alt}
      aria-hidden={decorative ? true : undefined}
      className={cn("h-16 w-16 object-contain select-none", className)}
      draggable="false"
    />
  );
}
