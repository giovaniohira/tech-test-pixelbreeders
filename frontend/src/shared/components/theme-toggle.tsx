import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/shared/providers/use-theme";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface ThemeToggleProps {
  className?: string;
  size?: "default" | "sm" | "icon";
}

export function ThemeToggle({ className, size = "icon" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      onClick={toggleTheme}
      className={cn("cursor-pointer", className)}
      aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}
