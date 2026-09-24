// HealthGuard — static site generator.
// WHY: one layout + content data → 29 consistent pages. Header/footer/logo can
// never drift; every component/feature is literally its own page (client ask).
// Run: node build.mjs
import { writeFileSync, existsSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { page } from './src/layout.mjs';
import core from './content/pages-core.mjs';
import docs from './content/pages-docs.mjs';
import care from './content/pages-care.mjs';
import trust from './content/pages-trust.mjs';
import data from './content/pages-data.mjs';
import product from './content/pages-product.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'public');
const IMG = join(OUT, 'images');

const pages = [...core, ...docs, ...care, ...trust, ...data, ...product];

// Art resolution: prefer the page's art; fall back gracefully if an asset is
// pending generation (keeps the build green, never a broken <img>).
function resolveArt(art) {
  if (art && existsSync(join(IMG, art))) return art;
  const fallbacks = ['hero-canvas.jpg', 'art-decks.jpg', 'art-documents.jpg'];
  for (const f of fallbacks) if (existsSync(join(IMG, f))) return f;
  return '';
}

mkdirSync(OUT, { recursive: true });

const seen = new Set();
let totalBytes = 0;
for (const p of pages) {
  if (seen.has(p.slug)) throw new Error('Duplicate slug: ' + p.slug);
  seen.add(p.slug);
  const art = resolveArt(p.art);
  const body = p.body(art).join('\n');
  const html = page({ slug: p.slug, title: p.title, desc: p.desc, family: p.family, body });
  const file = join(OUT, `${p.slug}.html`);
  writeFileSync(file, html);
  totalBytes += html.length;
  console.log(`✓ ${p.slug}.html  (${(html.length / 1024).toFixed(1)} KB)${p.art !== art ? `  [art fallback: ${art}]` : ''}`);
}

console.log(`\n${pages.length} pages · ${(totalBytes / 1024).toFixed(0)} KB total HTML`);
const images = existsSync(IMG) ? readdirSync(IMG) : [];
console.log(`images: ${images.length ? images.join(', ') : '(none)'}`);
