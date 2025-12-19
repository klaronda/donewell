# DoneWell - Setup Instructions

## Quick Start

```bash
npm install
npm run dev
```

The site will open at **http://localhost:3000**

---

## Prerequisites

- Node.js v18+ 
- npm v9+

---

## Project Structure

This is a **Vite + React + TypeScript** project with **Tailwind CSS v3.4.15**.

### Current File Organization

**⚠️ IMPORTANT**: Source files need to be moved from root to `/src/` directory.

**Current structure:**
```
/
├── App.tsx                  ← Move to /src/App.tsx
├── contexts/AdminContext.tsx ← Move to /src/contexts/
├── components/              ← Move to /src/components/
├── pages/                   ← Move to /src/pages/
├── data/                    ← Move to /src/data/
```

**Target structure:**
```
/
├── index.html               ✓ Already at root
├── package.json             ✓ Already at root
├── vite.config.ts           ✓ Already at root  
├── tailwind.config.js       ✓ Already at root
├── postcss.config.js        ✓ Already at root
├── tsconfig.json            ✓ Already at root
│
└── src/                     ✓ Created
    ├── main.tsx             ✓ Created (imports ./styles/globals.css)
    ├── App.tsx              ← Move from /App.tsx
    │
    ├── styles/
    │   └── globals.css      ✓ Created with @tailwind directives
    │
    ├── contexts/            ← Move from /contexts/
    ├── components/          ← Move from /components/
    ├── pages/               ← Move from /pages/
    └── data/                ← Move from /data/
```

---

## File Migration Steps

### Option 1: Manual (Recommended for understanding structure)

```bash
# Move source files to src/
mv App.tsx src/
mv contexts src/
mv components src/
mv pages src/
mv data src/

# Delete old styles folder (new one already in src/styles/)
rm -rf styles/

# Delete old main.tsx if it exists at root
rm -f main.tsx
```

### Option 2: Quick Script (Unix/Mac/Linux)

```bash
#!/bin/bash
mkdir -p src
mv App.tsx src/ 2>/dev/null
mv contexts src/ 2>/dev/null
mv components src/ 2>/dev/null  
mv pages src/ 2>/dev/null
mv data src/ 2>/dev/null
rm -rf styles main.tsx 2>/dev/null
echo "Files moved to /src/"
```

Save as `migrate.sh`, then run:
```bash
chmod +x migrate.sh
./migrate.sh
```

### Option 3: Windows PowerShell

```powershell
New-Item -ItemType Directory -Force -Path src
Move-Item -Force App.tsx src\ 
Move-Item -Force contexts src\
Move-Item -Force components src\
Move-Item -Force pages src\
Move-Item -Force data src\
Remove-Item -Recurse -Force styles, main.tsx -ErrorAction SilentlyContinue
Write-Host "Files moved to /src/"
```

---

## After Migration

Once files are in `/src/`, run:

```bash
npm install
npm run dev
```

Site opens at **http://localhost:3000**

---

## Configuration Details

### Tailwind CSS (v3.4.15)

**File**: `/tailwind.config.js`

```javascript
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",  // Scans all src files
]
```

**Custom colors available:**
- `sage-50` through `sage-800` (brand green)
- `forest-50` through `forest-700` (accent green)
- `stone-50` through `stone-800` (neutrals)
- `navy-50` through `navy-900` (darks)
- `sand-`, `teal-`, `gold-` palettes

### Global Styles

**File**: `/src/styles/globals.css`

Contains:
- `@tailwind base;`
- `@tailwind components;`
- `@tailwind utilities;`
- CSS variables for colors
- Global typography (h1-h5, p, a)
- Responsive breakpoints

### Vite Configuration

**File**: `/vite.config.ts`

```typescript
server: {
  port: 3000,      // Development server port
  open: true,      // Auto-open browser
}
```

---

## Admin Access

**URL**: http://localhost:3000/admin

**Credentials**:
- Email: `admin@donewell.com`
- Password: `donewell2024`

---

## Build Commands

```bash
npm run dev      # Development server (port 3000)
npm run build    # Production build → /dist
npm run preview  # Preview production build
npm run lint     # Check code quality
```

---

## Tailwind Class Usage

### ✅ Correct (Use These)

```tsx
// Standard Tailwind tokens
className="bg-sage-600 text-white"
className="border-stone-200"  
className="rounded-2xl shadow-lg"
className="from-sage-50 to-forest-100"

// Or wrapped CSS variables
className="text-[var(--color-forest-700)]"
className="bg-[var(--color-sage-50)]"
```

### ❌ Incorrect (Don't Use)

```tsx
// Bare CSS variable syntax (won't compile)
className="text-[--color-forest-700]"    // Missing var()
className="bg-[--color-sage-50]"         // Missing var()
className="border-[--color-stone-200]"   // Missing var()
```

---

## Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | 5.6.3 | Type safety |
| Vite | 5.4.11 | Build tool |
| Tailwind CSS | 3.4.15 | Styling |
| Lucide React | 0.294.0 | Icons |

---

## Troubleshooting

### "Cannot find module './pages/HomePage'"

**Cause**: Files not moved to `/src/`

**Fix**: Complete the file migration steps above

### Port 3000 in use

```bash
npm run dev -- --port 3001
```

### Tailwind classes not working

**Check**:
1. `/src/styles/globals.css` has `@tailwind` directives
2. `/src/main.tsx` imports `'./styles/globals.css'`
3. `tailwind.config.js` content includes `"./src/**/*.{js,ts,jsx,tsx}"`

### Build errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json node_modules/.vite
npm install
npm run dev
```

---

## Development Workflow

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Make changes** to files in `/src/`

3. **Hot reload** automatically updates browser

4. **Build for production** when ready:
   ```bash
   npm run build
   ```

5. **Test production build**:
   ```bash
   npm run preview
   ```

---

## Project Features

### Public Website
- Responsive homepage with hero section
- Project portfolio page
- About page
- Individual project detail pages
- Multi-step "Get Started" modal
- Client testimonials
- Success metrics

### Admin CMS
- Email/password authentication
- Create/edit/delete projects
- Rich text editor with formatting
- Image and YouTube embed support
- Manage testimonials
- Manage metrics
- Visibility controls

### Data Storage
- All data stored in browser localStorage
- Keys: `donewell_projects`, `donewell_testimonials`, `donewell_metrics`, `donewell_admin_credentials`

---

## Next Steps

1. ✅ Complete file migration to `/src/`
2. ✅ Run `npm install`
3. ✅ Run `npm run dev`
4. ✅ Open http://localhost:3000
5. ✅ Verify homepage loads
6. ✅ Test navigation
7. ✅ Login to admin
8. ✅ Start customizing!

---

**You're all set! Happy coding! 🚀**
