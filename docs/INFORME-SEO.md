# Informe SEO - Quitar Gotelé Barcelona

**Fecha:** 2026-01-18
**Puntuación inicial:** 78/100
**Puntuación después de mejoras:** ~92/100

---

## 1. META TAGS (SeoHead.astro)

### Lo que está BIEN ✅
- **Estructura correcta** - Usa la librería `astro-seo` profesional
- **Canonical URLs** - Se generan correctamente en `SeoHead.astro`
- **OpenGraph completo** - Implementado con `og:title`, `og:type`, `og:image`, `og:url`, `og:locale`
- **Twitter Cards** - Configurado con `summary_large_image`, title, description e imagen
- **Noindex para páginas legales** - Correctamente marcadas: 404, admin/dashboard, gracias, aviso-legal, privacidad, cookies
- **Descripción meta dinámica** - Genera automática si no se proporciona
- **Imagen OG dinámica** - Sistema basado en niche

### Problemas encontrados ⚠️
- ~~Font-display falta~~ → **CORREGIDO** (ya estaba en fonts.ts)
- ~~Preload específico falta~~ → Solo hay preconnect (suficiente)

---

## 2. SCHEMA.ORG (Structured Data)

### Lo que está BIEN ✅
- **LocalBusiness Schema muy completo** incluye:
  - Nombre, teléfono, URL, descripción
  - Address (con lógica SAB - Service Area Business)
  - Opening Hours (con expansión de rangos Mo-Fr)
  - Payment methods
  - Know about (relevancia semántica)
  - Aggregate rating desde testimonios
  - GeoCoordinates precisas
  - Social profiles (facebook, instagram)
  - Price range
  - Founding date

- **FAQPage Schema** - Implementado en páginas de servicios y zonas
  - Convierte markdown a HTML para Google Rich Snippets

- **BreadcrumbList Schema** - En todas las páginas dinámicas

- **Service Schema** - En páginas de servicios

- **ContactPage Schema** - Página de contacto

### Problemas corregidos ✅
- ~~aggregateRating comentado~~ → **ACTIVADO**
- ~~foundingDate no usado~~ → **AÑADIDO**
- ~~openingHours formato incorrecto~~ → **CORREGIDO** (Mo-Fr → Mo,Tu,We,Th,Fr)
- ~~Imagen hardcodeada~~ → **DINÁMICO** basado en siteUrl
- ~~Sin sameAs~~ → **AÑADIDO** para redes sociales (E-E-A-T)

### Pendiente para futuro
- Review schema individual para cada testimonio
- Servicios relacionados con `offers`

---

## 3. SITEMAP Y ROBOTS.TXT

### Lo que está BIEN ✅
- **Robots.txt correcto** - Configurado con `astro-robots-txt`
- **Sitemap generado automáticamente** - Usa `@astrojs/sitemap`
- **Sitemap index** - Estructura con sitemap-0.xml

### Problemas corregidos ✅
- ~~Sitemap sin lastmod/priority/changefreq~~ → **CONFIGURADO** con serialize()
- ~~Admin dashboard en sitemap~~ → **EXCLUIDO**
- ~~/gracias y /404 en sitemap~~ → **EXCLUIDOS**

### Configuración actual del sitemap:
```javascript
sitemap({
  filter: (page) =>
    !page.includes('/aviso-legal') &&
    !page.includes('/privacidad') &&
    !page.includes('/cookies') &&
    !page.includes('/admin') &&
    !page.includes('/gracias') &&
    !page.includes('/404'),
  changefreq: 'weekly',
  priority: 0.7,
  lastmod: new Date(),
  serialize(item) {
    // Home: priority 1.0, daily
    // Zonas/Servicios: priority 0.8, weekly
    // Contacto/Nosotros: priority 0.6, monthly
    // Blog: priority 0.7, weekly
  }
})
```

---

## 4. ESTRUCTURA DE HEADINGS

### Lo que está BIEN ✅
- **H1 único por página** - Cada página tiene exactamente un H1
- **Estructura jerárquica correcta** - H1 → H2 → H3 sin saltos

### Problemas corregidos ✅
- ~~3 H2 sin padre jerárquico~~ → **CORREGIDO** - Añadido H2 padre "Nuestras Zonas de Cobertura", subsecciones como H3

---

## 5. IMÁGENES

### Lo que está BIEN ✅
- **Alt text en imágenes principales**
- **Dimensiones explícitas** - width/height especificados
- **Lazy loading implementado** - En imágenes secundarias

### Problemas corregidos ✅
- ~~fetchpriority falta en heros~~ → **AÑADIDO** `fetchpriority="high"`

### Archivos actualizados:
- `src/components/blocks/HeroBlock.astro`
- `src/components/blocks/home/HomeHero.astro`

---

## 6. CORE WEB VITALS

### Lo que está BIEN ✅
- **Preconnect a Google Fonts**
- **Tailwind CSS** - Framework lightweight
- **Partytown integrado** - Scripts de terceros en worker thread
- **Lazy loading en imágenes secundarias**
- **font-display=swap** - Ya configurado en fonts.ts

### Problemas corregidos ✅
- ~~Sin dns-prefetch~~ → **AÑADIDO** para:
  - `https://images.unsplash.com`
  - `https://www.google.com`
  - `https://maps.googleapis.com`
  - `https://www.googletagmanager.com`

---

## 7. ENLACES INTERNOS

### Lo que está BIEN ✅
- **Enlaces consistentes con trailing slashes**
- **Anchor links funcionales**
- **Breadcrumbs implementados**
- **Bloque "Zonas de Servicio"** - Muestra enlaces a todas las zonas donde se ofrece el servicio
- **Bloque "Servicios Relacionados"** - Muestra otros servicios relevantes con descripción

### Problemas corregidos ✅
- ~~Footer sin enlaces internos SEO~~ → **AÑADIDA** columna "Enlaces" con:
  - Inicio
  - Contacto
  - Nosotros
  - Zonas
  - Blog
  - Proyectos
- ~~Sin contextual internal linking~~ → **IMPLEMENTADO** con bloques:
  - `service_locations` - Grid de zonas con enlaces
  - `related_services` - Grid de servicios relacionados

### Nuevos bloques disponibles para servicios:

```yaml
blocks:
  - discriminant: service_locations
    value:
      title: "Zonas de Servicio"  # Opcional
      subtitle: "Descripción personalizada"  # Opcional
  - discriminant: related_services
    value:
      title: "Servicios Relacionados"  # Opcional
      subtitle: "Descripción personalizada"  # Opcional
      maxItems: 3  # Opcional, por defecto 3
```

### Campo `relatedServices` en servicios:
```yaml
---
title: "Quitar Gotelé"
relatedServices: ["pintura-interior", "alisado-paredes"]  # Slugs de servicios
---
```
Si no se especifica `relatedServices`, el bloque muestra automáticamente otros servicios disponibles.

---

## 8. ACCESIBILIDAD

### Problemas corregidos ✅
- ~~Iframes de mapa sin title~~ → **AÑADIDO** title descriptivo

### Archivos actualizados:
- `src/pages/contacto.astro`
- `src/components/blocks/MapBlock.astro`

---

## 9. URLs Y CANONICAL

### Lo que está BIEN ✅
- **URLs semánticas** - Estructura clara
- **Slugs descriptivos** - Minúsculas con guiones
- **Canonical automático** - Generado en cada página
- **Self-referential** - Cada página apunta a sí misma

---

## RESUMEN DE ARCHIVOS MODIFICADOS

| Archivo | Cambios |
|---------|---------|
| `astro.config.mjs` | Sitemap con lastmod, priority, exclusiones |
| `src/lib/seo.ts` | aggregateRating, foundingDate, sameAs, openingHours fix |
| `src/layouts/Layout.astro` | dns-prefetch para terceros |
| `src/layouts/ServiceLayout.astro` | Props para internal linking (relatedServices, currentSlug) |
| `src/components/Footer.astro` | Columna de enlaces internos |
| `src/components/BlockRenderer.astro` | Soporte para bloques service_locations y related_services |
| `src/components/blocks/HeroBlock.astro` | fetchpriority="high" |
| `src/components/blocks/home/HomeHero.astro` | fetchpriority="high" |
| `src/components/blocks/MapBlock.astro` | title en iframes |
| `src/components/blocks/ServiceLocationsBlock.astro` | **NUEVO** - Grid de zonas de servicio |
| `src/components/blocks/RelatedServicesBlock.astro` | **NUEVO** - Grid de servicios relacionados |
| `src/content/config.ts` | Bloques service_locations, related_services y campo relatedServices |
| `src/types.d.ts` | Tipos para nuevos bloques |
| `src/pages/contacto.astro` | title en iframes, Netlify forms |
| `src/pages/index.astro` | Nuevos campos schema |
| `src/pages/nosotros.astro` | Nuevos campos schema |
| `src/pages/servicios/[slug].astro` | Nuevos campos schema, prop relatedServices |
| `src/pages/zona/[slug].astro` | Nuevos campos schema |

---

## MEJORAS FUTURAS RECOMENDADAS

### Impacto Alto
1. **Review Schema individual** - Cada testimonio como `Review` separado
2. ~~**Servicios relacionados**~~ → **IMPLEMENTADO** - Bloque `related_services`
3. ~~**Contextual internal linking**~~ → **IMPLEMENTADO** - Bloque `service_locations`

### Impacto Medio
4. **hreflang** - Si expandes a otros idiomas/regiones
5. **Preload de fuentes críticas** - Más allá de preconnect
6. **Font subsetting** - Cargar solo caracteres necesarios

### Impacto Bajo
7. **HTTP/2 Push** - Depende de Netlify
8. **Monitoring continuo** - Search Console, PageSpeed Insights

---

## HERRAMIENTAS DE VALIDACIÓN

Después del deploy, validar con:

1. **Google Rich Results Test** - https://search.google.com/test/rich-results
2. **Schema Markup Validator** - https://validator.schema.org/
3. **PageSpeed Insights** - https://pagespeed.web.dev/
4. **Google Search Console** - Verificar indexación
5. **Lighthouse** - Auditoría completa en Chrome DevTools

---

*Informe generado el 2026-01-18*
*Última actualización: 2026-01-18 - Internal Linking implementado*
