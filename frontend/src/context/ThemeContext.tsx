import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";

export type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "theme";

const THEME_COLORS: Record<Theme, string> = {
    light: "#FBFAFD",
    dark: "#0B0910",
};

/**
 * Reads the initial theme from storage, falling back to the OS preference.
 */
const getCurrentTheme = (): Theme => {
    const theme = localStorage.getItem(THEME_STORAGE_KEY);

    if (theme === "light" || theme === "dark")
        return theme;

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

/**
 * Applies the theme to the document and keeps the browser chrome in sync.
 */
const applyTheme = (theme: Theme): void => {
    const root = document.documentElement;
    const isDark = theme === "dark";

    root.classList.toggle("dark", isDark);
    root.style.colorScheme = theme;
    document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", THEME_COLORS[theme]);
};

interface ThemeContextProps {
    // State
    theme: Theme;

    // Methods
    toggleTheme: () => void;
}

export const ThemeContext = createContext({} as ThemeContextProps);

/**
 * Returns the current theme and the toggle action.
 * @returns Theme state and actions.
 */
export const useTheme = (): ThemeContextProps => {
    const context = useContext(ThemeContext);

    if (!context)
        throw new Error("useTheme must be used within a ThemeContextProvider");

    return context;
};

export const ThemeContextProvider = ({ children }: PropsWithChildren) => {
    const [theme, setTheme] = useState<Theme>(getCurrentTheme);

    const toggleTheme = (): void => {
        setTheme((currentTheme) => {
            const nextTheme = currentTheme === "light" ? "dark" : "light";
            localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
            return nextTheme;
        });
    };

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    return (
        <ThemeContext
            value={{
                theme: theme,
                toggleTheme: toggleTheme
            }}>
            {children}
        </ThemeContext>
    );
};
