/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // 8px base grid system for consistent spacing
      spacing: {
        0: "0px",
        0.5: "4px", // Half step for fine-tuning
        1: "8px", // Base unit
        2: "16px",
        3: "24px",
        4: "32px",
        5: "40px",
        6: "48px",
        7: "56px",
        8: "64px",
        9: "72px",
        10: "80px",
        12: "96px",
        14: "112px",
        16: "128px",
        20: "160px",
        24: "192px",
      },
      // Touch-friendly button heights (WCAG compliant)
      height: {
        "button-sm": "48px", // Minimum touch target
        "button-md": "56px", // Comfortable default
        "button-lg": "64px", // Large/prominent actions
      },
      minHeight: {
        "button-sm": "48px",
        "button-md": "56px",
        "button-lg": "64px",
        touch: "48px", // General touch target minimum
        "touch-lg": "56px", // Comfortable touch target
      },
      minWidth: {
        "button-sm": "48px",
        "button-md": "56px",
        "button-lg": "64px",
        touch: "48px",
        "touch-lg": "56px",
      },
      // Store app color palette - WCAG AA compliant
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6", // Primary blue
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        success: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981", // Success emerald
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b", // Warning amber
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },
        danger: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444", // Danger red
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
          950: "#450a0a",
        },
        neutral: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b", // Neutral slate
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
      },
      // Typography scale - optimized for 10-inch tablets
      fontSize: {
        xs: ["14px", { lineHeight: "20px", letterSpacing: "0.01em" }], // Min accessible size
        sm: ["14px", { lineHeight: "20px", letterSpacing: "0.01em" }],
        base: ["16px", { lineHeight: "24px", letterSpacing: "normal" }], // Comfortable reading
        lg: ["18px", { lineHeight: "28px", letterSpacing: "normal" }],
        xl: ["20px", { lineHeight: "28px", letterSpacing: "-0.01em" }], // Heading small
        "2xl": ["24px", { lineHeight: "32px", letterSpacing: "-0.02em" }], // Heading medium
        "3xl": ["30px", { lineHeight: "36px", letterSpacing: "-0.02em" }],
        "4xl": ["36px", { lineHeight: "40px", letterSpacing: "-0.03em" }],
      },
      // Focus ring styles for accessibility
      ringWidth: {
        focus: "3px",
      },
      ringOffsetWidth: {
        focus: "2px",
      },
      // Transition durations - fast feedback for touch
      transitionDuration: {
        fast: "150ms",
        normal: "200ms",
        slow: "300ms",
      },
      // Tablet-specific breakpoints
      screens: {
        tablet: "768px", // Standard tablet portrait
        "tablet-lg": "1024px", // Tablet landscape / large tablet
      },
      // Border radius for touch-friendly UI
      borderRadius: {
        touch: "12px", // Comfortable rounded corners
      },
    },
  },
  plugins: [
    // Custom utilities plugin
    function ({ addUtilities }) {
      addUtilities({
        // Minimum touch target (48x48px - WCAG 2.1 AA)
        ".touch-target": {
          minWidth: "48px",
          minHeight: "48px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        },
        // Comfortable touch target (56x56px)
        ".touch-target-lg": {
          minWidth: "56px",
          minHeight: "56px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        },
        // Accessibility-focused focus ring (WCAG compliant)
        ".focus-visible-ring": {
          "&:focus-visible": {
            outline: "none",
            ringWidth: "3px",
            ringColor: "#3b82f6",
            ringOffset: "2px",
            ringOffsetColor: "#ffffff",
          },
        },
        // Safe area padding for tablets with notches/rounded corners
        ".safe-area-padding": {
          paddingTop: "env(safe-area-inset-top)",
          paddingRight: "env(safe-area-inset-right)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
        },
        ".safe-area-pt": {
          paddingTop: "env(safe-area-inset-top)",
        },
        ".safe-area-pr": {
          paddingRight: "env(safe-area-inset-right)",
        },
        ".safe-area-pb": {
          paddingBottom: "env(safe-area-inset-bottom)",
        },
        ".safe-area-pl": {
          paddingLeft: "env(safe-area-inset-left)",
        },
        // High contrast focus state for better visibility
        ".focus-ring-high-contrast": {
          "&:focus": {
            outline: "3px solid #1d4ed8",
            outlineOffset: "2px",
          },
        },
      });
    },
  ],
};
