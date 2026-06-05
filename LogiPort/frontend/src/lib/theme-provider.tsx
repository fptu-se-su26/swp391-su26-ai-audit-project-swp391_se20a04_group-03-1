"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")
  const [mounted, setMounted] = useState(false)

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light")
    
    setTheme(initialTheme)
    applyThemeToDOM(initialTheme)
    setMounted(true)
  }, [])

  // Update DOM when theme changes
  useEffect(() => {
    if (mounted) {
      applyThemeToDOM(theme)
    }
  }, [theme, mounted])

  const applyThemeToDOM = (newTheme: Theme) => {
    const html = document.documentElement
    if (newTheme === "dark") {
      html.classList.add("dark")
    } else {
      html.classList.remove("dark")
    }
    localStorage.setItem("theme", newTheme)
  }

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === "light" ? "dark" : "light")
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    // Return default theme if context not available
    return {
      theme: "light" as const,
      toggleTheme: () => {
        console.warn("useTheme called outside ThemeProvider")
      },
    }
  }
  return context
}
