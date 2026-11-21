import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-hover": "var(--color-surface-hover)",
        "surface-active": "var(--color-surface-active)",
        sidebar: "var(--color-sidebar)",
        "sidebar-surface": "var(--color-sidebar-surface)",
        "sidebar-text": "var(--color-sidebar-text)",
        "sidebar-muted": "var(--color-sidebar-muted)",
        border: "var(--color-border)",
        "border-subtle": "var(--color-border-subtle)",
        "border-input": "var(--color-border-input)",
        text: "var(--color-text)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",

        // Brand Palette
        accent: "var(--color-accent)",
        "accent-hover": "var(--color-accent-hover)",
        "on-accent": "var(--color-on-accent)",
        navy: "var(--color-navy)",
        maroon: "var(--color-maroon)",
        gold: "var(--color-gold)",

        // Role-based colors
        "priority-urgent": "var(--color-priority-urgent)",
        "priority-high": "var(--color-priority-high)",
        "priority-normal": "var(--color-priority-normal)",
        "priority-low": "var(--color-priority-low)",
        "status-open": "var(--color-status-open)",
        "status-progress": "var(--color-status-progress)",
        "status-review": "var(--color-status-review)",
        "status-done": "var(--color-status-done)",
        danger: "var(--color-danger)",
        "danger-surface": "var(--color-danger-surface)",
        success: "var(--color-success)",
        "success-surface": "var(--color-success-surface)",
        warning: "var(--color-warning)",
        "warning-surface": "var(--color-warning-surface)",
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        card: "var(--shadow-card)",
        dropdown: "var(--shadow-dropdown)",
        modal: "var(--shadow-modal)",
      },
    },
  },
  plugins: [],
};
export default config;
