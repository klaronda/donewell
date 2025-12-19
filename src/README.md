# DoneWell - Digital Services Studio Website

A professional, conversion-focused marketing website built with React, TypeScript, Vite, and Tailwind CSS.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Opens at **http://localhost:3000**

📖 **See [SETUP.md](./SETUP.md) for complete setup instructions**

---

## ✨ Features

### Public Website
- Responsive homepage with hero and CTAs
- Project portfolio with case studies
- About page with team and process
- Multi-step lead capture form
- Client testimonials
- Success metrics display

### Admin CMS
- Full content management system
- Rich text editor with formatting
- Image and YouTube embed support
- Visibility controls for homepage content
- localStorage-based data persistence

**Admin Access:**
- URL: http://localhost:3000/admin
- Email: `admin@donewell.com`
- Password: `donewell2024`

---

## 🛠️ Tech Stack

- **React 18.3** + **TypeScript 5.6** - Type-safe UI framework
- **Vite 5.4** - Lightning-fast build tool
- **Tailwind CSS 3.4** - Utility-first styling
- **Lucide React** - Icon library

---

## 📁 Project Structure

```
/
├── index.html              # Entry HTML
├── package.json            # Dependencies
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
│
└── src/
    ├── main.tsx            # React entry point
    ├── App.tsx             # Main app component
    ├── styles/
    │   └── globals.css     # Global styles + Tailwind
    ├── pages/              # Page components
    ├── components/         # Reusable components
    ├── contexts/           # React contexts
    └── data/               # Mock data
```

---

## 🎨 Design System

### Colors
- **Sage** (`sage-50` to `sage-800`) - Primary brand green
- **Forest** (`forest-50` to `forest-700`) - Accent green
- **Stone** (`stone-50` to `stone-800`) - Neutral grays
- **Navy** (`navy-50` to `navy-900`) - Dark blues

### Tailwind Usage
```tsx
// ✅ Use standard Tailwind tokens
className="bg-sage-600 text-white"
className="rounded-2xl shadow-lg"

// ✅ Or wrap CSS variables
className="text-[var(--color-forest-700)]"
```

---

## 📝 Available Scripts

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Check code quality
```

---

## 🚀 Deployment

```bash
npm run build
```

Deploy the `/dist` folder to:
- Vercel (recommended)
- Netlify
- GitHub Pages
- Cloudflare Pages

---

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup guide with troubleshooting
- **[DEV_BRIEF.md](./DEV_BRIEF.md)** - Architecture and development patterns
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Feature changelog

---

## 🔧 Troubleshooting

See [SETUP.md](./SETUP.md) for detailed troubleshooting steps.

**Quick fixes:**

```bash
# Port 3000 in use
npm run dev -- --port 3001

# Clear cache
rm -rf node_modules/.vite
npm run dev

# Fresh install
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📄 License

Private and proprietary. All rights reserved.

---

**Built with ❤️ using React + TypeScript + Vite + Tailwind CSS**
