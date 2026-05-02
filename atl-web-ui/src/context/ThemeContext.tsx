import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: 'light',
    toggleTheme: () => {},
    isDark: false,
});

/**
 * Reads the stored theme from localStorage, falls back to OS preference,
 * then falls back to 'light'.
 */
function getInitialTheme(): Theme {
    try {
        const stored = localStorage.getItem('ims-theme') as Theme | null;
        if (stored === 'dark' || stored === 'light') return stored;
    } catch {
        // localStorage not available (SSR / private mode edge cases)
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

function applyTheme(theme: Theme) {
    const root = document.documentElement;
    if (theme === 'dark') {
        root.setAttribute('data-theme', 'dark');
    } else {
        root.removeAttribute('data-theme');
    }
    try {
        localStorage.setItem('ims-theme', theme);
    } catch {
        // ignore
    }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const initial = getInitialTheme();
        // Apply immediately to avoid flash of wrong theme
        if (typeof document !== 'undefined') {
            applyTheme(initial);
        }
        return initial;
    });

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
            {children}
        </ThemeContext.Provider>
    );
};

/** Hook to consume the current theme and toggle function anywhere in the app. */
export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
