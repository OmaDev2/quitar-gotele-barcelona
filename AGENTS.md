# AGENTS.md

## Build, Lint, and Test Commands

### Development
```bash
npm run dev          # Start dev server at localhost:4321
npm start            # Alias for npm run dev
```

### Production Build
```bash
npm run build        # Build production site to ./dist/
npm run preview      # Preview production build locally
```

### Utility Scripts
```bash
npm run optimize-images    # Optimize images in assets
npm run reset              # Reset site data
npm run export             # Export client data
npm run manual             # Manual research mode
npm run generate_site      # Generate site content
npm run research:wizard    # Run research wizard
```

### Testing
No test framework is configured. Before implementing features, consider adding Jest or Vitest.

### Running Single Test (when test framework is added)
```bash
# Example patterns (framework-dependent):
npm test -- Service.test.ts        # Run specific test file
npm test -- -t "should render"     # Run tests matching pattern
npm test -- --watch               # Watch mode
```

## Code Style Guidelines

### File Extensions
- Astro components: `.astro`
- React components: `.tsx` (preferred) or `.jsx`
- TypeScript utilities: `.ts`
- JavaScript API routes: `.js`

### Imports
- Use `@/` alias for src directory: `import { getSettings } from "@/lib/settings"`
- Relative imports for nearby files: `import Navbar from "../components/Navbar.astro"`
- Group imports: external libs → internal modules → local files
- Type-only imports: `import type { LocalBusiness } from "schema-dts"`
- Astro imports: `import { getCollection, getEntry } from "astro:content"`

### Formatting
- 4-space indentation in Astro files
- 2-space indentation in JSON config files
- No trailing whitespace
- No semicolons in JavaScript/TypeScript
- Max line length: ~100 characters (soft limit)
- No comments unless explicitly requested

### Types and TypeScript
- Strict TypeScript configuration (extends `astro/tsconfigs/strict`)
- Define interfaces for component props in frontmatter
- Use type assertions sparingly: `as any` only when necessary
- Use type guards for content collections
- Return types for public functions
- Use nullish coalescing `??` for fallback values

### Naming Conventions
- Components: PascalCase (`Navbar.astro`, `Footer.astro`)
- Files: kebab-case for utilities (`seo.ts`, `settings.ts`)
- Variables/functions: camelCase (`getSettings`, `siteName`)
- Constants: UPPER_SNAKE_CASE for config constants
- CSS classes: Tailwind utility classes only

### Astro Components
- Frontmatter block with `---` delimiters
- Define Props interface at top of frontmatter
- Destructure props with defaults: `const { stickyPhone = true } = Astro.props`
- Use await for async data fetching in frontmatter
- Template expressions with curly braces: `{siteName}`
- Slot for child content: `<slot />`
- Client-side scripts in `<script>` tags at bottom

### React Components
- Functional components with hooks
- Use lucide-react for icons: `import { Phone, Mail } from "lucide-react"`
- Tailwind for styling (no inline styles unless dynamic)
- Event handlers: camelCase (`onClick`, `onSubmit`)
- Props interface as generic: `interface Props { title: string }`

### Error Handling
- Try/catch for async operations
- Console.error for logging: `console.error("Error:", e)`
- Graceful fallbacks for missing data
- Return Response objects in API routes: `{ status: 200 }`

### Styling (Tailwind CSS)
- Utility-first approach
- Semantic color system: `primary`, `secondary`, `surface`, `accent`, `heading`, `text`
- Responsive prefixes: `md:`, `lg:`
- States: `hover:`, `focus:`, `group-hover:`
- Spacing scale: Tailwind default
- Custom animations in tailwind.config.mjs

### CMS and Content
- Fetch collections: `await getCollection("services")`
- Fetch entries: `await getEntry("business", "global")`
- Use Keystatic for content management at `/keystatic`
- Store settings in unified helpers (lib/settings.ts)
- Content blocks with discriminants for page builders

### SEO and Metadata
- Generate Schema.org markup via lib/seo.ts
- Use LocalBusiness, FAQPage, BreadcrumbList schemas
- JSON-LD in `<script type="application/ld+json">`
- Meta tags via SeoHead component
- Open Graph tags included

### Environment Variables
- No .env files committed
- Use Netlify environment variables in production
- Access via `import.meta.env` (Astro standard)

### Performance
- Image optimization via Astro Image component
- Lazy loading with `loading="lazy"`
- Partytown for third-party scripts (GTM, GA)
- Static site generation where possible
- DNS prefetch for external domains

### Accessibility
- Semantic HTML5 elements
- ARIA labels on interactive elements: `aria-label="Abrir menú"`
- Focus states: `focus:` utility classes
- Alt text on images: `alt="Logo de sitio"`
- Contrast ratios: WCAG AA compliant

### Language
- All UI text in Spanish
- Comments and logs in Spanish
- Proper Spanish characters (á, é, í, ó, ú, ñ) in content
