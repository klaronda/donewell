# 📦 File Migration Required

## Current Status

The project has been restructured for standard Vite organization with source files in `/src/`.

**New files created:**
- ✅ `/src/main.tsx` - React entry point
- ✅ `/src/App.tsx` - Main app component  
- ✅ `/src/styles/globals.css` - Global styles with Tailwind directives

**Old files to be replaced:**
- ⚠️ `/App.tsx` - Old version (protected, can't auto-delete)
- ⚠️ `/styles/globals.css` - Old version (protected, can't auto-delete)

---

## Action Required

Move the following directories to `/src/`:

```bash
# Move source directories
mv contexts src/
mv components src/
mv pages src/
mv data src/
```

After migration, you can manually delete the old files:
- `/App.tsx` (replaced by `/src/App.tsx`)
- `/styles/` folder (replaced by `/src/styles/`)

---

## Quick Setup

```bash
# 1. Move files
mv contexts components pages data src/

# 2. Install and run
npm install
npm run dev
```

---

See **[SETUP.md](./SETUP.md)** for detailed instructions.
