import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import netlify from '@astrojs/netlify';
import robotsTxt from 'astro-robots-txt';

// Leer siteUrl desde global.yaml manualmente (no podemos usar astro:content aquí)
function getSiteUrl() {
  try {
    const fileContent = fs.readFileSync('./src/content/business/global.yaml', 'utf-8');
    const match = fileContent.match(/siteUrl:\s*['"]?(.*?)['"]?\s*$/m);
    return match ? match[1] : 'https://localhost:4321';
  } catch (e) {
    return 'https://localhost:4321';
  }
}

const siteUrl = getSiteUrl();

// https://astro.build/config
export default defineConfig({
  // 🌐 Dominio final del sitio
  site: siteUrl,

  // 🔗 Trailing slash: siempre con barra al final (bueno para SEO)
  // 🔗 Trailing slash: Ignoramos para evitar conflictos con Keystatic admin
  trailingSlash: 'always',

  image: {
    domains: ["images.unsplash.com"],
  },

  integrations: [
    react(),
    keystatic({
      disableAutomaticRoutes: true,
    }),
    mdx(),
    tailwind(),
    sitemap({
      // Excluir páginas legales y admin del sitemap
      filter: (page) =>
        !page.includes('/aviso-legal') &&
        !page.includes('/privacidad') &&
        !page.includes('/cookies') &&
        !page.includes('/admin') &&
        !page.includes('/gracias') &&
        !page.includes('/404'),
      serialize(item) {
        // --- LÓGICA DE LASTMOD DINÁMICO ---
        try {
          let filePath = '';
          const url = new URL(item.url);
          const pathname = url.pathname.replace(/\/$/, ''); // Quitar barra final para comparar

          if (pathname === '' || pathname === '/') {
             // Home: Usamos el MDX de home como referencia de cambio principal
             filePath = './src/content/pages/home.mdx';
          } else if (pathname.startsWith('/zona/')) {
             // Zonas dinámicas: /zona/nombre-zona -> src/content/locations/nombre-zona.mdx
             const slug = pathname.replace('/zona/', '');
             filePath = `./src/content/locations/${slug}.mdx`;
          } else if (pathname.startsWith('/blog/')) {
             // Blog dinámico: /blog/slug -> src/content/blog/slug.md
             const slug = pathname.replace('/blog/', '');
             filePath = `./src/content/blog/${slug}.md`;
          } else if (pathname === '/nosotros') {
             filePath = './src/pages/nosotros.astro';
          } else if (pathname === '/contacto') {
             filePath = './src/pages/contacto.astro';
          } else if (pathname === '/proyectos') {
             filePath = './src/pages/proyectos.astro';
          } else if (pathname === '/zonas') {
             filePath = './src/pages/zonas.astro';
          } else if (pathname === '/blog') {
             filePath = './src/pages/blog/index.astro';
          }

          if (filePath && fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            item.lastmod = stats.mtime.toISOString();
          } else {
            // Fallback si no encontramos el archivo exacto (ej. páginas estáticas sin mapeo)
            item.lastmod = new Date().toISOString();
          }
        } catch (e) {
          item.lastmod = new Date().toISOString();
        }

        // Prioridad y frecuencia
        if (item.url === siteUrl + '/') {
          item.priority = 1.0;
          item.changefreq = 'daily';
        } else if (item.url.includes('/zona/')) {
          item.priority = 0.8;
          item.changefreq = 'weekly';
        } else {
          item.priority = 0.6;
          item.changefreq = 'monthly';
        }

        return item;
      }
    }),
    robotsTxt({
      sitemap: siteUrl + '/sitemap-index.xml',
      policy: [
        {
          userAgent: '*',
          allow: '/',
          disallow: ['/admin/', '/gracias/', '/404/'],
        },
      ],
    }),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    })
  ],

  // 🚀 OPTIMIZACIÓN DE RENDIMIENTO
  build: {
    inlineStylesheets: 'never', // Evita inlined CSS que engorda el HTML y permite caché del navegador
  },

  // ✅ MODO SERVER: Necesario para Keystatic y API routes
  output: 'static',
  adapter: netlify(),

  vite: {
    ssr: {
      noExternal: ['@keystatic/core', '@keystatic/astro'],
    }
  }
});