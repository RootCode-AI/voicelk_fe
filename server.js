// Serve public build assets and the app's only public page.
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const dist = path.join(path.dirname(filename), 'dist');

export function createApp({ distDir = dist } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', true);
  app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.get('x-forwarded-proto') === 'http') {
      return res.redirect(301, `https://${req.get('host')}${req.originalUrl}`);
    }
    // Firebase Google sign-in opens a popup.
    res.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    next();
  });
  app.get('/index.html', (_req, res) => res.redirect(301, '/'));
  app.use('/assets', express.static(path.join(distDir, 'assets'), { immutable: true, maxAge: '1y' }));
  app.use(express.static(distDir, { index: false }));
  app.get('/', (_req, res) => {
    res.set('Cache-Control', 'no-cache');
    res.sendFile(path.join(distDir, 'index.html'));
  });
  // Internal app views do not have URL routes. Avoid indexing duplicate homepages
  // and returning HTML for missing images, sitemap files or JavaScript bundles.
  app.use((_req, res) => res.status(404).set('X-Robots-Tag', 'noindex').type('text/plain').send('Not found'));
  return app;
}

if (process.argv[1] && path.resolve(process.argv[1]) === filename) {
  const port = process.env.PORT || 4173;
  createApp().listen(port, () => console.log(`VoiceLK web client listening on port ${port}`));
}
