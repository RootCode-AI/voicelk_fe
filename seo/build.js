import { readFileSync } from 'node:fs';
import { DEFAULT_SITE_URL, HOME_TITLE, SITE_DESCRIPTION } from './site.js';

export function normalizeSiteUrl(value = DEFAULT_SITE_URL) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
      url.search || url.hash || url.pathname !== '/') {
    throw new Error('VITE_SITE_URL must be an HTTP(S) origin, for example https://chat.voicelk.dev');
  }
  return url.origin;
}

export function seoFiles(value = DEFAULT_SITE_URL) {
  const siteUrl = normalizeSiteUrl(value);
  return {
    'robots.txt': `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
    // This app has one public URL. Account views and chats are internal state.
    // Omit lastmod rather than treating every deployment as a content change.
    'sitemap.xml': readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8')
      .replaceAll(DEFAULT_SITE_URL, siteUrl),
    'llms.txt': readFileSync(new URL('./llms.txt', import.meta.url), 'utf8')
      .replaceAll('__SITE_URL__', siteUrl),
  };
}

export const CONTENT_TYPES = {
  'robots.txt': 'text/plain; charset=utf-8',
  'llms.txt': 'text/plain; charset=utf-8',
  'sitemap.xml': 'application/xml; charset=utf-8',
};

const escapeHtml = value => value.replace(/[&<>"']/g,
  char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export function seoPlugin(value = DEFAULT_SITE_URL) {
  const siteUrl = normalizeSiteUrl(value);
  return {
    name: 'voicelk-seo',
    transformIndexHtml: html => html.replaceAll('__SITE_URL__', siteUrl)
      .replaceAll('__SITE_TITLE__', escapeHtml(HOME_TITLE))
      .replaceAll('__SITE_DESCRIPTION__', escapeHtml(SITE_DESCRIPTION)),
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const name = req.url?.split('?')[0].slice(1);
        if (!Object.hasOwn(CONTENT_TYPES, name)) return next();
        res.setHeader('Content-Type', CONTENT_TYPES[name]);
        res.end(seoFiles(siteUrl)[name]);
      });
    },
    generateBundle() {
      for (const [fileName, source] of Object.entries(seoFiles(siteUrl))) {
        this.emitFile({ type: 'asset', fileName, source });
      }
    },
  };
}
