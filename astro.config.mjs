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
  trailingSlash: 'ignore',

  image: {
    domains: ["images.unsplash.com"],
  },

  integrations: [
    react(),
    keystatic(),
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
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      serialize(item) {
        // Prioridad alta para home y páginas principales
        if (item.url === '/' || item.url.endsWith('/')) {
          if (item.url === '/' || item.url === siteUrl + '/') {
            item.priority = 1.0;
            item.changefreq = 'daily';
          } else if (item.url.includes('/zona/') || item.url.includes('/servicios/')) {
            item.priority = 0.8;
            item.changefreq = 'weekly';
          } else if (item.url.includes('/contacto') || item.url.includes('/nosotros')) {
            item.priority = 0.6;
            item.changefreq = 'monthly';
          } else if (item.url.includes('/blog')) {
            item.priority = 0.7;
            item.changefreq = 'weekly';
          }
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
          disallow: ['/admin', '/gracias', '/404'],
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
    inlineStylesheets: 'auto', // Cambiado a 'auto' para evitar advertencia de "Unused CSS" y permitir caché del navegador
  },

  // ✅ MODO SERVER: Necesario para Keystatic y API routes
  output: 'server',
  adapter: netlify(),

  vite: {
    ssr: {
      noExternal: ['@keystatic/core', '@keystatic/astro'],
    }
  }
});