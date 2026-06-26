import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  to?: string;
}

export function Logo({ className, showText = true, to = "/" }: LogoProps) {
  const content = (
    <>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-[0_0_20px_-4px] shadow-primary/50">
        <Shield className="h-4 w-4 text-primary-foreground" />
      </div>
      {showText && (
        <span className="font-semibold tracking-tight text-foreground">FileVault</span>
      )}
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className={cn("flex items-center gap-2.5 transition-opacity hover:opacity-90", className)}
      >
        {content}
      </Link>
    );
  }

  return <div className={cn("flex items-center gap-2.5", className)}>{content}</div>;
}
