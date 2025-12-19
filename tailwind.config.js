/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    // Figma Make exports invalid forms like `text-[--color-stone-700]`.
    // We normalize those at runtime into standard Tailwind tokens like `text-stone-700`.
    {
      pattern:
        /^(?:sm:|md:|lg:|xl:|2xl:|hover:|focus:|active:|disabled:|group-hover:|focus-visible:)*text-(?:sand|stone|navy|sage|forest|teal|gold)-(?:50|100|200|300|400|500|600|700|800|900)$/,
    },
    {
      pattern:
        /^(?:sm:|md:|lg:|xl:|2xl:|hover:|focus:|active:|disabled:|group-hover:|focus-visible:)*bg-(?:sand|stone|navy|sage|forest|teal|gold)-(?:50|100|200|300|400|500|600|700|800|900)$/,
    },
    {
      pattern:
        /^(?:sm:|md:|lg:|xl:|2xl:|hover:|focus:|active:|disabled:|group-hover:|focus-visible:)*border-(?:sand|stone|navy|sage|forest|teal|gold)-(?:50|100|200|300|400|500|600|700|800|900)$/,
    },
    {
      pattern:
        /^(?:sm:|md:|lg:|xl:|2xl:|hover:|focus:|active:|disabled:|group-hover:|focus-visible:)*from-(?:sand|stone|navy|sage|forest|teal|gold)-(?:50|100|200|300|400|500|600|700|800|900)$/,
    },
    {
      pattern:
        /^(?:sm:|md:|lg:|xl:|2xl:|hover:|focus:|active:|disabled:|group-hover:|focus-visible:)*via-(?:sand|stone|navy|sage|forest|teal|gold)-(?:50|100|200|300|400|500|600|700|800|900)$/,
    },
    {
      pattern:
        /^(?:sm:|md:|lg:|xl:|2xl:|hover:|focus:|active:|disabled:|group-hover:|focus-visible:)*to-(?:sand|stone|navy|sage|forest|teal|gold)-(?:50|100|200|300|400|500|600|700|800|900)$/,
    },
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#faf8f5",
          100: "#f5f0e8",
          200: "#ebe2d1",
          300: "#ddc9ad",
          400: "#c9ab84",
          500: "#b8916a",
        },
        stone: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
          400: "#a8a29e",
          500: "#6b6662",
          600: "#57534e",
          700: "#44403c",
          800: "#292524",
        },
        navy: {
          50: "#f0f3f7",
          100: "#dde4ec",
          200: "#c5d2e0",
          600: "#3d5a7a",
          700: "#2c4256",
          800: "#1e2f3f",
          900: "#0f1821",
        },
        sage: {
          50: "#f4f7f5",
          100: "#e6ede8",
          200: "#ccddd2",
          300: "#a8c4b3",
          400: "#7da68f",
          500: "#5a8a70",
          600: "#427056",
          700: "#345a45",
          800: "#2a4838",
        },
        forest: {
          50: "#f0f5f3",
          100: "#d9e8e1",
          400: "#4d9d7a",
          500: "#3a8563",
          600: "#2d6b4f",
          700: "#255741",
        },
        teal: {
          50: "#f0f8f7",
          100: "#d4ebe8",
          400: "#5ba89c",
          500: "#4a8f84",
          600: "#3d7569",
        },
        gold: {
          50: "#faf7f0",
          100: "#f5edd9",
          400: "#c9a66b",
          500: "#b88f55",
          600: "#9a7545",
        },
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
    },
  },
  plugins: [],
};




