# DoneWell - Developer Brief for Cursor

## 🎯 Project Overview

**DoneWell** is a professional marketing website for a digital services studio that helps non-technical professionals turn their ideas into polished websites and simple apps. The site is conversion-focused, designed to handle traffic from Facebook and Instagram ads.

### Design Philosophy
- **Visual Identity**: Sage and forest green color palette, generous whitespace, rounded corners
- **Feel**: Warm, confident, high-quality, clean, modern, premium
- **Goal**: Build trust, showcase expertise, convert visitors into leads

---

## 🏗️ Architecture

### Tech Stack
- **React 18** + **TypeScript** - Component-based UI with type safety
- **Vite** - Fast dev server and build tool
- **Tailwind CSS 4.0** - Utility-first styling with custom design tokens
- **localStorage** - Frontend-only data persistence (no backend yet)

### Project Structure
```
/
├── components/
│   ├── admin/                    # Admin CMS components
│   │   ├── ProjectsManager.tsx   # Project CRUD interface
│   │   ├── TestimonialsManager.tsx
│   │   ├── MetricsManager.tsx
│   │   └── RichTextEditor.tsx    # Custom rich text editor
│   ├── figma/                    # Protected design system components
│   │   └── ImageWithFallback.tsx # (DO NOT MODIFY)
│   └── ui/                       # shadcn/ui component library
├── contexts/
│   └── AdminContext.tsx          # Global state + localStorage persistence
├── data/
│   └── mockProjects.ts           # Default project data
├── pages/
│   ├── HomePage.tsx              # Landing page (/)
│   ├── WorkPage.tsx              # Portfolio (/work)
│   ├── AboutPage.tsx             # About page (/about)
│   ├── ProjectDetailPage.tsx     # Case studies (/projects/:slug)
│   ├── AdminLoginPage.tsx        # Auth page (/admin)
│   └── AdminDashboardPage.tsx    # CMS dashboard (/admin)
├── styles/
│   └── globals.css               # Tailwind config + custom CSS
├── App.tsx                       # Main router + AdminProvider
└── main.tsx                      # React entry point
```

---

## 🔑 Key Features

### Public-Facing Site

#### 1. Multi-Page Navigation
- **Home** (`/`) - Hero, services, testimonials, CTA
- **Work** (`/work`) - Portfolio grid with project cards
- **About** (`/about`) - Team, process, trust signals
- **Project Detail** (`/projects/:slug`) - Case study with problem/solution/results

#### 2. "Get Started for Free" Modal
- Multi-step form (project details → budget/timeline → contact info)
- Opens from CTA buttons throughout the site
- Form state managed locally (currently not persisted)

#### 3. Dynamic Content
- Projects filtered by visibility settings (`showOnHomepage`, `showOnWorkPage`)
- Featured projects highlighted
- Testimonials with client photos and company info
- Metrics cards showing business credibility

### Admin CMS (Frontend-Only)

#### Authentication
- **Email**: `admin@donewell.com`
- **Password**: `donewell2024`
- Credentials stored in localStorage: `donewell_admin_credentials`
- Simple session management with `AdminContext`

#### Project Management
- **Rich Text Editor** with toolbar:
  - Bold, italic, headings (H2, H3)
  - Bullet/numbered lists
  - Links
  - Images (URL-based)
  - YouTube embeds
- **Five Content Sections**:
  1. Summary - Project overview
  2. Problem - Client challenge
  3. Objective - Goals
  4. Our Actions - What we did
  5. Results - Outcomes with metrics
- **Visibility Controls**:
  - Show on homepage (featured section)
  - Show on work page (portfolio)
  - Featured badge
- **Metrics Cards**: Add custom result metrics per project

#### Testimonials Management
- Add/edit/delete testimonials
- Client name, company, role
- Photo URL
- Testimonial text
- Homepage visibility toggle

#### Metrics Management
- Create result cards (e.g., "50+ Projects", "98% Satisfaction")
- Custom value and label
- Display on homepage stats section

---

## 🎨 Styling Guidelines

### Tailwind CSS 4.0
- Uses CSS variables in `/styles/globals.css`
- Custom color palette: `--color-sage-*`, `--color-forest-*`, `--color-stone-*`

### ⚠️ IMPORTANT Typography Rules
**DO NOT USE** these Tailwind classes unless explicitly needed:
- ❌ Font size classes (`text-sm`, `text-lg`, `text-2xl`, etc.)
- ❌ Font weight classes (`font-bold`, `font-semibold`, etc.)
- ❌ Line height classes (`leading-tight`, `leading-none`, etc.)

**Why?** Typography is defined globally per HTML element in `globals.css`. Only override when user requests specific styling changes.

### Color Usage
```tsx
// Sage (primary brand color)
bg-sage-50 to bg-sage-900
text-sage-600, text-sage-700

// Forest (secondary/accent)
bg-forest-600 to bg-forest-700
hover:bg-forest-700

// Stone (neutrals)
bg-stone-50, bg-stone-100
text-stone-600, text-stone-900
```

### Design Patterns
- **Generous whitespace**: Large padding/margins
- **Rounded corners**: `rounded-2xl`, `rounded-3xl` for cards
- **Subtle shadows**: `shadow-lg`, `shadow-xl`
- **Smooth transitions**: `transition-all duration-200`

---

## 💾 Data Management

### localStorage Schema

#### Projects
**Key**: `donewell_projects`
```typescript
interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  imageUrl: string;
  
  // Rich text content
  summary: string;
  problem: string;
  objective: string;
  ourActions: string;
  results: string;
  
  // Visibility
  featured: boolean;
  showOnHomepage: boolean;
  showOnWorkPage: boolean;
  
  // Metrics for this project
  metrics: Array<{
    id: string;
    value: string;
    label: string;
  }>;
}
```

#### Testimonials
**Key**: `donewell_testimonials`
```typescript
interface Testimonial {
  id: string;
  name: string;
  company: string;
  role: string;
  content: string;
  imageUrl: string;
  showOnHomepage: boolean;
}
```

#### Metrics
**Key**: `donewell_metrics`
```typescript
interface Metric {
  id: string;
  value: string;
  label: string;
}
```

#### Admin Credentials
**Key**: `donewell_admin_credentials`
```json
{
  "email": "admin@donewell.com",
  "password": "donewell2024"
}
```

### AdminContext API
```typescript
const {
  // Auth
  isAuthenticated,
  login,
  logout,
  
  // Projects
  projects,
  addProject,
  updateProject,
  deleteProject,
  
  // Testimonials
  testimonials,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  
  // Metrics
  metrics,
  addMetric,
  updateMetric,
  deleteMetric,
} = useAdmin();
```

---

## 🛠️ Common Development Tasks

### Adding a New Public Page

1. **Create page component** in `/pages/`:
```tsx
// pages/ContactPage.tsx
import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

interface ContactPageProps {
  onGetStartedClick: () => void;
  isModalOpen: boolean;
  onModalClose: () => void;
}

export function ContactPage({ onGetStartedClick, isModalOpen, onModalClose }: ContactPageProps) {
  return (
    <>
      <Header onGetStartedClick={onGetStartedClick} />
      <main>
        {/* Your content */}
      </main>
      <Footer onGetStartedClick={onGetStartedClick} />
      <GetStartedModal isOpen={isModalOpen} onClose={onModalClose} />
    </>
  );
}
```

2. **Add route in App.tsx**:
```tsx
// Add to AppContent function
if (currentPage === 'contact') {
  return (
    <ContactPage 
      onGetStartedClick={handleGetStartedClick}
      isModalOpen={isModalOpen}
      onModalClose={handleModalClose}
    />
  );
}

// Add to routing logic
else if (path === '/contact') {
  setCurrentPage('contact');
  window.history.pushState({}, '', '/contact');
}
```

3. **Add navigation link** in `Header.tsx`:
```tsx
<a href="/contact">Contact</a>
```

### Adding a New Admin Feature

1. **Create manager component** in `/components/admin/`:
```tsx
// components/admin/ServicesManager.tsx
import React from 'react';
import { useAdmin } from '../../contexts/AdminContext';

export function ServicesManager() {
  const { services, addService, updateService, deleteService } = useAdmin();
  
  // Your CRUD UI
}
```

2. **Add to AdminContext**:
```tsx
// contexts/AdminContext.tsx
const [services, setServices] = useState<Service[]>([]);

const addService = (service: Service) => {
  const updated = [...services, service];
  setServices(updated);
  localStorage.setItem('donewell_services', JSON.stringify(updated));
};

// Provide in context value
```

3. **Add tab in AdminDashboardPage**:
```tsx
<button onClick={() => setActiveTab('services')}>Services</button>

{activeTab === 'services' && <ServicesManager />}
```

### Modifying the Rich Text Editor

**File**: `/components/admin/RichTextEditor.tsx`

Key features:
- `execCommand` for formatting (bold, italic, etc.)
- Custom link insertion modal
- Image URL insertion
- YouTube embed conversion
- Placeholder text positioning fix (recently completed)

To add a new formatting option:
```tsx
const handleNewFormat = () => {
  document.execCommand('formatName', false, 'value');
  editorRef.current?.focus();
};

// Add button
<button onClick={handleNewFormat} className="...">
  <IconName className="w-4 h-4" />
</button>
```

### Working with Images

#### Existing Images from Design System
```tsx
// Import from figma:asset (NO path prefix!)
import heroImage from "figma:asset/abc123.png";

<img src={heroImage} alt="..." />
```

#### New Images (User-Generated)
```tsx
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

<ImageWithFallback 
  src="https://example.com/image.jpg"
  alt="Description"
  className="w-full h-64 object-cover"
/>
```

#### Using Unsplash
- In Figma Make, use `unsplash_tool` to get image URLs
- For local dev, use direct Unsplash URLs or placeholder services

---

## 🐛 Common Issues & Solutions

### Issue: localStorage not updating
**Solution**: Check browser DevTools → Application → Local Storage. Data persists across sessions. Clear manually if needed.

### Issue: Rich text editor placeholder positioning
**Fixed**: Placeholder now positioned with `absolute` and `pointer-events-none`. Do not modify this logic.

### Issue: Route not working
**Solution**: Check both path handlers in `App.tsx`:
1. Initial `useEffect` (handles page load)
2. `handleClick` (handles link clicks)
3. `handlePopState` (handles back/forward)

### Issue: TypeScript errors after adding new feature
**Solution**: 
1. Define interfaces in the component file or contexts
2. Update AdminContext type definitions
3. Run `npm run build` to check for errors

### Issue: Styles not applying
**Solution**:
1. Check Tailwind class names (no typos)
2. Avoid font-size/weight/line-height classes
3. Use design tokens from `globals.css`
4. Check for conflicting styles

---

## 🔒 Protected Files

**DO NOT MODIFY**:
- `/components/figma/ImageWithFallback.tsx` - System component

**MODIFY WITH CAUTION**:
- `/styles/globals.css` - Only change when design system updates needed
- `/contexts/AdminContext.tsx` - Core state management

---

## 🧪 Testing Checklist

Before committing changes:

- [ ] All pages load without errors (`/`, `/work`, `/about`, `/projects/*`, `/admin`)
- [ ] Navigation works (header links, footer links, back/forward buttons)
- [ ] Admin login/logout functions
- [ ] Projects CRUD operations work
- [ ] Testimonials CRUD operations work
- [ ] Metrics CRUD operations work
- [ ] Rich text editor formats properly
- [ ] "Get Started" modal opens and closes
- [ ] localStorage persists data across page reloads
- [ ] Responsive design works (mobile, tablet, desktop)
- [ ] No console errors or warnings
- [ ] TypeScript compiles without errors (`npm run build`)

---

## 📝 Git Workflow

### Commit Message Format
```
type(scope): brief description

- Detailed change 1
- Detailed change 2
```

**Types**: `feat`, `fix`, `style`, `refactor`, `docs`, `test`, `chore`

**Examples**:
```
feat(admin): add services manager
fix(editor): correct placeholder positioning  
style(homepage): update hero section spacing
refactor(routing): simplify navigation logic
```

### Branches
- `main` - Production-ready code
- `dev` - Development branch
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes

---

## 🚀 Deployment Notes

### Current State
- **Frontend-only** - No backend, no API
- **localStorage** - Data is client-side only
- **Static site** - Can deploy to any static host (Vercel, Netlify, etc.)

### Future Backend Integration
When adding a real backend:

1. **Replace localStorage with API calls** in `AdminContext`
2. **Add environment variables** for API endpoints
3. **Implement real authentication** (JWT, OAuth, etc.)
4. **Add form submission** to actual database
5. **Image uploads** to cloud storage (S3, Cloudinary)

### Build for Production
```bash
npm run build
npm run preview  # Test production build locally
```

Output directory: `/dist`

---

## 📚 Additional Resources

- **Tailwind CSS 4.0 Docs**: https://tailwindcss.com/docs
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev
- **TypeScript Docs**: https://www.typescriptlang.org/docs

---

## 🆘 Need Help?

1. Check browser console for errors
2. Review this dev brief
3. Check `/IMPLEMENTATION_SUMMARY.md` for feature history
4. Check component comments for usage examples
5. Test in incognito mode (clean localStorage)

---

## 🎯 Current Sprint Goals

### Completed ✅
- Full public-facing website
- Admin CMS with authentication
- Projects, testimonials, metrics management
- Rich text editor with all features
- localStorage persistence
- Responsive design
- Fix rich text editor placeholder positioning

### Next Steps 🚧
- Enhance form submission (persist "Get Started" submissions)
- Add image upload functionality (replace URL inputs)
- Analytics integration (track conversions)
- Performance optimization
- SEO improvements (meta tags, sitemap)
- Backend API integration

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: ✅ Ready for Development
