import { readFileSync } from 'node:fs'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Public address of the web client. Search engines and social previews need
// absolute URLs, so it is written into index.html, robots.txt, sitemap.xml and
// llms.txt at build time.
const DEFAULT_SITE_URL = 'https://chat.voicelk.dev'

function seoFiles(siteUrl) {
  const today = new Date().toISOString().slice(0, 10)
  return {
    'robots.txt': `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
    'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`,
    'llms.txt': readFileSync(new URL('./seo/llms.txt', import.meta.url), 'utf8')
      .replaceAll('__SITE_URL__', siteUrl),
  }
}

const CONTENT_TYPES = {
  'robots.txt': 'text/plain; charset=utf-8',
  'llms.txt': 'text/plain; charset=utf-8',
  'sitemap.xml': 'application/xml; charset=utf-8',
}

function seo(siteUrl) {
  return {
    name: 'voicelk-seo',
    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', siteUrl),
    // Served from memory in dev so the files can be checked before a deploy.
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const name = req.url?.slice(1)
        if (!(name in CONTENT_TYPES)) return next()
        res.setHeader('Content-Type', CONTENT_TYPES[name])
        res.end(seoFiles(siteUrl)[name])
      })
    },
    generateBundle() {
      for (const [fileName, source] of Object.entries(seoFiles(siteUrl))) {
        this.emitFile({ type: 'asset', fileName, source })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const siteUrl = (env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '')

  return {
    plugins: [react(), tailwindcss(), seo(siteUrl)],
    server: {
      headers: {
        "Cross-Origin-Opener-Policy": "same-origin-allow-popups"
      }
    }
  }
})
