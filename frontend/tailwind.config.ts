// Tailwind CSS v4 is configured through CSS-first theming in `src/index.css`.
// This file is kept for tooling compatibility (shadcn/ui reads it from components.json).
import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
} satisfies Config
