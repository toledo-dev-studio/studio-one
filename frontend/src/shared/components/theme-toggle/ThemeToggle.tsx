import { MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@/shared/shadcn/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/extensions/utils";

interface Props {
    className?: string;
}

/**
 * Switches between the light and dark themes.
 */
export const ThemeToggle = ({ className }: Props) => {
    const { theme, toggleTheme } = useTheme();
    const label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("size-9 rounded-full text-muted-foreground hover:text-foreground", className)}
            aria-label={label}
            title={label}
            onClick={toggleTheme}
        >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </Button>
    );
};
