// Theme Context for Dark Mode support
import { createContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'colorful';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: (newTheme?: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    toggleTheme: () => { },
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme && ['light', 'dark', 'colorful'].includes(savedTheme)) {
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = (newTheme?: Theme) => {
        const nextTheme = newTheme || (theme === 'light' ? 'dark' : theme === 'dark' ? 'colorful' : 'light');
        setTheme(nextTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
