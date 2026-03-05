#!/usr/bin/env node
/**
 * Script para extraer datos de Google Search Console
 * Uso: node scripts/search-console.mjs
 */

import { google } from 'googleapis';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Configuración
const CREDENTIALS_FILE = join(ROOT, 'quitargotelebcn-8a759c5117da.json');
const SITE_URL = 'https://quitargotelebarcelona.es';
const OUTPUT_FILE = join(ROOT, 'search-console-data.json');

// Últimos 28 días
const endDate = new Date();
const startDate = new Date();
startDate.setDate(endDate.getDate() - 28);

const formatDate = (date) => date.toISOString().split('T')[0];

async function main() {
  console.log('🔍 Conectando con Google Search Console...\n');

  // Autenticación
  const credentials = JSON.parse(readFileSync(CREDENTIALS_FILE, 'utf8'));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  const searchconsole = google.searchconsole({ version: 'v1', auth });

  try {
    // 1. Queries (palabras clave)
    console.log('📊 Extrayendo queries (últimos 28 días)...');
    const queriesResponse = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['query'],
        rowLimit: 500,
      },
    });

    // 2. Páginas
    console.log('📄 Extrayendo páginas...');
    const pagesResponse = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['page'],
        rowLimit: 100,
      },
    });

    // 3. Queries por página (para home)
    console.log('🏠 Extrayendo queries de la home...');
    const homeQueriesResponse = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['query'],
        dimensionFilterGroups: [{
          filters: [{
            dimension: 'page',
            operator: 'equals',
            expression: SITE_URL + '/',
          }],
        }],
        rowLimit: 200,
      },
    });

    // Procesar y formatear datos
    const data = {
      period: {
        start: formatDate(startDate),
        end: formatDate(endDate),
      },
      queries: (queriesResponse.data.rows || []).map(row => ({
        query: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: (row.ctr * 100).toFixed(2) + '%',
        position: row.position.toFixed(1),
      })),
      pages: (pagesResponse.data.rows || []).map(row => ({
        page: row.keys[0].replace(SITE_URL, ''),
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: (row.ctr * 100).toFixed(2) + '%',
        position: row.position.toFixed(1),
      })),
      homeQueries: (homeQueriesResponse.data.rows || []).map(row => ({
        query: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: (row.ctr * 100).toFixed(2) + '%',
        position: row.position.toFixed(1),
      })),
    };

    // Guardar resultados
    writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));

    console.log('\n✅ Datos extraídos correctamente!');
    console.log(`📁 Guardado en: ${OUTPUT_FILE}`);
    console.log(`\n📈 Resumen:`);
    console.log(`   - ${data.queries.length} queries totales`);
    console.log(`   - ${data.pages.length} páginas`);
    console.log(`   - ${data.homeQueries.length} queries de la home`);

    // Mostrar top 10 queries
    console.log('\n🔝 Top 10 queries por clics:');
    data.queries
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)
      .forEach((q, i) => {
        console.log(`   ${i + 1}. "${q.query}" - ${q.clicks} clics, pos ${q.position}`);
      });

  } catch (error) {
    if (error.code === 403) {
      console.error('\n❌ Error 403: Sin permisos');
      console.error('\n👉 Asegúrate de añadir esta cuenta de servicio como usuario en Search Console:');
      console.error(`   ${credentials.client_email}`);
      console.error('\n   Pasos:');
      console.error('   1. Ve a https://search.google.com/search-console');
      console.error('   2. Selecciona tu propiedad');
      console.error('   3. Configuración → Usuarios y permisos → Añadir usuario');
      console.error(`   4. Email: ${credentials.client_email}`);
      console.error('   5. Permiso: Restringido (solo lectura)');
    } else {
      console.error('\n❌ Error:', error.message);
    }
    process.exit(1);
  }
}

main();
